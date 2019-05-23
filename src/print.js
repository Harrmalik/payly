let empid = location.search.split('=')[1],
    empSite = '',
    timezone = '',
    endDate = '',
    startDate = '',
    timeslots,
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

$('#end').datetimepicker({
  defaultDate: moment().day() == 6 ? moment().weekday(12) : moment().weekday(5),
  format: 'MMMM Do YYYY',
  daysOfWeekDisabled: [1,2,3,4,6]
});

$('#end').on('dp.change', () => {
  if (empid) {
    getTimesheet();
  }
});

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
			$('#username').html(user.empname);
			empSite = user.site
			timezone = user.timezone,
			deltasonic = user.deltasonic
      endDate = $('#end').data("DateTimePicker").date().weekday(deltasonic ? 5 : 6).hour(23).minute(59).format('YYYY-MM-DD');
      startDate = $('#end').data("DateTimePicker").date().weekday(deltasonic ? -1 : 0).hour(0).minute(0).format('YYYY-MM-DD');
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

      $('#weekBeginning').html(startDate);
      $('#weekEnding').html(endDate);
      // buildTable(endDate, startDate, days);
      makeTimesheet(endDate, startDate, days);
		} else {
			iziToast.warning({
				title: 'Couldn\'t find user',
				message: `${empid} is not a valid employee id, Please try again!.`,
			});
		}
	});
	return false;
}

makeTimesheet = (endDate, startDate, days) => {
  totalTime = 0;
  $('#punchRole').empty()
      $.ajax({
          url: `./php/main.php?module=admin&action=getEmployeeHours`,
          data: {
              empid,
              startDate,
              endDate
          }
      }).done((currentTimeslots) => {
    timeslots = currentTimeslots.timeslots
    $('#loader').removeClass('loader')
    $('#timesheetPage').show();
    $("#timesheet").empty();
    $("#timesheet").append(`
      <tbody id="timesheetTable">
        <tr class="active headers">
          <th style="width: 15%;">Date</th>
          <th style="width: 15%;">Role</th>
          <th style="width: 20%;">Check In</th>
          <th style="width: 20%;">Check Out</th>
          <th style="width: 10%;">Hours</th>
        </tr>
      </tbody>
    `)
    $("#laborBreakdowns").empty();
    $("#laborBreakdowns").append(`
      <div id="weekend" style="float:left;width:33%;">
        <div id="saturdayBreakdown">
          <h3><small>saturday breakdown</small></h3>
          <p id="saturdayHours"></p>
        </div>
        <div id="sundayBreakdown">
          <h3><small>sunday breakdown</small></h3>
          <p id="sundayHours"></p>
        </div>
        <div id="mondayBreakdown">
          <h3><small>monday breakdown</small></h3>
          <p id="mondayHours"></p>
        </div>
        <div id="tuesdayBreakdown">
          <h3><small>tuesday breakdown</small></h3>
          <p id="tuesdayHours"></p>
        </div>
      </div>

      <div id="weekday" style="float:left;width:33%;">
        <div id="wednesdayBreakdown">
          <h3><small>wednesday breakdown</small></h3>
          <p id="wednesdayHours"></p>
        </div>
        <div id="thursdayBreakdown">
          <h3><small>thursday breakdown</small></h3>
          <p id="thursdayHours"></p>
        </div>
        <div id="fridayBreakdown">
          <h3><small>friday breakdown</small></h3>
          <p id="fridayHours"></p>
        </div>
      </div>

      <div id="totals" style="float:left;width:33%;">
        <div id="totalBreakdown">
          <h3><small>total breakdown</small></h3>
          <p id="totalHours"></p>
        </div>
      </div>
    `)
    let hours = 0,
      weekbreakdown = {
        saturday: {
          timeslots: [],
          roles: [],
          washTips: 0,
          detailTips: 0,
          total: 0,
        },
        sunday: {
          timeslots: [],
          roles: [],
          washTips: 0,
          detailTips: 0,
          total: 0,
        },
        monday: {
          timeslots: [],
          roles: [],
          washTips: 0,
          detailTips: 0,
          total: 0,
        },
        tuesday: {
          timeslots: [],
          roles: [],
          washTips: 0,
          detailTips: 0,
          total: 0,
        },
        wednesday: {
          timeslots: [],
          roles: [],
          washTips: 0,
          detailTips: 0,
          total: 0,
        },
        thursday: {
          timeslots: [],
          roles: [],
          washTips: 0,
          detailTips: 0,
          total: 0,
        },
        friday: {
          timeslots: [],
          roles: [],
          washTips: 0,
          detailTips: 0,
          total: 0,
        },
        total: {
          timeslots: [],
          roles: [],
          washTips: 0,
          detailTips: 0,
          total: 0,
        }
      }

      timeslots.forEach((timeslot, index) => {
          let hoursSum = 0,
              weekday = moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday() === 6 ? -1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday(),
              $htmlDay = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][0],
              $htmlhours = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][1],
              breakSum = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][3],
              weekdayText = moment().weekday(weekday).format('dddd').toLowerCase();

          timeslot.punchouttime = timeslot.punchouttime ? timeslot.punchouttime : moment.unix(1553981280).format('l') == moment().format('l') ? moment().tz(timeslot.punchintimezone).unix() : null

          if (timeslot.punchouttime) {
            hoursSum = moment.unix(timeslot.punchouttime).diff(moment.unix(timeslot.punchintime), 'minutes') / 60;
            weekbreakdown[weekdayText].timeslots.push({
              ...timeslot,
              hoursSum
            })
            weekbreakdown[weekdayText].roles[timeslot.role] = weekbreakdown[weekdayText][timeslot.role] ? weekbreakdown[weekdayText][timeslot.role] +  hoursSum : hoursSum;
            weekbreakdown[weekdayText].total += hoursSum;
            weekbreakdown.total.roles[timeslot.role] = weekbreakdown.total.roles[timeslot.role] ? weekbreakdown.total.roles[timeslot.role] + hoursSum : hoursSum;
            weekbreakdown.total.total += hoursSum;
          }
      });

      $.ajax({
        url : `./php/main.php?module=kissklock&action=getTips`,
        data : {
          id: empid,
          startDate,
          endDate
        }
      }).done((tips) => {
        tips.forEach((tip, index) => {
          let washTips         = tip.washTTips ? tip.washTTips : 0,
              detailTips       = tip.detailTTips ? tip.detailTTips : 0,
              weekday          = moment(tip.timestamp).weekday() === 6 ? -1 : moment(tip.timestamp).weekday(),
              weekdayText = moment().weekday(weekday).format('dddd').toLowerCase();

              weekbreakdown[weekdayText].washTips += washTips
              weekbreakdown[weekdayText].detailTips += detailTips
              weekbreakdown['total'].washTips += washTips
              weekbreakdown['total'].detailTips += detailTips
        })

        Object.keys(weekbreakdown).forEach(d => {
          Object.keys(weekbreakdown[d].timeslots).forEach(r => {
            addTimeSlot(weekbreakdown[d].timeslots[r], weekbreakdown[d].total)
          })
          Object.keys(weekbreakdown[d].roles).forEach(r => {
            $(`#${d}Hours`).prepend(`<p>${r}: <b>${weekbreakdown[d].roles[r].toFixed(2)}</b></p>`);
          })

          if (weekbreakdown[d].washTips > 0) $(`#${d}Hours`).prepend(`<p>Wash tips: <b>${weekbreakdown[d].washTips.toFixed(2)}</b></p>`);
          if (weekbreakdown[d].detailTips > 0) $(`#${d}Hours`).prepend(`<p>Detail tips: <b>${weekbreakdown[d].detailTips.toFixed(2)}</b></p>`);
          $(`#${d}Hours`).append(`<p><b>Total Hours</b>: <b>${weekbreakdown[d].total.toFixed(2)}</b></p>`);
          if (weekbreakdown[d].total > 0) addTotalRow(weekbreakdown[d].total.toFixed(2));
        })
      })
    });
  }

  function addTimeSlot(timeslot, sum) {
    $('#timesheetTable').append(
      `
      <tr class="timeslots">
          <td>${moment.unix(timeslot.created).format('dddd, MMM Do')}</td>
          <td>${timeslot.role}</td>
          <td class="${timeslot.insource == 2 ? 'warning' : ''} ${timeslot.overBreak ? 'red' : ''} ${timeslot.typeid == 1 ? 'vacation' : ''} ${timeslot.typeid == 2 ? 'pto' : ''}">
            ${timeslot.punchintime ? moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).format('h:mm a') : '00:00 AM'} ${timeslot.insource == 2 ? '*' : ''}
          </td>
          <td class="${timeslot.outsource == 2 ? 'warning' : ''}  ${timeslot.typeid == 1 ? 'vacation' : ''} ${timeslot.typeid == 2 ? 'pto' : ''}">
            ${timeslot.punchouttime ? moment.unix(timeslot.punchouttime).tz(timeslot.punchouttimezone).format('h:mm a') : '- -'}
          </td>
          <td class=${sum.toFixed(2) > 6 ? 'red' : ''}>
            ${timeslot.hoursSum.toFixed(2)}
          </td>
      </tr>
      `
    )
    }

  function addTipsRow(type, total) {
    $('#timesheetTable').append(
      `
      <tr class="timeslots">
          <td></td>
          <td></td>
          <td></td>
          <td>${ type == 'detail' ? 'Detail Tips' : 'Wash Tips'}</td>
          <td>
            ${total}
          </td>
      </tr>
      `
    )
  }

  function addTotalRow(total) {
    $('#timesheetTable').append(
      `
      <tr class="timeslots">
          <td></td>
          <td></td>
          <td></td>
          <td class="info">Total</td>
          <td class="info">
            <b>${total}</b>
          </td>
      </tr>
      `
    )
  }


getTimesheet()
