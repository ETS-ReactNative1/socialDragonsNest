import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import {ThemeProvider as MuiThemeProvider} from '@material-ui/core/styles';
import { createTheme } from '@material-ui/core/styles';
import jwtDecode from 'jwt-decode';
// Redux elements 
import { Provider } from 'react-redux';
import store from './redux/store';
import { SET_AUTHENTICATED } from './redux/types';
import { logoutUser, getUserData } from './redux/actions/userActions';
// components
import Navbar from './components/layout/Navbar';
import themeObject from './util/theme';
import AuthRoute from './util/authRoute';
// screens
import Home from './screens/home';
import login from './screens/login';
import register from './screens/register';
import user from './screens/user';

import axios from 'axios';

const theme = createTheme(themeObject);

// axios.defaults.baseURL =
//   'https://europe-west1-socialape-d081e.cloudfunctions.net/api';

const token = localStorage.FBIdToken;
if (token) {
  const decodedToken = jwtDecode(token);
  if (decodedToken.exp * 1000 < Date.now()) {
    store.dispatch(logoutUser());
    window.location.href = '/login';
  } else {
    store.dispatch({ type: SET_AUTHENTICATED });
    axios.defaults.headers.common['Authorization'] = token;
    store.dispatch(getUserData());
  }
}

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Router>
            <Navbar />
            <div className="container">
              <Routes>
                <Route exact path="/" component={Home} />
                <AuthRoute exact path="/login" component={login} />
                <AuthRoute exact path="/register" component={register} />
                <Route exact path="/users/:handle" component={user} />
                <Route
                  exact
                  path="/users/:handle/post/:postId"
                  component={user}
                />
              </Routes>
            </div>
          </Router>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

export default App;
