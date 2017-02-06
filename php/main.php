<?php
  header('content-type:application/json');
  require_once('/var/www/resources/core/index.php');
  $core->inc('users');
  $NodeServer = ':9208/checkinclockserver';
  $response;

  // API
  switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
      switch ($_REQUEST['action']) {
        case 'getInitialState':
          $response = doGetRequest(API_SERVER . $NodeServer . "/getinitialstate?startDate=" . urlencode($_REQUEST['startDate'])
                                    . "&endDate=" . urlencode($_REQUEST['endDate']), USER::getUsername(),USER::getPassword());
          break;

        case 'getTimesheet':
          $response = doGetRequest(API_SERVER . $NodeServer . "/getinitialstate", USER::getUsername(),USER::getPassword());
          break;
      }

      break;

    case 'POST':
      switch ($_REQUEST['action']) {
        case 'checkIn':
          $response = doPostRequest(API_SERVER . $NodeServer . "/checkin?time=" . urlencode($_REQUEST['time']), USER::getUsername(),USER::getPassword());
          break;

        case 'checkOut':
            $response = doPostRequestWithData(API_SERVER . $NodeServer . "/checkout?id=" . $_REQUEST['id'] . '&time=' . urlencode($_REQUEST['time']),json_encode($_POST), USER::getUsername(),USER::getPassword());
            break;
      }

      break;
  }

  http_response_code($response->code);
  echo $response->raw_body;
?>
