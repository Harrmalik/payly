<?php   include_once "./layouts/header.php"; ?>
<?php
    require_once('/var/www/resources/core/index.php');
    $core->inc('users');
    USER::authPage();

    $isManager      = USER::inGroup(73) ? 'true' : 'false';
    $isBasicManager = USER::inGroup(11) || USER::inGroup(12) || USER::inGroup(13) || USER::inGroup(14) || USER::inGroup(15) ? 'true' : 'false';
    $isPayroll      = USER::inGroup(74) ? 'true' : 'false';
    $isTrainer      = USER::inGroup(21) ? 'true' : 'false';
    $isHr           = USER::inGroup(57) ? 'true' : 'false';
    $isDm           = USER::inGroup(65) ? 'true' : 'false';
    $isLocation     = $_SESSION['location'] != 900 ? 'true' : 'false';
?>

<!--
<link rel="stylesheet" href="../../DSCommons/public/css/datatables.min.css">
-->
<link rel="stylesheet" href="./css/jquery.dataTables.min.css">
<link rel="stylesheet" href="./css/datetimepicker.css">
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
<link re="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.1/css/theme.default.min.css">
<link re="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.1/css/theme.bootstrap_3.min.css">

<script src="https://cdn.datatables.net/buttons/1.5.1/js/dataTables.buttons.min.js"></script>
<script src="https://cdn.datatables.net/buttons/1.5.1/js/buttons.flash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.32/pdfmake.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.32/vfs_fonts.js"></script>
<script src="https://cdn.datatables.net/buttons/1.5.1/js/buttons.html5.min.js"></script>
<script src="https://cdn.datatables.net/buttons/1.5.1/js/buttons.print.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.1/js/jquery.tablesorter.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.1/js/jquery.tablesorter.widgets.min.js"></script>



<!--[if lt IE 9]>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
<![endif]-->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/chosen/1.8.2/chosen.min.css" rel="stylesheet"/>
    <link href="./css/styles.css" rel="stylesheet"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/chosen/1.8.2/chosen.jquery.min.js"></script>
</head>

<body data-myempid="<?php echo $_SESSION['employeeid']; ?>" data-location="<?php echo $_SESSION['location']; ?>" data-isManager="<?php echo $isManager; ?>" data-isBasicManager="<?php echo $isBasicManager; ?>" data-isPayroll="<?php echo $isPayroll; ?>"
  data-islocation="<?php echo $isLocation; ?>" data-ishr="<?php echo $isHr; ?>" data-istrainer="<?php echo $isTrainer; ?>" data-isdm="<?php echo $isDm; ?>">
    <div class="panel panel-primary container">
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
              <a class="navbar-brand" href="#"><b>Kissklock Admin</b></a>
            </div>

            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              <ul class="nav navbar-nav">
                  <li><a href="./" role="button">Kissklock</a></li>
                  <li role="presentation" class="active"><a href="#dashboard" aria-controls="dashboard" role="tab" data-toggle="tab" onclick="$('#userTimesheet').hide();$('#employees').show();$('#laborBreakdown').hide();">Dashboard</a></li>
                  <li role="presentation"><a class="adminsBtn" href="#home" aria-controls="home" role="tab" data-toggle="tab">Timesheet Management</a></li>
                  <li role="presentation"><a class="trainerBtn" href="#addusers" aria-controls="addusers" role="tab" data-toggle="tab" onclick="$('#userTimesheet').hide();$('#laborBreakdown').hide();">Add users</a></li>
                  <li role="presentation"><a class="adminsBtn" href="#users" aria-controls="users" role="tab" data-toggle="tab" onclick="$('#userTimesheet').hide();$('#laborBreakdown').hide();">User Management</a></li>
                  <li role="presentation"><a class="payrollBtn" href="#supervisors" aria-controls="supervisors" role="tab" data-toggle="tab" onclick="$('#userTimesheet').hide();$('#laborBreakdown').hide();">Supervisor Management</a></li>
                  <li role="presentation"><a class="tipsBtn" href="#tips" aria-controls="tips" role="tab" data-toggle="tab" onclick="$('#userTimesheet').hide();$('#laborBreakdown').hide();">Tips Management</a></li>
                  <li role="presentation"><a class="hrBtn" href="#auditing" aria-controls="auditing" role="tab" data-toggle="tab" onclick="$('#userTimesheet').hide();$('#laborBreakdown').hide();">Auditing</a></li>
                  <li role="presentation"><a class="adminsBtn" href="#reports" aria-controls="reports" role="tab" data-toggle="tab" onclick="$('#userTimesheet').hide()">Reports</a></li>
                  <!-- <li role="presentation"><a class="hrBtn" href="#news" aria-controls="reports" role="tab" data-toggle="tab" onclick="$('#userTimesheet').hide()">News</a></li> -->
              </ul>
              <ul class="nav navbar-nav navbar-right">
                  <li class="dropdown multiSite">
                   <a id="homeLocation" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Site:  <?php echo $_SESSION['location']; ?> <span class="caret"></span></a>
                   <ul class="dropdown-menu" id="locations">
                   </ul>
                 </li>
                  <li><a href="../ApplicationPortal/logout.php" role="button">Sign Out</a></li>
                <li><a href="../ApplicationPortal/dashboard.php" role="button">Application Portal</a></li>
              </ul>
            </div><!-- /.navbar-collapse -->
          </div><!-- /.container-fluid -->
        </nav>

        <div class="panel-body">
            <div class="tab-content">

              <div role="tabpanel" class="tab-pane active" id="dashboard">
                    <section id="employeesLoader" style="display:none">
                        Loading Data ....
                    </section>
                    <section id="employees">
                        <?php if($isLocation == 'true') { ?>
                            <form class="form-inline">
                                <div class="form-group">
                                    <label for="punchouttime" style="text-align: left;" class=" control-label">Week Ending</label>
                                    <div class='input-group date' id='dDate'>
                                        <input type='text' class="form-control" />
                                        <span class="input-group-addon">
                                            <span class="glyphicon glyphicon-calendar"></span>
                                        </span>
                                    </div>
                                </div>
                                <div class="checkbox" style="padding-right:5px">
                                  <label>
                                    <input type="checkbox" checked onclick="$('.wash-cards').toggle()"> Wash <span  class="badge badge-primary" id="washTotalCount"></span>
                                  </label>
                                </div>
                                <div class="checkbox" style="padding-right:5px">
                                  <label>
                                    <input type="checkbox" checked onclick="$('#detailCard').toggle()"> Detail <span  class="badge badge-primary" id="detailTotalCount"></span>
                                  </label>
                                </div>
                                <div class="checkbox" style="padding-right:5px">
                                  <label>
                                    <input type="checkbox" checked onclick="$('#storeCard').toggle()"> Store <span  class="badge badge-primary" id="storeTotalCount"></span>
                                  </label>
                                </div>
                                <div class="checkbox" style="padding-right:5px">
                                  <label>
                                    <input type="checkbox" checked onclick="$('#foodCard').toggle()"> Food <span  class="badge badge-primary" id="foodTotalCount"></span>
                                  </label>
                                </div>
                                <div class="checkbox" style="padding-right:5px">
                                  <label>
                                    <input type="checkbox" checked onclick="$('#lubeCard').toggle()"> Lube <span  class="badge badge-primary" id="lubeTotalCount"></span>
                                  </label>
                                </div>
                                <div class="checkbox" style="padding-right:5px">
                                  <label>
                                    <input type="checkbox" checked onclick="$('#workedCard').toggle()"> Worked/Didn't Work
                                  </label>
                                </div>
                            </form>

                            <article style="width:70%;float:left;padding: 1em;height:85vh;overflow:scroll">
                                <h2 class="table-name"> Working Now <span id="workingCount" class="badge"></span> <small>Last Updated: <span id="lastUpdate"></span></small></h2>

                                <div class="table-card wash-cards">
                                  <div class="table-card wash-cards" id="boothCard">
                                      <h2 class="table-name"> Booth <span id="boothCount" class="badge"></span></h2>
                                      <table class="table table-condensed table-hover table-striped">
                                        <thead>
                                            <tr>
                                                <th>Start Time</th>
                                                <th>Name</th>
                                                <th>Day Hrs</th>
                                                <th>Role Hrs</th>
                                                <th>Break</th>
                                                <th>Minor</th>
                                                <th>Role</th>
                                                <th>Wk Hrs</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody id="boothTable">

                                        </tbody>
                                      </table>
                                  </div>

                                  <div class="table-card wash-cards" id="powerCard">
                                      <h2 class="table-name"> Power Wash <span id="powerCount" class="badge"></span></h2>
                                      <table class="table table-condensed table-hover table-striped">
                                        <thead>
                                            <tr>
                                                <th>Start Time</th>
                                                <th>Name</th>
                                                <th>Day Hrs</th>
                                                <th>Role Hrs</th>
                                                <th>Break</th>
                                                <th>Minor</th>
                                                <th>Role</th>
                                                <th>Wk Hrs</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody id="powerTable">

                                        </tbody>
                                      </table>
                                  </div>

                                  <div class="table-card wash-cards" id="washCard">
                                      <h2 class="table-name"> Wash Exit <span id="washExitCount" class="badge"></span></h2>
                                      <table class="table table-condensed table-hover table-striped">
                                        <thead>
                                            <tr>
                                                <th>Start Time</th>
                                                <th>Name</th>
                                                <th>Day Hrs</th>
                                                <th>Role Hrs</th>
                                                <th>Break</th>
                                                <th>Minor</th>
                                                <th>Role</th>
                                                <th>Wk Hrs</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody id="washTable">

                                        </tbody>
                                      </table>
                                  </div>

                                  <div class="table-card" id="managementCard">
                                      <h2 class="table-name"> Management <span id="managersCount" class="badge"></span></h2>
                                      <table class="table table-condensed table-hover table-striped">
                                        <thead>
                                            <tr>
                                              <th>Start Time</th>
                                              <th>Name</th>
                                              <th>Day Hrs</th>
                                              <th>Role Hrs</th>
                                              <th>Break</th>
                                              <th>Minor</th>
                                              <th>Role</th>
                                              <th>Wk Hrs</th>
                                              <th></th>
                                            </tr>
                                        </thead>
                                        <tbody id="managementTable">

                                        </tbody>
                                      </table>
                                  </div>
                                </div>

                                <div class="table-card" id="detailCard">
                                    <h2 class="table-name"> Detail <span id="detailCount" class="badge"></span></h2>
                                    <table class="table table-condensed table-hover table-striped">
                                      <thead>
                                          <tr>
                                              <th>Start Time</th>
                                              <th>Name</th>
                                              <th>Day Hrs</th>
                                              <th>Role Hrs</th>
                                              <th>Break</th>
                                              <th>Minor</th>
                                              <th>Role</th>
                                              <th>Wk Hrs</th>
                                              <th></th>
                                          </tr>
                                      </thead>
                                      <tbody id="detailTable">

                                      </tbody>
                                    </table>
                                </div>

                                <div class="table-card" id="storeCard">
                                    <h2 class="table-name"> C-Store <span id="storeCount" class="badge"></span></h2>
                                    <table class="table table-condensed table-hover table-striped">
                                      <thead>
                                          <tr>
                                              <th>Start Time</th>
                                              <th>Name</th>
                                              <th>Day Hrs</th>
                                              <th>Role Hrs</th>
                                              <th>Break</th>
                                              <th>Minor</th>
                                              <th>Role</th>
                                              <th>Wk Hrs</th>
                                              <th></th>
                                          </tr>
                                      </thead>
                                      <tbody id="storeTable">

                                      </tbody>
                                    </table>
                                </div>

                                <div class="table-card" id="foodCard">
                                    <h2 class="table-name"> Food Service <span id="foodCount" class="badge"></span></h2>
                                    <table class="table table-condensed table-hover table-striped">
                                      <thead>
                                          <tr>
                                              <th>Start Time</th>
                                              <th>Name</th>
                                              <th>Day Hrs</th>
                                              <th>Role Hrs</th>
                                              <th>Break</th>
                                              <th>Minor</th>
                                              <th>Role</th>
                                              <th>Wk Hrs</th>
                                              <th></th>
                                          </tr>
                                      </thead>
                                      <tbody id="foodTable">

                                      </tbody>
                                    </table>
                                </div>

                                <div class="table-card" id="lubeCard">
                                    <h2 class="table-name"> Lube <span id="lubeCount" class="primary badge"></span></h2>
                                    <table class="table table-condensed table-hover table-striped">
                                      <thead>
                                          <tr>
                                              <th>Start Time</th>
                                              <th>Name</th>
                                              <th>Day Hrs</th>
                                              <th>Role Hrs</th>
                                              <th>Break</th>
                                              <th>Minor</th>
                                              <th>Role</th>
                                              <th>Wk Hrs</th>
                                              <th></th>
                                          </tr>
                                      </thead>
                                      <tbody id="lubeTable">

                                      </tbody>
                                    </table>
                                </div>

                                <div class="table-card" id="otherCard">
                                    <h2 class="table-name"> Other <span id="otherCount" class="badge"></span></h2>
                                    <table class="table table-condensed table-hover table-striped">
                                      <thead>
                                          <tr>
                                            <th>Start Time</th>
                                            <th>Name</th>
                                            <th>Day Hrs</th>
                                            <th>Role Hrs</th>
                                            <th>Break</th>
                                            <th>Minor</th>
                                            <th>Role</th>
                                            <th>Wk Hrs</th>
                                            <th></th>
                                          </tr>
                                      </thead>
                                      <tbody id="otherTable">

                                      </tbody>
                                    </table>
                                </div>
                            </article>
                            <article style="width:30%;float:left;padding: 1em;height:85vh;overflow:scroll"  id="workedCard">
                                <h2 class="table-name"> Worked Today <span id="activeCount" class="badge"></span></h2>
                                <table class="table">
                                  <thead>
                                      <tr>
                                          <th></th>
                                          <th>Hrs</th>
                                          <th>Name</th>
                                          <th>Break</th>
                                          <th></th>
                                      </tr>
                                  </thead>
                                  <tbody id="workedTable">

                                  </tbody>
                                </table>

                                <h2 class="table-name"> Didn't Work Today <span id="nonActiveCount" class="badge"></span></h2>
                                <table class="table">
                                  <thead>
                                      <tr>
                                          <th></th>
                                          <th>Hrs</th>
                                          <th>Name</th>
                                          <th>Break</th>
                                          <th></th>
                                      </tr>
                                  </thead>
                                  <tbody id="totalTable">

                                  </tbody>
                                </table>
                            </article>
                        <?php } else { ?>
                            <h2>Employees</h2>
                            <hr/>
                            <table id="dashboardTable" class="table table-hover table-striped table-responsive">
                                <thead>
                                    <th>Name</th>
                                    <th>Currently Working</th>
                                    <th>Has Break</th>
                                    <th>Today Hours</th>
                                    <th>This Week Hours</th>
                                    <th>Last Week Hours</th>
                                    <th>Hours Till Overtime</th>
                                    <th>Action</th>
                                </thead>
                                <tbody id="list">

                                </tbody>
                            </table>
                        <?php } ?>
                    </section>
                </div>

              <div role="tabpanel" class="tab-pane" id="home">
                  <form class="form-horizontal" onsubmit="return getTimesheet();">
                    <div class="form-group">
                      <label for="employeeID" class="col-sm-2 control-label">Employee ID</label>
                      <div class="col-sm-4">
                        <input type="text" class="form-control" id="employeeID" placeholder="Employee ID">
                      </div>
                    </div>
                </form>
                <div id="loader2"></div>
              </div>

              <div role="tabpanel" class="tab-pane" id="addusers">
                <div id='addinguser' class="btn btn-primary">Add Another User</div>

                <br><br>
                <form class="form-inline" id="user-form">
                  <div class="form-group" style="display:block;">
                    <div class="form-group">
                      <label for="uName" class=" control-label">Employee #</label>
                      <input name="empid" type="text" class="form-control">
                    </div>
                    <div class="form-group">
                      <label for="uName" class=" control-label">Name</label>
                      <input name="name" type="text" class="form-control">
                    </div>
                    <div class="form-group">
                      <label for="inputPassword3" class=" control-label">Location</label>
                      <select name="location" class="form-control">
                          <option value="">Select a Location</option>
                          <option value="807">807. Main Street</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="inputPassword3" class=" control-label">Timezone</label>
                      <select name="timezone" class="form-control">
                          <option value="America/New_York">EST</option>
                          <option value="America/Chicago">CDT</option>
                      </select>
                    </div>
                    </br></br>
                  </div>
                </form>

                <br/><br/>
                <div id="savingMassUsers" class="btn btn-primary btn-block">Save Users</div>
              </div>

              <div role="tabpanel" class="tab-pane" id="users">
                  <form class="form-horizontal">
                    <div class="form-group">
                      <label for="employeeID" class="col-sm-2 control-label">Employee ID</label>
                      <div class="col-sm-4">
                        <input type="text" class="form-control" id="employeeid" placeholder="Employee ID">
                      </div>
                    </div>
                </form>

                <br><br>
                <form class="form-horizontal">
                  <div class="form-group">
                    <label for="uName" class="col-sm-2 control-label">Employee Name</label>
                    <div class="col-sm-4">
                      <input type="text" class="form-control" id="uName">
                    </div>
                  </div>
                  <div class="form-group payrollBtn">
                    <label for="uDeltasonic" class="col-sm-2 control-label">Company</label>
                    <div class="col-sm-4">
                        <select class="form-control" id="uDeltasonic">
                            <option value="1">Deltasonic</option>
                            <option value="0">Benderson</option>
                        </select>
                    </div>
                  </div>
                  <div class="form-group payrollBtn">
                    <label for="uCode" class="col-sm-2 control-label">Company Code</label>
                    <div class="col-sm-4">
                        <select class="form-control" id="uCode">
                            <option value="DSCW">DSCW</option>
                        </select>
                    </div>
                  </div>
                  <div class="form-group payrollBtn">
                    <label for="inputPassword3" class="col-sm-2 control-label">Job Description</label>
                    <div class="col-sm-4">
                      <input type="text" class="form-control" id="uJob">
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="inputPassword3" class="col-sm-2 control-label">Location</label>
                    <div class="col-sm-4">
                        <select class="form-control" id="uLocation">
                            <option value="">Select a Location</option>
                            <option value="900">900. Office</option>
                            <option value="807">807. Main Street</option>
                        </select>
                    </div>
                  </div>
                  <div class="form-group payrollBtn">
                    <label for="inputPassword3" class="col-sm-2 control-label">Supervisor</label>
                    <div class="col-sm-4">
                      <input type="text" class="form-control" id="uSupervisor" placeholder="Supervisor ID">
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="inputPassword3" class="col-sm-2 control-label">Timezone</label>
                    <div class="col-sm-4">
                        <select class="form-control" id="uTimezone">
                            <option value="America/New_York">EST</option>
                            <option value="America/Chicago">CDT</option>
                        </select>
                    </div>
                  </div>
                  <div class="form-group payrollBtn">
                    <label for="inputPassword3" class="col-sm-2 control-label">Holidays</label>
                    <div class="col-sm-4">
                      <input type="number" class="form-control" id="uHoliday" placeholder="How many hours">
                    </div>
                  </div>
                  <div class="form-group payrollBtn">
                    <label for="weekends" class="col-sm-2 control-label">Weekends</label>
                    <div class="col-sm-4">
                        <input id="weekends" type="checkbox"></input>
                    </div>
                  </div>
                  <div class="form-group payrollBtn">
                    <label for="nights" class="col-sm-2 control-label">Nights</label>
                    <div class="col-sm-4">
                        <input id="nights" type="checkbox"></input>
                    </div>
                  </div>
                  <div class="form-group payrollBtn">
                    <label for="alerts" class="col-sm-2 control-label">Alerts</label>
                    <div class="col-sm-4">
                        <input id="alerts" type="checkbox"></input>
                    </div>
                  </div>
                  <div class="form-group payrollBtn">
                    <label for="canCallIn" class="col-sm-2 control-label">Can Call In</label>
                    <div class="col-sm-4">
                        <input id="canCallIn" type="checkbox"></input>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="field" class="col-sm-2 control-label">Field</label>
                    <div class="col-sm-4">
                        <input id="field" type="checkbox"></input>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="phone" class="col-sm-2 control-label">Phone</label>
                    <div class="col-sm-4">
                      <input type="text" class="form-control" id="phone">
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="col-sm-offset-2 col-sm-10">
                      <div id="removeUser" class="btn btn-danger">Remove User</div>
                      <div id="saveUser" class="btn btn-primary">Save User</div>
                    </div>
                  </div>
                </form>
              </div>

              <div role="tabpanel" class="tab-pane" id="supervisors">
                  <form class="form-horizontal">
                    <div class="form-group">
                      <label for="supervisorid" class="col-sm-2 control-label">Supervisor ID</label>
                      <div class="col-sm-4">
                        <input type="text" class="form-control" id="supervisorid" placeholder="empid">
                      </div>
                    </div>
                  </form>

                  <br><br>
                  <form class="form-horizontal">
                    <div class="form-group">
                      <label for="sName" class="col-sm-2 control-label">Name</label>
                      <div class="col-sm-4">
                        <input type="text" class="form-control" id="sName">
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="sEmail" class="col-sm-2 control-label">Email</label>
                      <div class="col-sm-4">
                        <input type="text" class="form-control" id="sEmail" placeholder="supervisor@deltasoniccarwash.com">
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="supervisorEmployees" class="col-sm-2 control-label">Supervisor</label>
                      <div class="col-sm-8">
                        <select id="supervisorEmployees" data-placeholder="Add Employees" multiple class="form-control chosen-select" style="width:100%">
                        </select>
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="nights" class="col-sm-2 control-label">Is Active</label>
                      <div class="col-sm-4">
                          <input id="sActive" type="checkbox"></input>
                      </div>
                    </div>
                    <div class="form-group">
                      <div class="col-sm-offset-2 col-sm-10">
                        <div id="removeSupervisor" class="btn btn-danger">Remove Supervisor</div>
                        <div id="saveSupervisor" class="btn btn-success">Save Changes</div>
                      </div>
                    </div>
                  </form>
              </div>

              <div role="tabpanel" class="tab-pane" id="tips">
                  <div class="row text-left">
                      <form classs="form">
                      <div class="form-group">
                        <label for="end" class="col-sm-2 control-label">Dates</label>
                        <div class="col-sm-4">
                            <div class='input-group date' id='dateFilter'>
                                <input type='text' class="form-control" />
                                <span class="input-group-addon">
                                    <span class="glyphicon glyphicon-calendar"></span>
                                </span>
                            </div>
                        </div>
                        <span id="dateRangeDisplay"></span>
                      </div>
                  </form>

                    <table id="tipContainer" class="stripe row-border order-column">
                      <thead>
                          <tr>
                              <th>Name</th>
                              <th>Date</th>
                              <th>Location</th>
                              <th>Tipped Hours</th>
                              <th>Non Tipped Hours</th>
                              <th>4 Hour Acknowledgement</th>
                              <th>Wash Tips</th>
                              <th>Detail Tips</th>
                              <th>Total Tips</th>
                              <th>Manager Review</th>
                              <th></th>
                          </tr>
                      </thead>
                      <tfoot>
                          <tr>
                              <th>Name</th>
                              <th>Date</th>
                              <th>Location</th>
                              <th>Tipped Hours</th>
                              <th>Non Tipped Hours</th>
                              <th>4 Hour Acknowledgement</th>
                              <th>Wash Tips</th>
                              <th>Detail Tips</th>
                              <th>Total Tips</th>
                              <th>Manager Review</th>
                              <th></th>
                          </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

              <div role="tabpanel" class="tab-pane" id="auditing">
                  <form class="form-horizontal">
                    <div class="form-group">
                      <label for="employeeID" class="col-sm-2 control-label">Get Last Worked Day</label>
                      <div class="col-sm-4">
                        <input id="auditUsers" type='text' class="form-control" />
                      </div>
                    </div>
                </form>

                 <div id="auditUser"></div>
              </div>

              <div role="tabpanel" class="tab-pane" id="reports">
                <div class="form-group" style="clear:both; margin:1em 0;">
                    <label for="punchouttime" style="text-align: left;" class="col-sm-2 control-label">Start Date</label>
                    <div class="col-sm-4">
                        <div class='input-group date' id='startDate'>
                            <input type='text' class="form-control" />
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon-calendar"></span>
                            </span>
                        </div>
                    </div>
                </div>
                <br/>
                <div class="form-group" style="clear:both; margin:1em 0;">
                    <label for="punchouttime" style="text-align: left;" class="col-sm-2 control-label">End Date</label>
                    <div class="col-sm-4">
                        <div class='input-group date' id='endDate'>
                            <input type='text' class="form-control" />
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon-calendar"></span>
                            </span>
                        </div>
                    </div>
                </div>
                <br/>
                <div class="form-group" style="clear:both; margin:1em 0;">
                  <label for="phone" class="col-sm-2 control-label">Reports</label>
                  <div class="col-sm-4">
                      <select class="form-control" id="reportsDropdown">
                          <option value="dailyAutosignOutReport">Forgot to sign out</option>
                          <option value="dailyUnderEightHoursReport">Under 8 Hours</option>
                          <option value="dailyNoLunchBreakReport">No Lunch Break</option>
                          <option value="dailyNoSignOutReport">Autosigned out</option>
                          <!-- <option value="totalHours">Weekly Hours</option> -->
                          <option value="laborReport">Labor Report</option>
                          <!-- <option value="nightHours">Night Hours</option> -->
                          <!-- <option value="supportHours">Support Hours</option> -->
                          <option value="minorReport">Minors Report</option>
                      </select>
                  </div>
                </div>

                <div class="btn btn-primary" id="runReport">Run Report</div>

                <div id="reportData" style="margin: 2em 0">

                </div>
              </div>

              <div role="tabpanel" class="tab-pane" id="news">

              </div>
            </div> <!-- /tab content -->

          </div><!-- /panel body -->


            <div class="modal fade" tabindex="-1" role="dialog" id="removeTipModal">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Remove Tip</h4>
                  </div>
                  <div class="modal-body">
                    <p>Are you sure you want to remove this tip?</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">No</button>
                    <button type="button" class="btn btn-primary" onClick="confirmRemoveTip()" id="btnConfirmRemove">Yes</button>
                  </div>
                </div><!-- /.modal-content -->
              </div><!-- /.modal-dialog -->
            </div><!-- /.modal -->


            <section id="userTimesheet" class="panel-body">
                <section className="hero hero-page gray-bg padding-small" style={{margin: "-2em",padding: "50px 0",background:"#f5f5f5"}}>
                  <div className="container">
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
                      <h3>Timesheet for Week of <span id="weekBeginning"></span> - <span id="weekEnding"></span></h3>
                      <div class="btn-group" role="group">
                          <button type="button" class="btn btn-primary" id="addTimeslot">Add Time</button>
                      </div>
                  </div>
                </section>


                <section id="loader">
                </section>


                <section id="timesheetPage">
                  <table id="timesheet" class="table table-condensed">
                      <tbody id="timesheetTable">

                      </tbody>
                  </table>
                </section>
            </section>
            <div id="laborBreakdown">

            </div>
            <div id="timesheetModal" class="modal fade" tabindex="-1" role="dialog">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title" id="modal-title">Edit Timeslot</h4>
                  </div>

                  <div class="modal-body">
                      <form class="form-horizontal" onsubmit="return getTimesheet();">
                          <div class="form-group" id="typefield">
                              <select class="form-control payrollBtn" id="type">
                                  <option value="1">Vacation</option>
                                  <option value="2">Sick</option>
                                  <option value="0">Regular</option>
                                  <option value="3">Floating</option>
                                  <option value="4">Holiday</option>
                                  <option value="5">Jury Duty</option>
                                  <option value="6">Bereavement</option>
                                  <option value="7">Office Closed</option>
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
                          <div class="form-group">
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
                          <div class="form-group">
                              <label for="punchouttime" style="text-align: left;" class="col-sm-3 control-label">Role</label>
                              <div class="col-sm-9">
                                  <select class="form-control roles" id="punchRole">

                                    </select>
                              </div>
                          </div>

                          <div class="payrollBtn">
                              <div class="form-group adding">
                                  <h4>Hours</h4>
                                  <button type="button" class="btn btn-default" onClick="fullday()">Full Day</button>
                                  <button type="button" class="btn btn-default" onClick="halfday()">Half Day</button>
                              </div>
                              <div class="form-group adding">
                                  <input type="number" class="form-control" id="selectHours">
                              </div>
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
    </div>
</body>


<script src="./dist/admin.js"></script>
