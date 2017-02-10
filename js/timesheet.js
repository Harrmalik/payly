$(document).ready(() => {
    // Javascript letiables
    let params = getQueryParams(document.location.search);
    let startDate = moment().weekday(-1).hour(0);
    let endDate = moment().weekday(5).hour(23).minute(59);
    let totalTime = 0,
    saturdayHours = 0,
    sundayHours = 0,
    mondayHours = 0,
    tuesdayHours = 0,
    wednesdayHours = 0,
    thursdayHours = 0,
    fridayHours = 0;

    // HTML Elements
    let $timesheet = $('#timesheet');
    let $totalHours = $('#totalHours');
    let days = [
        [$('#saturday'), $('#saturdayHours'), saturdayHours],
        [$('#sunday'), $('#sundayHours'), sundayHours],
        [$('#monday'), $('#mondayHours'), mondayHours],
        [$('#tuesday'), $('#tuesdayHours'), tuesdayHours],
        [$('#wednesday'), $('#wednesdayHours'), wednesdayHours],
        [$('#thursday'), $('#thursdayHours'), thursdayHours],
        [$('#friday'), $('#fridayHours'), fridayHours],
    ];

    getInitialState(days);
    makeTimesheet()


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
                code: params.code,
                startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
                endDate: endDate.format('YYYY-MM-DD HH:mm:ss')
            }
        }).done((data) => {
            let timeslots = data.clockedHours;
            let hours = 0;
            timeslots.forEach((timeslot) => {
                let hoursSum = 0;
                weekday = moment(timeslot.created).weekday();
                $htmlDay = days[weekday + 1][0];
                $htmlhours = days[weekday + 1][1];

                if (timeslot.punchouttime) {
                    hoursSum = moment(timeslot.punchouttime).diff(moment(timeslot.punchintime), 'minutes') / 60;
                    totalTime += hoursSum;
                    days[weekday + 1][2] += hoursSum;
                }

                if (!$htmlDay.attr('clocked')) {
                    $htmlDay.attr('clocked', true);
                    addRow($htmlDay, timeslot, hoursSum);
                } else {
                    addExtraRow($htmlDay, timeslot, hoursSum)
                }

                $htmlhours.html(`<b>${days[weekday + 1][2].toFixed(2)}</b>`);
                $totalHours.html(`<b>${totalTime.toFixed(2)}</b>`);
            });
        });
    }
    function addRow($element, timeslot, sum) {
        // TODO: add an row for timeslot
        $element.html(
            `
                <td>${moment(timeslot.created).format('dddd, MMM Do')}</td>
                <td>${timeslot.punchintime ? moment(timeslot.punchintime).format('h:mm a') : '00:00 AM'}</td>
                <td>${timeslot.punchouttime ? moment(timeslot.punchouttime).format('h:mm a') : '00:00 PM'}</td>
                <td>${sum.toFixed(2)}</td>
            `
        );
    }

    function addExtraRow($element, timeslot, sum) {
        // TODO: add an extra row to same day
        $(
            `<tr>
                <td></td>
                <td>${timeslot.punchintime ? moment(timeslot.punchintime).format('h:mm a') : '00:00 AM'}</td>
                <td>${timeslot.punchouttime ? moment(timeslot.punchouttime).format('h:mm a') : '00:00 PM'}</td>
                <td>${sum.toFixed(2)}</td>
            </tr>`
        ).insertAfter($element);
    }
});
