<?php include_once './layouts/header.php' ?>

    <script src="./js/signature_pad.min.js"></script>
</head>

<body>
    <img style="position:absolute; width:300px; top: 10em; left: 5em"/>
    <div class="" style="box-shadow: none;">
        <div class="panel-heading" style="display:none">
            <p class="text-center"><img src="<?php echo $assets; ?>../images/delta_logo.png" width="150px" /></p>
        </div>

        <nav class="navbar navbar-inverse" id="nav" style="display:none">
          <div class="container-fluid">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
              <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
              </button>
              <a class="navbar-brand" href="./" id="appname">Kiss Klock</a>
            </div>

            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              <ul class="nav navbar-nav">
                  <li class="active"><a id="home"><i class="glyphicon glyphicon-home"></i> Home</a></li>
                  <li class="isField"><a id="tips" role="button"><i class="glyphicon glyphicon-home"></i> Tips</a></li>
                  <li><a id="timesheet" role="button"><i class="glyphicon glyphicon-list-alt"></i> Timesheet</a></li>
                  <!-- <li><a id="home" role="button"><i class="glyphicon glyphicon-home"></i> Edit Request</a></li> -->
              </ul>
              <ul class="nav navbar-nav navbar-right">
                  <p class="navbar-text" id="name"></p>
                  <li class="dropdown">
                   <a id="primaryJob" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"></a>
                   <ul class="dropdown-menu" id="jobList">
                   </ul>
                 </li>
                  <li><a href="./" role="button" onclick="localStorage.setItem('empid', '');">Sign Out</a></li>
              </ul>
            </div><!-- /.navbar-collapse -->
          </div><!-- /.container-fluid -->
        </nav>

        <div id="kissklock-app">
            <!-- <p id="weather">
                <i class="fas fa-cloud-sun"></i> 47
                <span id="weather-text">Clear Skies</span>
            </p> -->
            <div id="unknownusermodal" class="modal" tabindex="-1" role="dialog" data-keyboard="false">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="clearEmpId()"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">User not found!</h4>
                  </div>
                  <div class="modal-body">
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-default btn-lg" data-dismiss="modal" onclick="clearEmpId()">No</button>
                    <button type="button" class="btn btn-warning btn-lg" onclick="unknownSignin()">Yes</button>
                  </div>
                </div><!-- /.modal-content -->
              </div><!-- /.modal-dialog -->
            </div><!-- /.modal -->

            <div id="clockdate">
              <div class="clockdate-wrapper">
                <div id="clock"></div>
                <div id="date"></div>
              </div>
            </div>

            <section id="auth" style="display:none">
                <form id="loginForm" class="form-horizontal" style="width:30em;margin:auto">
                  <div class="form-group">
                    <div class="col-sm-8 no-padding">
                      <input type="text" autocomplete="off" class="form-control" id="inputID" placeholder="Employee ID">
                    </div>
                    <div class="col-sm-4 no-padding">
                      <button type="submit" id="login" class="btn btn-success btn-lg">Log In</button>
                    </div>
                  </div>
                </form>

                <section id="numpad">
                    <div class="btn-group-vertical btn-group-lg btn-group-primary" role="group" aria-label="...">
                      <button type="button" class="btn btn-default" onClick="update(1)">1</button>
                      <button type="button" class="btn btn-default" onClick="update(4)">4</button>
                      <button type="button" class="btn btn-default" onClick="update(7)">7</button>
                      <button type="button" class="btn btn-default" onClick="back()"><i class="glyphicon glyphicon-arrow-left"></i></button>
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
                      <button type="button" class="btn btn-default" onClick="empty()"><i class="glyphicon glyphicon-remove" style="padding-top:10px"></i></button>
                    </div>
                </section>
            </section>

            <section id="app">
                <section id="main-content">
                    <section class="mainBtns">
                        <button type="button" class="btn btn-primary btn-lg" id="checkIn"><h3>Punch In</h3></button>
                        <button type="button" class="btn btn-primary btn-lg isField" id="lunchBreak"><h3>Lunch Break</h3></button>
                        <button type="button" class="btn btn-primary btn-lg" id="checkOut">
                            <h3>Punch out</h3>
                            <p>Total Hours will be: <span id="overallHours"></span></p>
                        </button>
                        <!-- <button type="button" class="btn btn-default btn-lg" id="timesheet">View Timesheet</button> -->
                        <?php if ($_SERVER['SERVER_ADDR'] != '172.18.100.7') { ?>
                            <button type="button" class="btn btn-block btn-lg btn-default" onclick="openWarning()" id="setuser" style="display:none; width:97%; height:3em">This is my local machine</button>
                        <?php } ?>
                    </section>
                </section>

                <section id="sidebar">
                    <h3>Today's Hours</h3>

                    <table class="table">
                        <th>Role</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Hours</th>
                        <th></th>

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

                    <div id="overtime">
                        <h3>Overtime reason</h3>
                        <textarea id="overtimeReason" class="form-control" rows="3"></textarea>
                        <button type="button" id="overtimeBtn" class="btn-primary custom-btn">Save Overtime</button>
                    </div>
                </section>
            </section>

            <!-- <button class="circular ui big blue icon button" id="notifications">
              <i class="fas fa-newspaper"></i>
            </button>

            <div id="notificationsPanel" class="panel panel-default">
              <div class="panel-heading">
                <h2 class="panel-title">Notifications</h2>
              </div>
              <div class="panel-body" style="padding:0;margin:0">
                  <ul id="notificationsList" class="list-group" style="padding:0;margin:0">
                    <li class="list-group-item"><h2>Delta Updates</h2></li>
                    <li class="list-group-item">It's time to select your 2018 holiday gift! Log into mydeltasonic.com and complete the form no later than December 14.</li>
                    <li class="list-group-item">Looking for 15 employees to star in our new commercial!</li>
                  </ul>
              </div>
            </div> -->
        </div>

        <div class="panel-body">
        <div id="warning" class="modal fade" tabindex="5" role="dialog" >
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

        <section id="tipsPage">
            <div class="row text-center">
                <div id="slide1" style="display:none;">
                    <div id="msg-status"><br/></div>

                    <div><b>Employee</b>: <span id="employeeNameDisplay"></span></div><br/>

                    <form class="form-horizontal" style="margin:auto;width:500px">
                        <div class="form-group">
                            <label for="end" style="text-align: left;" class="col-sm-2 control-label">Date</label>

                            <div class='input-group date' id='tipDate'>
                              <input type='text' class="form-control" />
                              <span class="input-group-addon">
                                  <span class="glyphicon glyphicon-calendar"></span>
                              </span>
                            </div>
                        </div>
                    </form>
                    <hr/>

                    <form id="frmtips">
                    <div id="todaystips">
                        <div>
                            <input type="hidden" name="employeeid" id="employeeid"/>
                            <input type="hidden" id="site" value="<?php echo $site;?>"/>
                            <input type="hidden" name="lessthanfourhours" id="lessthanfourhours" value="1"/>
                            <input type="hidden" name="lessthanfourhoursunderstand" id="lessthanfourhoursunderstand" value="1"/>

                            <!-- <div id="tipsection1" style="display:block;">
                                Have you worked less than 4 hours today?

                                <div class="text-center">
                                    <div class="btn btn-lg btn-success btnLessthanfourhours" id="btnLessthanfourhours1" ds_value="1">Yes</div>
                                    <div class="btn btn-lg btn-danger btnLessthanfourhours" id="btnLessthanfourhours0" ds_value="0">No</div>
                                </div>
                            </div>

                            <div id="tipsection2" style="display:none;">
                                <div style="width:80%;padding-left: 20%;;">
                                    <p class="text-left">On today’s date, I have voluntarily decided to work less than four (4) hours.  It is my voluntary decision to leave without working a minimum four-hour shift. Management is not requiring me to leave at this time.  I understand that I can work a minimum four-hour shift, but am voluntarily choosing to not do so on today's date. </p>
                                    <p class="text-left">By clicking the box below, I am acknowledging my understanding and decision to work less than a four-hour minimum shift. </p>
                                    <br/>

                                    <div class="btn btn-lg btn-success btnLessthanfourhoursunderstand">I understand</div>
                                </div>
                            </div> -->


                            <div id="tipsection1" style="display:none;margin:auto;" class="container text-left">
                                <h3>Shifts Worked</h3>
                                <ol id="shiftsWorked">

                                </ol>
                                <br/>

                                <div class="row">
                                    <div class="col-sm-12">
                                        <div class="form-group">
                                            <label for="tippedHours" class="col-sm-3"><b>Tipped hours</b></label>
                                            <input type="number" step=".01" autocomplete="off" class="form-control col-sm-3" disabled name="tippedHours" style="width:100px;"/>
                                        </div>
                                    </div>
                                    <br/><br/>

                                    <div class="col-sm-12">
                                        <div class="form-group">
                                            <label for="nonTippedHours" class="col-sm-3"><b>Non Tipped hours</b></label>
                                                <input type="number" step=".01" autocomplete="off" class="form-control col-sm-3" disabled name="nonTippedHours" style="width:100px;"/>
                                        </div>
                                    </div>
                                    <br/><br/>

                                    <div class="col-sm-12">
                                        <div class="form-group">
                                            <label for="nonTippedHours" class="col-sm-3"><b>Total Hours</b></label>
                                                <input type="number" step=".01" autocomplete="off" class="form-control col-sm-3" disabled name="totalDayHours" style="width:100px;"/>
                                        </div>
                                    </div>
                                    <br/><br/>
                                </div>
                                <div class="row">
                                    <div class="col-sm-12" id="detailInput" style="display:none;">
                                        <div class="form-group">
                                            <label for="detailTTips" class="col-sm-3"><b>Detail T</b> tips earned</label>
                                            <input type="number" step=".01" autocomplete="off" class="form-control col-sm-3" name="detailTTips" style="width:100px;"/>
                                        </div>
                                        <br/><br/>
                                    </div>
                                    <div class="col-sm-12" id="washInput" style="display:none;">
                                        <div class="form-group">
                                            <label for="washTTips" class="col-sm-3"><b>Wash T</b> tips earned</label>
                                            <input type="number" step=".01" autocomplete="off" class="form-control col-sm-3" name="washTTips" style="width:100px;"/>
                                        </div>
                                        <br/><br/>
                                    </div>
                                </div>

                                <div class="row text-center">
                                    <b>Please check and verify your above time entries and notify management of any errors. <span class="hasTips" style="display:none;">Please claim all your tips you've earned today, no more no less.</span></b>
                                    <div id="underFourText" style="display:none;">
                                        <p>On today’s date, I have voluntarily decided to work less than four (4) hours.  It is my voluntary decision to leave without working a minimum four-hour shift. Management is not requiring me to leave at this time.  I understand that I can work a minimum four-hour shift, but am voluntarily choosing to not do so on today's date. </p>
                                        <p>By clicking the box below, I am acknowledging my understanding and decision to work less than a four-hour minimum shift. </p>
                                    </div>
                                    <br/>
                                </div>

                                <div class="questionRow row">
                                    <div class="text-right col-sm-offset-1 col-sm-5">
                                        <button type="button" class="btn btn-primary btn-lg" id='btnSigDisplay'>
                                          <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>&nbsp;&nbsp;Sign
                                        </button>
                                    </div>
                                    <div class="col-sm-5">
                                        <div class="btn btn-primary btn-lg" id="btnCommand" onClick="saveTips()">Submit</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                    </form>
                </div>

                <div class="row" id="signatureContainer" style="display:none;background-color:#fff;">
                    <div class="modal-body">
                        <div id="signature-pad-container"><canvas id="signature-pad" class="signature-pad" width="400px" height="200px"></canvas></div>
                        <img id="imgSig" style="display:none;" height="200px" width="400px"/>

                        <div>
                            By my signature, I certify that the information I entered on this form is true, accurate, and complete based on my own check of my time entries on a daily basis
                        </div>

                        <div class="text-right">
                            <div class="btn btn-primary" id="btnSigHide">Apply Signature</div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="modal fade" id="msgContainer" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true"  style="overflow-y:hidden;">
                <div class="modal-dialog" role="document" style="width:30%;">
                    <div class="modal-content">
                        <div class="modal-body">
                            <div id="modal-status" class="text-center" style="font-size:150%;">

                            </div>
                        </div>

                        <div class="modal-footer text-right">
                            <div class="btn btn-primary" id="btnHideMsg" onClick="closeModal('msgContainer')">[X] Close</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="timesheetPage">
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

            <table class="table">
                <tbody id="timesheetTable">

                </tbody>
            </table>

        <hr>
        <p>Yellow Background: Used phone system</p>
        <p>Pink Background: Vacation Time</p>
        <p>Green Background: Paid time off</p>
        <p>Red Time: Break under 30 minutes</p>
        <p>Red Hours: Work period over 6 Hours</p>
        <p>*: Called using personal phone</p>

        </section>
        </div>
    </div>
</body>

<script src="./dist/main.js"></script>
