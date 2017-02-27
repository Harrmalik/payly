'use strict';
let empid,
	buildTable,
	makeTimesheet,
	timeslot;
	$('#punchintime').datetimepicker();
	$('#punchouttime').datetimepicker();

let getTimesheet = (e) => {
	if (e)
		e.preventDefault();
	empid = $('#employeeID').val();

	$.ajax({
		url: `./php/main.php?action=validateUser&empid=${empid}`
	}).done((result) => {
		if (result.user) {
			// TODO: show application
			buildTable();
			makeTimesheet();
		} else {
			let errMessage = result;
			console.log(errMessage);
		}
	});
	return false;
}

$('#addTimeslot').on('click', () => {
	$('#modal-title').html('Add Timeslot');
	$('#typefield').show();
	$('#punchintime').data("DateTimePicker").date('');
	$('#punchouttime').data("DateTimePicker").date('');
	$('#modal-button').html('<button type="button" class="btn btn-primary" onclick="addTimeslot()" data-dismiss="modal">Save changes</button>');
	$('.modal').modal('show');
});

let addTimeslot = () => {
	console.log({
		userid: empid,
		punchintime: moment($('#punchintime').data("DateTimePicker").date()).format('YYYY-MM-DD HH:mm:ss'),
		punchouttime: moment($('#punchouttime').data("DateTimePicker").date()).format('YYYY-MM-DD HH:mm:ss'),
		type: $('#type').val()
	});
	// $.ajax({
	// 	url: `./php/main.php?action=newTimeslot`,
	// 	method: 'post',
	// 	data: {
	// 		userid: empid,
	// 		punchintime: moment($('#punchintime').data("DateTimePicker").date()).format('YYYY-MM-DD HH:mm:ss'),
	// 		punchouttime: moment($('#punchouttime').data("DateTimePicker").date()).format('YYYY-MM-DD HH:mm:ss'),
	// 		type: $('#type').val()
	// 	}
	// }).done((data) => {
	//
	// });
}

let makeEdit = (row) => {
	timeslot = $(row).data();
	$('#modal-title').html('Edit Timeslot');
	$('#typefield').hide();
	$('#modal-button').html('<button type="button" class="btn btn-primary" onclick="saveChange()" data-dismiss="modal">Save changes</button>');
	$('#punchintime').data("DateTimePicker").date(moment(timeslot.in));
	$('#punchouttime').data("DateTimePicker").date(moment(timeslot.out));
	$('.modal').modal('show');
};

let saveChange = () => {
	// TODO: update table

	// TODO: Make api call
	$.ajax({
		url: `./php/main.php?action=updateTimeslot`,
		method: 'post',
		data: {
			timeid: timeslot.id,
			punchintime: moment($('#punchintime').data("DateTimePicker").date()).format('YYYY-MM-DD HH:mm:ss'),
			punchouttime: moment($('#punchouttime').data("DateTimePicker").date()).format('YYYY-MM-DD HH:mm:ss')
		}
	}).done((data) => {

	});
}

$(document).ready(function(){
	// Javascript letiables
    let startDate;
    let endDate;
        startDate = moment().weekday(-8).hour(0).minute(0);
        endDate = moment().weekday(-2).hour(23).minute(59);
    let totalTime = 0,
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

        $('#startDate').html(startDate.format('M/D/YYYY'));
        $('#endDate').html(endDate.format('M/D/YYYY'));

        days.forEach((day,index) => {
            $(`
                <tr class="active">
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
					<th>Action</th>
                </tr>
            `).insertBefore(day[0]);

            day[0].first().html(`
                <td>${moment().weekday(index-1).format('dddd, MMM Do')}</td>
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
                startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
                endDate: endDate.format('YYYY-MM-DD HH:mm:ss')
            }
        }).done((data) => {
            let timeslots = data.clockedHours;
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

                if (!$htmlDay.attr('clocked')) {
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
                <tr>
                    <td>${!$element.attr('clocked') ? moment(timeslot.created).format('dddd, MMM Do') : ''}</td>
                    <td class="${timeslot.insource === 'phone' ? 'warning' : ''} ${timeslot.overBreak ? 'red' : ''}">${timeslot.punchintime ? moment(timeslot.punchintime).format('h:mm a') : '00:00 AM'}</td>
                    <td class="${timeslot.outsource === 'phone' ? 'warning' : ''}">${timeslot.punchouttime ? moment(timeslot.punchouttime).format('h:mm a') : '- -'}</td>
                    <td class=${sum.toFixed(2) > 6 ? 'red' : ''}>${sum.toFixed(2)}</td>
					<td><button type="button" class="btn btn-default btn-small" onclick='makeEdit(this)'
						data-id=${timeslot.timeid}
						data-in=${timeslot.punchintime}
						data-out=${timeslot.punchouttime}>Edit Time</button></td>
                </tr>
            `
        ).insertBefore($element);
		$('.datetime').datetimepicker();
    }

	let getInitialState = () => {
		$.ajax({
			url: `./php/main.php?action=getEmployees`
		}).done((result) => {
			let employees = result.employees;
			if (employees.length > 0) {
				employees.forEach((employee) => {
					$('#list').append(`
						<li class="list-group-item">${employee.name} <br><a class="label label-primary" href="./timesheet.php?empid=${employee.id}&week=0" target="_blank">View Timesheet</a></li>
					`)
				});
			} else {
				$('#employees').html('You are in charge of no employees');
			}
	    });
	};

	getInitialState();
});
