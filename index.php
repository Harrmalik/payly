<?php include_once './layouts/header.php' ?>
        <script type="text/babel" src="./js/main.js"></script>
</head>

<body>
    <div class="panel panel-primary container">
        <div class="panel-heading" style="display:none">
            <p class="text-center"><img src="<?php echo $assets; ?>../images/delta_logo.png" width="150px" /></p>
        </div>

        <nav class="navbar navbar-inverse">
          <div class="container-fluid">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
              <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
              </button>
              <a class="navbar-brand" href="./"><b>Punch In Clock</b></a>
            </div>

            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              <ul class="nav navbar-nav">
                  <li class="active"><a href="./" role="button">Home</a></li>
                  <li><a href="./admin.php" role="button">Admin</a></li>
              </ul>
              <ul class="nav navbar-nav navbar-right">
                  <p class="navbar-text" id="name"></p>
                  <li><a href="./" role="button">Sign Out</a></li>
              </ul>
            </div><!-- /.navbar-collapse -->
          </div><!-- /.container-fluid -->
        </nav>

        <div class="panel-body">
        <section id="auth" style="display:none">
            <div id="message"></div>
            <form class="form-horizontal" onsubmit="return login()">
              <div class="form-group">
                <label for="inputID" class="col-sm-2 control-label">Employee ID</label>
                <div class="col-sm-10">
                  <input type="number" class="form-control" id="inputID" placeholder="Employee ID">
                </div>
              </div>
            </form>

            <div class="modal fade" tabindex="-1" role="dialog">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">User not found!</h4>
                  </div>
                  <div class="modal-body">
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-default btn-lg" data-dismiss="modal">No</button>
                    <button type="button" class="btn btn-warning btn-lg" onclick="unknownSignin()">Yes</button>
                  </div>
                </div><!-- /.modal-content -->
              </div><!-- /.modal-dialog -->
            </div><!-- /.modal -->

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
            <h3 style="color: white">holder</h3>
            <div id="clockdate" style="display:none">
              <div class="clockdate-wrapper">
                <div id="clock"></div>
                <div id="date"></div>
              </div>
            </div>

            <div id="warning" class="modal fade" tabindex="-1" role="dialog">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Modal title</h4>
                  </div>
                  <div class="modal-body">
                    <p>If this is your local computer, clicking "Accept" will keep your session logged in forever</p>
                    <p class="red">Please do not click "Accept" if this is a public machine</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-dismiss="modal" style="width:auto;height:100%;">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="setUser()" style="width:auto;height:100%;">Accept</button>
                  </div>
                </div><!-- /.modal-content -->
              </div><!-- /.modal-dialog -->
            </div><!-- /.modal -->

            <section class="mainBtns">
                <button type="button" class="btn btn-primary btn-lg" id="checkIn">Punch In</button>
                <button type="button" class="btn btn-primary btn-lg" id="checkOut">Punch Out</button>
                <button type="button" class="btn btn-default btn-lg" id="timesheet">View Timesheet</button>
                <button type="button" class="btn btn-block btn-lg btn-default" onclick="openWarning()" id="setuser" style="display:none; width:97%; height:3em">This is my local machine</button>
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
