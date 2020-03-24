import React, { useState, useEffect } from 'react';
import './DashboardPage.scss';

// import Numpad from './components/numpad'

function DashboardPage(props) {
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
    <div id="dashboard-page">
      Welcome to the dashboard
    </div>
  );
}

export default DashboardPage
