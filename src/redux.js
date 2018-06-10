import React from 'react'
import ReactDOM from 'react-dom'

import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'

import createHistory from 'history/createBrowserHistory'
import { Route } from 'react-router'

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'

//
import dataSelectionReducer from "./redux/data_selection"


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
  // let state = { ...state }
  switch (action.type) {
    // case SET_VISIBILITY_FILTER:
    //   return Object.assign({}, state, {
    //     visibilityFilter: action.filter
    //   })
    case "clickTitle":
      state.toolbarTitle = 'toolbar - ' + parseInt(Math.random() * 10);
      break

    case 'login.logging':
      state.loginError = null
      break

    case 'login.loggedIn':
      state.token = action.token
      state.user = action.user
      break

    case 'login.loginFailed':
      state.loginError = action.error
      break

    case 'login.logout':
      state.token = null
      state.user = null
      state.loginError = null
      break

    case 'login.updateUserInfo':
      state.user = action.user
      break

    default:
      break
  }

  return state
}

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(
  combineReducers({
    main: appReducer,
    data: dataSelectionReducer,
    router: routerReducer
  }),
  composeEnhancers(applyMiddleware(middleware))
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

export const actionLogout = _ => ({
  type: 'login.logout',
})

export const actionUpdateUserInfo = user => ({
  type: 'login.updateUserInfo',
  user: user,
})
