'use strict';
let empid,
	empSite,
	userData = $('title').data(),
	myEmpid = $('body').data('myempid'),
	isManager = $('body').data('ismanager'),
	isBasicManager = $('body').data('isbasicmanager'),
	isPayroll = $('body').data('ispayroll'),
	isHr = $('body').data('ishr'),
	isTrainer = $('body').data('istrainer'),
	isDm = $('body').data('isdm'),
	isLocation = $('body').data('islocation'),
	buildTable,
	makeTimesheet,
	timezone,
	deltasonic,
	timeslot,
	allUsers,
	employees,
	admins = [82934,4010,22068],
	locations = [{
		id: 900,
		name: 'Office',
	}, {
		id: 807,
		name: 'Main Street'
	}],
	currentLocation = $('body').data('location');
	$('#punchintime').datetimepicker({
		sideBySide: true
	});
	$('#punchouttime').datetimepicker({
		sideBySide: true
	});
	$('#dDate').datetimepicker({
		defaultDate: moment().day() == 6 ? moment().weekday(12) : moment().weekday(5),
		format: 'MMMM Do YYYY',
		daysOfWeekDisabled: [1,2,3,4,6]
	});
	$('#end').datetimepicker({
		defaultDate: moment().day() == 6 ? moment().weekday(12) : moment().weekday(5),
		format: 'MMMM Do YYYY',
		daysOfWeekDisabled: [1,2,3,4,6]
	});
	$('#dateFilter').datetimepicker({
		defaultDate: moment().day() == 6 ? moment().weekday(12) : moment().weekday(5),
		format: 'MMMM Do YYYY',
		daysOfWeekDisabled: [1,2,3,4,6]
	});
	$('#startTime').datetimepicker({
		defaultDate: moment().hour(8).startOf('hour'),
		format: 'MMMM Do h:mm a',
	});
	$('#startDate').datetimepicker({
		defaultDate: moment().day() == 6 ? moment().day() : moment().weekday(-1),
		format: 'MMMM Do YYYY h:mm a',
	});
	$('#endDate').datetimepicker({
		defaultDate: moment().day() == 6 ? moment().weekday(12) : moment().weekday(5),
		format: 'MMMM Do YYYY h:mm a',
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
$('.trainerBtn').hide()
$('.multiSite').hide()

if (isPayroll || isTrainer || isDm || isHr) $('.multiSite').show()
if (isPayroll || isLocation) $('.adminsBtn').show()
if (isLocation) $('.tipsBtn').show()
if (isPayroll) $('.payrollBtn').show()
if (isTrainer) $('.trainerBtn').show()
if (isHr) $('.hrBtn').show()

console.log({
	isManager,
	isBasicManager,
	isPayroll,
	isTrainer,
	isDm,
	isHr,
	isLocation
});

// Edit Timesheets tab
let getTimesheet = (userid, endDate = null) => {
	empid = userid ? userid : $('#employeeID').val() ? $('#employeeID').val().split('.')[0] : empid;
	if (userid)	{
		$('#userTimesheet').show()
		$('#laborBreakdown').show()
		$('#employees').hide()
		$('#loader').addClass('loader')
		$('#username').html('Getting Employee');
	}

	if (endDate) {
		$('#end').data("DateTimePicker").date(endDate)
	}

	$.ajax({
		url: `./php/main.php?module=kissklock&action=validateUser&id=${empid}`
	}).done((user) => {
		if (user.empname) {
			// TODO: show application
			$('#username').html(user.empname);
			empSite = user.site
			timezone = user.timezone ? user.timezone : moment.tz.guess(),
			deltasonic = user.deltasonic
			buildTable();
			makeTimesheet();
			if ($( "#reports" ).is(":visible")) {
				$( "#reportData" ).hide()
			}
		} else {
			iziToast.warning({
				title: 'Couldn\'t find user',
				message: `${empid} is not a valid employee id, Please try again!.`,
			});
		}
	});
	return false;
}

let getInOuts = () => {
	$.ajax({
		url: `./php/main.php`,
		method: 'get',
		data: {
			currentLocation,
			action: 'getInOuts',
			module: 'admin'
		}
	}).done((data) => {
		$('#inusers').empty()
		$('#outusers').empty()
		let ins = Object.keys(data.ins)
		let outs = Object.keys(data.outs)

		ins.forEach(inKey => {
			if (inKey != 'null') {
				data.ins[inKey].forEach(emp => {
					let currentHour = `${emp.intime > 12 ? emp.intime - 12 : emp.intime} ${emp.intime > 12 ? 'PM' : 'AM'}`
					$('#inusers').append(`
						<tr>
							<td>${currentHour}</td>
							<td>${emp.employeename}</td>
						</tr>
					`)
				})
			}
		})

		outs.forEach(outKey => {
			if (outKey != 'null') {
				data.outs[outKey].forEach(emp => {
					let currentHour = `${emp.outtime > 12 ? emp.outtime - 12 : emp.outtime} ${emp.outtime > 12 ? 'PM' : 'AM'}`
					$('#outusers').append(`
						<tr>
							<td>${currentHour}</td>
							<td>${emp.employeename}</td>
						</tr>
					`)
				})
			}
		})
	});
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
	let minutes = $('#selectHours').val().split('.')[1] > 0 ? (60 / (100/$('#selectHours').val().split('.')[1])) : 0,
		punchouttime = $('#selectHours').val() != "" ? moment($('#punchintime').data("DateTimePicker").date()).add($('#selectHours').val().split('.')[0], 'hours').minutes(Math.round(minutes)).utc().unix() : null;

	if (isLocation) punchouttime = $('#punchouttime').data("DateTimePicker").date() ? moment($('#punchouttime').data("DateTimePicker").date()).utc().unix() : null

	$.ajax({
		url: `./php/main.php`,
		method: 'post',
		data: {
			userid: empid,
			punchintime: moment($('#punchintime').data("DateTimePicker").date()).utc().unix(),
			punchouttime,
			timezone,
			empSite,
			role: $('#punchRole').val() ? $('#punchRole').val() : null,
			type: isLocation ? 0 : $('#type').val(),
			action: 'addTimeslot',
			module: 'admin'
		}
	}).done((data) => {
		ga('send', 'event', 'addTimeslot', empid, 'type', $('#type').val())
		iziToast.success({
			title: 'Success',
			message: `Timeslot successfully created.`
		});
		getTimesheet(empid);
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
	$('#punchRole').val(timeslot.role);
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
		getTimesheet(empid);
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
			role: timeslot.role,
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
			getTimesheet(empid);
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
		getTimesheet(empid);
	});
}

let saveNotes = (isOut, empid,noteid) => {
	let data = {
		module: 'admin',
		action: 'saveNote',
		noteid,
		empid,
		currentLocation
	}

	if (isOut) {
		data.outtime = $(`#${empid}-notes`).val()
	} else {
		data.intime = $(`#${empid}-notes`).val()
	}

	$.ajax({
		url: `./php/main.php`,
		method: 'post',
		data
	}).done((data) => {
		iziToast.success({
			title: 'Success',
			message: `time saved.`,
		});
	});
}


// Edit Users Tab
$('#addinguser').on('click', () => {
	$('#user-form').append(`
		<div class="form-group" style="display:block;">
			<div class="form-group">
				<label for="uName" class=" control-label">Employee #</label>
				<input name="empid" type="text" class="form-control">
			</div>
			<div class="form-group">
				<label for="uName" class=" control-label">Name</label>
				<input name="name" type="text" class="form-control">
			</div>
			<div class="form-group">
				<label for="inputPassword3" class=" control-label">Location</label>
				<select name="location" class="form-control">
						<option value="">Select a Location</option>
						<option value="900">900. Office</option>
						<option value="807">807. Main Street</option>
				</select>
			</div>
			<div class="form-group">
				<label for="inputPassword3" class=" control-label">Timezone</label>
				<select name="timezone" class="form-control">
						<option value="America/New_York">EST</option>
						<option value="America/Chicago">CDT</option>
				</select>
			</div>
			</br></br>
		</div>
	`)
})

$('#savingMassUsers').on('click', () => {
	let formData = $('#user-form').serialize().split('&'),
			users = [],
			counter = 0;

		formData.forEach(e => {
			let values = e.split('=')
			if (counter % 4 == 0) {
				users.push({[values[0]]: values[1]})
			} else {
				users[users.length-1][values[0]] = values[1].replace(/%2F/ig,'/')
			}
			counter++
		})

		users.forEach(u => {
			let data = {
				module: 'admin',
				action: 'addUser',
				employeeID: u.empid,
				employeeName: u.name.replace('+',' '),
				deltasonic: 1,
				companyCode: 'DSCW',
				job: '',
				supervisor: '',
				timezone: u.timezone,
				holidays: 0,
				weekends: 0,
				nights: 0,
				alerts: 0,
				canCallIn: 0,
				field: 1,
				location: u.location
			}

			$.ajax({
				url: `./php/main.php`,
				method: 'post',
				data
			}).done((data) => {
				$.ajax({
					url: `./php/main.php`,
					method: 'post',
					data: {
						userid: u.empid,
						punchintime: moment($('#startTime').data("DateTimePicker").date()).utc().unix(),
						punchouttime: null,
						timezone: u.timezone,
						empSite: u.location,
						role: 9991,
						type: 1,
						action: 'addTimeslot',
						module: 'admin'
					}
				})
				iziToast.success({
					title: 'Success',
					message: `User Added`,
				});
			});
		})
})

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
		location: $('#uLocation').val()
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
	$('#laborBreakdown').hide()
	$('#employees').show()
	$('#timesheetPage').hide()

	if ($( "#reports" ).is(":visible")) {
		$( "#reportData" ).show()
	}
}

function printTimesheet() {
	location.href = "./print.php?empid=" + empid
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
		url: `./php/main.php?module=admin&action=getEmployeesByLocation`
	}).always((users) => {
		let options = {
			url: function(query) {
				return `./php/main.php?module=admin&action=searchEmployees&query=${query.split('.')[0]}&location=${currentLocation}`
			},
			getValue: (user) => {
				return user.employeeid + '. '  + user.employeename
			},
			theme: "blue-light",
			list: {
				maxNumberOfElements: 20,
				match: {
					enabled: true
				},
				onChooseEvent: () => {
					let employee = $("#employeeID").getSelectedItemData()
					getTimesheet(employee.employeeid)
				}
			}
		},
		options2 = {
			url: function(query) {
				return `./php/main.php?module=admin&action=searchEmployees&query=${query.split('.')[0]}&location=${currentLocation}`
			},
			getValue: (user) => {
				return user.employeeid + '. '  + user.employeename
			},
			theme: "blue-light",
			list: {
				maxNumberOfElements: 20,
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
					$('#uLocation').val(employee.location)
				}
			}
		},
		options3 = {
			url: function(query) {
				return `./php/main.php?module=admin&action=searchEmployees&query=${query.split('.')[0]}&location=${currentLocation}`
			},
			getValue: (user) => {
				return user.employeeid + '. '  + user.employeename
			},
			theme: "blue-light",
			list: {
				maxNumberOfElements: 20,
				match: {
					enabled: true
				},
				onChooseEvent: () => {
					let employee = $("#auditUsers").getSelectedItemData()
					$.ajax({
						url: `./php/main.php?module=admin&action=getLastWorkedDay&empid=${employee.employeeid}`
					}).done((result) => {
						$('#auditUser').append(`
							<p>${employee.employeename}: ${moment(result[0].punchintime).weekday(5).format('l')} <a class="btn btn-default" onclick="getTimesheet(${employee.employeeid}, '${moment(result[0].punchintime).format('MMMM Do YYYY')}')">View Timesheet</a></p>
						`)
					})

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
		$("#employeeid").easyAutocomplete(options2)
		$("#auditUsers").easyAutocomplete(options3)
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
		$('#reportData').empty().append('Running report.....');
		$.ajax({
	  	url: `./php/main.php?module=admin&action=runReport&report=${$('#reportsDropdown').val()}&location=${currentLocation}&startDate=${$('#startDate').data("DateTimePicker").date().unix()}&endDate=${$('#endDate').data("DateTimePicker").date().unix()}&profitcenter=${$('#reportsProfitCenter').val()}`
	  }).done((result) => {
			let keys = []
			$('#reportData').empty()
			if (result.length == 0 ){
				$('#reportData').append('No Employees');
			} else {
				switch ($('#reportsDropdown').val()) {
					case "totalHours":
					case "supportHours":
					case "nightHours":
					case "dailyUnderEightHoursReport":
					case "dailyNoLunchBreakReport":
						result.forEach(e => {
							$('#reportData').append(`<p>${e.userid}, ${e.name} : ${e.hours} <a class="" onclick="getTimesheet(${e.userid}, '${$('#startDate').data("DateTimePicker").date().format('MMMM Do YYYY')}')">View Timesheet</a></p></p>`)
						})
						break;
					case "dailyNoSignOutReport":
					case "dailyAutosignOutReport":
						result.forEach(e => {
							$('#reportData').append(`<p>${e.userid}, ${e.name} <a class="" onclick="getTimesheet(${e.userid}, '${$('#startDate').data("DateTimePicker").date().format('MMMM Do YYYY')}')">View Timesheet</a></p></p>`)
						})
						break;
					case "minorReport":
						result.forEach(e => {
							$('#reportData').append(`<p>${e.employeename} - ${moment(e.punchintime).format('h:mm a')} - ${moment(e.punchouttime).format('h:mm a')} :<b>TOTAL HOURS</b> -> ${e.totalhours} <a class="" onclick="getTimesheet(${e.userid}, '${$('#startDate').data("DateTimePicker").date().format('MMMM Do YYYY')}')">View Timesheet</a></p></p>`)
						})
						break;
					case "laborReport":
						keys = Object.keys(result)
						let baseHours = Object.keys(result[$('#reportsProfitCenter').val()])
						$('#reportData').append(`
							<table class="table">
								<thead>
									<tr>
										<th>Hour</th>
										<th>${$('#reportsProfitCenter').find(":selected").text()}</th>
									</tr>
								</thead>

								<tbody id="reportRows">
								</tbody>

								<tfoot>

								</tfoot>
							</table>
						`)

						baseHours.forEach(e => {
							let currentHour = `${e > 12 ? e - 12 : e} ${e > 12 ? 'PM' : 'AM'}`
							$('#reportRows').append(`
								<tr>
									<td>${e == 'total' ? 'Total' : currentHour}</td>
									<td id="${$('#reportsProfitCenter').val()}${currentHour.replace(' ','')}">0.00</td>
								</tr>
							`)
							})
						keys.forEach(e => {
							let hours = Object.keys(result[e])

							hours.forEach(h => {
								let currentHour = `${h > 12 ? h - 12 : h} ${h > 12 ? 'PM' : 'AM'}`
								if (e == 'total') {

								} else {
									$(`#${e}${currentHour.replace(' ','')}`).html(`${result[e][h] ? (result[e][h]/60).toFixed(2) : '0.00'}`)
								}
							})
						})
						break;
					case "laborReportByRole":
						keys = Object.keys(result)
						$('#reportData').append(`
							<table class="table table-condensed">
								<thead>
									<tr>
										<th>Role</th>
										<th>Regular</th>
										<th>Vacation</th>
										<th>Total</th>
									</tr>
								</thead>

								<tbody id="reportRows">

								</tbody>

								<tfoot id="reportFoot">

								</tfoot>
							</table>
						`)
						keys.forEach(e => {
							if (e == 'total') {
								$('#reportFoot').append(`
									<tr>
										<td><b>${e}</b></td>
										<td>${result[e].regular.toFixed(2)}</td>
										<td>${result[e].vacation ? result[e].vacation.toFixed(2) : 0}</td>
										<td>${result[e].total}</td>
									</tr>
								`)
							} else {
								$('#reportRows').append(`
									<tr>
										<td>${e}</td>
										<td>${result[e].regular.toFixed(2)}</td>
										<td>${result[e].vacation ? result[e].vacation.toFixed(2) : 0}</td>
										<td>${result[e].total.toFixed(2)}</td>
									</tr>
								`)
							}
						})
						break;
					case "laborReportByEmployee":
						keys = Object.keys(result)

						keys.forEach(e => {
							let roles = Object.keys(result[e])
							$('#reportData').append(`
								<div id="${result[e].employeeId}">
									<h3>${e}</h3>
								</div>
							`)

							roles.forEach(r => {
								if (r == 'total') {
								} else if (r == 'employeeId') {
								} else {
									$(`#reportData`).append(`<p>${r}: ${result[e][r].toFixed(2)}</p>`)
								}
							})
							$(`#reportData`).append(`<p><b>Total</b>: ${result[e].total.toFixed(2)}</p>`)
						})
						break;
					case "employeesWorking":
						$('#reportData').append(`
							<table class="table table-condensed">
								<thead>
									<tr>
										<th>Name</th>
										<th>Role</th>
										<th>Punch in</th>
										<th>Punch out</th>
									</tr>
								</thead>

								<tbody id="reportRows">

								</tbody>
							</table>
						`)
						result.forEach(e => {
							$('#reportRows').append(`
								<tr>
									<td>${e.employeename}</td>
									<td>${e.rolename}</td>
									<td>${moment(e.punchintime).format('hh:mm a')}</td>
									<td>${e.punchouttime ? moment(e.punchouttime).format('hh:mm a') : 'Currently working'}</td>
								</tr>
							`)
						})
						break;
						default:
				}
			}
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
		if (((isManager && isLocation) || isPayroll) && (admins.find(a => a == myEmpid) == myEmpid || empid != myEmpid)) {
			//$('#back').hide()
			$('#addTimeslot').show()
		} else {
			$('#addTimeslot').hide()
		}


		endDate = $('#end').data("DateTimePicker").date().weekday(deltasonic ? 5 : 6).hour(23).minute(59);
		startDate = $('#end').data("DateTimePicker").date().weekday(deltasonic ? -1 : 0).hour(0).minute(0);
		$('#weekBeginning').html(startDate.format('M/D/YYYY'));
		$('#weekEnding').html(endDate.format('M/D/YYYY'));

    days.forEach((day,index) => {
			if (((isManager && isLocation) || isPayroll) && (admins.find(a => a == myEmpid) == myEmpid || empid != myEmpid)) {
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
						<th style="width: 15%;">Role</th>
						<th style="width: 25%;">Check In</th>
						<th style="width: 25%;">Check Out</th>
						<th style="width: 25%;">Hours</th>
					</tr>

					<tr id="${day[4]}" class="timeslots">
						<td>${$('#end').data("DateTimePicker").date().weekday(deltasonic ? index-1 : index).format('dddd, MMM Do')}</td>
						<td></td>
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
			}
        });

		if (deltasonic) {
			days = [
				[$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday',$('#saturdayBreakdown')],
				[$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday',$('#sundayBreakdown')],
				[$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday',$('#mondayBreakdown')],
				[$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday',$('#tuesdayBreakdown')],
				[$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday',$('#wednesdayBreakdown')],
				[$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday',$('#thursdayBreakdown')],
				[$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday',$('#fridayBreakdown')],
			];
		} else {
			days = [
				[$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday',$('#sundayBreakdown')],
				[$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday',$('#mondayBreakdown')],
				[$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday',$('#tuesdayBreakdown')],
				[$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday',$('#wednesdayBreakdown')],
				[$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday',$('#thursdayBreakdown')],
				[$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday',$('#fridayBreakdown')],
				[$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday',$('#saturdayBreakdown')],
			];
		}

		if (((isManager && isLocation) || isPayroll) && (admins.find(a => a == myEmpid) == myEmpid || empid != myEmpid)) {
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
					<th></th>
					<th>Total Hours</th>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td id="totalHours" class="info"><b>0</b></td>
				</tr>
			`)
		}
			$('#userTimesheet').show();
			$('#laborBreakdown').show();
    }

	let buildDashboard = (dashboard) => {
		$('#workedTable').empty()
		$('#totalTable').empty()

		if (employees && employees.length > 0) {
			let active = [],
				nonActive = [],
				booth = [],
				power= [],
				washExit = [],
				wash = 0,
				detail = [],
				store = [],
				food = [],
				lube = [],
				managers = [],
				other = [];

			employees.forEach(e => {
				if (e.todayHours) {
					let r = e.role.toLowerCase(),
						hoursWorked = (e.hoursWorked/60).toFixed(2),
						todayHours = (e.todayHours/60).toFixed(2),
						totalHours = (e.totalHours/60).toFixed(2),
						breakTime = (e.breakTime/60).toFixed(2)

					e.hoursWorked = (e.hoursWorked/60).toFixed(2)
					e.todayHours = (e.todayHours/60).toFixed(2)
					e.totalHours = (e.totalHours/60).toFixed(2)
					e.breakTime = (e.breakTime/60).toFixed(2)

					if (!e.workingNow) {
						active++
						$('#workedTable').append(`
							<tr class='clickable' onclick="getTimesheet(${e.id})">
								<td>${active}</td>
								<td>${todayHours}</td>
								<td>${e.name}</td>
								<td>${breakTime > 0 ? '<i class="fas fa-check"></i>' : ''}</td>
							</tr>
						`)
					} else {
						if (r.match(/manager|supervisor/g) && e.profitcenter == 1) {
							managers.push(e)
							wash++
						} else if (r.match(/c-store/g) || e.profitcenter == 4) {
							store.push(e)
						} else if (!r.match(/detail u|kiss univ detail/g) && (r.match(/detail|quality|paint/g) || e.profitcenter == 2)) {
							detail.push(e)
						} else if (r.match(/power|program/g)) {
							power.push(e)
							wash++
						} else if (r.match(/bd|advisor/g) && e.profitcenter == 1) {
							booth.push(e)
							wash++
						} else if (r.match(/wash t/g)) {
							washExit.push(e)
							wash++
						} else if (r.match(/coffee|food/g) || e.profitcenter == 5) {
							food.push(e)
						} else if (r.match(/lube/g) || e.profitcenter == 3) {
							lube.push(e)
						} else {
							other.push(e)
						}
					}
				} else {
					let totalHours = (e.totalHours/60).toFixed(2)
					let breakTime = (e.breakTime/60).toFixed(2)
					nonActive.push(e)
					$('#totalTable').append(`
						<tr class='clickable'>
							<td onclick="getTimesheet(${e.id})">${totalHours}</td>
							<td onclick="getTimesheet(${e.id})">${e.name} ${breakTime > 0 ? '<i class="fas fa-check"></i>' : ''}</td>
							<td>
								<select class="form-control" id="${e.id}-notes" onChange="saveNotes(false,${e.id}, ${e.noteid})" value="${e.intime}">
									<option value="0">Select In</option>
									<option value="7" ${e.intime == 7 ? 'selected' : '' }>7 AM</option>
									<option value="8" ${e.intime == 8 ? 'selected' : '' }>8 AM</option>
									<option value="9" ${e.intime == 9 ? 'selected' : '' }>9 AM</option>
									<option value="10" ${e.intime == 10 ? 'selected' : '' }>10 AM</option>
									<option value="11" ${e.intime == 11 ? 'selected' : '' }>11 AM</option>
									<option value="12" ${e.intime == 12 ? 'selected' : '' }>12 AM</option>
									<option value="13" ${e.intime == 13 ? 'selected' : '' }>1 PM</option>
									<option value="14" ${e.intime == 14 ? 'selected' : '' }>2 PM</option>
									<option value="15" ${e.intime == 15 ? 'selected' : '' }>3 PM</option>
									<option value="16" ${e.intime == 16 ? 'selected' : '' }>4 PM</option>
									<option value="17" ${e.intime == 17 ? 'selected' : '' }>5 PM</option>
									<option value="18" ${e.intime == 18 ? 'selected' : '' }>6 PM</option>
									<option value="19" ${e.intime == 19 ? 'selected' : '' }>7 PM</option>
									<option value="20" ${e.intime == 20 ? 'selected' : '' }>8 PM</option>
									<option value="21" ${e.intime == 21 ? 'selected' : '' }>9 PM</option>
								</select>
							</td>
						</tr>
					`)
				}
			})
			let columns = [
					{ data: 'id'},
					{ data: 'startTime', render: data => { return moment.unix(data).format('h:mm a') }, width: '12%'  },
					{ data: 'name', width: '24%' },
					{ data: 'todayHours', width: '10%' },
					{ data: 'hoursWorked', render: data => { return `<span class="${data > 6 ? 'red' : '' }">${data}</span>`}, width: '10%' },
					{ data: 'breakTime', render: data => { return data > 0 ? '<i class="fas fa-check"></i>' : '' }, width: '6%' },
					{ data: 'isMinor', render: data => { return data ? '<i class="fas fa-child"></i>' : '' }, width: '6%' },
					{ data: 'role', width: '18%' },
					{ data: 'totalHours', render: data => { return `<span class="${data > 40 ? 'red' : '' }">${data}</span>`}, width: '10%' },
					{ data: 'id', render: (data, type, e) => { return `
						<select class="form-control" id="${e.id}-notes" onChange="saveNotes(true, ${e.id}, ${e.noteid})" value="${e.outtime}">
							<option value="0">Select Out</option>
							<option value="7" ${e.outtime == 7 ? 'selected' : '' }>7 AM</option>
							<option value="8" ${e.outtime == 8 ? 'selected' : '' }>8 AM</option>
							<option value="9" ${e.outtime == 9 ? 'selected' : '' }>9 AM</option>
							<option value="10" ${e.outtime == 10 ? 'selected' : '' }>10 AM</option>
							<option value="11" ${e.outtime == 11 ? 'selected' : '' }>11 AM</option>
							<option value="12" ${e.outtime == 12 ? 'selected' : '' }>12 AM</option>
							<option value="13" ${e.outtime == 13 ? 'selected' : '' }>1 PM</option>
							<option value="14" ${e.outtime == 14 ? 'selected' : '' }>2 PM</option>
							<option value="15" ${e.outtime == 15 ? 'selected' : '' }>3 PM</option>
							<option value="16" ${e.outtime == 16 ? 'selected' : '' }>4 PM</option>
							<option value="17" ${e.outtime == 17 ? 'selected' : '' }>5 PM</option>
							<option value="18" ${e.outtime == 18 ? 'selected' : '' }>6 PM</option>
							<option value="19" ${e.outtime == 19 ? 'selected' : '' }>7 PM</option>
							<option value="20" ${e.outtime == 20 ? 'selected' : '' }>8 PM</option>
							<option value="21" ${e.outtime == 21 ? 'selected' : '' }>9 PM</option>
						</select>
					`}, width: '8%' },
			],
			columnDefs = [
				{
					targets: [0],
					visible: false
				}
			]

			$('#managementCard table').DataTable( {
					data: managers,
					destroy: true,
					order: [[ 1, "desc" ]],
					columns,
					columnDefs
			} );
			$('#detailCard table').DataTable( {
					data: detail,
					destroy: true,
					order: [[ 1, "desc" ]],
					columns
			} );
			$('#powerCard table').DataTable( {
					data: power,
					destroy: true,
					order: [[ 1, "desc" ]],
					columns,
					columnDefs
			} );
			$('#boothCard table').DataTable( {
					data: booth,
					destroy: true,
					order: [[ 1, "desc" ]],
					columns,
					columnDefs
			} );
			$('#washCard table').DataTable( {
					data: washExit,
					destroy: true,
					order: [[ 1, "desc" ]],
					columns,
					columnDefs
			} );
			$('#foodCard table').DataTable( {
					data: food,
					destroy: true,
					order: [[ 1, "desc" ]],
					columns,
					columnDefs
			} );
			$('#storeCard table').DataTable( {
					data: store,
					destroy: true,
					order: [[ 1, "desc" ]],
					columns,
					columnDefs
			} );
			$('#lubeCard table').DataTable( {
					data: lube,
					destroy: true,
					order: [[ 1, "desc" ]],
					columns,
					columnDefs
			} );
			$('#otherCard table').DataTable( {
					data: other,
					destroy: true,
					order: [[ 1, "desc" ]],
					columns,
					columnDefs
			} );
			$('#washTotalCount').text(wash)
			$('#detailTotalCount').text(detail.length)
			$('#storeTotalCount').text(store.length)
			$('#foodTotalCount').text(food.length)
			$('#lubeTotalCount').text(lube.length)
			$('#boothCount').text(booth.length)
			$('#powerCount').text(power.length)
			$('#washExitCount').text(washExit.length)
			$('#detailCount').text(detail.length)
			$('#storeCount').text(store.length)
			$('#foodCount').text(food.length)
			$('#lubeCount').text(lube.length)
			$('#managersCount').text(managers.length)
			$('#otherCount').text(other.length)
			$('#workingCount').text(wash + detail.length + food.length + store.length + lube.length + other.length)
			$('#activeCount').text(active.length)
			$('#nonActiveCount').text(nonActive.length)


			$('.dataTable tr').on('click', e => {
				if ((($(e.target).closest("input").attr('id') && $(e.target).closest("input").attr('id').split('-')[1] != 'notes') || !$(e.target).closest("input").attr('id')) && !$(e.target).closest("select").attr('id'))
					getTimesheet($(e.target).parents("tr").children().last().children().attr('id').split('-')[0])
			})
		} else {
			$('#employees').html('No Employees found for you')
		}

		if ($( "a[href*='\#dashboard'" ).parent().hasClass('active') && $( "#timesheetPage" ).is(":hidden")) $('#employees').show()
		$('#employeesLoader').hide()
	}

  makeTimesheet = () => {
		totalTime = 0;
		$('#punchRole').empty()
        $.ajax({
            url: `./php/main.php?module=admin&action=getEmployeeHours`,
            data: {
                empid,
                startDate: startDate.hour(0).minute(0).format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD')
            }
        }).done((currentTimeslots) => {
			timeslots = currentTimeslots.timeslots
			$('#loader').removeClass('loader')
			$('#timesheetPage').show()
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
      let hours = 0,
				roles = currentTimeslots.roles,
				roleHours = {
					saturday: {},
					sunday: {},
					monday: {},
					tuesday: {},
					wednesday: {},
					thursday: {},
					friday: {},
					total: {}
				}

			$('#punchRole').append('<option value="">N/A</option>')
			roles.forEach(r => {
				$('#punchRole').append(`<option value=${r.job_code} ${r.primaryjob == 'Y' ? 'selected' : ''}>${r.job_desc}</option>`)
			})
            timeslots.forEach((timeslot, index) => {
								timeslot.punchintimezone = timeslot.punchintimezone ? timeslot.punchintimezone : timezone
								timeslot.punchouttimezone = timeslot.punchouttimezone ? timeslot.punchouttimezone : timezone

                let hoursSum = 0,
                    weekday = moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday() === 6 ? -1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday(),
                    $htmlDay = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][0],
                    $htmlhours = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][1],
                    breakSum = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][3];

								timeslot.punchouttime = timeslot.punchouttime ? timeslot.punchouttime : moment.unix(1553981280).format('l') == moment().format('l') ? moment().tz(timeslot.punchintimezone).unix() : null

								if (timeslot.punchouttime) {
                    hoursSum = moment.unix(timeslot.punchouttime).diff(moment.unix(timeslot.punchintime), 'minutes') / 60;
                    totalTime += hoursSum;
										if (roleHours.total[timeslot.role]) {
											roleHours.total[timeslot.role] += hoursSum
										} else {
											roleHours.total[timeslot.role] = hoursSum
										}

										if (roleHours[days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][4]][timeslot.role]) {
											roleHours[days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][4]][timeslot.role] += hoursSum
										} else {
											roleHours[days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][4]][timeslot.role] = hoursSum
										}
                    days[weekday + 1][2] += hoursSum;
                    if (timeslots[index -1]) {
                        let previousWeekday = moment.unix(timeslots[index -1].created).weekday() === 6 ? -1 : moment.unix(timeslots[index -1].created).weekday();
                        if (weekday === previousWeekday) {
                            if (timeslots[index-1].punchouttime) {
                                days[weekday + 1][3] += moment.unix(timeslot.punchintime).diff(moment.unix(timeslots[index-1].punchouttime), 'minutes');
                                if (days[previousWeekday + 1][3] < 30) {
                                    timeslot.overBreak = days[previousWeekday + 1][3];
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


			Object.keys(roleHours).forEach(d => {
				Object.keys(roleHours[d]).forEach(r => {
					$(`#${d}Breakdown`).append(`<p>${r} ${roleHours[d][r].toFixed(2)}</p>`);
				})
			})

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
						((isManager && isLocation) || isPayroll) && (admins.find(a => a == myEmpid) == myEmpid || empid != myEmpid) ?
							`<td>
								<select class="form-control roles" data-timeid="${timeslot.timeid}">
									<option>N/A</option>
									${roles.map(r => {
										return `<option value=${r.job_code} ${timeslot.roleId == r.job_code ? 'selected' : ''}>${r.job_desc}</option>`
									})}
								  </select>
							</td>` : `
							<td>${timeslot.role}</td>
							`
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
						((isManager && isLocation) || isPayroll) && (admins.find(a => a == myEmpid) == myEmpid || empid != myEmpid) ?
							`<td>
								<button class="btn btn-danger btn-small" onclick='deleteTimeslot(this)' data-id=${timeslot.timeid}
								data-toggle="tooltip" data-placement="top" title="Delete timeslot"
								><i class="glyphicon glyphicon-remove"></i></button>
								<button type="button" class="btn btn-default btn-small" onclick='makeEdit(this)'
									data-toggle="tooltip" data-placement="top" title="Edit timeslot"
									data-id=${timeslot.timeid}
									data-in=${timeslot.punchintime}
									data-out=${timeslot.punchouttime}
									data-role=${timeslot.roleId}
									data-timezone=${timeslot.punchintimezone}><i class="glyphicon glyphicon-pencil"></i></button>
								<button type="button" class="btn btn-default btn-small" onclick='addLunchslot(this)'
									data-toggle="tooltip" data-placement="top" title="Create Lunchpunch"
									data-id=${timeslot.timeid}
									data-role=${timeslot.roleId}
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

	let getInitialState = () => {
		if (isLocation) {
			// $('#employees').hide()
			// $('#employeesLoader').show()
			$.ajax({
				url: `./php/main.php?module=admin&action=getLocationEmployees&location=${currentLocation}&offset=${moment(moment().weekday(5)).diff($('#dDate').data("DateTimePicker").date(), 'weeks')}`
			}).done((data) => {
				employees = data
				buildDashboard()
				$('#lastUpdate').text(moment().format('h:mm a'))
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

	// EVENT LISTENERS
	$('#back').on('click', getInitialState)

	$('#dDate').on('dp.change', () => {
		getInitialState();
	});

	locations.forEach((l) => {
		$('#locations').append(`
			<li><a id="${l.id}">${l.name}</a></li>
		`)
	})

	$('#locations a').on('click', (e) => {
		$('#homeLocation').html(`${e.target.text} <span class="caret"></span>`)
		currentLocation = e.target.id
		$('#employeeid').val('')
		getInitialState()
	})

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

	$('.dashboard-tab').on('click', (e) => {
		buildDashboard(e.currentTarget.id)
	})


	// STARTING APPLICATION
	if (isManager || isBasicManager) {
		setInterval(getInitialState, 60000);
		getInitialState();
	}

	var now =  new Date();
	var nowStr = ( (parseInt(now.getMonth())+1) + "/" + now.getDate() + "/" + now.getFullYear() );

	getDateRange(nowStr, false);
	displayDateRange();
	getTips();
	$("form").submit((e) => {
		e.preventDefault();
	});
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
