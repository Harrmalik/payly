<?php
  header('content-type:application/json');
  require_once('/var/www/resources/core/index.php');
  $core->inc('users'); 
  $NodeServer = '/CheckIn';
  $response;

  // API
  switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
      switch ($_REQUEST['action']) {
        case 'getInitialState':
          $response = doGetRequestWithData(API_SERVER . NodeServer . "/function",json_encode($_POST), USER::getUsername(),USER::getPassword());
          break;
          
        case 'getTimesheet':
          $response = doGetRequestWithData(API_SERVER . NodeServer . "/function",json_encode($_POST), USER::getUsername(),USER::getPassword());
          break;
          
        case 'getWorkers':
          $response = doGetRequestWithData(API_SERVER . NodeServer . "/function",json_encode($_POST), USER::getUsername(),USER::getPassword());
          break;
      }
      
      break;
      
    case 'POST': 
      switch ($_REQUEST['action']) {
        case 'initialCheckIn':
          $response = doPostRequestWithData(API_SERVER . NodeServer . "/function",json_encode($_POST), USER::getUsername(),USER::getPassword());
          break;
      }
    
      break;
      
    case 'PUT':
      switch ($_REQUEST['action']) {
        case 'checkIn':
          $response = doPutRequestWithData(API_SERVER . NodeServer . "/function",json_encode($_POST), USER::getUsername(),USER::getPassword());
          break;

        case 'checkOut':
          $response = doPutRequestWithData(API_SERVER . NodeServer . "/function",json_encode($_POST), USER::getUsername(),USER::getPassword());
          break;

        case 'editTimesheet'
          $response = doPutRequestWithData(API_SERVER . NodeServer . "/function",json_encode($_POST), USER::getUsername(),USER::getPassword());
          break;
        
      }

      break;

    case 'DELETE':
      switch ($_REQUEST['action']) {
        case 'deleteTime':
          $response = doDeleteRequest(API_SERVER . NodeServer . "/function",json_encode($_POST), USER::getUsername(),USER::getPassword());
          break;
      }
      
      break;
  }

  echo $response;
?>

