<?php
require_once("/var/www/resources/core/index.php");
$core->inc("users");

USER::authPage();

$username = USER::getUsername();
$password = USER::getPassword();

// convert time to mysql friendly format
$_REQUEST['startDate'] = date("Y-m-d", ($_REQUEST['startDate'] != "" ? $_REQUEST['startDate'] : date("U") ) );
$_REQUEST['endDate'] = date("Y-m-d", ($_REQUEST['endDate'] != "" ? $_REQUEST['endDate'] : date("U") ) );

$command = "getTips";
$_REQUEST['userid'] = USER::getUserId();

$url = CHECKINCLOCK_SERVER . "/" . $command;
$response = doPostRequestWithData($url, $_REQUEST, $username, $password);

$returnArray = array("columns" => array("Name", "Date", "Wash Hours", "Wash Tips", "Detail Hours", "Detail Tips", "Total Tips", "Manager Reviewed", "Remove"), "data" => array());

$dataArray = json_decode($response->raw_body, true);
$cleanedDataArray = array();
foreach($dataArray as $d){
	$key = count($returnArray['data']);

	$returnArray['data'][$key][0] = $d['empname'];
	$returnArray['data'][$key][1] = $d['dateFormat'];
	$returnArray['data'][$key][2] = $d['punchSite'];

	$returnArray['data'][$key][3] = $d['tippedHours'];
	$returnArray['data'][$key][4] = $d['nonTippedHours'];

	$returnArray['data'][$key][5] = $d['washTTips'];
	$returnArray['data'][$key][6] = $d['detailTTips'];

	$returnArray['data'][$key][7] = ($d['detailTTips'] + $d['washTTips']);
	$returnArray['data'][$key][8] = ($d['reviewManager'] == "" ? "<div class=\"btn btn-success\" onClick=\"reviewTip(this, ".$d['tipid'].")\">Review</div>" : $d['reviewManager'] );
	$returnArray['data'][$key][9] = "<div class=\"btn btn-danger\" onClick=\"removeTip(this, ".$d['tipid'].", '".$d['empnumber']."', '".$d['dateSimple']."')\">Remove</div>";
}
ob_clean();
header('Content-Type: application/json');
echo json_encode($returnArray);
/*
echo '<hr/>';
echo '{
  "data": [
  	["1", "2", "3", "4", "5", "6", "7", "8"]
  ]
}';
*/
?>
