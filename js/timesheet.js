// HTML Elements
$timesheet = $('#timesheet');

$(document).ready(() => {
    let startDate = moment().weekday(-1).hour(0);
    let endDate = moment().weekday(5).hour(0);

    $('#startDate').html(startDate.format('M/D/YYYY'));
    $('#endDate').html(endDate.format('M/D/YYYY'));

    // $.ajax({
    //     url: `/php/main.php?action=getTimesheet&startDate=${startDate.format('YYYY-MM-DD HH:DD:SS')}&endDate=${endDate.format('YYYY-MM-DD HH:DD:SS')}`,
    //     method: 'get'
    // }).done({
    //
    // })
});

// Functions

function addRow() {
    // TODO: add an row for timeslot

    $timesheet;
    `<tr>
        <td>Jan 21</td>
        <td>00:00 AM</td>
        <td>00:00 PM</td>
        <td>0</td>
    </tr>`
}

function addExtraRow() {
    // TODO: add an extra row to same day

}

function calculateHours() {
    // TODO: calculate hours for current timeslot

}

function calculateDay() {
    // TODO: calculate hours for entire day

}

function calculateWeek()  {
    // TODO: calulate hours for entire week

}
