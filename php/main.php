<?php
  header('content-type:application/json');
  require_once('/var/www/resources/core/index.php');
  $core->inc('users');
  $NodeServer = '/checkinclockserver';
  $response;

  // API
  switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
      switch ($_REQUEST['action']) {
        case 'validateUser':
            $response = doGetRequest(CHECKINCLOCK_SERVER . $NodeServer . "/validate?empid=" . $_REQUEST['empid'], EUSER, EUSERPASSWORD);
            break;
      }

      break;

    case 'POST':
      switch ($_REQUEST['action']) {
      case 'getInitialState':
          $response = doPostRequestWithData(CHECKINCLOCK_SERVER . $NodeServer . "/getinitialstate",array("data" => json_encode($_POST)), EUSER, EUSERPASSWORD);
          break;

        case 'checkIn':
          $response = doPostRequestWithData(CHECKINCLOCK_SERVER . $NodeServer . "/checkin",array("data" => json_encode($_POST)), EUSER, EUSERPASSWORD);
          break;

        case 'checkOut':
            $response = doPostRequestWithData(CHECKINCLOCK_SERVER . $NodeServer . "/checkout", array("data" => json_encode($_POST)), EUSER, EUSERPASSWORD);
            break;
      }

      break;
  }

  http_response_code($response->code);
  echo $response->raw_body;
?>
