'use strict';

let empid,
	getInitialState,
	logoutUrl = './',
	timer = () => {
		setTimeout(IdleTimeout, 60000)
	},
	removeTimer = () => {
		clearTimeout(timeout)
	};
function update(input) {
	$('#inputID').val($('#inputID').val() + input);
}

let back = () => {
	$('#inputID').val($('#inputID').val().slice(0, -1));
}

let empty = () => {
	$('#inputID').val('');
}

let login = (e) => {
	if (e)
		e.preventDefault();
	empid = $('#inputID').val();

	$.ajax({
		url: `./php/main.php?action=validateUser&empid=${empid}`
	}).done((result) => {
		if (result.user) {
			// TODO: show application
			getInitialState();
			$('#auth').toggle();
			$('#app').toggle();
			$('#name').html(result.user.empname);
			timer()
		} else {
			$(".modal-title").html(`User not found for employee ID: ${empid}`)
			$(".modal-body").html(`
				  <p>The Employee number <b>${empid}</b> Was not found in the system. Would you like to punch it in anyway</p>
			`)
			$('.modal').modal('toggle')
		}
	});
	return false;
}

let unknownSignin = () => {
	$('.modal').modal('toggle')
	getInitialState();
	$('#auth').toggle();
	$('#app').toggle();
	$('#name').html(empid);
	timer()
}

// Logout the user.
function IdleTimeout() {
	window.location = logoutUrl;
}

$(document).ready(function(){
	$('#inputID').val('');
	$('#inputID').focus();
	//Javascript letiables
	let date = moment(),
		counter = 0,
		checkInTime,
		checkOutTime,
		checkInIds = [],
		totalTime = 0;

	// HTML Buttons
	let $checkInBtn = $('#checkIn'),
		$checkOutBtn = $('#checkOut'),
		$timesheetBtn = $('#timesheet'),
		$todayHours = $('#todayHours'),
		$totalHours = $('#totalHours');

	// Event Listeners
	$checkInBtn.on("click", () => {
		$.ajax({
			url: `./php/main.php?action=checkIn`,
			method: 'POST',
			data: {
				time: moment().seconds(0).format('YYYY-MM-DD HH:mm:ss'),
				empid: empid
			}
		}).done((result) => {
			checkInIds.push(result.id);
			checkInTime = moment();
			makeUpdate();
		});
	});

	$checkOutBtn.on("click", () => {
		$.ajax({
			url: `./php/main.php?action=checkOut`,
			method: 'POST',
			data: {
				time: moment().seconds(0).format('YYYY-MM-DD HH:mm:ss'),
				id: checkInIds[checkInIds.length - 1],
				empid: empid
			}
		}).done((hours) => {
			checkOutTime = moment();
			makeUpdate(true);
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
			let timeslots = hours.clockedHours;
			if (timeslots.length > 0) {
				timeslots.forEach((timeslot, index) => {
					let hoursSum;
					checkInTime = timeslot.punchintime ? moment(timeslot.punchintime) : null;
					checkOutTime = timeslot.punchouttime ? moment(timeslot.punchouttime) : null;
					checkInIds.push(timeslot.timeid);
					counter++;

					if (checkOutTime) {
						hoursSum = calculateHours(checkInTime, checkOutTime);
						populateElement(totalTime.toFixed(2),$totalHours);
						counter++;
					}

					addRow(checkInTime, checkOutTime, hoursSum);
				});

				toggleButtons();
			} else {
				toggleButtons();
			}
	    });
	};

	let populateElement = (time, field) => {
		if (time === null)
			return;

		field.html(time);
	};

	let makeUpdate = (checkOut) => {
		let hoursSum;
		counter++;
		if (checkOut) {
			hoursSum = calculateHours(checkInTime, checkOutTime);
			populateElement(totalTime.toFixed(2),$totalHours);
			$(`#${checkInIds[checkInIds.length - 1]}timeout`).html(checkOutTime.format('h:mm a'));
			$(`#${checkInIds[checkInIds.length - 1]}hours`).html(hoursSum.toFixed(2));
		} else {
			addRow(checkInTime, null, null);
		}
		toggleButtons();
	};

	let toggleButtons = () => {
		if (counter % 2 == 0) {
			$checkInBtn.show();
			$checkOutBtn.hide();
		} else {
			$checkInBtn.hide();
			$checkOutBtn.show();
		}
	};

	let calculateHours = (start, end) => {
		let hours = end.diff(start, 'minutes') / 60;
		totalTime += hours;
		return hours;
	};

	let addRow = (start, end, total) => {
		$todayHours.append(`
			<tr>
				<td>${checkInIds.length == 1 ? moment().format('dddd, MMM Do') : ''}</td>
				<td>${start.format('h:mm a')}</td>
				<td id="${checkInIds[checkInIds.length - 1] + 'timeout'}">${ end ? end.format('h:mm a') : '- -'}</td>
				<td id="${checkInIds[checkInIds.length - 1] + 'hours'}" class="${total > 6 ? 'red' : ''}">${total ? total.toFixed(2) : 0}</td>
			</tr>
		`);
	}
});
