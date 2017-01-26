<?php
	include_once("/var/www/resources/core/index.php");
	$core->inc('users');
	USER::authPage();
?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>Delta Sonic - Check In Clock</title>

	<link rel="stylesheet" href="./css/main.css">

	<link rel="stylesheet" href="./css/font-awesome.min.css">
	<link rel="stylesheet" href="./css/bootstrap.min.css">
	<link rel="stylesheet" href="./css/font-awesome.min.css">
	<link rel="stylesheet" href="./css/jquery-ui.min.css">

	<script src="./js/jquery-2.1.4.min.js"></script>
	<script src="./js/jquery-ui.min.js"></script>
	<script src="./js/bootstrap.min.js"></script>

	<!--[if IE]>
	<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
</head>

<body>
	<div class="panel panel-primary container">
    		<div class="panel-heading">
        	<p class="text-center"><img src="../CognosReports/images/delta_logo.png" width="150px" /></p>
		<h2 class="text-center">Item Maintenance</h2>
    </div>
    <div class="panel-body">
        <div style="float: left">
		<h2>Welcome $name</h2>
        </div>
        <div style="float: right">        
            <a href="../ApplicationPortal/dashboard.php" class="btn btn-primary" role="button">Dashboard</a> 
        </div>

	<section class="mainBtns">
		<button type="button" class="btn btn-primary btn-lg">Check In</button>
		<button type="button" class="btn btn-primary btn-lg">Check Out</button>
		<button type="button" class="btn btn-default btn-lg">View Timesheet</button>
	</section>

		<h3>Timesheet</h3>

		<table class="table">
			<th>Date</th>
			<th>Check In</th>
			<th>Check Out</th>
			<th><Hours</th>
		</table>
	</div>
</body>
