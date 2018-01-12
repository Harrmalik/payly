<?php   include_once "./layouts/header.php"; ?>
<?php
    require_once('/var/www/resources/core/index.php');
    $core->inc('users');
    USER::authPage();
    if (USER::inGroup(74)) {
            $isManager = 'false';
    } else {
            $isManager = 'true';
    }
?>
    <script type="text/babel" src="./js/admin.js"></script>
</head>

<body data-isManager="<?php echo $isManager; ?>">
    <div class="panel panel-primary container">
        <div class="panel-heading">
            <p class="text-center"><img src="../DSCommons/public/images/delta_logo.png" width="150px" /></p>
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
                  <li><a href="./" role="button">Home</a></li>
                  <li class="active"><a href="./admin.php" role="button">Admin</a></li>
              </ul>
              <ul class="nav navbar-nav navbar-right">
                  <li><a href="../ApplicationPortal/logout.php" role="button">Sign Out</a></li>
                <li><a href="../ApplicationPortal/dashboard.php" role="button">Application Portal</a></li>
              </ul>
            </div><!-- /.navbar-collapse -->
          </div><!-- /.container-fluid -->
        </nav>

        <div class="panel-body">
            <?php if ($isManager == 'false') { ?>
                <span id="alert"></span>
                <!-- Nav tabs -->
                <ul class="nav nav-tabs" role="tablist">
                  <li role="presentation" class="active"><a href="#home" aria-controls="home" role="tab" data-toggle="tab">Edit Timesheets</a></li>
                  <li role="presentation"><a href="#users" aria-controls="users" role="tab" data-toggle="tab">Edit Users</a></li>
                  <li role="presentation"><a href="#supervisors" aria-controls="supervisors" role="tab" data-toggle="tab">Edit Supervisors</a></li>
                </ul>

                <br/>
                <div class="tab-content">
                  <div role="tabpanel" class="tab-pane active" id="home">
                      <form class="form-horizontal" onsubmit="return getTimesheet();">
                        <div class="form-group">
                          <label for="employeeID" class="col-sm-2 control-label">Employee ID</label>
                          <div class="col-sm-4">
                            <input type="text" class="form-control" id="employeeID" placeholder="Employee ID">
                          </div>
                        </div>
                    </form>
                    <div id="loader2"></div>

                      <div class="modal fade" tabindex="-1" role="dialog">
                        <div class="modal-dialog" role="document">
                          <div class="modal-content">
                            <div class="modal-header">
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                              <h4 class="modal-title" id="modal-title">Edit Timeslot</h4>
                            </div>

                            <div class="modal-body">
                                <form class="form-horizontal" onsubmit="return getTimesheet();">
                                    <div class="form-group" id="typefield">
                                        <select class="form-control" id="type">
                                            <option value="1">Vacation</option>
                                            <option value="2">Sick</option>
                                            <option value="0">Regular</option>
                                            <option value="3">Floating</option>
                                            <option value="4">Holiday</option>
                                          </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="punchintime" style="text-align: left;" class="col-sm-3 control-label">Punch In</label>
                                        <div class="col-sm-9">
                                            <div class='input-group date' id='punchintime'>
                                                <input type='text' class="form-control" />
                                                <span class="input-group-addon">
                                                    <span class="glyphicon glyphicon-calendar"></span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group" id="punchingout">
                                        <label for="punchouttime" style="text-align: left;" class="col-sm-3 control-label">Punch Out</label>
                                        <div class="col-sm-9">
                                            <div class='input-group date' id='punchouttime'>
                                                <input type='text' class="form-control" />
                                                <span class="input-group-addon">
                                                    <span class="glyphicon glyphicon-calendar"></span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group adding">
                                        <h4>Hours</h4>
                                        <button type="button" class="btn btn-default" onClick="fullday()">Full Day</button>
                                        <button type="button" class="btn btn-default" onClick="halfday()">Half Day</button>
                                    </div>
                                    <div class="form-group adding">
                                        <input type="number" class="form-control" id="selectHours">
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                              <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                              <span id="modal-button"></span>
                            </div>
                          </div><!-- /.modal-content -->
                        </div><!-- /.modal-dialog -->
                      </div><!-- /.modal -->
                  </div>

                  <div role="tabpanel" class="tab-pane" id="users">
                      <form class="form-horizontal" onsubmit="return getTimesheet();">
                        <div class="form-group">
                          <label for="employeeID" class="col-sm-2 control-label">Employee ID</label>
                          <div class="col-sm-4">
                            <input type="number" class="form-control" id="" placeholder="Employee ID">
                          </div>
                        </div>
                    </form>
                  </div>

                  <div role="tabpanel" class="tab-pane" id="supervisors">
                      <form class="form-horizontal" onsubmit="return getTimesheet();">
                        <div class="form-group">
                          <label for="employeeID" class="col-sm-2 control-label">Employee ID</label>
                          <div class="col-sm-4">
                            <input type="number" class="form-control" id="supervisors" placeholder="manager">
                          </div>
                        </div>
                      </form>
                  </div>
                </div>


            <?php } else { ?>
                <section id="employees">
                    <h2>Employees</h2>
                    <hr/>
                    <div id="loader"></div>
                    <table class="table table-hover">
                        <thead>
                            <th>Name</th>
                            <th>This Week Hours</th>
                            <th>Last Week Hours</th>
                            <th></th>
                        </thead>
                        <tbody id="list">

                        </tbody>
                    </table>
                </section>
            <?php } ?>

            <section id="userTimesheet">
                <button class="btn btn-default btn-top" id="back" onclick="back()"><i class="glyphicon glyphicon-chevron-left"></i> Back</button>
                <form class="form-horizontal">
                    <div class="form-group">
                      <label for="end" class="col-sm-2 control-label">Week Ending</label>
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
                <h3>Timesheet for Week of <span id="startDate"></span> - <span id="endDate"></span></h3>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-primary" id="addTimeslot">Add Time</button>
                </div>

                <table id="timesheet" class="table">
                <tr id="saturday">
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="saturdayHours" class="info" colspan="2"><b>0</b></td>
                </tr>

                <tr id="sunday">
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="sundayHours" class="info" colspan="2"><b>0</b></td>
                </tr>

                <tr id="monday">
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="mondayHours" class="info" colspan="2"><b>0</b></td>
                </tr>

                <tr id="tuesday">
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="tuesdayHours" class="info" colspan="2"><b>0</b></td>
                </tr>

                <tr id="wednesday">
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="wednesdayHours" class="info" colspan="2"><b>0</b></td>
                </tr>



                <tr id="thursday">
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="thursdayHours" class="info" colspan="2"><b>0</b></td>
                </tr>



                <tr id="friday">
                </tr>

                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="fridayHours" class="info" colspan="2"><b>0</b></td>
                </tr>

                <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th>Total Hours</th>
                    <th></th>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td id="totalHours" class="info" colspan="2"><b>0</b></td>
                </tr>
                </table>
            </section>
        </div>
    </div>
</body>
