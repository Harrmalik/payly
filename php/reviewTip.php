<?php
require_once("/var/www/resources/core/index.php");
$core->inc("users");

$username = USER::getUsername();
$password = USER::getPassword();

$_REQUEST['userid'] = USER::getUserId();

$url = CHECKINCLOCK_SERVER . "/reviewTip";
$response = doPostRequestWithData($url, $_REQUEST, $username, $password);

header('content-type: application/json');
echo $response;
?>
