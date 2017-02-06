$(document).ready(function(){
	//Javascript letiables
	let date = moment(),
		time = '',
		counter = 0,
		checkInTime,
		checkOutTime,
		checkInTime2,
		checkOutTime2,
		checkInIds = [],
		totalTime = 0;

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
		$timeIn2,
		$timeOut2,
		$hours2,
		$totalHours = $('#totalHours');

	// Event Listeners
	$checkInBtn.on("click", () => {
		$.ajax({
			url: `./php/main.php?action=checkIn`,
			dataType: 'json',
			method: 'POST',
			data: {
				time: moment().format('YYYY-MM-DD HH:mm:ss')
			}
		}).done((result) => {
			checkInIds.push(result.id);
			if ($timeIn.text() !== '00:00') {
				checkInTime2 = moment();
				makeUpdate('#timeIn2', 'create new row', 'check in');
			} else {
				checkInTime = moment();
				makeUpdate('#timeIn', null, 'check in');
			}
		});
	});

	$checkOutBtn.on("click", () => {
		$.ajax({
			url: `./php/main.php?action=checkOut&id=${checkInIds[checkInIds.length - 1]}&time=${moment().format('YYYY-MM-DD HH:mm:ss')}`,
			method: 'POST',
			data: {
				id: checkInIds[checkInIds.length - 1]
			}
		}).done((hours) => {
			console.log(hours);
			if ($timeOut.text() !== "00:00") {
				checkOutTime2 = moment();
				makeUpdate('#timeOut2', 'calculate hour2', 'check out');
			} else {
				checkOutTime = moment();
				makeUpdate('#timeOut', 'calculate hours', 'check out');
			}
		});
	});

	$timesheetBtn.on("click", () => {
		window.location.href = 'timesheet.php';
	});

	// Functions
	let getInitialState = () => {
		$.ajax({
			url: `./php/main.php?action=getInitialState&startDate=${date.format('YYYY-MM-DD') + ' 00:00:00'}&endDate=${moment().add(1,'days').format('YYYY-MM-DD') + ' 00:00:00'}`
		}).done((hours) => {
			var hours = hours.clockedHours;
			if (hours.length > 0) {
				checkInTime = hours[0].punch_in_time ? moment(hours[0].punch_in_time) : null;
				checkOutTime = hours[0].punch_out_time ? moment(hours[0].punch_out_time) : null;
				checkInIds.push(hours[0].punch_in_id);
				populateElement(checkInTime.format('h:mm a'), $timeIn);
				if (checkOutTime !== null)
					populateElement(checkOutTime.format('h:mm a'), $timeOut);

				counter++;

				if (checkOutTime) {
					let hoursSum = checkOutTime.diff(checkInTime, 'minutes') / 60;
					totalTime += hoursSum;
					populateElement(hoursSum.toFixed(2),$hours);
					populateElement(totalTime.toFixed(2),$totalHours);
					counter++;
				}

				if (hours.length > 1) {
					newRow(time);
					checkInTime2 = hours[1].punch_in_time ? moment(hours[1].punch_in_time) : null;
					checkOutTime2 = hours[1].punch_out_time ? moment(hours[1].punch_out_time) : null;
					checkInIds.push(hours[1].punch_in_id);
					populateElement(checkInTime2.format('h:mm a'), $timeIn2);
					if (checkOutTime2 !== null)
						populateElement(checkOutTime2.format('h:mm a'), $timeOut2);

					counter++;

					if (checkOutTime2) {
						let hoursSum = checkOutTime2.diff(checkInTime2, 'minutes') / 60;
						totalTime += hoursSum;
						console.log(totalTime);
						populateElement(hoursSum.toFixed(2),$hours2);
						populateElement(totalTime.toFixed(2),$totalHours);
						counter++;
					}
				}

				toggleButtons();
				$today.html(moment(hours[0].punch_in_time).format('MMM Do'));
			} else {
				toggleButtons();
				$today.html(date.format('MMM Do'));
			}
	    });
	};

	let populateElement = (time, field) => {
		if (time === null)
			return;

		field.html(time);
	};

	let makeUpdate = (field, extraAction, state) => {
		time = moment().format('h:mm a');
		updateToday(time, field, extraAction);
		toggleButtons(true);
	};

	let toggleButtons = (toggle) => {
		if (toggle || counter == 4) {
			$checkInBtn.toggle();
			$checkOutBtn.toggle();
		} else if (counter == 0 || counter == 2) {
			$checkOutBtn.toggle();
		} else if (counter == 1 || counter == 3) {
			$checkInBtn.toggle();
		}
	};

	let updateToday = (time, field, extraAction) => {
		$(field).html(time);
		if (extraAction == 'calculate hours') {
			let hoursSum = checkOutTime.diff(checkInTime, 'minutes') / 60;
			totalTime += hoursSum;
			populateElement(hoursSum.toFixed(2),$hours);
			populateElement(totalTime.toFixed(2),$totalHours);
		} else if (extraAction == 'calculate hour2') {
			let hoursSum = checkOutTime2.diff(checkInTime2, 'minutes') / 60;
			totalTime += hoursSum;
			console.log(totalTime);
			populateElement(hoursSum.toFixed(2),$hours2);
			populateElement(totalTime.toFixed(2),$totalHours);
			$checkInBtn.toggle();
		} else if (extraAction == 'create new row') {
			newRow(time);
		}
	};

	let newRow = (time) => {
		$todayHours.append(`
			<tr>
				<td></td>
				<td id="timeIn2">${time}</td>
				<td id="timeOut2">00:00</td>
				<td id="hours2">0</td>
			</tr>
		`);
		$timeIn2 = $('#timeIn2');
		$timeOut2 = $('#timeOut2');
		$hours2 = $('#hours2');
	}

	getInitialState();

});
