import React, { useState } from 'react';
import logo from './logo.svg';
import './App.scss';

import HomePage from './pages/home'
import DashboardPage from './pages/dashboard'

function App() {
  const [employee, setEmployee] = useState({
    name: 'Malik Harrison'
  });

  if (employee) {
    return (
      <div className="App">
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
          <a class="navbar-brand" href="#">Payly</a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="navbar-nav">
              <li class="nav-item active">
                <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Timesheet</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Admin</a>
              </li>
            </ul>
          </div>

          <form class="form-inline my-2 my-lg-0">
            <ul class="navbar-nav">
              <img src="https://lh3.googleusercontent.com/proxy/7Z_FvbvJMyQ2QnG_ttRadrbQ8O27FgrqvyBvUTOAezEWgXZU41OcwFde6d4ZCY_NEgjVkoycOl1HdqxoIcT13QOZ" alt="..." class="rounded-circle"/>
              <a class="navbar-brand" href="#">Hi, {employee.name}</a>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Dropdown link
                </a>
                <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                  <a class="dropdown-item" href="#">Action</a>
                  <a class="dropdown-item" href="#">Another action</a>
                  <a class="dropdown-item" href="#">Something else here</a>
                </div>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Log Out</a>
              </li>
            </ul>
          </form>
        </nav>

        <DashboardPage employee={employee}></DashboardPage>
      </div>
    );
  } else {
    return (
      <div className="App">
        <HomePage
          setEmployee={setEmployee}
        ></HomePage>
      </div>
    );
  }
}

export default App;
