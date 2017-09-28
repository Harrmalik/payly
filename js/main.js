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

if (!ga) {
	var ga = function (arg1, arg2, category = '', action = '', label = '') {
		console.log(`${arg2} - category: ${category}, action: ${action}, label: ${label}`);
	}
}

function update(input) {
	$('#inputID').val($('#inputID').val() + input);
	$('#inputID').val();
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
		url : `./php/main.php?action=validateUser&empid=${empid}`
	}).done((result) => {
		if (empid && result.user) {
			getInitialState();
			$('#auth').hide();
			$('#app').show();
			$('#name').html(`Signed in as ${result.user.empname} <i class="glyphicon glyphicon-user"></i>`);
			ga('send', 'event', 'Login', empid)
			userData.emp ? ga('set', 'userId', $('title').data('emp')) : ga('set', 'userId', empid)
			if (localStorage) {
				if (!localStorage.getItem('empid')) {
					timer()
					$('#setuser').show()
				}
			}
			if ($(window).width() > 1300) {
				$('#clockdate').show()
				startTime()
			}

			if (empid == 81369 || empid == 82934) {
				$('#benCheckIn').show()
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

let clearEmpId = () => {
	empid = '';
}

// Logout the user.
function IdleTimeout() {
	ga('send', 'event', 'Logout', empid, 'Timedout')
	$('#message').html('')
	window.location = logoutUrl;
}

$(document).ready(function () {
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
	$benCheckInBtn = $('#benCheckIn'),
	$timesheetBtn = $('#timesheet'),
	$todayHours = $('#todayHours'),
	$totalHours = $('#totalHours');

	// Event Listeners
	$checkInBtn.on("click", () => {
		ga('send', 'event', 'CheckIn', empid, 'Attempted')
		$('#checkIn').attr('disabled', true)
		$('#message').html(`<div class="alert alert-info" role="alert"><i class="fa fa-circle-o-notch fa-spin" style="font-size:24px"></i> Checking in now</div>`)

		setTimeout(() => {
			$('#checkIn').attr('disabled', false)
		}, 3000)
		$.ajax({
			url : `./php/main.php?action=checkIn`,
			method : 'POST',
			data : {
				time : moment().seconds(0).unix(),
				empid : empid
			}
		}).success((result) => {
			checkInIds.push(result.id);
			checkInTime = moment();
			makeUpdate();
			ga('send', 'event', 'CheckIn', empid, 'Successful')
			$('#message').html(`<div class="alert alert-success" role="alert">You have been successfully checked in</div>`)
		}).fail((result) => {
			console.log(result);
			$('#message').html(`<div class="alert alert-danger" role="alert">Kiss Klock could not be saved at this time</div>`)
			ga('send', 'event', 'CheckIn', empid, 'Unsuccessful')
		});
	});

	$checkOutBtn.on("click", () => {
		ga('send', 'event', 'CheckOut', empid, 'Attempted')
		$('#message').html(`<div class="alert alert-info" role="alert"><i class="fa fa-circle-o-notch fa-spin" style="font-size:24px"></i> Checking in now</div>`)
		$('#checkOut').attr('disabled', true)
		setTimeout(() => {
		}, 3000)
		$.ajax({
			url : `./php/main.php?action=checkOut`,
			method : 'POST',
			data : {
				time : moment().seconds(0).unix(),
				id : checkInIds[checkInIds.length - 1],
				empid : empid
			}
		}).success((hours) => {
			$('#message').html(`<div class="alert alert-info" role="alert"><b>30 Minutes</b> from now would be - <b>${moment().add(30,'minutes').format('h:mm a')}</b></div>`)
			checkOutTime = moment();
			makeUpdate(true);
			ga('send', 'event', 'CheckOut', empid, 'Successful')
		}).fail((result) => {
			$('#message').html(`<div class="alert alert-danger" role="alert">Kiss Klock could not be saved at this time</div>`)
			ga('send', 'event', 'CheckOut', empid, 'Unsuccessful')
		});
	});

	$benCheckInBtn.on("click", () => {
		ga('send', 'event', 'CheckIn', empid, 'Attempted')

		$.ajax({
			url : `./php/main.php?action=benCheckIn`,
			method : 'POST',
			data : {
				time : moment().seconds(0).unix(),
				empid : empid
			}
		}).success((result) => {
			checkInIds.push(result.id);
			checkInTime = moment();
			makeUpdate();
			ga('send', 'event', 'CheckIn', empid, 'Successful')
		}).fail((result) => {
			$('#message').html(`<div class="alert alert-danger" role="alert">Kiss Klock could not be saved at this time</div>`)
			ga('send', 'event', 'CheckIn', empid, 'Unsuccessful')
		});
	});

	$timesheetBtn.on("click", () => {
		$('#app').hide()
		$('#timesheetPage').show()
		// Javascript letiables
		let startDate,
		endDate,
		timeslots,
		totalTime = 0,
		breaks = 0,
		saturdayHours = 0,
		saturdayBreaks = 0,
		sundayHours = 0,
		sundayBreaks = 0,
		mondayHours = 0,
		mondayBreaks = 0,
		tuesdayHours = 0,
		tuesdayBreaks = 0,
		wednesdayHours = 0,
		wednesdayBreaks = 0,
		thursdayHours = 0,
		thursdayBreaks = 0,
		fridayHours = 0,
		fridayBreaks = 0;

		// HTML Elements
		let $timesheet = $('#timesheet');
		//let $totalHours = $('#totalHours');
		let days = [
			[$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks],
			[$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks],
			[$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks],
			[$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks],
			[$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks],
			[$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks],
			[$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks],
		];
		$('#end').datetimepicker({
			defaultDate : moment().weekday(2),
			format : 'MMMM Do',
			daysOfWeekDisabled : [0, 1, 2, 3, 4, 6]
		});

		$.ajax({
			url : `./php/main.php?action=validateUser&empid=${empid}`
		}).done((result) => {
			if (result.user) {
				$('#name').html(`Signed in as ${result.user.empname} <i class="glyphicon glyphicon-user"></i>`);
				$('#username').html(result.user.empname);
				buildTable();
				makeTimesheet();
			}
		});

		function buildTable() {
			days.forEach((day, index) => {
				if (timeslots) {
					$('.timeslots').remove();
					day[0].first().html('');
					day[0].attr('clocked', false);
					day[1].html('<b>0</b>');
					day[2] = 0;
					day[3] = 0;
					totalTime = 0;
				} else {
					$(`
		                <tr class="active">
		                    <th>Date</th>
		                    <th>Check In</th>
		                    <th>Check Out</th>
		                    <th>Hours</th>
		                </tr>
		            `).insertBefore(day[0]);
				}

				day[0].first().html(`
		            <td>${$('#end').data("DateTimePicker").date().weekday(index-1).format('dddd, MMM Do')}</td>
		            <td>- -</td>
		            <td>- -</td>
		            <td>0</td>
		        `);
			});
		}

		function makeTimesheet() {
			$.ajax({
				url : `./php/main.php?action=getInitialState`,
				method : 'post',
				data : {
					empid,
					startDate : $('#end').data("DateTimePicker").date().weekday(-1).hour(0).minute(0).format('YYYY-MM-DD HH:mm:ss'),
					endDate : $('#end').data("DateTimePicker").date().hour(23).minute(59).format('YYYY-MM-DD HH:mm:ss')
				}
			}).done((data) => {
				// $('#startDate').html($('#end').data("DateTimePicker").date().weekday(-1).format('M/D/YYYY'));
				// $('#endDate').html($('#end').data("DateTimePicker").date().format('M/D/YYYY'));
				timeslots = data.clockedHours;
				let hours = 0;
				let totalTime = 0;
				timeslots.forEach((timeslot, index) => {
					let hoursSum = 0,
					weekday = moment.unix(timeslot.created).weekday() === 6 ? -1 : moment.unix(timeslot.created).weekday(),
					$htmlDay = days[weekday + 1][0],
					$htmlhours = days[weekday + 1][1],
					breakSum = days[weekday + 1][3];

					if (timeslot.punchouttime) {
						hoursSum = moment.unix(timeslot.punchouttime).diff(moment.unix(timeslot.punchintime), 'minutes') / 60;
						totalTime += hoursSum;
						days[weekday + 1][2] += hoursSum;
						if (timeslots[index - 1]) {
							let previousWeekday = moment.unix(timeslots[index - 1].created).weekday() === 6 ? -1 : moment.unix(timeslots[index - 1].created).weekday();
							if (weekday === previousWeekday) {
								if (timeslots[index - 1].punchouttime) {
									days[weekday + 1][3] += moment.unix(timeslot.punchintime).diff(moment.unix(timeslots[index - 1].punchouttime), 'minutes');
									if (days[previousWeekday + 1][3] < 30) {
										timeslot.overBreak = true;
									}
								}
							}
						}
					}

					if (!$htmlDay.attr('clocked') || $htmlDay.attr('clocked') === 'false') {
						$htmlDay.html('');
						addRow($htmlDay, timeslot, hoursSum);
						$htmlDay.attr('clocked', true);
					} else {
						addRow($htmlDay, timeslot, hoursSum)
					}

					$htmlhours.html(`<b>${days[weekday + 1][2].toFixed(2)}</b>`);

				});
				$("td#totalHours.info").html('<b>' + totalTime.toFixed(2) + '</b>');
			});

		}

		function addRow($element, timeslot, sum) {
			$(
`
		            <tr class="timeslots">
		                <td>${!$element.attr('clocked') || $element.attr('clocked') === 'false' ? moment.unix(timeslot.created).format('dddd, MMM Do') : ''}</td>
		                <td class="${(timeslot.insource == 1 || timeslot.insource == 2) ? 'warning' : ''} ${timeslot.overBreak ? 'red' : ''} ${timeslot.typeid == 1 ? 'vacation' : ''} ${timeslot.typeid == 2 ? 'pto' : ''}">${timeslot.punchintime ? moment.unix(timeslot.punchintime).format('h:mm a') : '00:00 AM'} ${timeslot.insource == 2 ? '*' : ''}</td>
		                <td class="${(timeslot.outsource == 1 || timeslot.outsource == 2) ? 'warning' : ''} ${timeslot.typeid == 1 ? 'vacation' : ''} ${timeslot.typeid == 2 ? 'pto' : ''}">${timeslot.punchouttime ? moment.unix(timeslot.punchouttime).format('h:mm a') : '- -'}</td>
		                <td class=
		                    ${sum.toFixed(2) > 6 ? 'red' : ''}>${sum.toFixed(2)}
		                    ${timeslot.userid == timeslot.lasteditedby ? '' : '<button class="btn btn-defaults btn-xs" id=' + timeslot.timeid + 'info><i class="glyphicon glyphicon-info-sign"></i></button>'}
		                </td>
		            </tr>
		        `).insertBefore($element);
			setPopover(timeslot.timeid);
		};

		function setPopover(id) {
			$.ajax({
				url : `./php/main.php?action=getChanges`,
				method : 'post',
				data : {
					id
				}
			}).done((result) => {
				let changes = result.changes;
				let html = '';
				if (changes.length == 0) {
					html += 'This timeslot was created for you';
				} else {
					changes.forEach((c) => {
						if (c.oldintime !== c.newintime) {
							if (c.editedby == "99999") {
								html += '<p>You were autosigned out at midnight</p>'
							} else {
								html += `
										<p>Check in changed from <b>${moment.unix(c.oldintime).format('h:mm a')}</b> to <b>${moment.unix(c.newintime).format('h:mm a')}</b></p>
									`;
							}
						} else if (c.oldouttime !== c.newouttime) {
							if (c.editedby == "99999") {
								html += '<p>You were autosigned out at midnight</p>'
							} else {
								html += `
										<p>Check out changed from <b>${moment.unix(c.oldouttime).format('h:mm a')}</b> to <b>${moment.unix(c.newouttime).format('h:mm a')}</b></p>
									`;
							}
						}
					});
				}

				$(`#${id}info`).popover({
					template : `<div id=${id} class="popover" role="tooltip">
								<div class="arrow"></div>
								<h3 class="popover-title"></h3>
								<div class="popover-content"></div>
							</div>`,
					html : true,
					container : `#${id}info`,
					title : 'Change Log',
					content : html
				});
				$(`#${id}info`).on('click', () => {
					$(`#${id}`).popover('show');
				});

				$(`.popover`).on('show.bs.popover', function () {
					setTimeout(function () {
						$(`#${id}`).popover('hide');
					}, 2000);
				})
			});
		};

		$('#end').on('dp.change', () => {
			buildTable();
			makeTimesheet();
		});
	});

	// Functions
	getInitialState = () => {
		$.ajax({
			url : `./php/main.php?action=getInitialState`,
			method : 'POST',
			data : {
				empid : empid,
				startDate : date.format('YYYY-MM-DD') + ' 00:00:00',
				endDate : moment().add(1, 'days').format('YYYY-MM-DD') + ' 00:00:00'
			}
		}).done((hours) => {
			$('#todayHours').empty()
			checkInIds = []
			totalTime = 0
				counter = 0
				let timeslots = hours.clockedHours;
			if (timeslots.length > 0) {
				timeslots.forEach((timeslot, index) => {
					let hoursSum;
					checkInTime = timeslot.punchintime ? moment.unix(timeslot.punchintime) : null;
					checkOutTime = timeslot.punchouttime ? moment.unix(timeslot.punchouttime) : null;
					checkInIds.push(timeslot.timeid);
					counter++;

					if (checkOutTime) {
						hoursSum = calculateHours(checkInTime, checkOutTime);
						populateElement(totalTime.toFixed(2), $totalHours);
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
			populateElement(totalTime.toFixed(2), $totalHours);
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

	function refresh() {
		getInitialState()
	}

	setInterval(refresh, 60000);
});

function startTime() {
	var today = moment();
	$('#clock').html(today.format('hh:mm:ss') + `<span>${today.format('A')}</span>`)
	$('#date').text(today.format('Do, dddd MMMM YYYY'))
	var time = setTimeout(function () {
			startTime()
		}, 500);
}

function openWarning() {
	$('#warning').modal()
}

function setUser() {
	localStorage.setItem('empid', empid)
	ga('send', 'event', 'LocalMachine', empid)
	$('#warning').modal('hide')
}
