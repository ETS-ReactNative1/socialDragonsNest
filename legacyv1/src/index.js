import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, getDocs, addDoc, deleteDoc, doc
} from 'firebase/firestore'
import {
    getAuth,
    createUserWithEmailAndPassword
} from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyAr_QxJJvJwbkVLmqqBqDz8iNQh1CmeHQw",
    authDomain: "ci102-social-media-web-app.firebaseapp.com",
    databaseURL: "https://ci102-social-media-web-app-default-rtdb.firebaseio.com",
    projectId: "ci102-social-media-web-app",
    storageBucket: "ci102-social-media-web-app.appspot.com",
    messagingSenderId: "836422170191",
    appId: "1:836422170191:web:4b6fb10b2b3b58a0285c3a",
    measurementId: "G-HPQ0JG81DM"
  }

// init firebase
initializeApp(firebaseConfig)

// init services
const db = getFirestore()
const auth = getAuth()

// collection ref
const colRef = collection(db, 'users')

// get collection data
getDocs(colRef)
  .then(snapshot => {
    // console.log(snapshot.docs)
    let users = []
    snapshot.docs.forEach(doc => {
      users.push({ ...doc.data(), id: doc.id })
    })
    console.log(users)
  })
  .catch(err => {
    console.log(err.message)
  })

// adding documents
const addUserForm = document.querySelector('.add')
addUserForm.addEventListener('sumbit', (e) => {
    e.preventDefault()

    addDoc(colRef, {
        age: addUserForm.age.value,
        email: addUserForm.email.value,
        name: addUserForm.name.value,
    })
    .then(() => {
        addUserForm.reset() 
    })
})

// deleting documents
const deleteUserForm = document.querySelector('.delete')
deleteUserForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const docRef = doc(db, 'books', deleteUserForm.id.value)

    deleteDoc(docRef)
        .then(() => {
            deleteUserForm.reset()
    })
})

// signing users up
const signupForm= document.querySelector('.signup')
signupForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const email = signupForm.email.value
  const password = signupForm.password.value

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log('user created:', cred.user)
      signupForm.reset
    })


})
