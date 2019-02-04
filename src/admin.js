'use strict';
let empid,
	empSite,
	userData = $('title').data(),
	myEmpid = $('body').data('myempid'),
	isManager = $('body').data('ismanager'),
	isPayroll = $('body').data('ispayroll'),
	isLocation = $('body').data('islocation'),
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
		format: 'MMMM Do YYYY',
		daysOfWeekDisabled: [1,2,3,4,6]
	});
	$('#dateFilter').datetimepicker({
		defaultDate: moment().weekday(5),
		format: 'MMMM Do YYYY',
		daysOfWeekDisabled: [1,2,3,4,6]
	});
	$('#startDate').datetimepicker({
		defaultDate: moment().weekday(-1),
		format: 'MMMM Do YYYY',
	});
	$('#endDate').datetimepicker({
		defaultDate: moment().weekday(5),
		format: 'MMMM Do YYYY',
	});

	var glbDataTable = '';
	var calSelectStartDate = "";
	var calSelectEndDate = "";

if (window.navigator.userAgent.indexOf("MSIE ") > 0 ) {
	userData.emp ? ga('set', 'userId', $('title').data('emp')) : ga('set', 'userId', empid)
}

$('.adminsBtn').hide()
$('.tipsBtn').hide()
$('.payrollBtn').hide()
$('.hrBtn').hide()

if (isPayroll || isLocation) {
	$('.adminsBtn').show()
}

if (isLocation) {
	$('.tipsBtn').show()
}

if (isPayroll) {
	$('.payrollBtn').show()
}


$.ajax({
	url: `./php/main.php?module=getManager`
}).done((user) => {
	myEmpid = user[0].employeeid
});
console.log(isManager, isLocation,isPayroll);

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
	$('#timesheetModal').modal('show');
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
	$('#punchouttime').data("DateTimePicker").date(timeslot.out ? moment.unix(timeslot.out).tz(timeslot.timezone) : null);
	$('#punchingout').show();
	$('.adding').hide();
	$('#timesheetModal').modal('show');
};

let saveChange = () => {
	let punchintime = $('#punchintime').data("DateTimePicker").date(),
		punchouttime = $('#punchouttime').data("DateTimePicker").date()

	if (punchintime.hours() != moment.unix(timeslot.in).tz(timeslot.timezone).hours() &&
	 	timeslot.timezone == 'America/Chicago') {
		punchintime.add(1, 'hours')
	}

	if (punchouttime && punchouttime.hours() != moment.unix(timeslot.out).tz(timeslot.timezone).hours() &&
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
			punchouttime: punchouttime ? punchouttime.unix() : null,
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
		canCallIn: $('#canCallIn').is(':checked') == true ? 1 : 0,
		field: $('#field').is(':checked') == true ? 1 : 0,
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
		url: `./php/main.php?module=admin&action=${isLocation ? 'getEmployeesByLocation' : 'getEmployees'}`
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

		allUsers.forEach((user) => {
			$('#supervisorEmployees').append(`
				<option id="${user.employeeid}" value=${user.employeeid}>${user.employeename}</option>
			`)
		});
		$("#employeeID").easyAutocomplete(options)
		$('.easy-autocomplete-container').css('z-index', 3)
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

			$("#supervisorid").easyAutocomplete(options)
			$("#uSupervisor").easyAutocomplete(options)
			$('.easy-autocomplete-container').css('z-index', 3)

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
		})
	})

	$.ajax({
		url: `./php/main.php?module=admin&action=${isLocation ? 'getEmployeesByLocation' : 'getEmployees'}`
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
					populateCodeDropdown({target: {value: employee.deltasonic}})
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
					$('#canCallIn').prop('checked', employee.canCallIn == 1 ? true : false)
					$('#field').prop('checked', employee.field == 1 ? true : false)
				}
			}
		}

		$("#employeeid").easyAutocomplete(options)
	})



	$('#uDeltasonic').on('change', (e) => {
		populateCodeDropdown(e)
	})
	let populateCodeDropdown = (e) => {
		if (e.target.value == 1) {
			$('#uCode').html(`
				<option value="DSCW">DSCW</option>
			`)
		} else {
			$('#uCode').html(`
				<option value="BDLLC">BDLLC</option>
				<option value="BROCH">BROCH</option>
			`)
		}
	}

	$('#runReport').on('click', () => {
		$.ajax({
			url: `./php/main.php?module=admin&action=runReport&report=${$('#reportsDropdown').val()}&startDate=${$('#startDate').data("DateTimePicker").date().unix()}&endDate=${$('#endDate').data("DateTimePicker").date().unix()}`
		}).done((user) => {
			console.log(user);
		});
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
		if (((isManager && isLocation) || isPayroll) && empid != myEmpid){
			//$('#back').hide()
			$('#addTimeslot').show()
		} else {
			$('#addTimeslot').hide()
		}


		endDate = $('#end').data("DateTimePicker").date().weekday(deltasonic ? 5 : 6).hour(23).minute(59);
		startDate = $('#end').data("DateTimePicker").date().weekday(deltasonic ? -1 : 0).hour(0).minute(0);
		$('#startDate').html(startDate.format('M/D/YYYY'));
		$('#endDate').html(endDate.format('M/D/YYYY'));

        days.forEach((day,index) => {
			if (((isManager && isLocation) || isPayroll) && empid != myEmpid) {
				$timesheet.append(`
					<tr class="active headers">
						<th style="width: 15%;">Date</th>
						<th style="width: 15%;">Role</th>
						<th style="width: 20%;">Check In</th>
						<th style="width: 20%;">Check Out</th>
						<th style="width: 10%;">Hours</th>
						<th style="width: 20%;">Actions</th>
					</tr>

					<tr id="${day[4]}" class="timeslots">
						<td>${$('#end').data("DateTimePicker").date().weekday(deltasonic ? index-1 : index).format('dddd, MMM Do')}</td>
						<td>- -</td>
						<td>- -</td>
						<td>- -</td>
						<td>0</td>
						<td></td>
					</tr>

					<tr class="timeslots">
						<td></td>
						<td></td>
						<td></td>
						<td></td>
						<td id="${day[4]}Hours" class="info"><b>0</b></td>
						<td></td>
					</tr>
				`);
			} else {
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

		if (((isManager && isLocation) || isPayroll) && empid != myEmpid) {
			$timesheet.append(`
				<tr id="totalrow">
					<th></th>
					<th></th>
					<th></th>
					<th></th>
					<th>Total Hours</th>
					<th></th>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td id="totalHours" class="info"><b>0</b></td>
					<th></th>
				</tr>
			`)
		} else {
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
		}
		$('#userTimesheet').show();
    }

    makeTimesheet = () => {
		$('#loader').addClass('loader')
		totalTime = 0;
        $.ajax({
            url: `./php/main.php?module=admin&action=getEmployeeHours`,
            data: {
                empid,
                startDate: startDate.hour(0).minute(0).format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD')
            }
        }).done((currentTimeslots) => {
			timeslots = currentTimeslots.timeslots
			$('#loader2').hide()
            let hours = 0,
				roles = currentTimeslots.roles

            timeslots.forEach((timeslot, index) => {
                let hoursSum = 0,
                    weekday = moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday() === 6 ? -1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday(),
                    $htmlDay = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][0],
                    $htmlhours = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][1],
                    breakSum = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][3];

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
                    addRow($htmlDay, timeslot, hoursSum, roles);
                    $htmlDay.attr('clocked', true);
                } else {
                    addRow($htmlDay, timeslot, hoursSum, roles)
                }

                $htmlhours.html(`<b>${days[weekday + 1][2].toFixed(2)}</b>`);
                $("td#totalHours.info").html(`<b>${totalTime.toFixed(2)}</b>`);
            });
			$('.roles').on('change', e => {
				$.ajax({
					url: './php/main.php',
					method: 'post',
					data: {
						module: 'admin',
						action: 'changeTimeslotRole',
						empid,
						timeid: $(e.target).data('timeid'),
						role: e.target.value
					}
				}).success(() => {
					iziToast.success({
						title: 'Success',
						message: `Timeslot saved`,
					});
				}).fail(() => {
					iziToast.error({
						title: 'Error',
						message: `Error saving timeslot`,
					});
				})
			})
        });
    }

    function addRow($element, timeslot, sum, roles) {
        $(
            `
                <tr class="timeslots">
                    <td>${!$element.attr('clocked') || $element.attr('clocked') === 'false' ? moment.unix(timeslot.created).format('dddd, MMM Do') : ''}</td>
					${
						((isManager && isLocation) || isPayroll) && empid != myEmpid ?
							`<td>
								<select class="form-control roles" data-timeid="${timeslot.timeid}">
									${roles.map(r => {
										return `<option value=${r.job_code} ${timeslot.roleId == r.job_code ? 'selected' : ''}>${r.job_desc}</option>`
									})}
								  </select>
							</td>` : ''
					}
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
						((isManager && isLocation) || isPayroll) && empid != myEmpid ?
							`<td>
								<button class="btn btn-danger btn-small" onclick='deleteTimeslot(this)' data-id=${timeslot.timeid}
								data-toggle="tooltip" data-placement="top" title="Delete timeslot"
								><i class="glyphicon glyphicon-remove"></i></button>
								<button type="button" class="btn btn-default btn-small" onclick='makeEdit(this)'
									data-toggle="tooltip" data-placement="top" title="Edit timeslot"
									data-id=${timeslot.timeid}
									data-in=${timeslot.punchintime}
									data-out=${timeslot.punchouttime}
									data-timezone=${timeslot.punchintimezone}><i class="glyphicon glyphicon-pencil"></i></button>
								<button type="button" class="btn btn-default btn-small" onclick='addLunchslot(this)'
									data-toggle="tooltip" data-placement="top" title="Create Lunchpunch"
									data-id=${timeslot.timeid}
									data-in=${timeslot.punchintime}
									data-out=${timeslot.punchouttime}><i class="glyphicon glyphicon-apple"></i></button>
							</td>` : ''
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

	$('#dateFilter').on('dp.change', () => {
		getDateRange($('#dateFilter').data("DateTimePicker").date().weekday(5).hour(23).minute(59).format("M/D/Y"), true);
		displayDateRange();
		getTips();
	});

	let getInitialState = () => {
		if (isLocation) {
			$('#employees').toggle()
			$('#employeesLoader').toggle()
			$.ajax({
				url: `./php/main.php?module=admin&action=getLocationEmployees`
			}).done((employees) => {
				if (employees && employees.length > 0) {
					let active = 0,
						nonActive = 0,
						booth = 0,
						power= 0,
						wash = 0,
						managers = 0,
						other = 0;

					employees.forEach(e => {
						if (e.todayHours) {
							let r = e.role.toLowerCase()
							e.hoursWorked = (e.hoursWorked/60).toFixed(2)
							e.todayHours = (e.todayHours/60).toFixed(2)
							e.breakTime = (e.breakTime/60).toFixed(2)

							if (!e.workingNow) {
								active++
								$('#workedTable').append(`
									<tr>
										<td>${active}</td>
										<td>${e.todayHours}</td>
										<td>${e.name}</td>
										<td>${e.breakTime}</td>
										<td><a class="btn btn-default" onclick="getTimesheet(${e.id})">View Timesheet</a></td>
									</tr>
								`)
							} else {
								if (r.match(/power|program/g)) {
									power++
									$('#powerTable').append(`
										<tr>
											<td>${moment.unix(e.startTime).format('h:mm a')}</td>
											<td>${e.name}</td>
											<td>${e.todayHours}</td>
											<td>${e.hoursWorked}</td>
											<td>${e.breakTime}</td>
											<td>${e.isMinor ? '<i class="fas fa-child"></i>' : ''}</td>
											<td>${e.role}</td>
											<td><a class="btn btn-default" onclick="getTimesheet(${e.id})">View Timesheet</a></td>
										</tr>
									`)
								} else if (r.match(/bd|advisor/g)) {
									booth++
									$('#boothTable').append(`
										<tr>
											<td>${moment.unix(e.startTime).format('h:mm a')}</td>
											<td>${e.name}</td>
											<td>${e.todayHours}</td>
											<td>${e.hoursWorked}</td>
											<td>${e.breakTime}</td>
											<td>${e.isMinor ? '<i class="fas fa-child"></i>' : ''}</td>
											<td>${e.role}</td>
											<td><a class="btn btn-default" onclick="getTimesheet(${e.id})">View Timesheet</a></td>
										</tr>
									`)
								} else if (r.match(/wash t/g)) {
									wash++
									$('#washTable').append(`
										<tr>
											<td>${moment.unix(e.startTime).format('h:mm a')}</td>
											<td>${e.name}</td>
											<td>${e.todayHours}</td>
											<td>${e.hoursWorked}</td>
											<td>${e.breakTime}</td>
											<td>${e.isMinor ? '<i class="fas fa-child"></i>' : ''}</td>
											<td>${e.role}</td>
											<td><a class="btn btn-default" onclick="getTimesheet(${e.id})">View Timesheet</a></td>
										</tr>
									`)
								} else if (r.match(/manager|supervisor/g)) {
									managers++
									$('#managementTable').append(`
										<tr>
											<td>${moment.unix(e.startTime).format('h:mm a')}</td>
											<td>${e.todayHours}</td>
											<td>${e.name}</td>
											<td>${e.hasBreak ? '<i class="fas fa-check"></i>' : ''}</td>
											<td><a class="btn btn-default" onclick="getTimesheet(${e.id})">View Timesheet</a></td>
										</tr>
									`)
								} else {
									other++
									$('#otherTable').append(`
										<tr>
											<td>${e.todayHours}</td>
											<td>${e.name}</td>
											<td>${e.role}</td>
											<td><a class="btn btn-default" onclick="getTimesheet(${e.id})">View Timesheet</a></td>
										</tr>
									`)
								}
							}
						} else {
							e.todayHours = (e.todayHours/60).toFixed(2)
							e.breakTime = (e.breakTime/60).toFixed(2)
							nonActive++
							$('#totalTable').append(`
								<tr>
									<td>${nonActive}</td>
									<td>${e.totalHours}</td>
									<td>${e.name}</td>
									<td>${e.breakTime}</td>
									<td><a class="btn btn-default" onclick="getTimesheet(${e.id})">View Timesheet</a></td>
								</tr>
							`)
						}
					})
					$('#boothCount').text(booth)
					$('#powerCount').text(power)
					$('#washCount').text(wash)
					$('#managersCount').text(managers)
					$('#otherCount').text(other)
					$('#workingCount').text(booth + power + wash + managers + other)
					$('#activeCount').text(active)
					$('#nonActiveCount').text(nonActive)
				} else {
					$('#employees').html('No Employees found for you')
				}

				$('#employees').toggle()
				$('#employeesLoader').toggle()
			})
		} else {
			let dashboard;
			dashboard = $('#dashboardTable').DataTable( {
				"ajax": `./php/main.php?module=admin&action=${isLocation ? 'getLocationEmployees' : 'getMyEmployees'}`,
				"destroy": true,
				"searching": true,
				fixedColumns: false,
				pageLength: 100,
				"columns": [
				  { "data": "name", "render": (data, type, row) => { return row.isMinor ? data + ' <i class="fas fa-child"></i>' : data } },
				  { "data": "role", render: (data, type, row) => {return data ? data + ' <span class="badge badge-primary">' + row.hoursWorked.toFixed(2) + '</span>' : '' } },
				  { "data": "hasBreak", render: (data) => { return data ? '<i class="fas fa-check"></i>' : '' } },
				  { "data": "todayHours", render: (data) => { return data.toFixed(2) }},
				  { "data": "thisWeekHours", render: (data) => { return data.toFixed(2) }},
				  { "data": "lastWeekHours", render: (data) => { return data.toFixed(2) }},
				  { "data": "thisWeekHours", render: (data, row) =>  {return (40 - data).toFixed(2)} },
				  { "data": "id", render: (data) => {return `<a class="btn btn-default" onclick="getTimesheet(${data})">View Timesheet</a>`} }
			  ],
				"order": [[ 1, "desc" ]]
			} );
		}
	};

	if (isManager)
		getInitialState();

	var now =  new Date();
	var nowStr = ( (parseInt(now.getMonth())+1) + "/" + now.getDate() + "/" + now.getFullYear() );

	getDateRange(nowStr, false);
	displayDateRange();
	getTips();
});

function getTips(){
	glbDataTable = $('#tipContainer').DataTable( {
		"createdRow":function(row,data,dataIndex) {
			if (data[3] > 0 && data[8] == 0 && data[1] != moment().format("MM/DD/Y")) {
				$(row).addClass("suspect");
			}
		},
		dom: 'Blfrtip',
		buttons: [
			{
				extend: "csv",
				exportOptions: {
                    columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
                }
			},
			{
				extend: "excel",
				exportOptions: {
                    columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
                }
			}
        ],
        "ajax": "./php/getTips.php?startDate=" + (calSelectStartDate.getTime()/1000) + "&endDate=" + (calSelectEndDate.getTime()/1000),
		"destroy": true,
		"searching": true,
		"columnDefs": [
			{ "targets": 0, "width": "200px" }, // name
			{ "targets": 1, "width": "135px", "type": "date"}, // date
			{ "targets": 5, "width": "100px"},
			{ "targets": [3, 4, 6, 7, 8], "width": "125px" ,"type":"num", render: $.fn.dataTable.render.number(',','.',2)} // tips
		],
		fixedColumns: false,
		"order": [[ 1, "desc" ]]
		,"lengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]]
    } );

	var data = glbDataTable.buttons.exportData( {
	    columns: ':visible'
	} );
}

function reviewTip(obj, num){
	$.ajax({
		url: "./php/reviewTip.php",
		data: {id: num}
	}).done(function(data) {
		var success = false;

		if(typeof(data[0]) != 'undefined'){
			if(typeof(data[0]['status']) != 'undefined'){
				if(typeof(data[0]['status']) != 'success'){
					success = true;
				}
			}
		}

		if(success){
			$(obj).parent().html(data[0]['reviewName']);
		} else {

		}
	});
}

function displayDateRange(){
	$("#dateRangeDisplay").html("Showing for date range: " + (calSelectStartDate.getMonth()+1) + "/" + calSelectStartDate.getDate() + "/" + calSelectStartDate.getFullYear() +"  -  " + (calSelectEndDate.getMonth()+1) + "/" + calSelectEndDate.getDate() + "/" + calSelectEndDate.getFullYear());
}

var remove_obj = '';
var remove_num = '';
var remove_empnum = '';
var remove_date = '';
function removeTip(obj, num, empnum, date){
	remove_obj = obj;
	remove_num = num;
	remove_empnum = empnum;
	remove_date = date;

	$("#removeTipModal").modal("show");
}

function confirmRemoveTip(){
	$.ajax({
		url: "./php/removeTip.php",
		data: {
			"num": remove_num,
			"empnum": remove_empnum,
			"date": remove_date
		}
	}).done(function(data){
		remove_obj = '';
		remove_num = '';
		remove_empnum = '';
		remove_date = '';

		glbDataTable.ajax.reload();
		$("#removeTipModal").modal("hide");
	});
}

//dateStr = mm/dd/yyyy
function getDateRange(dateStr, boolStyle){
	/*
	DOW (payroll week = 6 - 5):
	0 - sun
	6 - sat

	*/
	var dateArray = dateStr.split("/");

	var year = dateArray[2];
	var month = dateArray[0];
	var day = dateArray[1];

	var epoch = Date.parse(year + '/' + month + '/' + day);
	var date = new Date(epoch);

	var oneDay = 24*60*60 * 1000;
	var dow = date.getDay();

	var daysTillStart = 0;
	var daysTillEnd = 0;

	switch(dow){
		case 0://Sunday
			daysTillStart = -1;
			daysTillEnd = 5;
			break;
		case 1://Monday
			daysTillStart = -2;
			daysTillEnd = 4;
			break;
		case 2://Tuesday
			daysTillStart = -3;
			daysTillEnd = 3;
			break;
		case 3://Wednesday
			daysTillStart = -4;
			daysTillEnd = 2;
			break;
		case 4://Thursday
			daysTillStart = -5;
			daysTillEnd = 1;
			break;
		case 5://Friday
			daysTillStart = -6;
			daysTillEnd = 0;
			break;
		case 6://Saturday
			daysTillStart = 0;
			daysTillEnd = 6;
			break;
		default:
			break;

	}

	calSelectStartDate = new Date(epoch + (oneDay * daysTillStart));
	calSelectEndDate = new Date(epoch + (oneDay * daysTillEnd));

	if(boolStyle){
		$(".adminCalWeekHighlight").removeClass("adminCalWeekHighlight");

		var tmpEpoch = calSelectStartDate.getTime();
		var tmpDate = '';
		while(tmpDate < calSelectEndDate.getTime()){
			tmpDate = new Date(tmpEpoch);

			var calObj = $(".xdsoft_date[data-date="+tmpDate.getDate()+"][data-month="+tmpDate.getMonth()+"][data-year="+tmpDate.getFullYear()+"]")[0];
			$(calObj).addClass("adminCalWeekHighlight");
			tmpEpoch += oneDay;
		}
	}
}
