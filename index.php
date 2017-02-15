<?php include_once './layouts/header.php' ?>
        <script src="./js/main.js"></script>
</head>

<body>
    <div class="panel panel-primary container">
        <div class="panel-heading">
            <p class="text-center"><img src="../CognosReports/images/delta_logo.png" width="150px" /></p>
            <h2 class="text-center">Check In Clock</h2>
        </div>

        <div class="panel-body">
            <div style="float: left">
            </div>

            <div style="float: right">
                <a href="./" class="btn btn-primary" role="button">Sign out</a>
                <a href="../ApplicationPortal/dashboard.php" class="btn btn-primary" role="button">Dashboard</a>
            </div>
        <section id="auth">
            <div id="message"></div>
            <form class="form-horizontal">
              <div class="form-group">
                <label for="inputID" class="col-sm-2 control-label">Employee ID</label>
                <div class="col-sm-10">
                  <input type="number" class="form-control" id="inputID" placeholder="Employee ID">
                </div>
              </div>
            </form>

            <section id="numpad">
                <div class="btn-group-vertical btn-group-lg btn-group-primary" role="group" aria-label="...">
                  <button type="button" class="btn btn-default" onClick="update(1)">1</button>
                  <button type="button" class="btn btn-default" onClick="update(4)">4</button>
                  <button type="button" class="btn btn-default" onClick="update(7)">7</button>
                  <button type="button" class="btn btn-default" onClick="back()">Back</button>
                </div>
                <div class="btn-group-vertical btn-group-lg" role="group" aria-label="...">
                  <button type="button" class="btn btn-default" onClick="update(2)">2</button>
                  <button type="button" class="btn btn-default" onClick="update(5)">5</button>
                  <button type="button" class="btn btn-default" onClick="update(8)">8</button>
                  <button type="button" class="btn btn-default" onClick="update(0)">0</button>
                </div>
                <div class="btn-group-vertical btn-group-lg" role="group" aria-label="...">
                  <button type="button" class="btn btn-default" onClick="update(3)">3</button>
                  <button type="button" class="btn btn-default" onClick="update(6)">6</button>
                  <button type="button" class="btn btn-default" onClick="update(9)">9</button>
                  <button type="button" class="btn btn-default" onClick="empty()">Clear</button>
                </div>
            </section>
            <button type="button" id="login" class="btn btn-success btn-block btn-lg" onClick="login()">Log In</button>
        </section>

        <section id="app">
            <section class="mainBtns">
                <button type="button" class="btn btn-primary btn-lg" id="checkIn">Punch In</button>
                <button type="button" class="btn btn-primary btn-lg" id="checkOut">Punch Out</button>
                <button type="button" class="btn btn-default btn-lg" id="timesheet">View Timesheet</button>
            </section>

            <h3>Today's Hours</h3>

            <table class="table">
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>

                <tbody id="todayHours">
                </tbody>

                <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th>Total Hours</th>
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="totalHours">0</td>
                </tr>
            </table>
        </section>
        </div>
    </div>
</body>
