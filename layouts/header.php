<?php
	include_once("/var/www/resources/core/index.php");
    $assets = "./../DSCommons/public/";
?>
<!doctype html>
<html lang="en">
<head>
		<?php if ($_SERVER['SERVER_ADDR'] != '172.18.100.7') { ?>
			<script>
			  if (location.hostname === '172.30.160.10') {
				  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
				  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			  })(window,document,'script','js/analytics.js','ga');
				  ga('create', 'UA-92825716-1', 'auto');
				  ga('send', 'pageview');
			  } else {
				  var ga = function(arg1, arg2, category = '', action = '', label = '') {
					  console.log(`${arg2} - category: ${category}, action: ${action}, label: ${label}`);
				  }
			  }
			</script>
		<?php } ?>
        <meta charset="utf-8" />
        <title data-emp="<?php echo $_SESSION['userid']; ?>">Delta Sonic - Kiss Klock</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">

		<link rel="stylesheet" href="<?php echo $assets; ?>css/main.css"/>
		<link rel="stylesheet" href="css/styles.css"/>

		<?php include_once($assets . "js/scripts.php"); ?>
		<script src="js/moment-timezone.js"></script>
