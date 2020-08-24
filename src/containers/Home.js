import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

import HOME_IMG from '../assets/images/har-kadam-aagey.jpeg';

export default function Home({ initialSetup }) {
  const [ appState, setAppState ] = useState({
    setupPresent: null,
    barracks: 0,
    units: 0,
    vacancies: 0
  });

  useEffect(() => {
    if(!('initialSetup' in initialSetup)){
      setAppState({ setupPresent: false });
    }else{
      setAppState({ setupPresent: true });
    }
  }, [initialSetup]);

  return (
    <>
      <div className="setup-form">
        {
          appState.setupPresent === false &&
          <Link className="setup-begin" to="/setup">Please click here to begin the setup</Link>
        }
        <div className="home-img"><img src={HOME_IMG} alt="home"/></div>
      </div>
    </>
  );
}
