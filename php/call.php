<?php
require_once("/var/www/resources/core/index.php");
$core->inc("users");

$_REQUEST['userid'] = USER::getUserId();

$command = $_REQUEST['command'];
$url = CHECKINCLOCK_SERVER . '/' . $command;
$response = doPostRequestWithData($url, $_REQUEST, EUSER, EUSERPASSWORD);

if($_REQUEST['command'] == "savetip"){
	// just return the response
} elseif($_REQUEST['command'] == "lookupEmployeeTips") {
	$responseArray = json_decode($response->raw_body, true);

	$isSigned = false;
	if(count($responseArray) > 0){
		$tipid = $responseArray[0]['tipid'];
		$employeeid = $_REQUEST['employeeid'];
		$dir = "/mount/deltaapps/tips/" . $employeeid . "/";
		$signatureFile = $dir . $tipid . '.png';

		if(file_exists($signatureFile)){
			$imageSize = getimagesize($signatureFile);

			if($imageSize['bits'] > 0){
				$isSigned = true;

				$responseArray[0]['signatureContent'] = "data:image/png;base64," . base64_encode(file_get_contents($signatureFile));
			}
		}
	}

	$responseArray[0]['isSigned'] = $isSigned;
	$response = json_encode($responseArray);
}

/*
print_r($response);
die();
*/
ob_clean();
header('content-type: application/json');
echo $response;
?>
