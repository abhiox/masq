import React, { useState, useEffect } from 'react';
import { Route, useLocation } from "react-router-dom";
import { ToastProvider } from 'react-toast-notifications';
import Header from './components/Header';
import Home from './containers/Home';
import InitialSetup from './containers/InitialSetup';
import PersonManagement from './containers/PersonManagement';
import Reports from './containers/Reports';
import PersonList from './containers/PersonList';
import BarrackList from './containers/BarrackList';

const storage = window.require('electron-json-storage');

export default function App() {
  const [appData, setAppData] = useState({});
  const location = useLocation();

  useEffect(() => {
    storage.get('initialSetup', function (error, data) {
      if (error) throw error;

      if ('initialSetup' in data) {
        setAppData({ ...data });
      }
    });
  }, [location.pathname]); // fetch data on every link change 

  return (
    <>
      <Header />
      <ToastProvider>
        <Route
          path="/"
          exact
          render={() => <Home initialSetup={appData} />}
        />
        <Route
          path="/setup"
          exact
          render={() => <InitialSetup initialSetup={appData} />}
        />
        <Route
          path="/personMgmt"
          exact
          render={() => <PersonManagement initialSetup={appData} />}
        />
        <Route
          path="/reports"
          exact
          render={() => <Reports initialSetup={appData} />}
        />
        <Route
          path="/personList"
          exact
          render={() => <PersonList initialSetup={appData} />}
        />
        <Route
          path="/barrackList"
          exact
          render={() => <BarrackList initialSetup={appData} />}
        />
      </ToastProvider>
    </>
  )
}