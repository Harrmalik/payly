let empid,
maxHours = 0,
currentHours,
hasOvertime,
getInitialState,
logoutUrl = './',
userData = $('title').data(),
ipaddress = '',
alerts,
timezone,
deltasonic,
autologout,
timer = () => {
	autologout = setTimeout(IdleTimeout, 60000)
},
removeTimer = () => {
	clearTimeout(autologout)
};

if (!ga) {
	var ga = function (arg1, arg2, category = '', action = '', label = '') {
		console.log(`${arg2} - category: ${category}, action: ${action}, label: ${label}`);
	}
}

// Only show timer if screen is wide enough
if ($(window).width() >= 1000) {
	$('#clockdate').show()
	startTime()
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
		url : `./php/main.php?module=getIp`
	}).always((ip) => {
		$.ajax({
			url : `./php/main.php?module=kissklock&action=validateUser&id=${empid}`
		}).done((user) => {
			let ipaddress = ip.responseText.trim()
			if (empid && user.empname) {
				getInitialState();
				$('#auth').hide();
				$('#nav').show();
				$('#appname').text(user.deltasonic ? 'Kiss Klock' : 'Benderson Timeclock')
				$('#app').show();
				$('#name').html(`Signed in as ${user.empname} <i class="glyphicon glyphicon-user"></i>`);
				ga('send', 'event', 'Login', empid)
				userData.emp ? ga('set', 'userId', $('title').data('emp')) : ga('set', 'userId', empid)
				maxHours = user.holidays
				currentHours = user.currentHours
				alerts = user.alerts
				timezone = user.timezone ? user.timezone : moment.tz.guess()
				deltasonic = user.deltasonic
				hasOvertime = user.hasOvertime
				var birthday = moment(user.birthday).add(5, 'hours').format('MMDD')
				var hiredDate = moment(user.hiredDate).add(5, 'hours').format('MMDD')
				var yearsWorked = moment().format('YYYY') - moment(user.hiredDate).add(5, 'hours').format('YYYY')
				var todaysDate = moment().format('MMDD')



				// If public machine prevent users from setting as local maching
				if (ipaddress == '172.30.49.156') {
					$('#setuser').hide()
				} else {
					getInitialState()

					// If local machine stop the page logout
					if (localStorage) {
						if (!localStorage.getItem('empid')) {
							timer()
							$('#setuser').show()
						}
					}
				}

				// Show benderson punch in for dev and benderson user
				if (empid == 81369 || empid == 82934) {
					$('#benCheckIn').show()
				}

				if (birthday == todaysDate) {
					$('#message').html(`<div class="alert alert-info" role="alert">Happy birthday <b>${user.empname}</b>!</div>`)
				}

				if (hiredDate == todaysDate) {
					$('#message').html(`<div class="alert alert-info" role="alert">Happy Anniversary <b>${user.empname}</b>! Thank you for your ${yearsWorked} year(s) of service.</b></div>`)
				}
			} else {
				$(".modal-title").html(`User not found for employee ID: ${empid}`)
				$(".modal-body").html(`
					  <p>The Employee number <b>${empid}</b> Was not found in the system. Would you like to punch it in anyway</p>
				`)
				$('#unknownusermodal').modal('toggle')
			}
		});
	})

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
	iziToast.show({
	    title: 'IdleTimeout',
	    message: 'You have been signed out'
	});
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
	$totalHours = $('#totalHours'),
	$overallHours = $('#overallHours');

	// Event Listeners
	$checkInBtn.on("click", () => {
		ga('send', 'event', 'CheckIn', empid, 'Attempted')
		$('#checkIn').attr('disabled', true)
		$('#checkIn').text('Punching in...')
		checkInTime = deltasonic ? moment().seconds(0) : moment().minute(Math.round(moment().minute() / 15) * 15).second(0);
		iziToast.show({
			title: 'Loading',
			message: `Checking in now`
		});

		$.ajax({
			url : `./php/main.php?module=kissklock&action=checkIn`,
			method : 'POST',
			data : {
				time     : checkInTime.unix(),
				empid    : empid,
				timezone : timezone,
				alerts   : alerts
			}
		}).success((checkin) => {
			checkInIds.push(checkin);
			makeUpdate();
			ga('send', 'event', 'CheckIn', empid, 'Successful')
			iziToast.success({
				message: 'You have been successfully checked in'
			});
		}).fail((result) => {
			iziToast.error({
				message: 'Kiss Klock could not be saved at this time'
			});
			ga('send', 'event', 'CheckIn', empid, 'Unsuccessful')
		}).always((result) => {
			$('#checkIn').attr('disabled', false)
			$('#checkIn').text('Punch In')
		});
	});

	$checkOutBtn.on("click", () => {
		ga('send', 'event', 'CheckOut', empid, 'Attempted')
		checkOutTime = deltasonic ? moment().seconds(0) : moment().minute(Math.round(moment().minute() / 15) * 15).second(0);
		iziToast.show({
			title: 'Loading',
			message: `Checking out now`
		});

		$('#checkOut').attr('disabled', true)
		$('#checkOut').text('Punching out...')
		setTimeout(() => {
		}, 3000)
		$.ajax({
			url : `./php/main.php?module=kissklock&action=checkOut`,
			method : 'POST',
			data : {
				time     : checkOutTime.unix(),
				id       : checkInIds[checkInIds.length - 1],
				empid    : empid,
				timezone : timezone,
				alerts   : alerts
			}
		}).success((hours) => {
			if (deltasonic == 1) {
				iziToast.info({
					timeout: 60000 * 60,
					title: 'Punched Out',
					message: `<b>30 Minutes</b> from now would be - <b>${moment.unix(checkOutTime.unix()).add(30,'minutes').format('h:mm a')}</b>`
				});
			}
			makeUpdate(true);
			ga('send', 'event', 'CheckOut', empid, 'Successful')
		}).fail((result) => {
			iziToast.error({
				message: 'Kiss Klock could not be saved at this time'
			});
			ga('send', 'event', 'CheckOut', empid, 'Unsuccessful')
		}).always((result) => {
			$('#checkOut').attr('disabled', false)
			$('#checkOut').text('Punch Out')
		});
	});

	$benCheckInBtn.on("click", () => {
		ga('send', 'event', 'CheckIn', empid, 'Attempted')

		$.ajax({
			url : `./php/main.php?module=kissklock&action=benCheckIn`,
			method : 'POST',
			data : {
				time     : moment().seconds(0).unix(),
				empid    : empid,
				timezone : timezone,
				alerts   : alerts
			}
		}).success((checkin) => {
			checkInIds.push(checkin);
			checkInTime = moment();
			makeUpdate();
			ga('send', 'event', 'CheckIn', empid, 'Successful')
		}).fail((result) => {
			iziToast.error({
				message: 'Kiss Klock could not be saved at this time'
			});
			ga('send', 'event', 'CheckIn', empid, 'Unsuccessful')
		});
	});

	$timesheetBtn.on("click", () => {
		$('#app').hide()
		$('#timesheetPage').show()
		$('#clockdate').hide()
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
		fridayBreaks = 0,
		days;

		// HTML Elements
		let $timesheet = $('#timesheetTable');
		//let $totalHours = $('#totalHours');

		if (deltasonic) {
			days = [
				[$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday'],
				[$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday'],
				[$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday'],
				[$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday'],
				[$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday'],
				[$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday'],
				[$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday'],
			];
			$('#end').datetimepicker({
				defaultDate : moment().weekday(5),
				format : 'MMMM Do, YYYY',
				daysOfWeekDisabled : [0, 1, 2, 3, 4, 6]
			});
		} else {
			days = [
				[$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday'],
				[$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday'],
				[$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday'],
				[$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday'],
				[$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday'],
				[$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday'],
				[$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday'],
			];
			$('#end').datetimepicker({
				defaultDate : moment().weekday(6),
				format : 'MMMM Do, YYYY',
				daysOfWeekDisabled : [0, 1, 2, 3, 4, 5]
			});
		}

		$.ajax({
			url : `./php/main.php?module=kissklock&action=validateUser&id=${empid}`
		}).done((user) => {
			if (user.empname) {
				$('#name').html(`Signed in as ${user.empname} <i class="glyphicon glyphicon-user"></i>`);
				$('#username').html(user.empname);
				buildTable();
				makeTimesheet();
			}
		});

		function buildTable() {
			$('#timesheetTable').empty()
			days.forEach((day, index) => {
				$('#timesheetTable').append(`
					<tr class="active">
						<th>Date</th>
						<th>Check In</th>
						<th>Check Out</th>
						<th>Hours</th>
					</tr>

					<tr id="${day[4]}" class="timeslots">
						<td>${$('#end').data("DateTimePicker").date().weekday(deltasonic ? index-1 : index).format('dddd, MMM Do')}</td>
						<td>- -</td>
						<td>- -</td>
						<td>0</td>
					</tr>

					<tr class="timeslots">
						<td></td>
						<td></td>
						<td></td>
						<td id="${day[4]}Hours" class="info"><b>0</b></td>
					</tr>
				`);
			});

			if (deltasonic) {
				days = [
					[$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday'],
					[$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday'],
					[$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday'],
					[$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday'],
					[$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday'],
					[$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday'],
					[$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday'],
				];
			} else {
				days = [
					[$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday'],
					[$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday'],
					[$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday'],
					[$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday'],
					[$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday'],
					[$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday'],
					[$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday'],
				];
			}

			$('#timesheetTable').append(`
				<tr id="totalrow">
					<th></th>
					<th></th>
					<th></th>
					<th>Total Hours</th>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td id="totalHours" class="info"><b>0</b></td>
				</tr>
			`)
		}

		function makeTimesheet() {
			$.ajax({
				url : `./php/main.php?module=kissklock&action=getInitialState`,
				data : {
					id: empid,
					startDate : $('#end').data("DateTimePicker").date().weekday(deltasonic ? -1 : 0).hour(0).minute(0).format('YYYY-MM-DD'),
					endDate : $('#end').data("DateTimePicker").date().hour(23).minute(59).format('YYYY-MM-DD')
				}
			}).done((clockedHours) => {
				timeslots = clockedHours;
				let hours = 0;
				let totalTime = 0;
				timeslots.forEach((timeslot, index) => {
					let hoursSum = 0,
					weekday = moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday() === 6 ? -1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday(),
					$htmlDay = days[deltasonic ? weekday + 1 : weekday][0],
					$htmlhours = days[deltasonic ? weekday + 1 : weekday][1],
					breakSum = days[deltasonic ? weekday + 1 : weekday][3];

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
				url : `./php/main.php?module=kissklock&action=getChanges&id=${id}`
			}).done((changes) => {
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
			url : `./php/main.php?module=kissklock&action=getInitialState`,
			data : {
				id : empid,
				startDate : date.format('YYYY-MM-DD'),
				endDate : moment().add(1, 'days').format('YYYY-MM-DD')
			}
		}).done((timeslots) => {
			$('#todayHours').empty()
			checkInIds = []
			totalTime  = 0
			counter    = 0

			if (timeslots.length > 0) {
				timeslots.forEach((timeslot, index) => {
					if (moment.unix(timeslot.punchintime).day() == moment().day()) {
						let hoursSum;
						checkInTime = timeslot.punchintime ? moment.unix(timeslot.punchintime) : null;
						checkOutTime = timeslot.punchouttime ? moment.unix(timeslot.punchouttime) : null;
						checkInIds.push(timeslot.timeid);
						counter++;

						if (checkOutTime) {
							hoursSum = calculateHours(checkInTime, checkOutTime);
							populateElement(totalTime.toFixed(2), $totalHours);
							populateElement(`${totalTime.toFixed(2)}/${maxHours}`, $overallHours);
							counter++;
						} else {
							let timeNow = moment.duration(moment().diff(moment(checkInTime))).asHours()
							populateElement(`${(totalTime + timeNow).toFixed(2)}`, $overallHours);
						}

						addRow(checkInTime, checkOutTime, hoursSum);
					}
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
			if (deltasonic == 0 && (currentHours + hoursSum > 40) && !hasOvertime) {
				removeTimer()
				swal({
					title: 'Reason for overtime',
					input: 'textarea',
					inputAttributes: {
					  autocapitalize: 'off'
					},
					confirmButtonText: 'Submit',
					showLoaderOnConfirm: true,
					preConfirm: (reason) => {
						$.ajax({
							url : `./php/main.php?module=kissklock&action=overtimeReason`,
							method : 'POST',
							data : {
								weekending : moment().weekday(5).unix(),
								empid      : empid,
								reason     : reason
							}
						}).success((checkin) => {
							ga('send', 'event', 'OvertimeReason', empid, 'Successful')
							iziToast.success({
								message: 'Overtime reason has been successfully saved.'
							});
						}).fail((result) => {
							iziToast.error({
								message: 'Could not save overtime reason at this time. Please try again.'
							});
							ga('send', 'event', 'OvertimeReason', empid, 'Unsuccessful')
						});
					},
					allowOutsideClick: false
				});
			}
			populateElement(totalTime.toFixed(2), $totalHours);
			populateElement(`${totalTime.toFixed(2)}/${maxHours}`, $overallHours);
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
				<td id="${checkInIds[checkInIds.length - 1] + 'hours'}" class="${total > 6 ? 'red' : ''}">${total ? total.toFixed(2) : '- -'}</td>
			</tr>
		`);
	}
});

function startTime() {
	var today = moment();
	$('#clock').html(today.format('hh:mm:ss') + `<span>${today.format('A')}</span>`)
	$('#date').text(today.format('dddd, MMMM Do'))
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
