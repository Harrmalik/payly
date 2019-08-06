let empid,
employeename,
counter = 0,
roles,
role,
tippedRole,
maxHours = 0,
currentHours = 0,
currentTippedHours = 0,
currentNonTippedHours = 0,
otrId,
getInitialState,
logoutUrl = './',
userData = $('title').data(),
ipaddress = '',
alerts,
timezone,
deltasonic,
isField,
autologout,
checkIn,
checkOut,
openTips,
hasNotClaimed = false,
timer = () => {
	autologout = setTimeout(IdleTimeout, 300000)
},
removeTimer = () => {
	clearTimeout(autologout)
};

$('body').css("overflow", "hidden")
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
	$('#login').attr('disabled', true)
	$('#login').text('Loading...')
	if (e)
		e.preventDefault();
	empid = empid ? empid : $('#inputID').val().replace(/[&<>]/g, '');

	$.ajax({
		url : `./php/main.php?module=getIp`
	}).always((ip) => {
		$.ajax({
			url : `./php/main.php?module=kissklock&action=validateUser&id=${empid}`
		}).done((user) => {
			let ipaddress = ip.responseText.trim()
			if (empid && user.empname) {
				getInitialState();
				var data = {
					id: empid,
					startDate: $('#tipDate').data("DateTimePicker").date().subtract(1, 'days').format('YYYY-MM-DD'),
					endDate: $('#tipDate').data("DateTimePicker").date().format('YYYY-MM-DD')
				};

				$.get("./php/main.php?module=kissklock&action=getHoursByRole",data).done(function(response){
					response.timeslots.forEach(t => {
						if (t.istipped ==1 && response.tips.length == 0) {
							$('.mainBtns').empty()
							$('#roleButtons').hide()
							$('.mainBtns').append('<h2>Must claim tips to continue using kissklock</h2>')
						}
					})
				})
				$('#auth').hide();
				$('#nav').show();
				$('#appname').text(user.deltasonic ? 'Kiss Klock' : 'Benderson Timeclock')
				$('#app').show();
				$('#name').html(`${user.empname} <i class="glyphicon glyphicon-user"></i>`);
				ga('send', 'event', 'Login', empid)
				userData.emp ? ga('set', 'userId', $('title').data('emp')) : ga('set', 'userId', empid)
				if (user.roles[0]) {
					// TODO: Log person into their last role
					role = user.roles[0].job_code
					tippedRole = user.roles[0].istipped == 1 ? true : false
					$('#primaryJob').html(`${user.roles[0].job_desc}`)
					user.roles.forEach((role) => {
						let color = 'bluebg'

						switch (role.profitcenter) {
							case 1: color = 'bluebg'; break;
							case 2: color = 'greenbg'; break;
							case 3: color = 'purplebg'; break;
							case 4: color = 'pinkbg'; break;
							case 5: color = 'orangebg'; break;
							case 7: color = 'redbg'; break;
						}

						$('#roleButtons').append(`
							<div class="role-button ${color}" id="${role.job_code}">${role.job_desc}</div>
						`)
					})
					$('#roleButtons .role-button').on('click', (e) => {
						$('#primaryJob').html(`${$(e.target).text()}`)
						role = e.target.id

						if (counter % 2 == 1) {
							$('.dropdown-toggle').prop('disabled', true);
							checkOut()
							checkIn()
						} else {
							checkIn()
						}
						$('#roleButtons').hide()
					})
				}
				employeename = user.empname
				maxHours = user.holidays
				currentHours = user.currentHours
				alerts = user.alerts
				timezone = user.timezone ? user.timezone : moment.tz.guess()
				deltasonic = user.deltasonic
				isField = user.field
				roles = user.roles
				if (currentHours == 0) $('#checkIn').html('<h3>Start Day</h3>')
				if (deltasonic) $('#overtime').hide()
				if (user.hasOvertime) {
					$('#overtimeReason').val(user.hasOvertime)
					otrId = user.otrId
				}
				if (!isField) $('.isField').hide()
				var birthday = moment(user.birthday).add(5, 'hours').format('MMDD')
				var hiredDate = moment(user.hiredDate).add(5, 'hours').format('MMDD')
				var yearsWorked = moment().format('YYYY') - moment(user.hiredDate).add(5, 'hours').format('YYYY')
				var todaysDate = moment().format('MMDD')

				// If public machine prevent users from setting as local maching
				if (ipaddress == '172.30.49.156') {
					$('#setuser').hide()
				} else {
					// If local machine stop the page logout
					if (localStorage) {
						if (!localStorage.getItem('empid')) {
							timer()
							$('#setuser').show()
						}
					}
				}

				if (birthday == todaysDate) {
					$('#message').html(`<div class="alert alert-info" role="alert">Happy birthday <b>${user.empname}</b>!</div>`)
				}

				if (hiredDate == todaysDate) {
					$('#message').html(`<div class="alert alert-info" role="alert">Happy Anniversary <b>${user.empname}</b>! Thank you for your ${yearsWorked} year(s) of service.</b></div>`)
				}

				$('#notificationsList').append(`
					<li class="list-group-item"><h2>Walden Notifications</h2></li>
					<li class="list-group-item">Weather will be cold today</li>
					<li class="list-group-item">Location will be closed after 2pm today</li>
				`)
			} else {
				$("#unknownusermodal .modal-title").html(`User not found for employee ID: ${empid}`)
				$("#unknownusermodal .modal-body").html(`
					  <p>The Employee number <b>${empid}</b> Was not found in the system. Would you like to punch it in anyway</p>
				`)
				$('#unknownusermodal').modal('toggle')
			}

			$('#login').attr('disabled', false)
			$('#login').text('Log In')
			window.scrollTo(0,0);
			$('body').css("overflow", "auto")
		});
	})

	return false;
}

$('#loginForm').on('submit',(e) => {
	if (e)
   		e.preventDefault();

	login();
});

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

function printTimesheet() {
	location.href = "./print.php?empid=" + empid
}

$(document).ready(function () {
	$('#inputID').val('');
	$('#inputID').focus();
	//Javascript letiables
	let date = moment(),
	checkInTime,
	checkOutTime,
	checkInIds = [],
	totalTime = 0,
	timeslots = [];

	// HTML Buttons
	let $checkInBtn = $('#checkIn'),
	$checkOutBtn = $('#checkOut'),
	$lunchBreakBtn = $('#lunchBreak'),
	$timesheetBtn = $('#timesheet'),
	$todayHours = $('#todayHours'),
	$totalHours = $('#totalHours'),
	$overallHours = $('#overallHours'),
	$overtimeBtn = $('#overtimeBtn');

	$('#tipDate').datetimepicker({
		defaultDate : moment(),
		format : 'MMMM Do, YYYY'
	});
	$('#tipDate').on('dp.change', () => {
		$($('[name="tippedHours"]')[0]).val("");
		$($('[name="nonTippedHours"]')[0]).val("");
		lookupHours();
	});

	// Event Listeners
	$('#notifications').on("click", () => {
		$('#notificationsPanel').slideToggle()
	});

	$checkInBtn.on("click", () => {
		checkIn()
	});

	$checkOutBtn.on("click", () => {
		checkOut(true)
	})

	$lunchBreakBtn.on("click", () => {
		ga('send', 'event', 'CheckOut', empid, 'Attempted')
		checkOutTime = deltasonic ? moment().seconds(0) : moment().minute(Math.round(moment().minute() / 15) * 15).second(0);
		iziToast.show({
			title: 'Loading',
			message: `Checking out now`
		});

		$lunchBreakBtn.attr('disabled', true)
		$lunchBreakBtn.text('Punching out...')
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
				alerts   : alerts,
				deltasonic
			}
		}).success((checkoutTime) => {
			checkOutTime = moment(checkoutTime)
			if (deltasonic == 1) {
				iziToast.info({
					timeout: 60000 * 60,
					title: 'Punched Out',
					message: `<b>30 Minutes</b> from now would be - <b>${moment.unix(checkOutTime.unix()).add(30,'minutes').format('h:mm a')}</b>`
				});
			}
			makeUpdate(true);
			ga('send', 'event', 'CheckOut', empid, 'Successful')

			if (isField && tippedRole)
				openTips($('#tips')[0], $('#tipsPage'))
		}).fail((result) => {
			iziToast.error({
				message: 'Kiss Klock could not be saved at this time'
			});
			ga('send', 'event', 'CheckOut', empid, 'Unsuccessful')
		}).always((result) => {
			$lunchBreakBtn.attr('disabled', false)
			$lunchBreakBtn.text('Punch Out')
			$('.dropdown-toggle').prop('disabled', false);
		});
	});

	$overtimeBtn.on('click', () => {
		$.ajax({
			url : `./php/main.php?module=kissklock&action=overtimeReason`,
			method : 'POST',
			data : {
				weekending : moment().weekday(5).unix(),
				empid      : empid,
				reason     : $('#overtimeReason').val().replace(/[&<>]/g, ''),
				otrId
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
	})

	$('#home').on('click', (e) => {
		nextPage(e, $('#app'))
		$('#kissklock-app').show()
		$('#clockdate').show()
	})

	$('#tips').on('click', (e) => {
		openTips(e, $('#tipsPage'))
	})

	$timesheetBtn.on("click", (e) => {
		nextPage(e, $('#timesheetPage'))
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
				if (isField) {
					$('#timesheetTable').append(`
						<tr class="active">
							<th>Date</th>
							<th>Role</th>
							<th>Check In</th>
							<th>Check Out</th>
							<th>Hours</th>
						</tr>

						<tr id="${day[4]}" class="timeslots">
							<td>${$('#end').data("DateTimePicker").date().weekday(deltasonic ? index-1 : index).format('dddd, MMM Do')}</td>
							<td>- -</td>
							<td>- -</td>
							<td>- -</td>
							<td>0</td>
						</tr>

						<tr class="timeslots">
							<td></td>
							<td></td>
							<td></td>
							<td></td>
							<td id="${day[4]}Hours" class="info"><b>0</b></td>
						</tr>
					`);
				} else {
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
				}
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

			if (isField) {
				$('#timesheetTable').append(`
					<tr id="totalrow">
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th>Total Hours</th>
					</tr>
					<tr>
						<td></td>
						<th></th>
						<td></td>
						<td></td>
						<td id="totalHours" class="info"><b>0</b></td>
					</tr>
				`)
			} else {
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

			$("#laborBreakdown").empty();
			$("#laborBreakdown").append(`
				<div id="saturdayBreakdown">
					<h3><small>saturday breakdown</small></h3>
				</div>
				<div id="sundayBreakdown">
					<h3><small>sunday breakdown</small></h3>
				</div>
				<div id="mondayBreakdown">
					<h3><small>monday breakdown</small></h3>
				</div>
				<div id="tuesdayBreakdown">
					<h3><small>tuesday breakdown</small></h3>
				</div>
				<div id="wednesdayBreakdown">
					<h3><small>wednesday breakdown</small></h3>
				</div>
				<div id="thursdayBreakdown">
					<h3><small>thursday breakdown</small></h3>
				</div>
				<div id="fridayBreakdown">
					<h3><small>friday breakdown</small></h3>
				</div>
				<div id="totalBreakdown">
					<h3><small>total breakdown</small></h3>
				</div>
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
			}).done((timeslots) => {
				let hours = 0;
				let totalTime = 0;

				timeslots.forEach((timeslot, index) => {
					let hoursSum     = 0,
					punchintimezone  = timeslot.punchintimezone ? timeslot.punchintimezone : moment.tz.guess(),
					punchouttimezone = timeslot.punchouttimezone ? timeslot.punchouttimezone : moment.tz.guess(),
					weekday          = moment.unix(timeslot.punchintime).tz(punchintimezone).weekday() === 6 ? -1 : moment.unix(timeslot.punchintime).tz(punchintimezone).weekday(),
					$htmlDay         = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(punchintimezone).weekday()][0],
					$htmlhours       = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(punchintimezone).weekday()][1],
					breakSum         = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(punchintimezone).weekday()][3];

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
					} else {
						hoursSum = moment().diff(moment.unix(timeslot.punchintime), 'minutes') / 60;
						totalTime += hoursSum;

						days[weekday + 1][2] += hoursSum;
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

				$.ajax({
					url : `./php/main.php?module=kissklock&action=getTips`,
					data : {
						id: empid,
						startDate : $('#end').data("DateTimePicker").date().weekday(deltasonic ? -1 : 0).hour(0).minute(0).format('YYYY-MM-DD'),
						endDate : $('#end').data("DateTimePicker").date().hour(23).minute(59).format('YYYY-MM-DD')
					}
				}).done((tips) => {
					tips.forEach((tip, index) => {
						let washTips         = tip.washTTips ? tip.washTTips : 0,
								detailTips       = tip.detailTTips ? tip.detailTTips : 0,
								weekday          = moment(tip.timestamp).weekday() === 6 ? -1 : moment(tip.timestamp).weekday(),
								$htmlDay         = days[deltasonic ? weekday + 1 : moment(tip.timestamp).weekday()][0]


						if (washTips) {
							$(`
									<tr class="timeslots">
											<td></td>
											<td>Wash tips $${washTips}</td>
											<td></td>
											<td></td>
											<td></td>
									</tr>
							`).insertBefore($htmlDay);
						}

						if (detailTips) {
							$(`
									<tr class="timeslots">
											<td></td>
											<td>Detail tips $${detailTips}</td>
											<td></td>
											<td></td>
											<td></td>
									</tr>
							`).insertBefore($htmlDay);
						}
					})
				})
				$("td#totalHours.info").html('<b>' + totalTime.toFixed(2) + '</b>');
			});

		}

		function addRow($element, timeslot, sum) {
			if (isField) {
				$(
						`
						<tr class="timeslots">
							<td>${!$element.attr('clocked') || $element.attr('clocked') === 'false' ? moment.unix(timeslot.created).format('dddd, MMM Do') : ''}</td>
							<td>${timeslot.role}</td>
							<td class="${(timeslot.insource == 1 || timeslot.insource == 2) ? 'warning' : ''} ${timeslot.overBreak ? 'red' : ''} ${timeslot.typeid == 1 ? 'vacation' : ''} ${timeslot.typeid == 2 ? 'pto' : ''}">${timeslot.punchintime ? moment.unix(timeslot.punchintime).format('h:mm a') : '00:00 AM'} ${timeslot.insource == 2 ? '*' : ''}</td>
							<td class="${(timeslot.outsource == 1 || timeslot.outsource == 2) ? 'warning' : ''} ${timeslot.typeid == 1 ? 'vacation' : ''} ${timeslot.typeid == 2 ? 'pto' : ''}">${timeslot.punchouttime ? moment.unix(timeslot.punchouttime).format('h:mm a') : '- -'}</td>
							<td class=
								${sum.toFixed(2) > 6 ? 'red' : ''}>${sum.toFixed(2)}
								${timeslot.userid == timeslot.lasteditedby ? '' : '<button class="btn btn-defaults btn-xs" id=' + timeslot.timeid + 'info><i class="glyphicon glyphicon-info-sign"></i></button>'}
							</td>
						</tr>
					`).insertBefore($element);
			} else {
				$(
						`
						<tr class="timeslots">
							<td>${!$element.attr('clocked') || $element.attr('clocked') === 'false' ? moment.unix(timeslot.created).format('dddd, MMM Do') : ''}</td>
							<td class="${(timeslot.insource == 1 || timeslot.insource == 2) ? 'warning' : ''} ${timeslot.overBreak ? 'red' : ''} ${timeslot.typeid == 1 ? 'vacation' : ''} ${timeslot.typeid == 2 ? 'pto' : ''}">${timeslot.punchintime ? moment.unix(timeslot.punchintime).format('h:mm a') : '00:00 AM'} ${timeslot.insource == 2 ? '*' : ''}</td>
							<td class="${(timeslot.outsource == 1 || timeslot.outsource == 2) ? 'warning' : ''} ${timeslot.typeid == 1 ? 'vacation' : ''} ${timeslot.typeid == 2 ? 'pto' : ''}">${timeslot.punchouttime ? moment.unix(timeslot.punchouttime).format('h:mm a') : '- -'}</td>
							<td class=
								${sum.toFixed(2) > 6 ? 'red' : !timeslot.punchouttime ? 'green' : ''}>${sum.toFixed(2)}
								${timeslot.userid == timeslot.lasteditedby ? '' : '<button class="btn btn-defaults btn-xs" id=' + timeslot.timeid + 'info><i class="glyphicon glyphicon-info-sign"></i></button>'}
							</td>
						</tr>
					`).insertBefore($element);
			}
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
			timeslots = timeslots
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
							hoursSum = calculateHours(checkInTime, moment())
							// let timeNow = moment.duration(moment().diff(moment(checkInTime))).asHours()
							populateElement(totalTime.toFixed(2), $totalHours);
							populateElement(`${(totalTime).toFixed(2)}`, $overallHours);
						}

						addRow(checkInTime, checkOutTime, hoursSum, timeslot.role);
					}
				});
				let lastPunchIn = timeslots[timeslots.length - 1],
					lastCheckOut = lastPunchIn.punchouttime ? moment.unix(lastPunchIn.punchouttime) : null;


				if (!lastCheckOut) {
					role = lastPunchIn.roleId
					tippedRole = lastPunchIn.istipped == 1 ? true : false
					$('#primaryJob').html(`${lastPunchIn.role}`)
				}

				toggleButtons();
			} else {
				toggleButtons();
			}

			if (counter % 2 == 0 && isField) {
				$('#roleButtons').show()
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

			// populateElement(totalTime.toFixed(2), $totalHours);
			// populateElement(`${totalTime.toFixed(2)}/${maxHours}`, $overallHours);
			$(`#${checkInIds[checkInIds.length - 1]}timeout`).html(checkOutTime.format('h:mm a'));
			$(`#${checkInIds[checkInIds.length - 1]}hours`).html(hoursSum.toFixed(2));
		} else {
			addRow(checkInTime, null, null);
		}
		toggleButtons();
	};

	let toggleButtons = () => {
		let position;

		if (counter % 2 == 0) {
			$checkInBtn.show();
			$checkOutBtn.hide();
			$lunchBreakBtn.hide();
			position = $('#checkIn').position()
		} else {
			$checkInBtn.hide();
			$checkOutBtn.show();
			if (isField) $lunchBreakBtn.show();
			position = $('#checkOut').position()
		}
		$('#clockdate').show().css({
			'top': '2em',
			'left': position.left + 16 + 'px',
			'transform' : 'none',
		})
	};

	let calculateHours = (start, end) => {
		let hours = end.diff(start, 'minutes') / 60;
		totalTime += hours;
		return hours;
	};

	let addRow = (start, end, total, role='') => {
		$todayHours.append(`
			<tr>
				<td>${role}</td>
				<td>${start.format('h:mm a')}</td>
				<td id="${checkInIds[checkInIds.length - 1] + 'timeout'}">${ end ? end.format('h:mm a') : '- -'}</td>
				<td id="${checkInIds[checkInIds.length - 1] + 'hours'}" class="${total > 6 ? 'red' : ''}">${total ? total.toFixed(2) : '- -'}</td>
				<td></td>
			</tr>
		`);
	}

	let nextPage = (e, page) => {
		$('#app').hide()
		$('#timesheetPage').hide()
		$('#clockdate').hide()
		$('#tipsPage').hide()
		page.show()
		$('nav li').removeClass('active')
		$(e.target).parent().addClass('active')
		e.target.id == 'home' ? $('#kissklock-app').show() : $('#kissklock-app').hide()
	}

	checkIn = () => {
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
				alerts   : alerts,
				role     : role,
				deltasonic
			}
		}).success((checkin) => {
			checkInIds.push(checkin.checkInId);
			checkInTime = moment(checkin.checkInTime)
			makeUpdate();
			ga('send', 'event', 'CheckIn', empid, 'Successful')
			$('.iziToast').hide()
			iziToast.success({
				message: 'You have been successfully checked in'
			});
		}).fail((result) => {
			$('.iziToast').hide()
			iziToast.error({
				message: 'Kiss Klock could not be saved at this time'
			});
			ga('send', 'event', 'CheckIn', empid, 'Unsuccessful')
		}).always((result) => {
			$('#checkIn').attr('disabled', false)
			$('#checkIn').text('Punch In')
			$('.dropdown-toggle').prop('disabled', false);
		});
	}

	checkOut = (doneForDay = false) => {
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
				alerts   : alerts,
				deltasonic
			}
		}).success((checkoutTime) => {
			checkOutTime = moment(checkoutTime)
			$('.iziToast').hide()
			if (deltasonic == 1) {
				iziToast.info({
					title: 'Punched Out',
					message: `You have successfully been punched out.`
				});
			}
			if (deltasonic == 1) {
				iziToast.info({
					timeout: 60000 * 60,
					title: 'Punched Out',
					message: `<b>30 Minutes</b> from now would be - <b>${moment.unix(checkOutTime.unix()).add(30,'minutes').format('h:mm a')}</b>`
				});
			}
			makeUpdate(true);
			ga('send', 'event', 'CheckOut', empid, 'Successful')
			if ((isField && tippedRole) || (isField && doneForDay))
				openTips($('#tips')[0], $('#tipsPage'))
		}).fail((result) => {
			$('.iziToast').hide()
			iziToast.error({
				message: 'Kiss Klock could not be saved at this time'
			});
			ga('send', 'event', 'CheckOut', empid, 'Unsuccessful')
		}).always((result) => {
			$('#checkOut').attr('disabled', false)
			$('#checkOut').text('Punch Out')
		});
	}

	openTips = (e) => {
		nextPage(e, $('#tipsPage'))
		$('#kissklock-app').hide()

		lookupHours()

		setQuestionNumber(1);

		$("#employeeid").val(empid);

		glbsection = 1;
		$("#slide1").slideDown("slow");
		$("#slide2").slideDown("slow");

		$("#employeeNameDisplay").text(employeename);
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


//////// TIPS
var glbsection = 0;
var glbSignaturePad = '';
$(document).ready(function(){

	$("#btnSigDisplay").on("click", function(){
		$("#todaystips").hide("", function(){ establishCanvas(); });
		$("#signatureContainer").show();
	});

	$("#btnSigHide").on("click", function(){
		$("#signatureContainer").hide();
		$("#todaystips").show();
	});

	//var canvas = document.getElementById('signature-pad');
	//var canvas = document.querySelector("canvas");
	//var canvas = $("canvas");
	var canvas = document.querySelector("canvas");

	glbSignaturePad = new SignaturePad(canvas, {
	  backgroundColor: 'rgb(255, 255, 255)' // necessary for saving image as JPEG; can be removed is only saving as PNG or SVG
	});

	//establishCanvas();

	$(".btnLessthanfourhours").on("click", function(){
		var value = $(this).attr("ds_value");
		setQ1(value);
	});

	$(".btnLessthanfourhoursunderstand").on("click", function(){
		$("#lessthanfourhoursunderstand").val(1);
		setQuestionNumber(3);
	});
});

function setQuestionNumber(sectionNumber){
	var counter = 1;
	while(document.getElementById("tipsection" + counter)){
		if(counter == sectionNumber){
			$("#tipsection" + counter).slideDown("slow", function(){ if(sectionNumber == 3){ establishCanvas(); } });
		} else {
			$("#tipsection" + counter).slideUp("slow");
		}

		counter++;
	}
	glbsection = counter;
}

function tipCommand(sectionNum){
	switch(sectionNum){
		case 1:
			if($("#setQuestionNumber").prop("checked")){

			} else {

			}
			break;
		case 2:
			setQuestionNumber(3);
			break;
		case 3:
			break;
		default:
			break;
	}
}

function setQ1(val){
	$("#lessthanfourhours").val(val);

	if(val > 0){
		setQuestionNumber(2);
	} else {
		setQuestionNumber(3);
	}
}

function saveTips(){
	if(!$("#btnCommand").hasClass("disabled")){
		$('.disabled').attr('disabled', false);
		var formData = $("#frmtips").serialize() + "&command=savetip";
		formData += "&date=" + $('#tipDate').data("DateTimePicker").date().format("M/D/Y");

		var tippedHours = $($('[name="tippedHours"]')[0]).val();
		var nonTippedHours = $($('[name="nonTippedHours"]')[0]).val();
		var washTips = $($('[name="washTTips"]')[0]).val() ? $($('[name="washTTips"]')[0]).val() : 0;
		var detailTips = $($('[name="detailTTips"]')[0]).val() ? $($('[name="detailTTips"]')[0]).val() : 0;

		var signatureData = encodeURIComponent(glbSignaturePad.toDataURL('image/png'));
		formData += "&signatureData=" + signatureData;

		if(!glbSignaturePad.isEmpty() || $('[name=tipid]').val()){
			$("#btnCommand").addClass("disabled");
			$.ajax({
				url: "./php/call.php",
				data: formData,
				method: "post"
			}).done(function(data){
				var success = false;

				if(typeof(data[0]) != 'undefined'){
					if(typeof(data[0]['status']) != 'undefined'){
						if(data[0]['status'] == 'success'){
							success = true;
						}
					}
				}

				if(success){
					//$("#msg-status").removeClass("bg-danger");
					//$("#msg-status").addClass("bg-success");
					//$("#msg-status").html("Saved");
					showMsg("bg-success", "Saved");

					setTimeout(function(){
		    			//resetPage();
		    			window.close();

						}, 3000);


				} else {
					showMsg("bg-danger", "An error has occurred while saving the tips' data.");
					//$("#msg-status").removeClass("bg-success");
					//$("#msg-status").addClass("bg-danger");
					//$("#msg-status").html("An error has occurred while saving the tips' data.");
					$("#btnCommand").removeClass("disabled");
				}

				$('.disabled').attr('disabled', true);
			});
		} else {
			//$("#msg-status").removeClass("bg-success");
			//$("#msg-status").addClass("bg-danger");
			//$("#msg-status").html("Please Enter values for all tips and hours, and remember to sign before saving.");
			showMsg("bg-danger", "Please Enter values for all tips and hours, and remember to sign before saving.");
		}
	}
}

function resetPage(){
	glbSignaturePad.clear();

	$("#btnCommand").removeClass("disabled");

	$("#slide1").slideDown("slow");
	$("#slide2").slideUp("slow");

	$("#msg-status").removeClass("bg-success");
	$("#msg-status").removeClass("bg-danger");
	$("#msg-status").html("<br/>");

	$("#empNumberDisplay").text("");
	$("#employeeNameDisplay").text("");

	$($('[name="employeeid"]')[0]).val("");
	$($('[name="lessthanfourhours"]')[0]).val("");
	$($('[name="lessthanfourhoursunderstand"]')[0]).val("");
	$($('[name="tippedHours"]')[0]).val("");
	$($('[name="nonTippedHours"]')[0]).val("");
	$($('[name="detailTTips"]')[0]).val("");
	$($('[name="washTTips"]')[0]).val("");
	closeModal('msgContainer');
}

/*
	TABLET SIGNATURE
	https://github.com/szimek/signature_pad
	https://jsfiddle.net/szimek/jq9cyzuc/
*/

// Adjust canvas coordinate space taking into account pixel ratio,
// to make it look crisp on mobile devices.
// This also causes canvas to be cleared.
function establishCanvas() {
	if(typeof(canvas) == 'undefined'){
		var canvas = document.getElementById('signature-pad');
	}
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    var ratio =  Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
}

function lookupHours(){
	var data = {
		id: empid,
		startDate: $('#tipDate').data("DateTimePicker").date().format('YYYY-MM-DD'),
		endDate: $('#tipDate').data("DateTimePicker").date().format('YYYY-MM-DD')
	};

	$('#washInput').hide()
	$('#detailInput').hide()
	$('#underFourText').hide()
	$('.hasTips').hide()
	$('#shiftsWorked').empty()

	$.get("./php/main.php?module=kissklock&action=getHoursByRole",data).done(function(response){
		let tippedHours = 0,
			nonTippedHours = 0,
			detail = false,
			wash = false;

		response.timeslots.forEach((timeslot) => {
			if (timeslot.istipped) {
				tippedHours += timeslot.totalHours
			} else {
				nonTippedHours += timeslot.totalHours
			}

			if (timeslot.role && timeslot.role.toLowerCase().match(/wash/))
				wash = true

			if (timeslot.role && timeslot.role.toLowerCase().match(/detail/))
				detail = true

			if (timeslot.punchouttime) {
				$('#shiftsWorked').append(`
					<li>${timeslot.role} (${timeslot.istipped ? 'tipped' : 'non tipped'}): ${moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).format('h:mm a')} - ${moment.unix(timeslot.punchouttime).tz(timeslot.punchintimezone).format('h:mm a')} - <b>${timeslot.totalHours ? timeslot.totalHours.toFixed(2) : 'N/A'} Hrs</b></li>
				`)
			}
		})

		if (wash) $('#washInput').show()
		if (detail) $('#detailInput').show()
		if ((tippedHours + nonTippedHours) < 4) $('#underFourText').show()
		if (tippedHours) $('.hasTips').show()

		$($('[name="tippedHours"]')[0]).val(tippedHours.toFixed(2));
		$($('[name="nonTippedHours"]')[0]).val(nonTippedHours.toFixed(2));
		$($('[name="totalDayHours"]')[0]).val((tippedHours + nonTippedHours).toFixed(2));

		$("#tippedHours_display").html(tippedHours.toFixed(2));
		$("#nonTippedHours_display").html(nonTippedHours.toFixed(2));


		if (response.tips[0]) {
			$('[name=washTTips]').val(response.tips[0].washTTips)
			$('[name=detailTTips]').val(response.tips[0].detailTTips)
			$('[name=tipid]').val(response.tips[0].tipid)
		} else {
			$('[name=washTTips]').val(0)
			$('[name=detailTTips]').val(0)
			$('[name=tipid]').val(0)
		}
	});
}

function showMsg(thisclass, msg){

	$("#modal-status").removeClass("bg-success bg-danger");
	$("#modal-status").addClass(thisclass);
	$("#modal-status").html(msg);

	$('#msgContainer').modal('show');
}

function closeModal(modal){
	$('#' + modal).modal('hide');
}
