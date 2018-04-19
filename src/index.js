import "babel-polyfill";

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

// import 'typeface-roboto'
// import '../node_modules/material-components-web/dist/material-components-web.min.css'

import './App.css';
// import './main.css'

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
