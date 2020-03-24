import React, { useState, useEffect } from 'react';
import './HomePage.scss';

import Numpad from './components/numpad'

function HomePage(props) {
  const [employeeID, setEmployeeID] = useState('');

  useEffect(() => {
    // Update the document title using the browser API
    document.title = `You clicked ${setEmployeeID} times`;
    console.log('yerr');
  });

  function handleLogin() {
    props.setEmployee({
      employeeID: 1,
      name: 'Malik Harrison'
    })
  }

  return (
    <div id="home-page">
      <div id="employee-id">{employeeID}</div>

      <Numpad
        employeeID={employeeID}
        callback={setEmployeeID}
      ></Numpad>

      <button id="login-btn" className="btn  btn-primary" onClick={() => { handleLogin(employeeID, props.setEmployee) }}>Login</button>
    </div>
  );
}

export default HomePage
