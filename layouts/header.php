<?php
	include_once("/var/www/resources/core/index.php");
    $assets = "./../DSCommons/public/";
?>
<!doctype html>
<html lang="en">
<head>
		<script>
		  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

		  if (location.hostname === '172.30.160.10') {
			  ga('create', 'UA-92825716-1', 'auto');
			  ga('send', 'pageview');
		  } else {
			  ga = console.log
		  }
		</script>
        <meta charset="utf-8" />
        <title>Delta Sonic - Check In Clock</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<link rel="stylesheet" href="<?php echo $assets; ?>css/main.css"/>
		<link rel="stylesheet" href="css/styles.css"/>

		<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
		<?php include_once($assets . "js/scripts.php"); ?>
	    <script src="<?php echo $assets; ?>Helpers.js"></script>

        <!--[if IE]>
        <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
