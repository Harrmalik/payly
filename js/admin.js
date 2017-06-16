'use strict';
let empid,
	userData = $('title').data(),
	buildTable,
	makeTimesheet,
	timeslot;
	$('#punchintime').datetimepicker({
		sideBySide: true
	});
	$('#punchouttime').datetimepicker({
		sideBySide: true
	});
	$('#end').datetimepicker({
		defaultDate: moment().weekday(5),
		format: 'MMMM Do',
		daysOfWeekDisabled: [0,1,2,3,4,6]
	});

userData.emp ? ga('set', 'userId', $('title').data('emp')) : ga('set', 'userId', empid)

let getTimesheet = (e) => {
	if (e)
		e.preventDefault();
	empid = $('#employeeID').val();

	$.ajax({
		url: `./php/main.php?action=validateUser&empid=${empid}`
	}).done((result) => {
		if (result.user) {
			// TODO: show application
			$('#username').html(result.user.empname);
			buildTable();
			makeTimesheet();
		} else {
			$('#alert').html(`
				<div class="alert alert-warning alert-dismissible" role="alert">
				  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				  ${empid} is not a valid employee id, Please try again!.
				</div>
			`)
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
			punchintime: moment($('#punchintime').data("DateTimePicker").date()).unix(),
			punchouttime: moment($('#punchintime').data("DateTimePicker").date()).add($('#selectHours').val().split('.')[0], 'hours').minutes(Math.round(minutes)).unix(),
			type: $('#type').val(),
			action: 'addTimeslot'
		}
	}).done((data) => {
		ga('send', 'event', 'addTimeslot', empid, 'type', $('#type').val())
		sendAlert('success', data.result)
		getTimesheet();
	});
}

let makeEdit = (row) => {
	timeslot = $(row).data();
	$('#modal-title').html('Edit Timeslot');
	$('#typefield').hide();
	$('#modal-button').html('<button type="button" class="btn btn-primary" onclick="saveChange()" data-dismiss="modal">Save changes</button>');
	$('#punchintime').data("DateTimePicker").date(moment.unix(timeslot.in));
	$('#punchouttime').data("DateTimePicker").date(moment.unix(timeslot.out));
	$('#punchingout').show();
	$('.adding').hide();
	$('.modal').modal('show');
};

let saveChange = () => {
	$.ajax({
		url: `./php/main.php`,
		method: 'post',
		data: {
			timeid: timeslot.id,
			oldin: timeslot.in,
			punchintime: $('#punchintime').data("DateTimePicker").date().unix(),
			oldout: timeslot.out,
			punchouttime: $('#punchouttime').data("DateTimePicker").date().unix(),
			timenow: moment().unix(),
			action: 'editTimeslot'
		}
	}).done((data) => {
		ga('send', 'event', 'editTimeslot', empid)
		sendAlert('info', data.result)
		getTimesheet();
	});
}

let addLunchslot = (row) => {
	let timeslot = $(row).data();
	$.ajax({
		url: `./php/main.php`,
		method: 'post',
		data: {
			userid: empid,
			punchintime: moment.unix(timeslot.out).hour(13).minutes(0).unix(),
			punchouttime: timeslot.out,
			type: 0,
			action: 'addTimeslot'
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
				punchouttime: moment.unix(timeslot.out).hour(12).minutes(30).unix(),
				timenow: moment().unix(),
				action: 'editTimeslot'
			}
		}).done((data) => {
			ga('send', 'event', 'addLunchslot', empid)
			sendAlert('success', data.result)
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
			action: 'deleteTimeslot'
		}
	}).done((data) => {
		ga('send', 'event', 'deleteTimeslot', empid)
		sendAlert('info', data.result)
		getTimesheet();
	});
}

let sendAlert = (type, message) => {
	$('#alert').html(`
		<div class="alert alert-${type} alert-dismissible" role="alert">
		  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
		  ${message}
		</div>
	`)
}

$(document).ready(function(){
	// Javascript letiables
    let startDate;
    let endDate;
    let timeslots,
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
    let $timesheet = $('#timesheet');
    let $totalHours = $('#totalHours');
    let days = [
        [$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks],
        [$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks],
        [$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks],
        [$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks],
        [$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks],
        [$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks],
        [$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks],
    ];

    // Functions
    buildTable = () => {
		startDate = $('#end').data("DateTimePicker").date().weekday(-1).hour(0).minute(0);
        endDate = $('#end').data("DateTimePicker").date().hour(23).minute(59);
        $('#startDate').html(startDate.format('M/D/YYYY'));
        $('#endDate').html(endDate.format('M/D/YYYY'));

        days.forEach((day,index) => {
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
					<tr class="active headers">
						<th style="width: 20%;">Date</th>
						<th style="width: 20%;">Check In</th>
						<th style="width: 20%;">Check Out</th>
						<th style="width: 10%;">Hours</th>
						<th style="width: 30%;">Actions</th>
					</tr>
				`).insertBefore(day[0]);
			}

            day[0].first().html(`
                <td>${$('#end').data("DateTimePicker").date().weekday(index-1).format('dddd, MMM Do')}</td>
                <td>- -</td>
                <td>- -</td>
                <td>0</td>
				<td>_</td>
            `);
        });
		$('#userTimesheet').show();
    }

    makeTimesheet = () => {
        $.ajax({
            url: `./php/main.php?action=getInitialState`,
            method: 'post',
            data: {
                empid: empid,
                startDate: $('#end').data("DateTimePicker").date().weekday(-1).hour(0).minute(0).format('YYYY-MM-DD HH:mm:ss'),
                endDate: $('#end').data("DateTimePicker").date().hour(23).minute(59).format('YYYY-MM-DD HH:mm:ss')
            }
        }).done((data) => {
            timeslots = data.clockedHours;
            let hours = 0;

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
                    <td>${!$element.attr('clocked') || $element.attr('clocked') === 'false' ? moment(timeslot.created).format('dddd, MMM Do') : ''}</td>
                    <td class="${timeslot.insource === 'phone' ? 'warning' : ''} ${timeslot.overBreak ? 'red' : ''} ${timeslot.typeid == 1 ? 'vacation' : ''} ${timeslot.typeid == 2 ? 'pto' : ''}">
						${timeslot.punchintime ? moment.unix(timeslot.punchintime).format('h:mm a') : '00:00 AM'}
					</td>
                    <td class="${timeslot.outsource === 'phone' ? 'warning' : ''}  ${timeslot.typeid == 1 ? 'vacation' : ''} ${timeslot.typeid == 2 ? 'pto' : ''}">
						${timeslot.punchouttime ? moment.unix(timeslot.punchouttime).format('h:mm a') : '- -'}
					</td>
                    <td class=${sum.toFixed(2) > 6 ? 'red' : ''}>
						${sum.toFixed(2)}
						${timeslot.userid == timeslot.lasteditedby && timeslot.typeid == 0 ? '' : '<button class="btn btn-defaults btn-xs" id=' + timeslot.timeid + 'info><i class="glyphicon glyphicon-info-sign"></i></button>'}
					</td>
					<td>
						<button class="btn btn-danger btn-small" onclick='deleteTimeslot(this)' data-id=${timeslot.timeid}><i class="glyphicon glyphicon-remove"></i></button>
						<button type="button" class="btn btn-default btn-small" onclick='makeEdit(this)'
							data-id=${timeslot.timeid}
							data-in=${timeslot.punchintime}
							data-out=${timeslot.punchouttime}><i class="glyphicon glyphicon-pencil"></i></button>
						<button type="button" class="btn btn-default btn-small" onclick='addLunchslot(this)'
							data-id=${timeslot.timeid}
							data-in=${timeslot.punchintime}
							data-out=${timeslot.punchouttime}><i class="glyphicon glyphicon-apple"></i></button>
					</td>
                </tr>
            `
        ).insertBefore($element);
		setPopover(timeslot.timeid);
		$('.datetime').datetimepicker();
    }

	function setPopover(id) {
		$.ajax({
			url: `./php/main.php?action=getChanges`,
			method: 'post',
			data: {
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
			getTimesheet();
		}
	});

	let getInitialState = () => {
		$.ajax({
			url: `./php/main.php?action=getManager`
		}).done((result) => {
			$.ajax({
				url: `./php/main.php?action=getEmployees&empid=${result[0].employeeid}`
			}).done((result) => {
				let employees = result.employees
				if (employees.length > 0) {
					employees.forEach((employee) => {
						$('#list').append(`
							<tr>
								<td>${employee.name}</td>
								<td>${employee.hours}</td>
								<td><a class="btn btn-default" href="./timesheet.php?empid=${employee.id}" target="_blank">View Timesheet</a></td>
							</tr>
						`)
					});
				} else {
					$('#employees').html('You are in charge of no employees');
				}
			})
	    });
	};

	getInitialState();
});
