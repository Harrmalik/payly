"use strict";

var empid,
    employeename,
    counter = 0,
    roles,
    role,
    tippedRole,
    maxHours = 0,
    currentHours = 0,
    currentTippedHours = 0,
    currentNonTippedHours = 0,
    otrId,
    getInitialState,
    logoutUrl = './',
    userData = $('title').data(),
    ipaddress = '',
    alerts,
    timezone,
    deltasonic,
    autologout,
    checkIn,
    checkOut,
    openTips,
    timer = function timer() {
  autologout = setTimeout(IdleTimeout, 60000);
},
    removeTimer = function removeTimer() {
  clearTimeout(autologout);
};

$('body').css("overflow", "hidden");
window.scrollTo(0, 0);

if (!ga) {
  var ga = function ga(arg1, arg2) {
    var category = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var action = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var label = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
    console.log("".concat(arg2, " - category: ").concat(category, ", action: ").concat(action, ", label: ").concat(label));
  };
} // Only show timer if screen is wide enough


if ($(window).width() >= 1000) {
  $('#clockdate').show();
  startTime();
}

function update(input) {
  $('#inputID').val($('#inputID').val() + input);
  $('#inputID').val();
}

var back = function back() {
  $('#inputID').val($('#inputID').val().slice(0, -1));
};

var empty = function empty() {
  $('#inputID').val('');
};

var login = function login(e) {
  if (e) e.preventDefault();
  empid = empid ? empid : $('#inputID').val().replace(/[&<>]/g, '');
  $.ajax({
    url: "./php/main.php?module=getIp"
  }).always(function (ip) {
    $.ajax({
      url: "./php/main.php?module=kissklock&action=validateUser&id=".concat(empid)
    }).done(function (user) {
      var ipaddress = ip.responseText.trim();

      if (empid && user.empname) {
        getInitialState();
        $('#auth').hide();
        $('#nav').show();
        $('#appname').text(user.deltasonic ? 'Kiss Klock' : 'Benderson Timeclock');
        $('#app').show();
        $('#name').html("Signed in as ".concat(user.empname, " <i class=\"glyphicon glyphicon-user\"></i>"));
        ga('send', 'event', 'Login', empid);
        userData.emp ? ga('set', 'userId', $('title').data('emp')) : ga('set', 'userId', empid);

        if (user.roles[0]) {
          // TODO: Log person into their last role
          role = user.roles[0].job_code;
          tippedRole = user.roles[0].istipped == 1 ? true : false;
          $('#primaryJob').html("".concat(user.roles[0].job_desc, " <span class=\"caret\"></span>"));
          user.roles.forEach(function (role) {
            $('#jobList').append("\n\t\t\t\t\t\t\t<li><a id=\"".concat(role.job_code, "\">").concat(role.job_desc, "</a></li>\n\t\t\t\t\t\t"));
          });
          $('#jobList a').on('click', function (e) {
            $('#primaryJob').html("".concat(e.target.text, " <span class=\"caret\"></span>"));
            role = e.target.id;

            if (counter % 2 == 1) {
              checkOut();
              checkIn();
            }
          });
        }

        employeename = user.empname;
        maxHours = user.holidays;
        currentHours = user.currentHours;
        alerts = user.alerts;
        timezone = user.timezone ? user.timezone : moment.tz.guess();
        deltasonic = user.deltasonic;
        roles = user.roles;
        if (currentHours == 0) $('#checkIn').html('<h3>Start Day</h3>');
        if (deltasonic) $('#overtime').hide();

        if (user.hasOvertime) {
          $('#overtimeReason').val(user.hasOvertime);
          otrId = user.otrId;
        }

        var birthday = moment(user.birthday).add(5, 'hours').format('MMDD');
        var hiredDate = moment(user.hiredDate).add(5, 'hours').format('MMDD');
        var yearsWorked = moment().format('YYYY') - moment(user.hiredDate).add(5, 'hours').format('YYYY');
        var todaysDate = moment().format('MMDD'); // If public machine prevent users from setting as local maching

        if (ipaddress == '172.30.49.156') {
          $('#setuser').hide();
        } else {
          // If local machine stop the page logout
          if (localStorage) {
            if (!localStorage.getItem('empid')) {
              timer();
              $('#setuser').show();
            }
          }
        }

        if (birthday == todaysDate) {
          $('#message').html("<div class=\"alert alert-info\" role=\"alert\">Happy birthday <b>".concat(user.empname, "</b>!</div>"));
        }

        if (hiredDate == todaysDate) {
          $('#message').html("<div class=\"alert alert-info\" role=\"alert\">Happy Anniversary <b>".concat(user.empname, "</b>! Thank you for your ").concat(yearsWorked, " year(s) of service.</b></div>"));
        }

        $('#notificationsList').append("\n\t\t\t\t\t<li class=\"list-group-item\"><h2>Walden Notifications</h2></li>\n\t\t\t\t\t<li class=\"list-group-item\">Weather will be cold today</li>\n\t\t\t\t\t<li class=\"list-group-item\">Location will be closed after 2pm today</li>\n\t\t\t\t");
      } else {
        $(".modal-title").html("User not found for employee ID: ".concat(empid));
        $(".modal-body").html("\n\t\t\t\t\t  <p>The Employee number <b>".concat(empid, "</b> Was not found in the system. Would you like to punch it in anyway</p>\n\t\t\t\t"));
        $('#unknownusermodal').modal('toggle');
      }
    });
  });
  return false;
};

$('#loginForm').on('submit', function (e) {
  if (e) e.preventDefault();
  login();
});

if (localStorage.getItem('empid')) {
  empid = localStorage.getItem('empid');
  login();
} else {
  $('#auth').show();
}

var unknownSignin = function unknownSignin() {
  $('#unknownusermodal').modal('toggle');
  getInitialState();
  $('#auth').toggle();
  $('#app').toggle();
  $('#name').html(empid);
  ga('send', 'event', 'Login', empid, 'Failed');
  timer();
};

var clearEmpId = function clearEmpId() {
  empid = '';
}; // Logout the user.


function IdleTimeout() {
  ga('send', 'event', 'Logout', empid, 'Timedout');
  iziToast.show({
    title: 'IdleTimeout',
    message: 'You have been signed out'
  });
  window.location = logoutUrl;
}

$(document).ready(function () {
  $('#inputID').val('');
  $('#inputID').focus(); //Javascript letiables

  var date = moment(),
      checkInTime,
      checkOutTime,
      checkInIds = [],
      totalTime = 0,
      timeslots = []; // HTML Buttons

  var $checkInBtn = $('#checkIn'),
      $checkOutBtn = $('#checkOut'),
      $lunchBreakBtn = $('#lunchBreak'),
      $timesheetBtn = $('#timesheet'),
      $todayHours = $('#todayHours'),
      $totalHours = $('#totalHours'),
      $overallHours = $('#overallHours'),
      $overtimeBtn = $('#overtimeBtn');
  $('#tipDate').datetimepicker({
    defaultDate: moment(),
    format: 'MMMM Do, YYYY'
  });
  $('#tipDate').on('dp.change', function () {
    $($('[name="tippedHours"]')[0]).val("");
    $($('[name="nonTippedHours"]')[0]).val("");
    lookupHours();
  }); // Event Listeners

  $('#notifications').on("click", function () {
    $('#notificationsPanel').slideToggle();
  });
  $checkInBtn.on("click", function () {
    checkIn();
  });
  $checkOutBtn.on("click", function () {
    // openTips($('#tips')[0], $('#tipsPage'))
    checkOut();
  });
  $lunchBreakBtn.on("click", function () {
    ga('send', 'event', 'CheckOut', empid, 'Attempted');
    checkOutTime = deltasonic ? moment().seconds(0) : moment().minute(Math.round(moment().minute() / 15) * 15).second(0);
    iziToast.show({
      title: 'Loading',
      message: "Checking out now"
    });
    $lunchBreakBtn.attr('disabled', true);
    $lunchBreakBtn.text('Punching out...');
    setTimeout(function () {}, 3000);
    $.ajax({
      url: "./php/main.php?module=kissklock&action=checkOut",
      method: 'POST',
      data: {
        time: checkOutTime.unix(),
        id: checkInIds[checkInIds.length - 1],
        empid: empid,
        timezone: timezone,
        alerts: alerts
      }
    }).success(function (hours) {
      if (deltasonic == 1) {
        iziToast.info({
          timeout: 60000 * 60,
          title: 'Punched Out',
          message: "<b>30 Minutes</b> from now would be - <b>".concat(moment.unix(checkOutTime.unix()).add(30, 'minutes').format('h:mm a'), "</b>")
        });
      }

      makeUpdate(true);
      ga('send', 'event', 'CheckOut', empid, 'Successful');
    }).fail(function (result) {
      iziToast.error({
        message: 'Kiss Klock could not be saved at this time'
      });
      ga('send', 'event', 'CheckOut', empid, 'Unsuccessful');
    }).always(function (result) {
      $lunchBreakBtn.attr('disabled', false);
      $lunchBreakBtn.text('Punch Out');
    });
  });
  $overtimeBtn.on('click', function () {
    $.ajax({
      url: "./php/main.php?module=kissklock&action=overtimeReason",
      method: 'POST',
      data: {
        weekending: moment().weekday(5).unix(),
        empid: empid,
        reason: $('#overtimeReason').val().replace(/[&<>]/g, ''),
        otrId: otrId
      }
    }).success(function (checkin) {
      ga('send', 'event', 'OvertimeReason', empid, 'Successful');
      iziToast.success({
        message: 'Overtime reason has been successfully saved.'
      });
    }).fail(function (result) {
      iziToast.error({
        message: 'Could not save overtime reason at this time. Please try again.'
      });
      ga('send', 'event', 'OvertimeReason', empid, 'Unsuccessful');
    });
  });
  $('#home').on('click', function (e) {
    nextPage(e, $('#app'));
    $('#kissklock-app').show();
    $('#clockdate').show();
  });
  $('#tips').on('click', function (e) {
    openTips(e, $('#tipsPage'));
  });
  $timesheetBtn.on("click", function (e) {
    nextPage(e, $('#timesheetPage'));
    $('body').css("overflow", "auto"); // Javascript letiables

    var startDate,
        endDate,
        timeslots,
        totalTime = 0,
        breaks = 0,
        saturdayHours = 0,
        saturdayBreaks = 0,
        sundayHours = 0,
        sundayBreaks = 0,
        mondayHours = 0,
        mondayBreaks = 0,
        tuesdayHours = 0,
        tuesdayBreaks = 0,
        wednesdayHours = 0,
        wednesdayBreaks = 0,
        thursdayHours = 0,
        thursdayBreaks = 0,
        fridayHours = 0,
        fridayBreaks = 0,
        days; // HTML Elements

    var $timesheet = $('#timesheetTable'); //let $totalHours = $('#totalHours');

    if (deltasonic) {
      days = [[$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday'], [$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday'], [$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday'], [$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday'], [$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday'], [$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday'], [$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday']];
      $('#end').datetimepicker({
        defaultDate: moment().weekday(5),
        format: 'MMMM Do, YYYY',
        daysOfWeekDisabled: [0, 1, 2, 3, 4, 6]
      });
    } else {
      days = [[$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday'], [$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday'], [$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday'], [$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday'], [$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday'], [$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday'], [$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday']];
      $('#end').datetimepicker({
        defaultDate: moment().weekday(6),
        format: 'MMMM Do, YYYY',
        daysOfWeekDisabled: [0, 1, 2, 3, 4, 5]
      });
    }

    $.ajax({
      url: "./php/main.php?module=kissklock&action=validateUser&id=".concat(empid)
    }).done(function (user) {
      if (user.empname) {
        $('#name').html("Signed in as ".concat(user.empname, " <i class=\"glyphicon glyphicon-user\"></i>"));
        $('#username').html(user.empname);
        buildTable();
        makeTimesheet();
      }
    });

    function buildTable() {
      $('#timesheetTable').empty();
      days.forEach(function (day, index) {
        $('#timesheetTable').append("\n\t\t\t\t\t<tr class=\"active\">\n\t\t\t\t\t\t<th>Date</th>\n\t\t\t\t\t\t<th>Check In</th>\n\t\t\t\t\t\t<th>Check Out</th>\n\t\t\t\t\t\t<th>Hours</th>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr id=\"".concat(day[4], "\" class=\"timeslots\">\n\t\t\t\t\t\t<td>").concat($('#end').data("DateTimePicker").date().weekday(deltasonic ? index - 1 : index).format('dddd, MMM Do'), "</td>\n\t\t\t\t\t\t<td>- -</td>\n\t\t\t\t\t\t<td>- -</td>\n\t\t\t\t\t\t<td>0</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr class=\"timeslots\">\n\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t<td id=\"").concat(day[4], "Hours\" class=\"info\"><b>0</b></td>\n\t\t\t\t\t</tr>\n\t\t\t\t"));
      });

      if (deltasonic) {
        days = [[$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday'], [$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday'], [$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday'], [$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday'], [$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday'], [$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday'], [$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday']];
      } else {
        days = [[$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday'], [$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday'], [$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday'], [$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday'], [$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday'], [$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday'], [$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday']];
      }

      $('#timesheetTable').append("\n\t\t\t\t<tr id=\"totalrow\">\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th>Total Hours</th>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td></td>\n\t\t\t\t\t<td></td>\n\t\t\t\t\t<td></td>\n\t\t\t\t\t<td id=\"totalHours\" class=\"info\"><b>0</b></td>\n\t\t\t\t</tr>\n\t\t\t");
    }

    function makeTimesheet() {
      $.ajax({
        url: "./php/main.php?module=kissklock&action=getInitialState",
        data: {
          id: empid,
          startDate: $('#end').data("DateTimePicker").date().weekday(deltasonic ? -1 : 0).hour(0).minute(0).format('YYYY-MM-DD'),
          endDate: $('#end').data("DateTimePicker").date().hour(23).minute(59).format('YYYY-MM-DD')
        }
      }).done(function (clockedHours) {
        timeslots = clockedHours;
        var hours = 0;
        var totalTime = 0;
        timeslots.forEach(function (timeslot, index) {
          var hoursSum = 0,
              punchintimezone = timeslot.punchintimezone ? timeslot.punchintimezone : moment.tz.guess(),
              punchouttimezone = timeslot.punchouttimezone ? timeslot.punchouttimezone : moment.tz.guess(),
              weekday = moment.unix(timeslot.punchintime).tz(punchintimezone).weekday() === 6 ? -1 : moment.unix(timeslot.punchintime).tz(punchintimezone).weekday(),
              $htmlDay = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(punchintimezone).weekday()][0],
              $htmlhours = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(punchintimezone).weekday()][1],
              breakSum = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(punchintimezone).weekday()][3];

          if (timeslot.punchouttime) {
            hoursSum = moment.unix(timeslot.punchouttime).diff(moment.unix(timeslot.punchintime), 'minutes') / 60;
            totalTime += hoursSum;
            days[weekday + 1][2] += hoursSum;

            if (timeslots[index - 1]) {
              var previousWeekday = moment.unix(timeslots[index - 1].created).weekday() === 6 ? -1 : moment.unix(timeslots[index - 1].created).weekday();

              if (weekday === previousWeekday) {
                if (timeslots[index - 1].punchouttime) {
                  days[weekday + 1][3] += moment.unix(timeslot.punchintime).diff(moment.unix(timeslots[index - 1].punchouttime), 'minutes');

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
            addRow($htmlDay, timeslot, hoursSum);
          }

          $htmlhours.html("<b>".concat(days[weekday + 1][2].toFixed(2), "</b>"));
        });
        $("td#totalHours.info").html('<b>' + totalTime.toFixed(2) + '</b>');
      });
    }

    function addRow($element, timeslot, sum) {
      $("\n\t\t            <tr class=\"timeslots\">\n\t\t                <td>".concat(!$element.attr('clocked') || $element.attr('clocked') === 'false' ? moment.unix(timeslot.created).format('dddd, MMM Do') : '', "</td>\n\t\t                <td class=\"").concat(timeslot.insource == 1 || timeslot.insource == 2 ? 'warning' : '', " ").concat(timeslot.overBreak ? 'red' : '', " ").concat(timeslot.typeid == 1 ? 'vacation' : '', " ").concat(timeslot.typeid == 2 ? 'pto' : '', "\">").concat(timeslot.punchintime ? moment.unix(timeslot.punchintime).format('h:mm a') : '00:00 AM', " ").concat(timeslot.insource == 2 ? '*' : '', "</td>\n\t\t                <td class=\"").concat(timeslot.outsource == 1 || timeslot.outsource == 2 ? 'warning' : '', " ").concat(timeslot.typeid == 1 ? 'vacation' : '', " ").concat(timeslot.typeid == 2 ? 'pto' : '', "\">").concat(timeslot.punchouttime ? moment.unix(timeslot.punchouttime).format('h:mm a') : '- -', "</td>\n\t\t                <td class=\n\t\t                    ").concat(sum.toFixed(2) > 6 ? 'red' : '', ">").concat(sum.toFixed(2), "\n\t\t                    ").concat(timeslot.userid == timeslot.lasteditedby ? '' : '<button class="btn btn-defaults btn-xs" id=' + timeslot.timeid + 'info><i class="glyphicon glyphicon-info-sign"></i></button>', "\n\t\t                </td>\n\t\t            </tr>\n\t\t        ")).insertBefore($element);
      setPopover(timeslot.timeid);
    }

    ;

    function setPopover(id) {
      $.ajax({
        url: "./php/main.php?module=kissklock&action=getChanges&id=".concat(id)
      }).done(function (changes) {
        var html = '';

        if (changes.length == 0) {
          html += 'This timeslot was created for you';
        } else {
          changes.forEach(function (c) {
            if (c.oldintime !== c.newintime) {
              if (c.editedby == "99999") {
                html += '<p>You were autosigned out at midnight</p>';
              } else {
                html += "\n\t\t\t\t\t\t\t\t\t\t<p>Check in changed from <b>".concat(moment.unix(c.oldintime).format('h:mm a'), "</b> to <b>").concat(moment.unix(c.newintime).format('h:mm a'), "</b></p>\n\t\t\t\t\t\t\t\t\t");
              }
            } else if (c.oldouttime !== c.newouttime) {
              if (c.editedby == "99999") {
                html += '<p>You were autosigned out at midnight</p>';
              } else {
                html += "\n\t\t\t\t\t\t\t\t\t\t<p>Check out changed from <b>".concat(moment.unix(c.oldouttime).format('h:mm a'), "</b> to <b>").concat(moment.unix(c.newouttime).format('h:mm a'), "</b></p>\n\t\t\t\t\t\t\t\t\t");
              }
            }
          });
        }

        $("#".concat(id, "info")).popover({
          template: "<div id=".concat(id, " class=\"popover\" role=\"tooltip\">\n\t\t\t\t\t\t\t\t<div class=\"arrow\"></div>\n\t\t\t\t\t\t\t\t<h3 class=\"popover-title\"></h3>\n\t\t\t\t\t\t\t\t<div class=\"popover-content\"></div>\n\t\t\t\t\t\t\t</div>"),
          html: true,
          container: "#".concat(id, "info"),
          title: 'Change Log',
          content: html
        });
        $("#".concat(id, "info")).on('click', function () {
          $("#".concat(id)).popover('show');
        });
        $(".popover").on('show.bs.popover', function () {
          setTimeout(function () {
            $("#".concat(id)).popover('hide');
          }, 2000);
        });
      });
    }

    ;
    $('#end').on('dp.change', function () {
      buildTable();
      makeTimesheet();
    });
  }); // Functions

  getInitialState = function getInitialState() {
    $.ajax({
      url: "./php/main.php?module=kissklock&action=getInitialState",
      data: {
        id: empid,
        startDate: date.format('YYYY-MM-DD'),
        endDate: moment().add(1, 'days').format('YYYY-MM-DD')
      }
    }).done(function (timeslots) {
      timeslots = timeslots;
      $('#todayHours').empty();
      checkInIds = [];
      totalTime = 0;
      counter = 0;

      if (timeslots.length > 0) {
        timeslots.forEach(function (timeslot, index) {
          if (moment.unix(timeslot.punchintime).day() == moment().day()) {
            var hoursSum;
            checkInTime = timeslot.punchintime ? moment.unix(timeslot.punchintime) : null;
            checkOutTime = timeslot.punchouttime ? moment.unix(timeslot.punchouttime) : null;
            checkInIds.push(timeslot.timeid);
            counter++;

            if (checkOutTime) {
              hoursSum = calculateHours(checkInTime, checkOutTime);
              populateElement(totalTime.toFixed(2), $totalHours);
              populateElement("".concat(totalTime.toFixed(2), "/").concat(maxHours), $overallHours);
              counter++;
            } else {
              var timeNow = moment.duration(moment().diff(moment(checkInTime))).asHours();
              populateElement("".concat((totalTime + timeNow).toFixed(2)), $overallHours);
            }

            addRow(checkInTime, checkOutTime, hoursSum, timeslot.role);
          }
        });
        var lastPunchIn = timeslots[timeslots.length - 1],
            lastCheckOut = lastPunchIn.punchouttime ? moment.unix(lastPunchIn.punchouttime) : null;

        if (!lastCheckOut) {
          role = lastPunchIn.roleId;
          tippedRole = lastPunchIn.istipped == 1 ? true : false;
          $('#primaryJob').html("".concat(lastPunchIn.role, " <span class=\"caret\"></span>"));
        }

        toggleButtons();
      } else {
        toggleButtons();
      }
    });
  };

  var populateElement = function populateElement(time, field) {
    if (time === null) return;
    field.html(time);
  };

  var makeUpdate = function makeUpdate(checkOut) {
    var hoursSum;
    counter++;

    if (checkOut) {
      hoursSum = calculateHours(checkInTime, checkOutTime);
      populateElement(totalTime.toFixed(2), $totalHours);
      populateElement("".concat(totalTime.toFixed(2), "/").concat(maxHours), $overallHours);
      $("#".concat(checkInIds[checkInIds.length - 1], "timeout")).html(checkOutTime.format('h:mm a'));
      $("#".concat(checkInIds[checkInIds.length - 1], "hours")).html(hoursSum.toFixed(2));
    } else {
      addRow(checkInTime, null, null);
    }

    toggleButtons();
  };

  var toggleButtons = function toggleButtons() {
    var position;

    if (counter % 2 == 0) {
      $checkInBtn.show();
      $checkOutBtn.hide();
      $lunchBreakBtn.hide();
      position = $('#checkIn').position();
    } else {
      $checkInBtn.hide();
      $checkOutBtn.show();
      $lunchBreakBtn.show();
      position = $('#checkOut').position();
    }

    $('#clockdate').show().css({
      'top': '2em',
      'left': position.left + 16 + 'px',
      'transform': 'none'
    });
  };

  var calculateHours = function calculateHours(start, end) {
    var hours = end.diff(start, 'minutes') / 60;
    totalTime += hours;
    return hours;
  };

  var addRow = function addRow(start, end, total) {
    var role = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    $todayHours.append("\n\t\t\t<tr>\n\t\t\t\t<td>".concat(checkInIds.length == 1 ? moment().format('dddd, MMM Do') : '', " <span class=\"badge badge-primary\">").concat(role, "</span></td>\n\t\t\t\t<td>").concat(start.format('h:mm a'), "</td>\n\t\t\t\t<td id=\"").concat(checkInIds[checkInIds.length - 1] + 'timeout', "\">").concat(end ? end.format('h:mm a') : '- -', "</td>\n\t\t\t\t<td id=\"").concat(checkInIds[checkInIds.length - 1] + 'hours', "\" class=\"").concat(total > 6 ? 'red' : '', "\">").concat(total ? total.toFixed(2) : '- -', "</td>\n\t\t\t\t<td></td>\n\t\t\t</tr>\n\t\t"));
  };

  var nextPage = function nextPage(e, page) {
    $('#app').hide();
    $('#timesheetPage').hide();
    $('#clockdate').hide();
    $('#tipsPage').hide();
    page.show();
    $('nav li').removeClass('active');
    $(e.target).parent().addClass('active');
    e.target.id == 'home' ? $('#kissklock-app').show() : $('#kissklock-app').hide();
  };

  checkIn = function checkIn() {
    ga('send', 'event', 'CheckIn', empid, 'Attempted');
    $('#checkIn').attr('disabled', true);
    $('#checkIn').text('Punching in...');
    checkInTime = deltasonic ? moment().seconds(0) : moment().minute(Math.round(moment().minute() / 15) * 15).second(0);
    iziToast.show({
      title: 'Loading',
      message: "Checking in now"
    });
    $.ajax({
      url: "./php/main.php?module=kissklock&action=checkIn",
      method: 'POST',
      data: {
        time: checkInTime.unix(),
        empid: empid,
        timezone: timezone,
        alerts: alerts,
        role: role
      }
    }).success(function (checkin) {
      checkInIds.push(checkin);
      makeUpdate();
      ga('send', 'event', 'CheckIn', empid, 'Successful');
      iziToast.success({
        message: 'You have been successfully checked in'
      });
    }).fail(function (result) {
      iziToast.error({
        message: 'Kiss Klock could not be saved at this time'
      });
      ga('send', 'event', 'CheckIn', empid, 'Unsuccessful');
    }).always(function (result) {
      $('#checkIn').attr('disabled', false);
      $('#checkIn').text('Punch In');
    });
  };

  checkOut = function checkOut() {
    ga('send', 'event', 'CheckOut', empid, 'Attempted');
    checkOutTime = deltasonic ? moment().seconds(0) : moment().minute(Math.round(moment().minute() / 15) * 15).second(0);
    iziToast.show({
      title: 'Loading',
      message: "Checking out now"
    });
    $('#checkOut').attr('disabled', true);
    $('#checkOut').text('Punching out...');
    setTimeout(function () {}, 3000);
    $.ajax({
      url: "./php/main.php?module=kissklock&action=checkOut",
      method: 'POST',
      data: {
        time: checkOutTime.unix(),
        id: checkInIds[checkInIds.length - 1],
        empid: empid,
        timezone: timezone,
        alerts: alerts
      }
    }).success(function (hours) {
      if (deltasonic == 1) {
        iziToast.info({
          title: 'Punched Out',
          message: "You have successfully been punched out."
        });
      }

      if (deltasonic == 1) {
        iziToast.info({
          timeout: 60000 * 60,
          title: 'Punched Out',
          message: "<b>30 Minutes</b> from now would be - <b>".concat(moment.unix(checkOutTime.unix()).add(30, 'minutes').format('h:mm a'), "</b>")
        });
      }

      makeUpdate(true);
      ga('send', 'event', 'CheckOut', empid, 'Successful'); // $('#kissklock-app').hide()
    }).fail(function (result) {
      iziToast.error({
        message: 'Kiss Klock could not be saved at this time'
      });
      ga('send', 'event', 'CheckOut', empid, 'Unsuccessful');
    }).always(function (result) {
      $('#checkOut').attr('disabled', false);
      $('#checkOut').text('Punch Out');
    });
  };

  openTips = function openTips(e) {
    nextPage(e, $('#tipsPage'));
    $('#kissklock-app').hide();
    lookupHours();
    setQuestionNumber(1);
    $("#employeeid").val(empid);
    glbsection = 1;
    $("#slide1").slideDown("slow");
    $("#slide2").slideDown("slow");
    $("#employeeNameDisplay").text(employeename);
  };
});

function startTime() {
  var today = moment();
  $('#clock').html(today.format('hh:mm:ss') + "<span>".concat(today.format('A'), "</span>"));
  $('#date').text(today.format('dddd, MMMM Do'));
  var time = setTimeout(function () {
    startTime();
  }, 500);
}

function openWarning() {
  $('#warning').modal();
}

function setUser() {
  localStorage.setItem('empid', empid);
  ga('send', 'event', 'LocalMachine', empid);
  $('#warning').modal('hide');
} //////// TIPS


var glbsection = 0;
var glbSignaturePad = '';
$(document).ready(function () {
  $("#btnSigDisplay").on("click", function () {
    $("#todaystips").hide("", function () {
      establishCanvas();
    });
    $("#signatureContainer").show();
  });
  $("#btnSigHide").on("click", function () {
    $("#signatureContainer").hide();
    $("#todaystips").show();
  }); //var canvas = document.getElementById('signature-pad');
  //var canvas = document.querySelector("canvas");
  //var canvas = $("canvas");

  var canvas = document.querySelector("canvas");
  glbSignaturePad = new SignaturePad(canvas, {
    backgroundColor: 'rgb(255, 255, 255)' // necessary for saving image as JPEG; can be removed is only saving as PNG or SVG

  }); //establishCanvas();

  $(".btnLessthanfourhours").on("click", function () {
    var value = $(this).attr("ds_value");
    setQ1(value);
  });
  $(".btnLessthanfourhoursunderstand").on("click", function () {
    $("#lessthanfourhoursunderstand").val(1);
    setQuestionNumber(3);
  });
});

function setQuestionNumber(sectionNumber) {
  var counter = 1;

  while (document.getElementById("tipsection" + counter)) {
    if (counter == sectionNumber) {
      $("#tipsection" + counter).slideDown("slow", function () {
        if (sectionNumber == 3) {
          establishCanvas();
        }
      });
    } else {
      $("#tipsection" + counter).slideUp("slow");
    }

    counter++;
  }

  glbsection = counter;
}

function tipCommand(sectionNum) {
  switch (sectionNum) {
    case 1:
      if ($("#setQuestionNumber").prop("checked")) {} else {}

      break;

    case 2:
      setQuestionNumber(3);
      break;

    case 3:
      break;

    default:
      break;
  }
}

function setQ1(val) {
  $("#lessthanfourhours").val(val);

  if (val > 0) {
    setQuestionNumber(2);
  } else {
    setQuestionNumber(3);
  }
}

function saveTips() {
  if (!$("#btnCommand").hasClass("disabled")) {
    var formData = $("#frmtips").serialize() + "&command=savetip";
    formData += "&date=" + $('#tipDate').data("DateTimePicker").date().format("M/D/Y");
    var tippedHours = $($('[name="tippedHours"]')[0]).val();
    var nonTippedHours = $($('[name="nonTippedHours"]')[0]).val();
    var washTips = $($('[name="washTTips"]')[0]).val();
    var detailTips = $($('[name="detailTTips"]')[0]).val();
    var signatureData = encodeURIComponent(glbSignaturePad.toDataURL('image/png'));
    formData += "&signatureData=" + signatureData;

    if (!isNaN(parseInt(tippedHours)) && !isNaN(parseInt(nonTippedHours)) && !isNaN(parseInt(washTips)) && !isNaN(parseInt(detailTips)) && !glbSignaturePad.isEmpty()) {
      $("#btnCommand").addClass("disabled");
      $.ajax({
        url: "./php/call.php",
        data: formData,
        method: "post"
      }).done(function (data) {
        var success = false;

        if (typeof data[0] != 'undefined') {
          if (typeof data[0]['status'] != 'undefined') {
            if (data[0]['status'] == 'success') {
              success = true;
            }
          }
        }

        if (success) {
          //$("#msg-status").removeClass("bg-danger");
          //$("#msg-status").addClass("bg-success");
          //$("#msg-status").html("Saved");
          showMsg("bg-success", "Saved");
          setTimeout(function () {
            //resetPage();
            window.close();
          }, 3000);
        } else {
          showMsg("bg-danger", "An error has occurred while saving the tips' data."); //$("#msg-status").removeClass("bg-success");
          //$("#msg-status").addClass("bg-danger");
          //$("#msg-status").html("An error has occurred while saving the tips' data.");

          $("#btnCommand").removeClass("disabled");
        }
      });
    } else {
      //$("#msg-status").removeClass("bg-success");
      //$("#msg-status").addClass("bg-danger");
      //$("#msg-status").html("Please Enter values for all tips and hours, and remember to sign before saving.");
      showMsg("bg-danger", "Please Enter values for all tips and hours, and remember to sign before saving.");
    }
  }
}

function resetPage() {
  glbSignaturePad.clear();
  $("#btnCommand").removeClass("disabled");
  $("#slide1").slideDown("slow");
  $("#slide2").slideUp("slow");
  $("#msg-status").removeClass("bg-success");
  $("#msg-status").removeClass("bg-danger");
  $("#msg-status").html("<br/>");
  $("#empNumberDisplay").text("");
  $("#employeeNameDisplay").text("");
  $($('[name="employeeid"]')[0]).val("");
  $($('[name="lessthanfourhours"]')[0]).val("");
  $($('[name="lessthanfourhoursunderstand"]')[0]).val("");
  $($('[name="tippedHours"]')[0]).val("");
  $($('[name="nonTippedHours"]')[0]).val("");
  $($('[name="detailTTips"]')[0]).val("");
  $($('[name="washTTips"]')[0]).val("");
  closeModal('msgContainer');
}
/*
	TABLET SIGNATURE
	https://github.com/szimek/signature_pad
	https://jsfiddle.net/szimek/jq9cyzuc/
*/
// Adjust canvas coordinate space taking into account pixel ratio,
// to make it look crisp on mobile devices.
// This also causes canvas to be cleared.


function establishCanvas() {
  if (typeof canvas == 'undefined') {
    var canvas = document.getElementById('signature-pad');
  } // When zoomed out to less than 100%, for some very strange reason,
  // some browsers report devicePixelRatio as less than 1
  // and only part of the canvas is cleared then.


  var ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);
}

function lookupHours() {
  var data = {
    id: empid,
    startDate: $('#tipDate').data("DateTimePicker").date().format('YYYY-MM-DD'),
    endDate: $('#tipDate').data("DateTimePicker").date().format('YYYY-MM-DD')
  };
  $('#washInput').hide();
  $('#detailInput').hide();
  $.get("./php/main.php?module=kissklock&action=getHoursByRole", data).done(function (response) {
    var tippedHours = 0,
        nonTippedHours = 0,
        detail = false,
        wash = false;
    response.forEach(function (timeslot) {
      if (timeslot.istipped) {
        tippedHours += timeslot.totalHours;
      } else {
        nonTippedHours += timeslot.totalHours;
      }

      if (timeslot.role && timeslot.role.toLowerCase().match(/wash/)) wash = true;
      if (timeslot.role && timeslot.role.toLowerCase().match(/detail/)) detail = true;
    });
    if (wash) $('#washInput').show();
    if (detail) $('#detailInput').show();
    $($('[name="tippedHours"]')[0]).val(tippedHours.toFixed(2));
    $($('[name="nonTippedHours"]')[0]).val(nonTippedHours.toFixed(2));
    $("#tippedHours_display").html(tippedHours.toFixed(2));
    $("#nonTippedHours_display").html(nonTippedHours.toFixed(2));
  });
}

function showMsg(thisclass, msg) {
  $("#modal-status").removeClass("bg-success bg-danger");
  $("#modal-status").addClass(thisclass);
  $("#modal-status").html(msg);
  $('#msgContainer').modal('show');
}

function closeModal(modal) {
  $('#' + modal).modal('hide');
}