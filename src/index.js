import React from 'react';
import { HashRouter } from "react-router-dom";
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <div className="app-wrapper">
        <div className="app-background"></div>
        <div className="main-page">
          <h1 className="text-center">MANAGEMENT OF SOLDIERS IN QUARANTINE</h1>
          <h2 className="text-center">(MASQ)</h2>
          <App />
        </div>
      </div>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
