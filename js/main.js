let empid,
	getInitialState,
	logoutUrl = './',
	userData = $('title').data(),
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
	empid = empid ? empid : $('#inputID').val();

	$.ajax({
		url: `./php/main.php?action=validateUser&empid=${empid}`
	}).done((result) => {
		if (result.user) {
			// TODO: show application

			getInitialState();
			$('#auth').hide();
			$('#app').show();
			$('#name').html(`Signed in as ${result.user.empname} <i class="glyphicon glyphicon-user"></i>`);
			ga('send', 'event', 'Login', empid)
			timer()
			userData.emp ? ga('set', 'userId', $('title').data('emp')) : ga('set', 'userId', empid)
			if (localStorage) {
				if (!localStorage.getItem('empid')) {
					$('#setuser').show()
				}
			}
			if ($( window ).width() >1300) {
				$('#clockdate').show()
				startTime()
			}
		} else {
			$(".modal-title").html(`User not found for employee ID: ${empid}`)
			$(".modal-body").html(`
				  <p>The Employee number <b>${empid}</b> Was not found in the system. Would you like to punch it in anyway</p>
			`)
			$('#unknownusermodal').modal('toggle')
		}
	});
	return false;
}

if (localStorage.getItem('empid')) {
	empid = localStorage.getItem('empid')
	login()
} else {
	$('#auth').show()
}

let unknownSignin = () => {
	$('#unknownusermodal').modal('toggle')
	getInitialState();
	$('#auth').toggle();
	$('#app').toggle();
	$('#name').html(empid);
	ga('send', 'event', 'Login', empid, 'Failed')
	timer()
}

// Logout the user.
function IdleTimeout() {
	ga('send', 'event', 'Logout', empid, 'Timedout')
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
		ga('send', 'event', 'CheckIn', empid, 'Attempted')
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
			ga('send', 'event', 'CheckIn', empid, 'Successful')
		});
	});

	$checkOutBtn.on("click", () => {
		ga('send', 'event', 'CheckOut', empid, 'Attempted')
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
			ga('send', 'event', 'CheckOut', empid, 'Successful')
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

function startTime() {
    var today = moment();
	$('#clock').html(today.format('hh:mm:ss') + `<span>${today.format('A')}</span>`)
	$('#date').text(today.format('Do, dddd MMMM YYYY'))
    var time = setTimeout(function(){ startTime() }, 500);
}

function openWarning() {
	$('#warning').modal()
}
function setUser() {
	localStorage.setItem('empid', empid)
	ga('send', 'event', 'LocalMachine', empid)
	$('#warning').modal('hide')
}
