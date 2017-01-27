$(document).ready(function(){
	//Javascript letiables
	let date = moment().format('MMM Do'),
		time = '',
		counter;

	// HTML Buttons
	let $checkInBtn = $('#checkIn'),
		$checkOutBtn = $('#checkOut'),
		$timesheetBtn = $('#timesheet'),
		$timesheet = $('#timesheet'),
		$todayHours = $('#todayHours'),
		$today = $('#today'),
		$timeIn = $('#timeIn'),
		$timeOut = $('#timeOut'),
		$hours = $('#hours'),
		$totalHours = $('#totalHours');
	$('#today').html(date);

	// Event Listeners
	$checkInBtn.on("click", () => {
		if ($timeIn.text() !== '00:00') {
			makeUpdate('#timeIn2', 'create new row');
		} else {
			makeUpdate('#timeIn');
		}
	});

	$checkOutBtn.on("click", () => {
		if ($timeOut.text() !== "00:00") {
			makeUpdate('#timeOut2', 'calculate hour2');
		} else {
			makeUpdate('#timeOut', 'calculate hours');
		}
	});

	$timesheetBtn.on("click", () => {
		window.location.href = 'timesheet.php';
	});

	// Functions
	let getInitialState = () => {
		// TODO: make api call get initial state
		// TODO: set default values
		toggleButtons('initial');
		$today.html(date);
	};

	let makeUpdate = (field, extraAction) => {
		time = moment().format('HH:MM a');
		updateToday(time, field, extraAction);
		updateTimesheet();
		toggleButtons();
	}
	
	let toggleButtons = (state) => {
		if (state === 'initial') {
			$checkOutBtn.toggle();
		} else {
			$checkInBtn.toggle();
			$checkOutBtn.toggle();
		}
	};
	
	let updateToday = (time, field, extraAction) => {
		$(field).html(time);
		if (extraAction == 'calculate hours') {
			$('#hours').html(moment().startOf('hour').fromNow());
		} else if (extraAction == 'calculate hour2') {
			$('#hours2').html(moment().startOf('hour').fromNow());
			$checkInBtn.toggle();
		} else if (extraAction == 'create new row') {
			$todayHours.append(`
				<tr>
					<td></td>
					<td id="timeIn2">${time}</td>
					<td id="timeOut2">00:00</td>
					<td id="hours2">0</td>
				</tr>
			`);
		}
	};

	let updateTimesheet = () => {
		// TODO: make put request to update times
	};

	getInitialState();

});


