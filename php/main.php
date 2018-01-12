<?php
  header('content-type:application/json');
  require_once('/var/www/resources/core/index.php');
  $core->inc('users');
  $NodeServer = CHECKINCLOCK_SERVER . "/checkinclockserver";

  $username = USER::getUsername(); $password = USER::getPassword();

  // API
  switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
      switch ($_REQUEST['module']) {
        case 'kissklock':
            $response = doGetRequest($NodeServer . "/kissklock?action=" . $_REQUEST['action'] . "&id=" . $_REQUEST['id'] . "&startDate=" . $_REQUEST['startDate'] . "&endDate=" . $_REQUEST['endDate'], EUSER, EUSERPASSWORD);
            break;
        case 'getIp':
            $response->raw_body = $_SERVER['REMOTE_ADDR'];
            break;
        case 'getManager':
            $response = doGetRequest("https://api1.dscws.com/universalaccess/users?fields=userid,realname,position,employeeid&filter=userid=" . $_SESSION['userid'], $username, $password);
            break;
        case 'admin':
            $response = doGetRequest($NodeServer . "/admin?action=" . $_REQUEST['action'] . "&empid=" . $_REQUEST['empid'], $username, $password);
            break;
      }

      break;

    case 'POST':
        if ($_REQUEST['module'] == 'kissklock') {
            $response = doPostRequestWithData($NodeServer . "/". $_REQUEST['module'] . "?action=" . $_REQUEST['action'], $_POST, EUSER, EUSERPASSWORD);
        } else {
            $response = doPostRequestWithData($NodeServer . "/". $_REQUEST['module'] . "?action=" . $_REQUEST['action'], $_POST, $username, $password);
        }

      break;

  default:
      $response = 'action not supported';
  }

  http_response_code($response->code);
  echo $response->raw_body;
?>
