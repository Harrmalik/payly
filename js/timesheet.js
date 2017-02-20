$(document).ready(() => {
    // Javascript letiables
    let params = getQueryParams(document.location.search);
    let startDate = moment().weekday(-1).hour(0).minute(0);
    let endDate = moment().weekday(5).hour(23).minute(59);
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

    getInitialState(days);
    makeTimesheet();


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

    function getInitialState(days) {
        $('#startDate').html(startDate.format('M/D/YYYY'));
        $('#endDate').html(endDate.format('M/D/YYYY'));

        days.forEach((day,index) => {
            $(`
                <tr class="active">
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                </tr>
            `).insertBefore(day[0]);

            day[0].first().html(`
                <td>${moment().weekday(index-1).format('dddd, MMM Do')}</td>
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
                        previousWeekday = moment(timeslots[index -1].created).weekday() === 6 ? -1 : moment(timeslots[index -1].created).weekday();
                        if (weekday === previousWeekday) {
                            if (timeslots[index-1].punchouttime) {
                                days[weekday + 1][3] += moment(timeslot.punchintime).diff(moment(timeslots[index-1].punchouttime), 'minutes');
                                console.log(moment(timeslot.punchintime).diff(moment(timeslots[index-1].punchouttime), 'minutes'));
                            }
                        } else if (!timeslots[index + 1]) {
                            console.log(days[previousWeekday + 1][0]);
                            console.log(' total: ' + days[previousWeekday + 1][3]);
                        } else {
                            console.log(days[previousWeekday + 1][0]);
                            console.log(' total: ' + days[previousWeekday + 1][3]);
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
                    <td class="${timeslot.insource === 'phone' ? 'warning' : ''}">${timeslot.punchintime ? moment(timeslot.punchintime).format('h:mm a') : '00:00 AM'}</td>
                    <td class="${timeslot.outsource === 'phone' ? 'warning' : ''}">${timeslot.punchouttime ? moment(timeslot.punchouttime).format('h:mm a') : '- -'}</td>
                    <td class=${sum.toFixed(2) > 6 ? 'red' : ''}>${sum.toFixed(2)}</td>
                </tr>
            `
        ).insertBefore($element);
    }
});
