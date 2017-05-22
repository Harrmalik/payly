<?php   include_once "./layouts/header.php"; ?>
    <script type="text/babel" src="./js/timesheet.js"></script>
</head>

<body>
    <div class="panel panel-primary container">
        <div class="panel-heading">
            <p class="text-center"><img src="../CognosReports/images/delta_logo.png" width="150px" /></p>
        </div>

        <nav class="navbar navbar-default">
          <div class="container-fluid">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
              <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
              </button>
              <a class="navbar-brand" href="#"><b>Punch In Clock</b></a>
            </div>

            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              <ul class="nav navbar-nav">
                  <li class="active"><a href="./" role="button">Home</a></li>
                  <li><a href="./admin.php" role="button">Admin</a></li>
              </ul>
              <ul class="nav navbar-nav navbar-right">
                  <li><a href="./" role="button">Sign Out</a></li>
                <li><a href="../ApplicationPortal/dashboard.php" role="button">Application Portal</a></li>
              </ul>
            </div><!-- /.navbar-collapse -->
          </div><!-- /.container-fluid -->
        </nav>

        <div class="panel-body">
            <form class="form-horizontal">
                <div class="form-group">
                    <label for="end" style="text-align: left;" class="col-sm-2 control-label">Week Ending</label>
                    <div class="col-sm-4">
                    <div class='input-group date' id='end'>
                      <input type='text' class="form-control" />
                      <span class="input-group-addon">
                          <span class="glyphicon glyphicon-calendar"></span>
                      </span>
                    </div>
                    </div>
                </div>
            </form>
            <h2 id="username"></h2>
            <!-- <h3>Timesheet for Week of <span id="startDate"></span> - <span id="endDate"></span></h3> -->

            <table id="timesheet" class="table">
                <tr id="saturday">
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="saturdayHours" class="info"><b>0</b></td>
                </tr>

                <tr id="sunday">
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="sundayHours" class="info"><b>0</b></td>
                </tr>

                <tr id="monday">
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="mondayHours" class="info"><b>0</b></td>
                </tr>

                <tr id="tuesday">
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="tuesdayHours" class="info"><b>0</b></td>
                </tr>

                <tr id="wednesday">
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="wednesdayHours" class="info"><b>0</b></td>
                </tr>



                <tr id="thursday">
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="thursdayHours" class="info"><b>0</b></td>
                </tr>



                <tr id="friday">
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="fridayHours" class="info"><b>0</b></td>
                </tr>

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
                    <td id="totalHours" class="info"><b>0</b></td>
                </tr>
            </table>

        <hr>
        <p>Yellow Background: Used phone system</p>
        <p>Pink Background: Vacation Time</p>
        <p>Green Background: Paid time off</p>
        <p>Red Time: Break under 30 minutes</p>
        <p>Red Hours: Work period over 6 Hours</p>
        <p>*: Called using personal phone</p>
        </div>
    </div>
</body>
