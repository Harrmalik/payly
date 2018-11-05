<?php
if($_SERVER['SERVER_ADDR'] == "172.18.100.7"){
	require_once("/var/www/resources/core/index.php");
	$core->inc("users");

	$date = $_REQUEST['date'];
	$code = $_REQUEST['code'];
	$site = $_REQUEST['site'];

	$url = "http://localhost:9998/?punchdate=".strtotime($date, 'Y-m-d')."&code=".$code."&site=".$site;

	$response = doGetRequest($url, EUSER, EUSERPASSWORD);
	$response = json_decode($response, true);
	//$response = $response[0];

	$returnArray = array("tippedHours" => "", "nonTippedHours" => "");

	if(count($response) > 0){
	  //echo "\nRESPONSE (".gettype($response)."):\n";
	  //print_r($response[0]);

	  $returnArray["tippedHours"] = $response[0]['tiphours'];
	  $returnArray["nonTippedHours"] = $response[0]['nontipped'];
	}
	ob_clean();
	echo json_encode($returnArray);
}
?>