import "babel-polyfill";

import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import { Provider } from 'react-redux'
import { store } from './redux'
// import ReduxTest from './redux-test'

import { CookiesProvider } from 'react-cookie';

import { BrowserRouter, Switch, Route, Link, withRouter } from 'react-router-dom';

// import 'typeface-roboto'
// import '../node_modules/material-components-web/dist/material-components-web.min.css'

import './App.css';
import './main.css'
import './index.css';

import App from './App';
import LoginPage from './login';

ReactDOM.render(<CookiesProvider>
    <Provider store={store}>
        {/* <BrowserRouter>
            <Switch>
                <Route path="/login" component={LoginPage} />
                <Route component={App} />
            </Switch>
        </BrowserRouter> */}
        <App />
    </Provider>
</CookiesProvider>, document.getElementById('root'));
// ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
// ReactDOM.render(<Provider store={store}><ReduxTest /></Provider>, document.getElementById('root'));
registerServiceWorker();
