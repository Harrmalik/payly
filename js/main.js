$(document).ready(function(){
	//Javascript variables
	var date = moment.format('MMM Do');
	var time = '';

	// HTML Buttons
	var checkInBtn = $('#checkIn');
	var checkOutBtn = $('#checkOut');
	var timesheetBtn = $('#timesheet');
	$('#today').html(date);

	// Event Listeners
	checkInBtn.on("click", function() {
		time = moment.format('HH:MM:SS');
		updateToday(time, '#timeIn');
		updateTimesheet();
	});

	checkOutBtn.on("click", function() {
		time = moment.format('HH:MM:SS');
		updateToday(time, '#timeOut');
		updateTimesheet();
	});

	timesheetBtn.on("click", function() {
		window.location('/timesheet.php');
	});

	// Functions
	var updateToday = function(time, field) {
		$(field).html(time);
	};

	var updateTimesheet = function() {

	};
}
