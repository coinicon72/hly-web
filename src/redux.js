import React from 'react'
import ReactDOM from 'react-dom'

import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'

import createHistory from 'history/createBrowserHistory'
import { Route } from 'react-router'

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory()

// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history)

const initialState = {
  page: "home",

  toolbarTitle: 'toolbar title',
  navMenus: ['profile', 'settings'],
  footbarContent: 'footbar',
  mainContent: 'main content',
}

function appReducer(state = initialState, action) {
  let newState = { ...state }
  switch (action.type) {
    // case SET_VISIBILITY_FILTER:
    //   return Object.assign({}, state, {
    //     visibilityFilter: action.filter
    //   })
    case "clickTitle":
      newState.toolbarTitle = 'toolbar - ' + parseInt(Math.random() * 10);
      break

    case 'login.logging':
      newState.loginError = null
      break

    case 'login.loggedIn':
      newState.token = action.token
      newState.user = action.user
      break

    case 'login.loginFailed':
      newState.loginError = action.error
      break
  }

  return newState
}

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
export const store = createStore(
  combineReducers({
    main: appReducer,
    router: routerReducer
  }),
  applyMiddleware(middleware),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)


// login
export function actionLogging() {
  return {
    type: 'login.logging',
  }
}

export function actionLoggedIn(token, user) {
  return {
    type: 'login.loggedIn',
    token: token,
    user: user,
  }
}

export function actionLoginFailed(e) {
  return {
    type: 'login.loginFailed',
    error: e,
  }
}
