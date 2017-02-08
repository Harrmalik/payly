$(document).ready(() => {
    // Javascript letiables
    let startDate = moment().weekday(-1).hour(0);
    let endDate = moment().weekday(5).hour(0);
    let totalTime = 0;

    // HTML Elements
    let $timesheet = $('#timesheet');
    let days = [
        [$('#saturday'), $('#saturdayHours')],
        [$('#sunday'), $('#sundayHours')],
        [$('#monday'), $('#mondayHours')],
        [$('#tuesday'), $('#tuesdayHours')],
        [$('#wednesday'), $('#wednesdayHours')],
        [$('#thursday'), $('#thursdayHours')],
        [$('#friday'), $('#fridayHours')],
    ];

    getInitialState(days);
    makeTimesheet()


    // Functions
    function getInitialState(days) {
        $('#startDate').html(startDate.format('M/D/YYYY'));
        $('#endDate').html(endDate.format('M/D/YYYY'));

        days.forEach((day,index) => {
            $(`
                <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                </tr>
            `).insertBefore(day[0]);

            day[0].first().html(`
                <td>${moment().weekday(index-1).format('MMM Do')}</td>
                <td>00:00 AM</td>
                <td>00:00 PM</td>
                <td>0</td>
            `);
        });
    }

    function makeTimesheet() {
        $.ajax({
            url: `./php/main.php?action=getInitialState`,
            method: 'post',
            data: {
                id: 2523526,
                startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
                endDate: endDate.format('YYYY-MM-DD HH:mm:ss')
            }
        }).done((data) => {
            let hours = data.clockedHours;
            hours.forEach((timeslot) => {
                let hoursSum = 0;
                weekday = moment(timeslot.created).weekday();
                $htmlDay = days[weekday + 1][0];
                $hours = days[weekday + 1][1]

                if (timeslot.punchouttime) {
                    hoursSum = moment(timeslot.punchouttime).diff(moment(timeslot.punchintime), 'minutes') / 60;
                    totalTime += hoursSum;
                }

                if (!$htmlDay.attr('clocked')) {
                    $htmlDay.attr('clocked', true);
                    addRow($htmlDay, timeslot, hoursSum);
                } else {
                    addExtraRow($htmlDay, timeslot, hoursSum)
                }
                $hours.html(totalTime);
            });
        });
    }
    function addRow($element, timeslot, sum) {
        // TODO: add an row for timeslot
        $element.html(
            `
                <td>${moment(timeslot.created).format('MMM Do')}</td>
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

    function calculateHours() {
        // TODO: calculate hours for current timeslot

    }

    function calculateDay() {
        // TODO: calculate hours for entire day

    }


});
