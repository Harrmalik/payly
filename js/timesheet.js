$(document).ready(() => {
    // Javascript letiables
    let params = getQueryParams(document.location.search);
    let startDate = moment().weekday(-1).hour(0).minute(0);
    let endDate = moment().weekday(5).hour(23).minute(59);
    let totalTime = 0,
    breaks = 0,
    saturdayHours = 0, saturdayBreaks = false,
    sundayHours = 0, sundayBreaks = false,
    mondayHours = 0, mondayBreaks = false,
    tuesdayHours = 0, tuesdayBreaks = false,
    wednesdayHours = 0, wednesdayBreaks = false,
    thursdayHours = 0, thursdayBreaks = false,
    fridayHours = 0, fridayBreaks = false;

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
                    breakSum = days[weekday + 1][2];

                if (timeslot.punchouttime) {
                    hoursSum = moment(timeslot.punchouttime).diff(moment(timeslot.punchintime), 'minutes') / 60;
                    totalTime += hoursSum;
                    days[weekday + 1][2] += hoursSum;
                    if (!breakSum) {
                        breakSum = true;
                    } else {
                        console.log(moment(timeslot.punchintime).diff(moment(timeslots[index-1].punchouttime), 'minutes'));
                    }
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
                <td class=${sum.toFixed(2) > 6 ? 'red' : ''}>${sum.toFixed(2)}</td>
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
                <td class=${sum.toFixed(2) > 6 ? 'red' : ''}>${sum.toFixed(2)}</td>
            </tr>`
        ).insertAfter($element);
    }
});
