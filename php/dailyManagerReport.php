<?php
/*
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
*/
require_once("/var/www/resources/core/index.php");
require_once("/var/www/resources/PHPExcel.php");  # include PHP Objects
require_once('/var/www/resources/PHPExcel/Writer/Excel2007.php');
include_once("/var/www/resources/core/mailer/index.php");

$core->inc("users");

// this report can only be generated
$hourLookup = false;
$host= gethostname();
if(stripos($host, "172-18-100-7") !== false){
	$hourLookup = true;
}

global $emailReports;
global $siteFilter;
$GLOBALS['emailReports'] = ( isset($_REQUEST['stopemail']) ? false : true );

$GLOBALS['siteFilter'] = ( isset($_REQUEST['site']) ? $_REQUEST['site'] : 0 );

$todayEpoch = date("U");
$todayDisplay = date("m/d/Y", $todayEpoch);

$coreDate = ( isset($_REQUEST['date']) ? strtotime($_REQUEST['date']) : date("U") - (24*60*60) );
$date_DB = date("Y-m-d", $coreDate);
$date_Display = date("m/d/Y", $coreDate);
$coreDow = date('w', $coreDate);// day of week, 0=sunday - 6 = Saturday

$daysAgo = 0;
if($coreDow < 6){
	$daysAgo = $coreDow+1;
}
$dateStartEpoch = $coreDate - ((24*60*60) * $daysAgo);
$dateStartDisplay = date("m/d/Y", $dateStartEpoch);
$dateStartDB = date("Y-m-d", $dateStartEpoch);
$dateStartCompare = date("Ymd", $dateStartEpoch);

$dateEndEpoch = strtotime($dateStartDisplay." + 6 days");
$dateEndDisplay = date("m/d/Y", $dateEndEpoch);
$dateEndDB = date("Y-m-d", $dateEndEpoch);
$dateEndCompare = date("Ymd", $dateEndEpoch);

/*
echo "core date = " . $date_Display;
echo "<br/>coreDow = " . $coreDow;
echo "<br/>New week started " . $daysAgo . " days ago";
echo "<br/>dateStartDisplay = " . $dateStartDisplay;
echo "<br/>Week Range From " . $dateStartDisplay . "  to  " . $dateEndDisplay;
*/

/*
$start    = $start = (new DateTime('@1413255600'))->modify('midnight'); // Start date
$end      = new DateTime('2014-10-22'); // End date
$interval = new DateInterval('P1D');    // Interval of one day
$period   = new DatePeriod($start, $interval, $end); // Period object to iterate through

foreach ($period as $date) {
   echo $date->format('Y-m-d H:i:s');
   echo "\n";
}
*/

$dayCounter = 0;
$dateArray = array();
while($dayCounter <= 6){

	$dayEpoch = strtotime($dateStartDisplay." + ".$dayCounter." days");
	$dayDisplay = date("m/d/Y", $dayEpoch);
	$dayKey = date("Ymd", $dayEpoch);
	$dateArray[$dayKey] = array ( "display" => $dayDisplay, "epoch" => strtotime($dayEpoch), "dow" => date("w", $dayEpoch), "dowDisplay" => date("l", $dayEpoch), "date_DB" => date("Y-m-d", $dayEpoch), "data" => array() );

	$dayCounter++;
}

// get Document list
$data = array("dateFrom" => $dateStartDB, "dateTo" => $dateEndDB, "siteFilter" => (int)$GLOBALS['siteFilter']);
$url = CHECKINCLOCK_SERVER . "/getDailyReport";
$response = doPostRequestWithData($url, $data, EUSER, EUSERPASSWORD);
$response = json_decode($response->raw_body, true);

$reportData = $response[0];
$recipientData = $response[1];
$employeeData = $response[2];

$recipientArray = array();
foreach($recipientData as $rec){
	$site = $rec['site'];
	$recipient = $rec['email'];

	if(!isset($recipientArray[$site])){
		$recipientArray[$site] = array();
	}
	array_push($recipientArray[$site], $recipient);
}

$employeeArray = array();
$employeeFullArray = array();
foreach($employeeData as $emp){
	$site = $emp['site'];
	$empNumber = $emp['employeeid'];
	$empName = $emp['empname'];

	if(!isset($employeeArray[$site])){
		$employeeArray[$site] = array();
	}

	$employeeArray[$site][$empNumber] = $empName;
	$employeeFullArray[$empNumber] = $empName;
}

$finalReportData = array();
foreach($reportData as $r){
	$site = $r['site'];
	$tipsDateYMD = $r['tipsDateYMD'];
	$employeenum = $r['empnumber'];

	if(!isset($finalReportData[$site])){
		$finalReportData[$site] = array();

		foreach($dateArray as $kkey => $val){
			$finalReportData[$site][$kkey] = array();

			// establish an employee enty for each [site][date][employee] as ana array, as an employee can have multiple entries in a day
			foreach($employeeArray[$site] as $employeeid => $employeename){
				$finalReportData[$site][$kkey][$employeeid] = array();
			}
		}
	}

	// won't happen often, but an employee has data, but is not on the official location list
	if(!isset($finalReportData[$site][$tipsDateYMD][$employeenum])){
		foreach($dateArray as $kkey => $val){
			$finalReportData[$site][$kkey][$employeenum] = array();
		}
	}

	array_push($finalReportData[$site][$tipsDateYMD][$employeenum], $r);

	if(!isset($employeeFullArray[$employeenum])){
		$employeeFullArray[$employeenum] = $r['empname'];
	}
}

// make sure each employee record has an array record flag
foreach($finalReportData as $site => $data){
	foreach($data as $dateKey => $r){
		foreach($r as $empnumber => $c){
			if(count($c) == 0){
				$finalReportData[$site][$dateKey][$empnumber] = array(array(
					'washTTips' => '',
					'detailTTips' => '',
					'empnumber' => $empnumber,
					'empname' => $employeeFullArray[$empnumber],
					'tipsDateMDY' => substr($dateKey, 4, 2) . "/" . substr($dateKey, -2) . "/" . substr($dateKey, 0, 4) ,
					'tippedHours' => '',
					'nonTippedHours' => '',
					'washTTips' => '',
					'detailTTips' => ''
				));
			}
		}
	}
}

$siteCounter = 0;
foreach($finalReportData as $site => $data){
	if($siteCounter > 0){
		endOfFile($objPHPExcel, $reportFileName, $reportFileNameFull, $siteFull, $recipientArray, $date_Display);
	}
	$siteFull = $site;

	// set up the next report
	$curDir = dirname(__FILE__);
	$reportFileName = "DailyReport_" . $site . ".xlsx";
	$reportFileNameFull = $curDir . "/../admin/reports/" . $reportFileName;
	unlink($reportFileNameFull);

	$objPHPExcel = new PHPExcel();
	$objPHPExcel->setActiveSheetIndex(0);
	$fileType = 'Excel2007';

	$employeeArray = array();
	$dateCounter = 0;
	$employeeHourLookup = array();
	foreach($data as $dateKey => $r){
		// GET THE SITEWATCH HOURS FOR THIS LOCATION, FOR THIS DATE
		if($hourLookup){
			$siteMin = substr($site, -2);
			// the batch parameter will tell the system to do a mass lookup by site and date (not individual employee)
			$url = "http://localhost:9998/?punchdate=" . urlencode($dateArray[$dateKey]['date_DB']) . "&code=" . $c2['empnumber'] . "&site=" . $siteMin . "&callsource=batch";
			$response = doGetRequest($url, EUSER, EUSERPASSWORD);
			$response = json_decode($response, true);
			for($sw_i = 0; $sw_i < count($response); $sw_i++){
				$sw_empcode = $response[$sw_i]['code'];
				if(!isset($employeeHourLookup[$sw_empcode])){
					$employeeHourLookup[$sw_empcode] = array();
				}
				$employeeHourLookup[$sw_empcode][$dateKey] = array();
				// some values are coming back as negative values, so we'll user trhe absolute value, instead
				$totalTippedHours  = abs($response[$sw_i]['tippedHours']);
				$totalNontippedHours  = abs($response[$sw_i]['nonTippedHours']);

				$employeeHourLookup[$sw_empcode][$dateKey]['tippedHours'] = $totalTippedHours;
				$employeeHourLookup[$sw_empcode][$dateKey]['nonTippedHours'] = $totalNontippedHours;

				$finalReportData[$site][$dateKey][$sw_empcode]['tippedHours'] = $totalTippedHours;
				$finalReportData[$site][$dateKey][$sw_empcode]['nonTippedHours'] = $totalNontippedHours;
			}
		}

		$objWorkSheet = $objPHPExcel->createSheet($dateCounter); //Setting index when creating
		$objPHPExcel->setActiveSheetIndex($dateCounter);

		//$dateArray[$dayKey] = array ( "display" => $dayDisplay, "epoch" => strtotime($dayEpoch), "dow" => date("w", $dayEpoch), "dowDisplay" => date("l", $dayEpoch), "data" => array() );
		$worksheetName = $dateArray[$dateKey]['dowDisplay'];
		$objPHPExcel->setActiveSheetIndex($dateCounter)->setTitle($worksheetName);

		$objPHPExcel->getActiveSheet()->SetCellValue("A1","Employee Tip Report");
		$objPHPExcel->getActiveSheet()->mergeCells('A1:B1');

		$objPHPExcel->getActiveSheet()->SetCellValue("A2","Location:");
		$objPHPExcel->getActiveSheet()->SetCellValue("B2",$site);
		$objPHPExcel->getActiveSheet()->SetCellValue("A3","Date:");
		$objPHPExcel->getActiveSheet()->SetCellValue("B3",$dateArray[$dateKey]['display']);

		$objPHPExcel->getActiveSheet()->SetCellValue("A5","Employee Number");
		$objPHPExcel->getActiveSheet()->SetCellValue("B5","Employee Name");
		$objPHPExcel->getActiveSheet()->SetCellValue("C5","Wash Tips");
		$objPHPExcel->getActiveSheet()->SetCellValue("D5","Detail Tips");
		$objPHPExcel->getActiveSheet()->SetCellValue("E5","Total Tips");
		$objPHPExcel->getActiveSheet()->SetCellValue("F5","Total Tip Hours");

		$rowCounter = 0;
		foreach($r as $c){
			foreach($c as $c2){
				$rNum = 6 + $rowCounter;
				$totalTips = ($c2['washTTips'] === "" && $c2['detailTTips'] === "" ? "" : $c2['washTTips'] + $c2['detailTTips']);
				$objPHPExcel->getActiveSheet()->SetCellValue("A".$rNum,$c2['empnumber']);
				$objPHPExcel->getActiveSheet()->SetCellValue("B".$rNum,$c2['empname']);
				$objPHPExcel->getActiveSheet()->SetCellValue("C".$rNum,$c2['washTTips']);
				$objPHPExcel->getActiveSheet()->SetCellValue("D".$rNum,$c2['detailTTips']);
				$objPHPExcel->getActiveSheet()->SetCellValue("E".$rNum,$totalTips);

				// get the sitewatch hour information
				$totalHours = "";
				/*
				if($hourLookup){
					$siteMin = substr($site, -2);
					$url = "http://localhost:9998/?punchdate=" . urlencode($dateArray[$dateKey]['date_DB']) . "&code=" . $c2['empnumber'] . "&site=" . $siteMin;
					$response = doGetRequest($url, EUSER, EUSERPASSWORD);
					$response = json_decode($response, true);
					if(count($response) > 0){
						// some values are coming back as negative values, so we'll user trhe absolute value, instead
						$totalHours  = abs($response[0]['tippedHours']);
						$totalNontippedHours  = abs($response[0]['nonTippedHours']);

						$finalReportData[$dateKey][$rowCounter]['tippedHours'] = $totalHours;
						$finalReportData[$dateKey][$rowCounter]['nonTippedHours'] = $totalNontippedHours;
					}
				}
				*/
				if(isset($employeeHourLookup[$c2['empnumber']])){
					$totalHours = $employeeHourLookup[$c2['empnumber']][$dateKey]['tippedHours'];
				}
				$objPHPExcel->getActiveSheet()->SetCellValue("F".$rNum,$totalHours);

				if(!isset($employeeArray[$c2['empnumber']])){
					$employeeArray[$c2['empnumber']] = array('name' => $c2['empname'], 'data' => array());
				}
				array_push($employeeArray[$c2['empnumber']]['data'], array($c2['tipsDateMDY'], $c2['detailTTips'], $c2['washTTips'], $totalTips, $totalHours));

				$rowCounter++;
			}
		}

		$dateCounter++;
	}

	$summaryDataWorksheetKey = $dateCounter;
	$summaryTableWorksheetKey = $dateCounter + 1;

	/*
	SUMMARY DATA WORKSHEET
	*/
	$objWorkSheet = $objPHPExcel->createSheet($summaryDataWorksheetKey); //Setting index when creating
	$objPHPExcel->setActiveSheetIndex($summaryDataWorksheetKey);
	$objPHPExcel->setActiveSheetIndex($summaryDataWorksheetKey)->setTitle("Summary Data");

	$objPHPExcel->getActiveSheet()->SetCellValue("A1","Delta Sonic Tips System");
	$objPHPExcel->getActiveSheet()->mergeCells('A1:G1');
	$objPHPExcel->getActiveSheet()->getStyle('A1')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);

	$objPHPExcel->getActiveSheet()->SetCellValue("A2","Name");
	$objPHPExcel->getActiveSheet()->SetCellValue("B2","Date");
	$objPHPExcel->getActiveSheet()->SetCellValue("C2","Tipped Hours");
	$objPHPExcel->getActiveSheet()->SetCellValue("D2","Non Tipped Hours");
	$objPHPExcel->getActiveSheet()->SetCellValue("E2","Wash Tips");
	$objPHPExcel->getActiveSheet()->SetCellValue("F2","Detail Tips");
	$objPHPExcel->getActiveSheet()->SetCellValue("G2","Total Tips");
	$objPHPExcel->getActiveSheet()->getStyle("A2:G2")->getFont()->setBold( true );

	$dataRow = 3;
	foreach($data as $dateKey => $r){
		foreach($r as $c){
			foreach($c as $c2){
				$totalTips = ($c2['washTTips'] === "" && $c2['detailTTips'] === "" ? "" : $c2['washTTips'] + $c2['detailTTips']);

				$objPHPExcel->getActiveSheet()->SetCellValue("A".$dataRow,$c2['empname']);
				$objPHPExcel->getActiveSheet()->SetCellValue("B".$dataRow,$c2['tipsDateMDY']);
				$objPHPExcel->getActiveSheet()->SetCellValue("C".$dataRow,$c2['tippedHours']);
				$objPHPExcel->getActiveSheet()->SetCellValue("D".$dataRow,$c2['nonTippedHours']);
				$objPHPExcel->getActiveSheet()->SetCellValue("E".$dataRow,$c2['washTTips']);
				$objPHPExcel->getActiveSheet()->SetCellValue("F".$dataRow,$c2['detailTTips']);
				$objPHPExcel->getActiveSheet()->SetCellValue("G".$dataRow,$totalTips);
				$dataRow++;
			}
		}
	}

	/*
	SUMMARY TABLE WORKSHEET
	*/
	$objWorkSheet = $objPHPExcel->createSheet($summaryTableWorksheetKey); //Setting index when creating
	$objPHPExcel->setActiveSheetIndex($summaryTableWorksheetKey);
	$objPHPExcel->setActiveSheetIndex($summaryTableWorksheetKey)->setTitle("Summary Table");

	$objPHPExcel->getActiveSheet()->SetCellValue("A1", "Employee Name");
	$objPHPExcel->getActiveSheet()->SetCellValue("B1", "Sum of Detail Tips");
	$objPHPExcel->getActiveSheet()->SetCellValue("C1", "Sum of Wash Tips");
	$objPHPExcel->getActiveSheet()->SetCellValue("D1", "Sum of Total Tips");
	$objPHPExcel->getActiveSheet()->SetCellValue("E1", "Sum of Tipped Hours");
	$objPHPExcel->getActiveSheet()->getStyle("A1:E1")->getFont()->setBold( true );

	$summaryTableRowCounter = 2;
	foreach($employeeArray as $empNumber => $empDataArray){
		$employeeName = $empDataArray['name'];
		$employeeData = $empDataArray['data'];

		$objPHPExcel->getActiveSheet()->SetCellValue("A" . $summaryTableRowCounter, $employeeName);

		$objPHPExcel->getActiveSheet()->SetCellValue("B" . $summaryTableRowCounter, "=SUBTOTAL(9,B".($summaryTableRowCounter+1).":B".( ($summaryTableRowCounter+1) + (count($employeeData) - 1) ) .")");
		$objPHPExcel->getActiveSheet()->SetCellValue("C" . $summaryTableRowCounter, "=SUBTOTAL(9,C".($summaryTableRowCounter+1).":C".( ($summaryTableRowCounter+1) + (count($employeeData) - 1) ) .")");
		$objPHPExcel->getActiveSheet()->SetCellValue("D" . $summaryTableRowCounter, "=SUBTOTAL(9,D".($summaryTableRowCounter+1).":D".( ($summaryTableRowCounter+1) + (count($employeeData) - 1) ) .")");
		$objPHPExcel->getActiveSheet()->SetCellValue("E" . $summaryTableRowCounter, "=SUBTOTAL(9,E".($summaryTableRowCounter+1).":E".( ($summaryTableRowCounter+1) + (count($employeeData) - 1) ) .")");

		$objPHPExcel->getActiveSheet()->getStyle("A" . $summaryTableRowCounter . ":E" . $summaryTableRowCounter)->getFont()->setBold( true );
		$objPHPExcel->getActiveSheet()->getStyle("A" . $summaryTableRowCounter . ":E" . $summaryTableRowCounter)->getFill()->setFillType(PHPExcel_Style_Fill::FILL_SOLID)->getStartColor()->setRGB('CCCED1');

		$summaryTableRowCounter++;
		foreach($employeeData as $employeeData_row){
			$objPHPExcel->getActiveSheet()->SetCellValue("A" . $summaryTableRowCounter, $employeeData_row[0]);
			$objPHPExcel->getActiveSheet()->SetCellValue("B" . $summaryTableRowCounter, $employeeData_row[1]);
			$objPHPExcel->getActiveSheet()->SetCellValue("C" . $summaryTableRowCounter, $employeeData_row[2]);
			$objPHPExcel->getActiveSheet()->SetCellValue("D" . $summaryTableRowCounter, $employeeData_row[3]);
			$objPHPExcel->getActiveSheet()->SetCellValue("E" . $summaryTableRowCounter, $employeeData_row[4]);
			$summaryTableRowCounter++;
		}
	}

	$objPHPExcel->getActiveSheet()->getStyle("A".$summaryTableRowCounter.":E".$summaryTableRowCounter."")->getFont()->setBold( true );
	$objPHPExcel->getActiveSheet()->SetCellValue("A" . $summaryTableRowCounter, "Grand Total:");
	$objPHPExcel->getActiveSheet()->SetCellValue("B" . $summaryTableRowCounter, "=SUBTOTAL(9,B2:B" . ($summaryTableRowCounter-1) . ")");
	$objPHPExcel->getActiveSheet()->SetCellValue("C" . $summaryTableRowCounter, "=SUBTOTAL(9,C2:C" . ($summaryTableRowCounter-1) . ")");
	$objPHPExcel->getActiveSheet()->SetCellValue("D" . $summaryTableRowCounter, "=SUBTOTAL(9,D2:D" . ($summaryTableRowCounter-1) . ")");
	$objPHPExcel->getActiveSheet()->SetCellValue("E" . $summaryTableRowCounter, "=SUBTOTAL(9,E2:E" . ($summaryTableRowCounter-1) . ")");

	$prevLoc = $site;
	$siteCounter++;
}
endOfFile($objPHPExcel, $reportFileName, $reportFileNameFull, $siteFull, $recipientArray, $date_Display);


function endOfFile($objPHPExcel, $reportFileName, $outputFileName, $site, $recipientArray, $reportDate){
	if($GLOBALS['siteFilter']){
		if(!in_array( $site, array($GLOBALS['siteFilter']) )){
			return false;
		}
	}
	$objWriter = new PHPExcel_Writer_Excel2007($objPHPExcel);

	/*
	$savefile = "php://output";
		header('Content-type: application/vnd.ms-excel');
		header("Content-Disposition: attachment; filename=$outputFileName");
	}
	$objWriter->save($savefile);

	$mailer = new DeltaMailer();
	$from = 'hr@deltasoniccarwash.com';

	if(isset($_REQUEST['debugEmailer'])){
		$recipients = "dereklutz@deltasoniccarwash.com";
	} else {
		$recipients = $createdByEmail;
	}

	$mailer->SendEmail($recipients,$from,$subject,$body);
	*/
	//return $outputFile;

	#if (PayrollUtils::is_cli() && false) {
		$savefile = $outputFileName;
	#} else {
	#	$savefile = "php://output";
	#	header('Content-type: application/vnd.ms-excel');
	#	header("Content-Disposition: attachment; filename=$outputFileName");
	#}
	$objWriter->save($savefile);

	if($GLOBALS['emailReports']){
		if(isset($recipientArray[$site])){
			if(count($recipientArray[$site]) > 0){
				$mailer = new DeltaMailer();
				$from = 'hr@deltasoniccarwash.com';

				if(isset($_REQUEST['debugEmailer'])){
					$recipients = "dereklutz@deltasoniccarwash.com";
				} else {
					$recipients = implode(',', $recipientArray[$site]);
				}

				$subject = "Daily Tip Report for " . $site . " " . $reportDate;
				$body = "Attached is your daily employee tips report for location ".$site." for the date of " . $reportDate;

				$mailer->SendEmail($recipients,$from,$subject,$body, true, $outputFileName);
			}
		}
	}
}
?>
