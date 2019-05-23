<?php   include_once "./layouts/header.php"; ?>
<?php
    require_once('/var/www/resources/core/index.php');
    $core->inc('users');
?>

  <!--
  <link rel="stylesheet" href="../../DSCommons/public/css/datatables.min.css">
  -->
  <link rel="stylesheet" href="./css/jquery.dataTables.min.css">
  <link rel="stylesheet" href="./css/datetimepicker.css">

  <!--[if lt IE 9]>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
  <![endif]-->
  <link href="./css/styles.css" rel="stylesheet"/>
</head>

<body>

  <div class="panel-body">
        <section className="hero hero-page gray-bg padding-small" style={{margin: "-2em",padding: "50px 0",background:"#f5f5f5"}}>
          <button class="btn btn-default btn-top no-print" id="back" onclick="location = './'"><i class="glyphicon glyphicon-chevron-left"></i> Back</button>
          <div className="container">
              <form class="form-horizontal">
                  <div class="form-group no-print">
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
              <h4 id="username"></h4>
              <h4>Timesheet for Week of <span id="weekBeginning"></span> - <span id="weekEnding"></span></h4>
          </div>
        </section>

        <section id="timesheetPage">
          <table id="timesheet" class="table table-condensed">

          </table>


          <div id="laborBreakdowns" style="position:block">

          </div>
        </section>

    </div><!-- /panel body -->
</body>


<script src="./dist/print.js"></script>
