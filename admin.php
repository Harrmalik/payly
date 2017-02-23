<?php   include_once "./layouts/header.php"; ?>
<?php
    require_once('/var/www/resources/core/index.php');
    $core->inc('users');
    USER::authPage();
?>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.13/js/jquery.dataTables.min.js"></script>
    <script type="text/babel" src="./js/admin.js"></script>
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
            <h2>Employees</h2>
            <hr/>
            <section id="employees">
                <ul id="list" class="list-group">

                </ul>
            </section>
        </div>
    </div>
</body>
