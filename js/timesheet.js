'use strict';

$(document).ready(() => {
    // Javascript letiables
    let params = getQueryParams(document.location.search);
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
    $('#end').datetimepicker({
        defaultDate: moment().weekday(2),
        format: 'MMMM Do',
        daysOfWeekDisabled: [0,1,2,3,4,6]
    });

    // Functions
    function getQueryParams(qs) {
        qs = qs.split('+').join(' ');

        var params = {},
            tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    }

    $.ajax({
        url: `./php/main.php?action=validateUser&empid=${params.empid}`
    }).done((result) => {
        if (result.user) {
            // TODO: show application
            $('#username').html(result.user.empname);
            buildTable();
            makeTimesheet();
        }
    });

    function buildTable() {
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
            url: `./php/main.php?action=getInitialState`,
            method: 'post',
            data: {
                empid: params.empid,
                startDate: $('#end').data("DateTimePicker").date().weekday(-1).hour(0).minute(0).format('YYYY-MM-DD HH:mm:ss'),
                endDate: $('#end').data("DateTimePicker").date().hour(23).minute(59).format('YYYY-MM-DD HH:mm:ss')
            }
        }).done((data) => {
            // $('#startDate').html($('#end').data("DateTimePicker").date().weekday(-1).format('M/D/YYYY'));
            // $('#endDate').html($('#end').data("DateTimePicker").date().format('M/D/YYYY'));
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
                    <td class="${(timeslot.insource == 1 || timeslot.insource == 2) ? 'warning' : ''} ${timeslot.overBreak ? 'red' : ''} ${timeslot.typeid == 1 ? 'vacation' : ''}">${timeslot.punchintime ? moment(timeslot.punchintime).format('h:mm a') : '00:00 AM'} ${timeslot.insource == 2 ? '*' : ''}</td>
                    <td class="${(timeslot.outsource == 1 || timeslot.outsource == 2) ? 'warning' : ''}">${timeslot.punchouttime ? moment(timeslot.punchouttime).format('h:mm a') : '- -'}</td>
                    <td class=
                        ${sum.toFixed(2) > 6 ? 'red' : ''}>${sum.toFixed(2)}
                        ${timeslot.userid == timeslot.lasteditedby ? '' : '<button class="btn btn-defaults btn-xs" id=' + timeslot.timeid + 'info><i class="glyphicon glyphicon-info-sign"></i></button>'}
                    </td>
                </tr>
            `
        ).insertBefore($element);
        setPopover(timeslot.timeid);
    };

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
									<p>Check in changed from <b>${moment(c.oldintime).format('h:mm a')}</b> to <b>${moment(c.newintime).format('h:mm a')}</b></p>
								`;
							}
						} else if (c.oldouttime !== c.newouttime) {
							if (c.editedBy == "99999") {
								html += '<p>You were autosigned out at midnight</p>'
							} else {
								html += `
									<p>Check out changed from <b>${moment(c.oldouttime).format('h:mm a')}</b> to <b>${moment(c.newouttime).format('h:mm a')}</b></p>
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
