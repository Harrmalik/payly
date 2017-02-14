let empid;
let getInitialState;
function update(input) {
	$('#inputID').val($('#inputID').val() + input);
}

let back = () => {
	$('#inputID').val($('#inputID').val().slice(0, -1));
}

let empty = () => {
	$('#inputID').val('');
}

let login = () => {
	empid = $('#inputID').val();
	$.ajax({
		url: `./php/main.php?action=validateUser&empid=${empid}`
	}).done((result) => {
		if (result.user) {
			// TODO: show application
			getInitialState();
			$('#auth').toggle();
			$('#app').toggle();
		} else {
			errMessage = result;
			$('#message').append(
				`<div class="alert alert-danger alert-dismissible" role="alert">
  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
  <strong>Bad Credentials</strong> Entered invalid employee id
</div>`
			)
		}
	});
}

$(document).ready(function(){
	$('#inputID').val('');
	$('#inputID').focus();
	//Javascript letiables
	let date = moment(),
		time = '',
		counter = 0,
		checkInTime,
		checkOutTime,
		checkInTime2,
		checkOutTime2,
		checkInIds = [],
		totalTime = 0,
		logoutUrl = './';

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
	setTimeout(IdleTimeout, 300000);

	$checkInBtn.on("click", () => {
		$.ajax({
			url: `./php/main.php?action=checkIn`,
			method: 'POST',
			data: {
				time: moment().format('YYYY-MM-DD HH:mm:ss'),
				empid: empid
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
			url: `./php/main.php?action=checkOut`,
			method: 'POST',
			data: {
				time: moment().format('YYYY-MM-DD HH:mm:ss'),
				id: checkInIds[checkInIds.length - 1],
				empid: empid
			}
		}).done((hours) => {
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
		window.location.href = `timesheet.php?empid=${empid}`;
	});

	// Functions
	getInitialState = () => {
		$.ajax({
			url: `./php/main.php?action=getInitialState`,
			method: 'POST',
			data: {
				empid: empid,
				startDate: date.format('YYYY-MM-DD') + ' 00:00:00',
				endDate: moment().add(1,'days').format('YYYY-MM-DD') + ' 00:00:00'
			}
		}).done((hours) => {
			var hours = hours.clockedHours;
			if (hours.length > 0) {
				checkInTime = hours[0].punchintime ? moment(hours[0].punchintime) : null;
				checkOutTime = hours[0].punchouttime ? moment(hours[0].punchouttime) : null;
				checkInIds.push(hours[0].timeid);
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
					checkInTime2 = hours[1].punchintime ? moment(hours[1].punchintime) : null;
					checkOutTime2 = hours[1].punchouttime ? moment(hours[1].punchouttime) : null;
					checkInIds.push(hours[1].timeid);
					populateElement(checkInTime2.format('h:mm a'), $timeIn2);
					if (checkOutTime2 !== null)
						populateElement(checkOutTime2.format('h:mm a'), $timeOut2);

					counter++;

					if (checkOutTime2) {
						let hoursSum = checkOutTime2.diff(checkInTime2, 'minutes') / 60;
						totalTime += hoursSum;
						populateElement(hoursSum.toFixed(2),$hours2);
						populateElement(totalTime.toFixed(2),$totalHours);
						counter++;
					}
				}

				toggleButtons();
				$today.html(moment(hours[0].punchintime).format('MMM Do'));
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
		counter++;
		time = moment().format('h:mm a');
		updateToday(time, field, extraAction);
		toggleButtons();
	};

	let toggleButtons = () => {
		if (counter == 0 || counter == 2) {
			$checkInBtn.show();
			$checkOutBtn.hide();
		} else if (counter == 1 || counter == 3) {
			$checkInBtn.hide();
			$checkOutBtn.show();
		} else {
			$checkInBtn.hide();
			$checkOutBtn.hide();
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

	// Logout the user.
	function IdleTimeout() {
	    window.location = logoutUrl;
	}

});
