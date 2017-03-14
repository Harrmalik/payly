'use strict';
let empid,
	buildTable,
	makeTimesheet,
	timeslot;
	$('#punchintime').datetimepicker();
	$('#punchouttime').datetimepicker();
	$('#end').datetimepicker({
		defaultDate: moment().weekday(-5),
		format: 'MMMM Do',
		daysOfWeekDisabled: [0,1,2,3,4,6]
	});

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
	$('#punchouttime').hide();
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
	$.ajax({
		url: `./php/main.php`,
		method: 'post',
		data: {
			userid: empid,
			punchintime: moment($('#punchintime').data("DateTimePicker").date()).format('YYYY-MM-DD HH:mm:ss'),
			punchouttime: moment($('#punchintime').data("DateTimePicker").date()).add($('#selectHours').val()[0], 'hours').format('YYYY-MM-DD HH:mm:ss'),
			type: $('#type').val(),
			action: 'addTimeslot'
		}
	}).done((data) => {
		//TODO: Update table, send message of success
		getTimesheet();
	});
}

let makeEdit = (row) => {
	timeslot = $(row).data();
	$('#modal-title').html('Edit Timeslot');
	$('#typefield').hide();
	$('#modal-button').html('<button type="button" class="btn btn-primary" onclick="saveChange()" data-dismiss="modal">Save changes</button>');
	$('#punchintime').data("DateTimePicker").date(moment(timeslot.in));
	$('#punchouttime').data("DateTimePicker").date(moment(timeslot.out));
	$('#punchouttime').show();
	$('.adding').hide();
	$('.modal').modal('show');
};

let saveChange = () => {
	// TODO: update table

	// TODO: Make api call
	$.ajax({
		url: `./php/main.php`,
		method: 'post',
		data: {
			timeid: timeslot.id,
			oldin: moment(timeslot.in).format('YYYY-MM-DD HH:mm:ss'),
			punchintime: moment($('#punchintime').data("DateTimePicker").date()).format('YYYY-MM-DD HH:mm:ss'),
			oldout: moment(timeslot.out).format('YYYY-MM-DD HH:mm:ss'),
			punchouttime: moment($('#punchouttime').data("DateTimePicker").date()).format('YYYY-MM-DD HH:mm:ss'),
			timenow: moment().format('YYYY-MM-DD HH:mm:ss'),
			action: 'editTimeslot'
		}
	}).done((data) => {
		getTimesheet();
	});
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
						<th>Date</th>
						<th>Check In</th>
						<th>Check Out</th>
						<th>Hours</th>
						<th>Action</th>
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
                    weekday = moment(timeslot.created).weekday() === 6 ? -1 : moment(timeslot.created).weekday(),
                    $htmlDay = days[weekday + 1][0],
                    $htmlhours = days[weekday + 1][1],
                    breakSum = days[weekday + 1][3];

                if (timeslot.punchouttime) {
                    hoursSum = moment(timeslot.punchouttime).diff(moment(timeslot.punchintime), 'minutes') / 60;
                    totalTime += hoursSum;
                    days[weekday + 1][2] += hoursSum;
                    if (timeslots[index -1]) {
                        let previousWeekday = moment(timeslots[index -1].created).weekday() === 6 ? -1 : moment(timeslots[index -1].created).weekday();
                        if (weekday === previousWeekday) {
                            if (timeslots[index-1].punchouttime) {
                                days[weekday + 1][3] += moment(timeslot.punchintime).diff(moment(timeslots[index-1].punchouttime), 'minutes');
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
                    <td class="${timeslot.insource === 'phone' ? 'warning' : ''} ${timeslot.overBreak ? 'red' : ''} ${timeslot.typeid == 1 ? 'vacation' : ''}">
						${timeslot.punchintime ? moment(timeslot.punchintime).format('h:mm a') : '00:00 AM'}
					</td>
                    <td class="${timeslot.outsource === 'phone' ? 'warning' : ''}  ${timeslot.typeid == 1 ? 'vacation' : ''}">
						${timeslot.punchouttime ? moment(timeslot.punchouttime).format('h:mm a') : '- -'}
					</td>
                    <td class=${sum.toFixed(2) > 6 ? 'red' : ''}>
						${sum.toFixed(2)}
						${timeslot.userid == timeslot.lasteditedby && timeslot.typeid == 0 ? '' : '<button class="btn btn-defaults btn-xs" id=' + timeslot.timeid + 'info><i class="glyphicon glyphicon-info-sign"></i></button>'}
					</td>
					<td><button type="button" class="btn btn-default btn-small" onclick='makeEdit(this)'
						data-id=${timeslot.timeid}
						data-in=${timeslot.punchintime}
						data-out=${timeslot.punchouttime}>Edit Time</button></td>
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
					html += 'No Changes tracked';
				} else {
					changes.forEach((c) => {
						if (c.oldintime !== c.newintime) {
							html += `
								<p>Check in changed from <b>${moment(c.oldintime).format('h:mm a')}</b> to <b>${moment(c.newintime).format('h:mm a')}</b></p>
							`;
						} else if (c.oldouttime !== c.newouttime) {
							html += `
								<p>Check out changed from <b>${moment(c.oldouttime).format('h:mm a')}</b> to <b>${moment(c.newouttime).format('h:mm a')}</b></p>
							`;
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
			url: `./php/main.php?action=getEmployees`
		}).done((result) => {
			let employees = result.employees;
			if (employees.length > 0) {
				employees.forEach((employee) => {
					$('#list').append(`
						<li class="list-group-item">${employee.name} <br><a class="label label-primary" href="./timesheet.php?empid=${employee.id}" target="_blank">View Timesheet</a></li>
					`)
				});
			} else {
				$('#employees').html('You are in charge of no employees');
			}
	    });
	};

	getInitialState();
});
