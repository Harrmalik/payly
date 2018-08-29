'use strict';
let empid,
	empSite,
	userData = $('title').data(),
	isManager = $('body').data('ismanager'),
	buildTable,
	makeTimesheet,
	timezone,
	deltasonic,
	timeslot,
	allUsers;
	$('#punchintime').datetimepicker({
		sideBySide: true
	});
	$('#punchouttime').datetimepicker({
		sideBySide: true
	});
	$('#end').datetimepicker({
		defaultDate: moment().weekday(5),
		format: 'MMMM Do',
		daysOfWeekDisabled: [1,2,3,4,6]
	});

if (window.navigator.userAgent.indexOf("MSIE ") > 0 ) {
	userData.emp ? ga('set', 'userId', $('title').data('emp')) : ga('set', 'userId', empid)
}


// Edit Timesheets tab

let getTimesheet = (userid) => {
	empid = $('#employeeID').val() ? $('#employeeID').val().split('.')[0] : userid ? userid : empid;
	if (userid)	{
		$('#userTimesheet').show()
		$('#employees').hide()
	}

	$.ajax({
		url: `./php/main.php?module=kissklock&action=validateUser&id=${empid}`
	}).done((user) => {
		if (user.empname) {
			// TODO: show application
			$('#username').html(user.empname);
			empSite = user.site
			timezone = user.timezone,
			deltasonic = user.deltasonic
			buildTable();
			makeTimesheet();
		} else {
			iziToast.warning({
				title: 'Couldn\'t find user',
				message: `${empid} is not a valid employee id, Please try again!.`,


			});
		}
	});
	return false;
}

$('#addTimeslot').on('click', () => {
	$('#modal-title').html('Add Timeslot');
	$('#typefield').show();
	$('#punchintime').data("DateTimePicker").date(moment().hour(9).minute(0).second(0));
	$('#punchingout').hide();
	$('.adding').show();
	$('#modal-button').html('<button type="button" class="btn btn-primary" onclick="addTimeslot()" data-dismiss="modal">Add Timeslot</button>');
	$('.modal').modal('show');
});

let fullday = () => {
	$('#selectHours').val(8);
}

let halfday = () => {
	$('#selectHours').val(4);
}

let addTimeslot = () => {
	let minutes = $('#selectHours').val().split('.')[1] > 0 ? (60 / (100/$('#selectHours').val().split('.')[1])) : 0

	$.ajax({
		url: `./php/main.php`,
		method: 'post',
		data: {
			userid: empid,
			punchintime: moment($('#punchintime').data("DateTimePicker").date()).utc().unix(),
			punchouttime: moment($('#punchintime').data("DateTimePicker").date()).add($('#selectHours').val().split('.')[0], 'hours').minutes(Math.round(minutes)).utc().unix(),
			timezone,
			empSite,
			type: $('#type').val(),
			action: 'addTimeslot',
			module: 'admin'
		}
	}).done((data) => {
		ga('send', 'event', 'addTimeslot', empid, 'type', $('#type').val())
		iziToast.success({
			title: 'Success',
			message: `Timeslot successfully created.`,


		});
		getTimesheet();
	});
}

let makeEdit = (row) => {
	timeslot = $(row).data();
	$('#modal-title').html('Edit Timeslot');
	$('#typefield').hide();
	$('#modal-button').html('<button type="button" class="btn btn-primary" onclick="saveChange()" data-dismiss="modal">Save changes</button>');
	$('#punchintime').data("DateTimePicker").date(moment.unix(timeslot.in).tz(timeslot.timezone));
	$('#punchouttime').data("DateTimePicker").date(moment.unix(timeslot.out).tz(timeslot.timezone));
	$('#punchingout').show();
	$('.adding').hide();
	$('.modal').modal('show');
};

let saveChange = () => {
	let punchintime = $('#punchintime').data("DateTimePicker").date(),
		punchouttime = $('#punchouttime').data("DateTimePicker").date()

	if (punchintime.hours() != moment.unix(timeslot.in).tz(timeslot.timezone).hours() &&
	 	timeslot.timezone == 'America/Chicago') {
		punchintime.add(1, 'hours')
	}
	if (punchouttime.hours() != moment.unix(timeslot.out).tz(timeslot.timezone).hours() &&
		timeslot.timezone == 'America/Chicago') {
		punchouttime.add(1, 'hours')
	}

	$.ajax({
		url: `./php/main.php`,
		method: 'post',
		data: {
			timeid: timeslot.id,
			oldin: timeslot.in,
			punchintime: punchintime.unix(),
			oldout: timeslot.out,
			punchouttime: punchouttime.unix(),
			timenow: moment().unix(),
			action: 'editTimeslot',
			module: 'admin'
		}
	}).done((data) => {
		ga('send', 'event', 'editTimeslot', empid)
		iziToast.success({
			title: 'Success',
			message: `${data.result}`,


		});
		getTimesheet();
	});
}

let addLunchslot = (row) => {
	let timeslot = $(row).data(),
		breakHour = timezone == 'America/New_York' ? 12 : 13;

	$.ajax({
		url: `./php/main.php`,
		method: 'post',
		data: {
			userid: empid,
			punchintime: moment.unix(timeslot.out).hour(13).minutes(0).unix(),
			punchouttime: moment.unix(timeslot.out).subtract(timezone == 'America/New_York' ? 0 : 1, 'hours').unix(),
			timezone,
			empSite,
			type: 0,
			action: 'addTimeslot',
			module: 'admin'
		}
	}).done((data) => {
		$.ajax({
			url: `./php/main.php`,
			method: 'post',
			data: {
				timeid: timeslot.id,
				oldin: timeslot.in,
				punchintime: timeslot.in,
				oldout: timeslot.out,
				punchouttime: moment.unix(timeslot.out).hour(breakHour).minutes(30).unix(),
				timenow: moment().unix(),
				action: 'editTimeslot',
				module: 'admin'
			}
		}).done((data) => {
			ga('send', 'event', 'addLunchslot', empid)
			iziToast.success({
				title: 'Success',
				message: `Lunch punch slot successfully created.`,
			});
			getTimesheet();
		});
	});
}

let deleteTimeslot = (row) => {
	let timeid = $(row).data('id');
	$.ajax({
		url: `./php/main.php`,
		method: 'post',
		data: {
			timeid: timeid,
			action: 'deleteTimeslot',
			module: 'admin'
		}
	}).done((data) => {
		ga('send', 'event', 'deleteTimeslot', empid)
		iziToast.success({
			title: 'Success',
			message: `Timeslot has been deleted`,


		});
		getTimesheet();
	});
}

// Edit Users Tab
$('#removeUser').on('click', () => {
	let data = {
		module: 'admin',
		action: 'removeUser',
		employeeID: $('#employeeid').val().split('.')[0]
	}

	$.ajax({
		url: `./php/main.php`,
		method: 'post',
		data
	}).done((data) => {
		iziToast.success({
			title: 'Sucess',
			message: `User removed`,


		});
	});
})

$('#saveUser').on('click', () => {
	let data = {
		module: 'admin',
		action: 'saveUser',
		employeeID: $('#employeeid').val().split('.')[0],
		employeeName: $('#uName').val(),
		deltasonic: $('#uDeltasonic').val(),
		companyCode: $('#uCode').val(),
		job: $('#uJob').val(),
		supervisor: $('#uSupervisor').val().split('.')[0],
		timezone: $('#uTimezone').val(),
		holidays: $('#uHoliday').val(),
		weekends: $('#weekends').is(':checked') == true ? 1 : 0,
		nights: $('#nights').is(':checked') == true ? 1 : 0,
		alerts: $('#alerts').is(':checked') == true ? 1 : 0,
	}
	if (!$('#employeeid').val().split('.')[1]) {
		data['action'] = 'addUser';

		$.ajax({
			url: `./php/main.php`,
			method: 'post',
			data
		}).done((data) => {
			iziToast.success({
				title: 'Success',
				message: `User Added`,
			});
		});
	} else {
		data['action'] = 'saveUser';

		$.ajax({
			url: `./php/main.php`,
			method: 'post',
			data
		}).done((data) => {
			iziToast.success({
				title: 'Success',
				message: `User saved`,


			});
		});
	}
})

// Edit Supervisors Tab
$('#removeSupervisor').on('click', () => {
	let data = {
		module: 'admin',
		action: 'removeSupervisor',
		employeeID: $('#supervisorid').val().split('.')[0]
	}

	$.ajax({
		url: `./php/main.php`,
		method: 'post',
		data
	}).done((data) => {
		iziToast.success({
			title: 'Couldn\'t find user',
			message: `Supervisor Removed`,


		});
	});
})

$('#saveSupervisor').on('click', () => {
	let data = {
		module: 'admin',
		action: 'addSupervisor',
		employeeID: $('#supervisorid').val().split('.')[0],
		name: $('#sName').val(),
		email: $('#sEmail').val(),
	}

	if (!$('#supervisorid').val().split('.')[1]) {
		data['action'] = 'addSupervisor';

		$.ajax({
			url: `./php/main.php`,
			method: 'post',
			data
		}).done((data) => {
			iziToast.success({
				title: 'Success',
				message: `Supervisor added.`,
			});
		});
	} else {
		data['action'] = 'saveSupervisor';

		$.ajax({
			url: `./php/main.php`,
			method: 'post',
			data
		}).done((data) => {
			iziToast.success({
				title: 'Success',
				message: `Supervisor saved`,
			});
		});
	}
})

function back() {
	$('#userTimesheet').hide()
	$('#employees').show()
}

$(document).ready(function(){
	// Javascript letiables
    let startDate;
    let endDate;
    let timeslots,
	days,
	totalTime = 0,
    breaks = 0,
    saturdayHours = 0, saturdayBreaks = 0,
    sundayHours = 0, sundayBreaks = 0,
    mondayHours = 0, mondayBreaks = 0,
    tuesdayHours = 0, tuesdayBreaks = 0,
    wednesdayHours = 0, wednesdayBreaks = 0,
    thursdayHours = 0, thursdayBreaks = 0,
    fridayHours = 0, fridayBreaks = 0;

    // HTML Elements
    let $timesheet = $('#timesheetTable');
    let $totalHours = $('#totalHours');

	// Autocomplete Searchboxes
	$.ajax({
		url: `./php/main.php?module=admin&action=getEmployees`
	}).done((users) => {
		let options = {
			data: users,
			getValue: (user) => {
				return user.employeeid + '. '  + user.employeename
			},
			theme: "blue-light",
			list: {
				match: {
					enabled: true
				},
				onChooseEvent: () => {
					let employee = $("#employeeID").getSelectedItemData()
					getTimesheet(employee.employeeid)
				}
			}
		}

		allUsers = users

		$("#employeeID").easyAutocomplete(options)
		$('.easy-autocomplete-container').css('z-index', 3)
	})

	$.ajax({
		url: `./php/main.php?module=admin&action=getEmployees`
	}).done((users) => {
		let options = {
			data: users,
			getValue: (user) => {
				return user.employeeid + '. '  + user.employeename
			},
			theme: "blue-light",
			list: {
				match: {
					enabled: true
				},
				onChooseEvent: () => {
					let employee = $("#employeeid").getSelectedItemData()
					$('#uEmployeeid').val(employee.employeeid)
					$('#uName').val(employee.employeename)
					$('#uDeltasonic').val(employee.deltasonic)
					$('#uCode').val(employee.companycode)
					$('#uJob').val(employee.job)
					$('#uSupervisor').val(`${employee.supervisor}. ${employee.name}`)
					$('#uTimezone').val(employee.timezone),
					$('#uHoliday').val(employee.holidays)
					$('#weekends').prop('checked', employee.weekends == 1 ? true : false)
					$('#nights').prop('checked', employee.nights == 1 ? true : false)
					$('#alerts').prop('checked', employee.alerts == 1 ? true : false)
				}
			}
		}

		$("#employeeid").easyAutocomplete(options)
	})

	$.ajax({
		url: `./php/main.php?module=admin&action=getSupervisors`
	}).done((supervisors) => {
		let options = {
			data: supervisors,
			getValue: (supervisor) => {
				return supervisor.employeeid + '. '  + supervisor.name
			},
			theme: "blue-light",
			list: {
				match: {
					enabled: true
				},
				onChooseEvent: () => {
					let supervisor = $("#supervisorid").getSelectedItemData()
					$('#sName').val(supervisor.name)
					$('#sEmail').val(supervisor.email)

					// Get a faster route removing user hours
					$.ajax({
						url: `./php/main.php?module=admin&action=getMyEmployees&empid=${supervisor.employeeid}`
					}).done((employees) => {
						console.log(employees);
						$("#supervisorEmployees").val(employees.map(employee => {
							return employee.id
						}))

						$("#supervisorEmployees").trigger("chosen:updated");
					})


				}
			}
		}

		allUsers.forEach((user) => {
			$('#supervisorEmployees').append(`
				<option id="${user.employeeid}" value=${user.employeeid}>${user.employeename}</option>
			`)
		});
		$("#supervisorid").easyAutocomplete(options)
		$("#uSupervisor").easyAutocomplete(options)
		$('.easy-autocomplete-container').css('z-index', 3)
		setTimeout(function(){
			$("#supervisorEmployees").chosen().change((data, change) => {
				if ($('#supervisorid').val().split('.')[0]) {
					if (change.selected) {
						// Change supervisor to me
						data = {
							module: 'admin',
							action: 'addEmployeeToSupervisor',
							employeeID: change.selected,
							supervisor: $('#supervisorid').val().split('.')[0]
						}
					} else {
						// Remove me as supervisor
						data = {
							module: 'admin',
							action: 'addEmployeeToSupervisor',
							employeeID: change.deselected,
							supervisor: null
						}
					}

					$.ajax({
						url: `./php/main.php`,
						method: 'post',
						data
					}).done((data) => {
						iziToast.success({
							title: 'Success',
							message: `User supervisor changed.`,
						});
					});
				}
			})
		}, 3000);

	})

    // Functions
    buildTable = () => {
		$timesheet.empty();
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
		if (!isManager){
			$('#back').hide()
		} else {
			$('#addTimeslot').hide()
		}


		endDate = $('#end').data("DateTimePicker").date().weekday(deltasonic ? 5 : 6).hour(23).minute(59);
		startDate = $('#end').data("DateTimePicker").date().weekday(deltasonic ? -1 : 0).hour(0).minute(0);
		$('#startDate').html(startDate.format('M/D/YYYY'));
		$('#endDate').html(endDate.format('M/D/YYYY'));

        days.forEach((day,index) => {
			if (isManager) {
				$timesheet.append(`
					<tr class="active headers">
						<th style="width: 25%;">Date</th>
						<th style="width: 25%;">Check In</th>
						<th style="width: 25%;">Check Out</th>
						<th style="width: 25%;">Hours</th>
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
			} else {
				$timesheet.append(`
					<tr class="active headers">
						<th style="width: 20%;">Date</th>
						<th style="width: 20%;">Check In</th>
						<th style="width: 20%;">Check Out</th>
						<th style="width: 10%;">Hours</th>
						<th style="width: 30%;">Actions</th>
					</tr>

					<tr id="${day[4]}" class="timeslots">
						<td>${$('#end').data("DateTimePicker").date().weekday(deltasonic ? index-1 : index).format('dddd, MMM Do')}</td>
						<td>- -</td>
						<td>- -</td>
						<td>0</td>
						<td></td>
					</tr>

					<tr class="timeslots">
						<td></td>
						<td></td>
						<td></td>
						<td id="${day[4]}Hours" class="info"><b>0</b></td>
						<td></td>
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
		if (isManager) {
			$timesheet.append(`
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
		} else {
			$timesheet.append(`
				<tr id="totalrow">
					<th></th>
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
					<th></th>
				</tr>
			`)
		}
		$('#userTimesheet').show();
    }

    makeTimesheet = () => {
		$('#loader').addClass('loader')
        $.ajax({
            url: `./php/main.php?module=kissklock&action=getInitialState`,
            data: {
                id: empid,
                startDate: startDate.hour(0).minute(0).format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD')
            }
        }).done((currentTimeslots) => {
			timeslots = currentTimeslots
			$('#loader2').hide()
            let hours = 0;

            timeslots.forEach((timeslot, index) => {
                let hoursSum = 0,
                    weekday = moment.unix(timeslot.created).weekday() === 6 ? -1 : moment.unix(timeslot.created).weekday(),
                    $htmlDay = days[deltasonic ? weekday + 1 : weekday][0],
                    $htmlhours = days[deltasonic ? weekday + 1 : weekday][1],
                    breakSum = days[deltasonic ? weekday + 1 : weekday][3];

                if (timeslot.punchouttime) {
                    hoursSum = moment.unix(timeslot.punchouttime).diff(moment.unix(timeslot.punchintime), 'minutes') / 60;
                    totalTime += hoursSum;
                    days[weekday + 1][2] += hoursSum;
                    if (timeslots[index -1]) {
                        let previousWeekday = moment.unix(timeslots[index -1].created).weekday() === 6 ? -1 : moment.unix(timeslots[index -1].created).weekday();
                        if (weekday === previousWeekday) {
                            if (timeslots[index-1].punchouttime) {
                                days[weekday + 1][3] += moment.unix(timeslot.punchintime).diff(moment.unix(timeslots[index-1].punchouttime), 'minutes');
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
                $totalHours.html(`<b>${totalTime.toFixed(2)}</b>`);
            });
        });
    }

    function addRow($element, timeslot, sum) {
        $(
            `
                <tr class="timeslots">
                    <td>${!$element.attr('clocked') || $element.attr('clocked') === 'false' ? moment.unix(timeslot.created).format('dddd, MMM Do') : ''}</td>
                    <td class="${timeslot.insource == 2 ? 'warning' : ''} ${timeslot.overBreak ? 'red' : ''} ${timeslot.typeid == 1 ? 'vacation' : ''} ${timeslot.typeid == 2 ? 'pto' : ''}">
						${timeslot.punchintime ? moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).format('h:mm a') : '00:00 AM'} ${timeslot.insource == 2 ? '*' : ''}
					</td>
                    <td class="${timeslot.outsource == 2 ? 'warning' : ''}  ${timeslot.typeid == 1 ? 'vacation' : ''} ${timeslot.typeid == 2 ? 'pto' : ''}">
						${timeslot.punchouttime ? moment.unix(timeslot.punchouttime).tz(timeslot.punchouttimezone).format('h:mm a') : '- -'}
					</td>
                    <td class=${sum.toFixed(2) > 6 ? 'red' : ''}>
						${sum.toFixed(2)}
						${timeslot.userid == timeslot.lasteditedby && timeslot.typeid == 0 ? '' : '<button class="btn btn-defaults btn-xs" id=' + timeslot.timeid + 'info><i class="glyphicon glyphicon-info-sign"></i></button>'}
					</td>
					${
						isManager ? '' :
							`<td>
								<button class="btn btn-danger btn-small" onclick='deleteTimeslot(this)' data-id=${timeslot.timeid}><i class="glyphicon glyphicon-remove"></i></button>
								<button type="button" class="btn btn-default btn-small" onclick='makeEdit(this)'
									data-id=${timeslot.timeid}
									data-in=${timeslot.punchintime}
									data-out=${timeslot.punchouttime}
									data-timezone=${timeslot.punchintimezone}><i class="glyphicon glyphicon-pencil"></i></button>
								<button type="button" class="btn btn-default btn-small" onclick='addLunchslot(this)'
									data-id=${timeslot.timeid}
									data-in=${timeslot.punchintime}
									data-out=${timeslot.punchouttime}><i class="glyphicon glyphicon-apple"></i></button>
							</td>`
					}
                </tr>
            `
        ).insertBefore($element);
		setPopover(timeslot.timeid);
		$('.datetime').datetimepicker();
    }

	function setPopover(id) {
		$.ajax({
			url: `./php/main.php?module=kissklock&action=getChanges&id=${id}`
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
						template: `<div id=${id} class="popover" role="tooltip">
							<div class="arrow"></div>
							<h3 class="popover-title"></h3>
							<div class="popover-content"></div>
						</div>`,
						html: true,
						container: `#${id}info`,
						title: 'Change Log',
						content: html
				});
				$(`#${id}info`).on('click', () => {
					ga('send', 'event', 'Timeclock', 'showChangeLog')
					$(`#${id}`).popover('show');
				});

				$(`.popover`).on('show.bs.popover', function () {
					setTimeout(function () {
						$(`#${id}`).popover('hide');
					}, 2000);
				})
		});
	}

	$('#end').on('dp.change', () => {
		if (empid) {
			buildTable()
			getTimesheet();
		}
	});

	let getInitialState = () => {
		$('#loader').addClass('loader')
		$.ajax({
			url: `./php/main.php?module=admin&action=getMyEmployees`
		}).done((employees) => {
			$('#loader').hide()
			if (employees.length > 0) {
				employees.forEach((employee) => {
					$('#list').append(`
						<tr>
							<td>${employee.name}</td>
							<td>${employee.thisWeekHours}</td>
							<td>${employee.lastWeekHours}</td>
							<td><a class="btn btn-default" onclick="getTimesheet(${employee.id})">View Timesheet</a></td>
						</tr>
					`)
				});
			} else {
				$('#employees').html('You are in charge of no employees');
			}
		})
	};

	if (isManager)
		getInitialState();
});
