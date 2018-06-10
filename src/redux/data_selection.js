import { createStore, combineReducers, applyMiddleware, compose } from 'redux'

const initState = {
    snackbarOpen: false,
    snackbarContent: "",
}

export default function dataSelectionReducer(state = initState, action) {
    let newState = { ...state }

    switch (action.type) {
        case 'data.showSanckbar':
            newState.snackbarOpen = true
            newState.snackbarContent = action.msg
            break

        case 'data.hideSanckbar':
            newState.snackbarOpen = false
            break
    }

    return newState
}

export const actionShowSnackbar = msg => ({
    type: 'data.showSanckbar',
    msg,
})
// export actionShowSnackbar

export const actionHideSnackbar = _ => ({
    type: 'data.hideSanckbar'
})
// export actionHideSnackbar

// export function commonDispatchs = _ => {
//     showSnackbar: msg => dispatch(actionShowSnackbar(msg))
// }