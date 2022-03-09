const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());

const { db } = require('./util/admin');

const {
  getAllPosts,
  ostAPost,
  getPost,
  commentOnPost,
  likeAPost,
  unlikeAPost,
  deleteAPost
} = require('./handlers/posts');
const {
  registration,
  login,
  uploadImage,
  addUserStuff,
  getAuthedUser,
  getUserStuff,
  markTheNotificationsAsRead
} = require('./handlers/users');

// Routes for Posts 
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, postAPost);
app.get('/post/:postId', getPost);
app.delete('/post/:postId', FBAuth, deleteAPost);
app.get('/post/:postId/like', FBAuth, likeAPost);
app.get('/post/:postId/unlike', FBAuth, unlikeAPost);
app.post('/post/:postId/comment', FBAuth, commentOnPost);

// Routes for Users
app.post('/signup', registration);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserStuff);
app.get('/user', FBAuth, getAuthedUser);
app.get('/user/:handle', getUserStuff);
app.post('/notifications', FBAuth, markTheNotificationsAsRead);
exports.api = functions.region('europe-west1').https.onRequest(app);

exports.generateNotifsOnLike = functions
  .region('us-central')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            postId: doc.id
          });
        }
      })
      .catch((err) => console.error(err));
  });

exports.deleteNotifsOnUnlike = functions
  .region('us-central')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });
  exports.createNotifsOnComment = functions
  .region('us-central')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            postId: doc.id
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.onUserImageChange = functions
  .region('us-central')
  .firestore.document('/users/{userId}')
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('image has changed');
      const batch = db.batch();
      return db
        .collection('posts')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const post = db.doc(`/posts/${doc.id}`);
            batch.update(post, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onPostDelete = functions
  .region('europe-west1')
  .firestore.document('/posts/{postId}')
  .onDelete((snapshot, context) => {
    const postId = context.params.postId;
    const batch = db.batch();
    return db
      .collection('comments')
      .where('postId', '==', postId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection('likes')
          .where('postId', '==', postId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('postId', '==', postId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });

// const config = {
//   apiKey: "AIzaSyBspB_6dUdXqp79rvmvun9C6KHBC3v-pAs",
//   authDomain: "socialdragonsnest.firebaseapp.com",
//   projectId: "socialdragonsnest",
//   storageBucket: "socialdragonsnest.appspot.com",
//   messagingSenderId: "654478438294",
//   appId: "1:654478438294:web:e87896f02a9324e89df7b7",
//   measurementId: "G-9QWX84F5KD"
// };

