<?php 
	include_once("/var/www/resources/core/index.php");
        $core->inc('users');
        USER::authPage();
        $assets = "./../DSCommons";
?>
<!doctype html>
<html lang="en">
<head>
        <meta charset="utf-8" />

        <title>Delta Sonic - Check In Clock</title>

        <link rel="stylesheet" href="./css/main.css">
	<meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="<?php echo $assets; ?>/css/font-awesome.min.css">
        <link rel="stylesheet" href="<?php echo $assets; ?>/css/bootstrap.min.css">
        <link rel="stylesheet" href="<?php echo $assets; ?>/css/font-awesome.min.css">
        <link rel="stylesheet" href="<?php echo $assets; ?>/css/jquery-ui.min.css">

        <script src="<?php echo $assets; ?>/js/jquery-1.12.4.min.js"></script>
        <script src="<?php echo $assets; ?>/js/jquery-ui.min.js"></script>
        <script src="<?php echo $assets; ?>/js/bootstrap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.17.1/moment.min.js"></script>

        <!--[if IE]>
        <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
