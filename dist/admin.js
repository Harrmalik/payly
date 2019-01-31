'use strict';

var empid,
    empSite,
    userData = $('title').data(),
    myEmpid = $('body').data('myempid'),
    isManager = $('body').data('ismanager'),
    isPayroll = $('body').data('ispayroll'),
    isLocation = $('body').data('islocation'),
    buildTable,
    makeTimesheet,
    timezone,
    deltasonic,
    timeslot,
    allUsers;
$('#punchintime').datetimepicker({
  sideBySide: true
});
$('#punchouttime').datetimepicker({
  sideBySide: true
});
$('#end').datetimepicker({
  defaultDate: moment().weekday(5),
  format: 'MMMM Do YYYY',
  daysOfWeekDisabled: [1, 2, 3, 4, 6]
});
$('#dateFilter').datetimepicker({
  defaultDate: moment().weekday(5),
  format: 'MMMM Do YYYY',
  daysOfWeekDisabled: [1, 2, 3, 4, 6]
});
$('#startDate').datetimepicker({
  defaultDate: moment().weekday(-1),
  format: 'MMMM Do YYYY'
});
$('#endDate').datetimepicker({
  defaultDate: moment().weekday(5),
  format: 'MMMM Do YYYY'
});
var glbDataTable = '';
var calSelectStartDate = "";
var calSelectEndDate = "";

if (window.navigator.userAgent.indexOf("MSIE ") > 0) {
  userData.emp ? ga('set', 'userId', $('title').data('emp')) : ga('set', 'userId', empid);
}

$('.adminsBtn').hide();
$('.tipsBtn').hide();
$('.payrollBtn').hide();
$('.hrBtn').hide();

if (isPayroll || isLocation) {
  $('.adminsBtn').show();
}

if (isLocation) {
  $('.tipsBtn').show();
}

if (isPayroll) {
  $('.payrollBtn').show();
}

$.ajax({
  url: "./php/main.php?module=getManager"
}).done(function (user) {
  myEmpid = user[0].employeeid;
});
console.log(isManager, isLocation, isPayroll); // Edit Timesheets tab

var getTimesheet = function getTimesheet(userid) {
  empid = $('#employeeID').val() ? $('#employeeID').val().split('.')[0] : userid ? userid : empid;

  if (userid) {
    $('#userTimesheet').show();
    $('#employees').hide();
  }

  $.ajax({
    url: "./php/main.php?module=kissklock&action=validateUser&id=".concat(empid)
  }).done(function (user) {
    if (user.empname) {
      // TODO: show application
      $('#username').html(user.empname);
      empSite = user.site;
      timezone = user.timezone, deltasonic = user.deltasonic;
      buildTable();
      makeTimesheet();
    } else {
      iziToast.warning({
        title: 'Couldn\'t find user',
        message: "".concat(empid, " is not a valid employee id, Please try again!.")
      });
    }
  });
  return false;
};

$('#addTimeslot').on('click', function () {
  $('#modal-title').html('Add Timeslot');
  $('#typefield').show();
  $('#punchintime').data("DateTimePicker").date(moment().hour(9).minute(0).second(0));
  $('#punchingout').hide();
  $('.adding').show();
  $('#modal-button').html('<button type="button" class="btn btn-primary" onclick="addTimeslot()" data-dismiss="modal">Add Timeslot</button>');
  $('#timesheetModal').modal('show');
});

var fullday = function fullday() {
  $('#selectHours').val(8);
};

var halfday = function halfday() {
  $('#selectHours').val(4);
};

var addTimeslot = function addTimeslot() {
  var minutes = $('#selectHours').val().split('.')[1] > 0 ? 60 / (100 / $('#selectHours').val().split('.')[1]) : 0;
  $.ajax({
    url: "./php/main.php",
    method: 'post',
    data: {
      userid: empid,
      punchintime: moment($('#punchintime').data("DateTimePicker").date()).utc().unix(),
      punchouttime: moment($('#punchintime').data("DateTimePicker").date()).add($('#selectHours').val().split('.')[0], 'hours').minutes(Math.round(minutes)).utc().unix(),
      timezone: timezone,
      empSite: empSite,
      type: $('#type').val(),
      action: 'addTimeslot',
      module: 'admin'
    }
  }).done(function (data) {
    ga('send', 'event', 'addTimeslot', empid, 'type', $('#type').val());
    iziToast.success({
      title: 'Success',
      message: "Timeslot successfully created."
    });
    getTimesheet();
  });
};

var makeEdit = function makeEdit(row) {
  timeslot = $(row).data();
  $('#modal-title').html('Edit Timeslot');
  $('#typefield').hide();
  $('#modal-button').html('<button type="button" class="btn btn-primary" onclick="saveChange()" data-dismiss="modal">Save changes</button>');
  $('#punchintime').data("DateTimePicker").date(moment.unix(timeslot.in).tz(timeslot.timezone));
  $('#punchouttime').data("DateTimePicker").date(timeslot.out ? moment.unix(timeslot.out).tz(timeslot.timezone) : null);
  $('#punchingout').show();
  $('.adding').hide();
  $('#timesheetModal').modal('show');
};

var saveChange = function saveChange() {
  var punchintime = $('#punchintime').data("DateTimePicker").date(),
      punchouttime = $('#punchouttime').data("DateTimePicker").date();

  if (punchintime.hours() != moment.unix(timeslot.in).tz(timeslot.timezone).hours() && timeslot.timezone == 'America/Chicago') {
    punchintime.add(1, 'hours');
  }

  if (punchouttime && punchouttime.hours() != moment.unix(timeslot.out).tz(timeslot.timezone).hours() && timeslot.timezone == 'America/Chicago') {
    punchouttime.add(1, 'hours');
  }

  $.ajax({
    url: "./php/main.php",
    method: 'post',
    data: {
      timeid: timeslot.id,
      oldin: timeslot.in,
      punchintime: punchintime.unix(),
      oldout: timeslot.out,
      punchouttime: punchouttime ? punchouttime.unix() : null,
      timenow: moment().unix(),
      action: 'editTimeslot',
      module: 'admin'
    }
  }).done(function (data) {
    ga('send', 'event', 'editTimeslot', empid);
    iziToast.success({
      title: 'Success',
      message: "".concat(data.result)
    });
    getTimesheet();
  });
};

var addLunchslot = function addLunchslot(row) {
  var timeslot = $(row).data(),
      breakHour = timezone == 'America/New_York' ? 12 : 13;
  $.ajax({
    url: "./php/main.php",
    method: 'post',
    data: {
      userid: empid,
      punchintime: moment.unix(timeslot.out).hour(13).minutes(0).unix(),
      punchouttime: moment.unix(timeslot.out).subtract(timezone == 'America/New_York' ? 0 : 1, 'hours').unix(),
      timezone: timezone,
      empSite: empSite,
      type: 0,
      action: 'addTimeslot',
      module: 'admin'
    }
  }).done(function (data) {
    $.ajax({
      url: "./php/main.php",
      method: 'post',
      data: {
        timeid: timeslot.id,
        oldin: timeslot.in,
        punchintime: timeslot.in,
        oldout: timeslot.out,
        punchouttime: moment.unix(timeslot.out).hour(breakHour).minutes(30).unix(),
        timenow: moment().unix(),
        action: 'editTimeslot',
        module: 'admin'
      }
    }).done(function (data) {
      ga('send', 'event', 'addLunchslot', empid);
      iziToast.success({
        title: 'Success',
        message: "Lunch punch slot successfully created."
      });
      getTimesheet();
    });
  });
};

var deleteTimeslot = function deleteTimeslot(row) {
  var timeid = $(row).data('id');
  $.ajax({
    url: "./php/main.php",
    method: 'post',
    data: {
      timeid: timeid,
      action: 'deleteTimeslot',
      module: 'admin'
    }
  }).done(function (data) {
    ga('send', 'event', 'deleteTimeslot', empid);
    iziToast.success({
      title: 'Success',
      message: "Timeslot has been deleted"
    });
    getTimesheet();
  });
}; // Edit Users Tab


$('#removeUser').on('click', function () {
  var data = {
    module: 'admin',
    action: 'removeUser',
    employeeID: $('#employeeid').val().split('.')[0]
  };
  $.ajax({
    url: "./php/main.php",
    method: 'post',
    data: data
  }).done(function (data) {
    iziToast.success({
      title: 'Sucess',
      message: "User removed"
    });
  });
});
$('#saveUser').on('click', function () {
  var data = {
    module: 'admin',
    action: 'saveUser',
    employeeID: $('#employeeid').val().split('.')[0],
    employeeName: $('#uName').val(),
    deltasonic: $('#uDeltasonic').val(),
    companyCode: $('#uCode').val(),
    job: $('#uJob').val(),
    supervisor: $('#uSupervisor').val().split('.')[0],
    timezone: $('#uTimezone').val(),
    holidays: $('#uHoliday').val(),
    weekends: $('#weekends').is(':checked') == true ? 1 : 0,
    nights: $('#nights').is(':checked') == true ? 1 : 0,
    alerts: $('#alerts').is(':checked') == true ? 1 : 0,
    canCallIn: $('#canCallIn').is(':checked') == true ? 1 : 0,
    field: $('#field').is(':checked') == true ? 1 : 0
  };

  if (!$('#employeeid').val().split('.')[1]) {
    data['action'] = 'addUser';
    $.ajax({
      url: "./php/main.php",
      method: 'post',
      data: data
    }).done(function (data) {
      iziToast.success({
        title: 'Success',
        message: "User Added"
      });
    });
  } else {
    data['action'] = 'saveUser';
    $.ajax({
      url: "./php/main.php",
      method: 'post',
      data: data
    }).done(function (data) {
      iziToast.success({
        title: 'Success',
        message: "User saved"
      });
    });
  }
}); // Edit Supervisors Tab

$('#removeSupervisor').on('click', function () {
  var data = {
    module: 'admin',
    action: 'removeSupervisor',
    employeeID: $('#supervisorid').val().split('.')[0]
  };
  $.ajax({
    url: "./php/main.php",
    method: 'post',
    data: data
  }).done(function (data) {
    iziToast.success({
      title: 'Couldn\'t find user',
      message: "Supervisor Removed"
    });
  });
});
$('#saveSupervisor').on('click', function () {
  var data = {
    module: 'admin',
    action: 'addSupervisor',
    employeeID: $('#supervisorid').val().split('.')[0],
    name: $('#sName').val(),
    email: $('#sEmail').val()
  };

  if (!$('#supervisorid').val().split('.')[1]) {
    data['action'] = 'addSupervisor';
    $.ajax({
      url: "./php/main.php",
      method: 'post',
      data: data
    }).done(function (data) {
      iziToast.success({
        title: 'Success',
        message: "Supervisor added."
      });
    });
  } else {
    data['action'] = 'saveSupervisor';
    $.ajax({
      url: "./php/main.php",
      method: 'post',
      data: data
    }).done(function (data) {
      iziToast.success({
        title: 'Success',
        message: "Supervisor saved"
      });
    });
  }
});

function back() {
  $('#userTimesheet').hide();
  $('#employees').show();
}

$(document).ready(function () {
  // Javascript letiables
  var startDate;
  var endDate;
  var timeslots,
      days,
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
      fridayBreaks = 0; // HTML Elements

  var $timesheet = $('#timesheetTable');
  var $totalHours = $('#totalHours'); // Autocomplete Searchboxes

  $.ajax({
    url: "./php/main.php?module=admin&action=".concat(isLocation ? 'getEmployeesByLocation' : 'getEmployees')
  }).done(function (users) {
    var options = {
      data: users,
      getValue: function getValue(user) {
        return user.employeeid + '. ' + user.employeename;
      },
      theme: "blue-light",
      list: {
        match: {
          enabled: true
        },
        onChooseEvent: function onChooseEvent() {
          var employee = $("#employeeID").getSelectedItemData();
          getTimesheet(employee.employeeid);
        }
      }
    };
    allUsers = users;
    allUsers.forEach(function (user) {
      $('#supervisorEmployees').append("\n\t\t\t\t<option id=\"".concat(user.employeeid, "\" value=").concat(user.employeeid, ">").concat(user.employeename, "</option>\n\t\t\t"));
    });
    $("#employeeID").easyAutocomplete(options);
    $('.easy-autocomplete-container').css('z-index', 3);
    $.ajax({
      url: "./php/main.php?module=admin&action=getSupervisors"
    }).done(function (supervisors) {
      var options = {
        data: supervisors,
        getValue: function getValue(supervisor) {
          return supervisor.employeeid + '. ' + supervisor.name;
        },
        theme: "blue-light",
        list: {
          match: {
            enabled: true
          },
          onChooseEvent: function onChooseEvent() {
            var supervisor = $("#supervisorid").getSelectedItemData();
            $('#sName').val(supervisor.name);
            $('#sEmail').val(supervisor.email); // Get a faster route removing user hours

            $.ajax({
              url: "./php/main.php?module=admin&action=getMyEmployees&empid=".concat(supervisor.employeeid)
            }).done(function (employees) {
              console.log(employees);
              $("#supervisorEmployees").val(employees.map(function (employee) {
                return employee.id;
              }));
              $("#supervisorEmployees").trigger("chosen:updated");
            });
          }
        }
      };
      $("#supervisorid").easyAutocomplete(options);
      $("#uSupervisor").easyAutocomplete(options);
      $('.easy-autocomplete-container').css('z-index', 3);
      $("#supervisorEmployees").chosen().change(function (data, change) {
        if ($('#supervisorid').val().split('.')[0]) {
          if (change.selected) {
            // Change supervisor to me
            data = {
              module: 'admin',
              action: 'addEmployeeToSupervisor',
              employeeID: change.selected,
              supervisor: $('#supervisorid').val().split('.')[0]
            };
          } else {
            // Remove me as supervisor
            data = {
              module: 'admin',
              action: 'addEmployeeToSupervisor',
              employeeID: change.deselected,
              supervisor: null
            };
          }

          $.ajax({
            url: "./php/main.php",
            method: 'post',
            data: data
          }).done(function (data) {
            iziToast.success({
              title: 'Success',
              message: "User supervisor changed."
            });
          });
        }
      });
    });
  });
  $.ajax({
    url: "./php/main.php?module=admin&action=".concat(isLocation ? 'getEmployeesByLocation' : 'getEmployees')
  }).done(function (users) {
    var options = {
      data: users,
      getValue: function getValue(user) {
        return user.employeeid + '. ' + user.employeename;
      },
      theme: "blue-light",
      list: {
        match: {
          enabled: true
        },
        onChooseEvent: function onChooseEvent() {
          var employee = $("#employeeid").getSelectedItemData();
          populateCodeDropdown({
            target: {
              value: employee.deltasonic
            }
          });
          $('#uEmployeeid').val(employee.employeeid);
          $('#uName').val(employee.employeename);
          $('#uDeltasonic').val(employee.deltasonic);
          $('#uCode').val(employee.companycode);
          $('#uJob').val(employee.job);
          $('#uSupervisor').val("".concat(employee.supervisor, ". ").concat(employee.name));
          $('#uTimezone').val(employee.timezone), $('#uHoliday').val(employee.holidays);
          $('#weekends').prop('checked', employee.weekends == 1 ? true : false);
          $('#nights').prop('checked', employee.nights == 1 ? true : false);
          $('#alerts').prop('checked', employee.alerts == 1 ? true : false);
          $('#canCallIn').prop('checked', employee.canCallIn == 1 ? true : false);
          $('#field').prop('checked', employee.field == 1 ? true : false);
        }
      }
    };
    $("#employeeid").easyAutocomplete(options);
  });
  $('#uDeltasonic').on('change', function (e) {
    populateCodeDropdown(e);
  });

  var populateCodeDropdown = function populateCodeDropdown(e) {
    if (e.target.value == 1) {
      $('#uCode').html("\n\t\t\t\t<option value=\"DSCW\">DSCW</option>\n\t\t\t");
    } else {
      $('#uCode').html("\n\t\t\t\t<option value=\"BDLLC\">BDLLC</option>\n\t\t\t\t<option value=\"BROCH\">BROCH</option>\n\t\t\t");
    }
  };

  $('#runReport').on('click', function () {
    $.ajax({
      url: "./php/main.php?module=admin&action=runReport&report=".concat($('#reportsDropdown').val(), "&startDate=").concat($('#startDate').data("DateTimePicker").date().unix(), "&endDate=").concat($('#endDate').data("DateTimePicker").date().unix())
    }).done(function (user) {
      console.log(user);
    });
  }); // Functions

  buildTable = function buildTable() {
    $timesheet.empty();

    if (deltasonic) {
      days = [[$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday'], [$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday'], [$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday'], [$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday'], [$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday'], [$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday'], [$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday']];
    } else {
      days = [[$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday'], [$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday'], [$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday'], [$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday'], [$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday'], [$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday'], [$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday']];
    }

    if ((isManager && isLocation || isPayroll) && empid != myEmpid) {
      //$('#back').hide()
      $('#addTimeslot').show();
    } else {
      $('#addTimeslot').hide();
    }

    endDate = $('#end').data("DateTimePicker").date().weekday(deltasonic ? 5 : 6).hour(23).minute(59);
    startDate = $('#end').data("DateTimePicker").date().weekday(deltasonic ? -1 : 0).hour(0).minute(0);
    $('#startDate').html(startDate.format('M/D/YYYY'));
    $('#endDate').html(endDate.format('M/D/YYYY'));
    days.forEach(function (day, index) {
      if ((isManager && isLocation || isPayroll) && empid != myEmpid) {
        $timesheet.append("\n\t\t\t\t\t<tr class=\"active headers\">\n\t\t\t\t\t\t<th style=\"width: 15%;\">Date</th>\n\t\t\t\t\t\t<th style=\"width: 15%;\">Role</th>\n\t\t\t\t\t\t<th style=\"width: 20%;\">Check In</th>\n\t\t\t\t\t\t<th style=\"width: 20%;\">Check Out</th>\n\t\t\t\t\t\t<th style=\"width: 10%;\">Hours</th>\n\t\t\t\t\t\t<th style=\"width: 20%;\">Actions</th>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr id=\"".concat(day[4], "\" class=\"timeslots\">\n\t\t\t\t\t\t<td>").concat($('#end').data("DateTimePicker").date().weekday(deltasonic ? index - 1 : index).format('dddd, MMM Do'), "</td>\n\t\t\t\t\t\t<td>- -</td>\n\t\t\t\t\t\t<td>- -</td>\n\t\t\t\t\t\t<td>- -</td>\n\t\t\t\t\t\t<td>0</td>\n\t\t\t\t\t\t<td></td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr class=\"timeslots\">\n\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t<td id=\"").concat(day[4], "Hours\" class=\"info\"><b>0</b></td>\n\t\t\t\t\t\t<td></td>\n\t\t\t\t\t</tr>\n\t\t\t\t"));
      } else {
        $timesheet.append("\n\t\t\t\t\t<tr class=\"active headers\">\n\t\t\t\t\t\t<th style=\"width: 25%;\">Date</th>\n\t\t\t\t\t\t<th style=\"width: 25%;\">Check In</th>\n\t\t\t\t\t\t<th style=\"width: 25%;\">Check Out</th>\n\t\t\t\t\t\t<th style=\"width: 25%;\">Hours</th>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr id=\"".concat(day[4], "\" class=\"timeslots\">\n\t\t\t\t\t\t<td>").concat($('#end').data("DateTimePicker").date().weekday(deltasonic ? index - 1 : index).format('dddd, MMM Do'), "</td>\n\t\t\t\t\t\t<td>- -</td>\n\t\t\t\t\t\t<td>- -</td>\n\t\t\t\t\t\t<td>0</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t\t<tr class=\"timeslots\">\n\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t<td id=\"").concat(day[4], "Hours\" class=\"info\"><b>0</b></td>\n\t\t\t\t\t</tr>\n\t\t\t\t"));
      }
    });

    if (deltasonic) {
      days = [[$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday'], [$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday'], [$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday'], [$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday'], [$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday'], [$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday'], [$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday']];
    } else {
      days = [[$('#sunday'), $('#sundayHours'), sundayHours, sundayBreaks, 'sunday'], [$('#monday'), $('#mondayHours'), mondayHours, mondayBreaks, 'monday'], [$('#tuesday'), $('#tuesdayHours'), tuesdayHours, tuesdayBreaks, 'tuesday'], [$('#wednesday'), $('#wednesdayHours'), wednesdayHours, wednesdayBreaks, 'wednesday'], [$('#thursday'), $('#thursdayHours'), thursdayHours, thursdayBreaks, 'thursday'], [$('#friday'), $('#fridayHours'), fridayHours, fridayBreaks, 'friday'], [$('#saturday'), $('#saturdayHours'), saturdayHours, saturdayBreaks, 'saturday']];
    }

    if ((isManager && isLocation || isPayroll) && empid != myEmpid) {
      $timesheet.append("\n\t\t\t\t<tr id=\"totalrow\">\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th>Total Hours</th>\n\t\t\t\t\t<th></th>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td></td>\n\t\t\t\t\t<td></td>\n\t\t\t\t\t<td></td>\n\t\t\t\t\t<td></td>\n\t\t\t\t\t<td id=\"totalHours\" class=\"info\"><b>0</b></td>\n\t\t\t\t\t<th></th>\n\t\t\t\t</tr>\n\t\t\t");
    } else {
      $timesheet.append("\n\t\t\t\t<tr id=\"totalrow\">\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th>Total Hours</th>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td></td>\n\t\t\t\t\t<td></td>\n\t\t\t\t\t<td></td>\n\t\t\t\t\t<td id=\"totalHours\" class=\"info\"><b>0</b></td>\n\t\t\t\t</tr>\n\t\t\t");
    }

    $('#userTimesheet').show();
  };

  makeTimesheet = function makeTimesheet() {
    $('#loader').addClass('loader');
    totalTime = 0;
    $.ajax({
      url: "./php/main.php?module=admin&action=getEmployeeHours",
      data: {
        empid: empid,
        startDate: startDate.hour(0).minute(0).format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
      }
    }).done(function (currentTimeslots) {
      timeslots = currentTimeslots.timeslots;
      $('#loader2').hide();
      var hours = 0,
          roles = currentTimeslots.roles;
      timeslots.forEach(function (timeslot, index) {
        var hoursSum = 0,
            weekday = moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday() === 6 ? -1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday(),
            $htmlDay = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][0],
            $htmlhours = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][1],
            breakSum = days[deltasonic ? weekday + 1 : moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).weekday()][3];

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
          addRow($htmlDay, timeslot, hoursSum, roles);
          $htmlDay.attr('clocked', true);
        } else {
          addRow($htmlDay, timeslot, hoursSum, roles);
        }

        $htmlhours.html("<b>".concat(days[weekday + 1][2].toFixed(2), "</b>"));
        $("td#totalHours.info").html("<b>".concat(totalTime.toFixed(2), "</b>"));
      });
      $('.roles').on('change', function (e) {
        $.ajax({
          url: './php/main.php',
          method: 'post',
          data: {
            module: 'admin',
            action: 'changeTimeslotRole',
            empid: empid,
            timeid: $(e.target).data('timeid'),
            role: e.target.value
          }
        }).success(function () {
          iziToast.success({
            title: 'Success',
            message: "Timeslot saved"
          });
        }).fail(function () {
          iziToast.error({
            title: 'Error',
            message: "Error saving timeslot"
          });
        });
      });
    });
  };

  function addRow($element, timeslot, sum, roles) {
    $("\n                <tr class=\"timeslots\">\n                    <td>".concat(!$element.attr('clocked') || $element.attr('clocked') === 'false' ? moment.unix(timeslot.created).format('dddd, MMM Do') : '', "</td>\n\t\t\t\t\t").concat((isManager && isLocation || isPayroll) && empid != myEmpid ? "<td>\n\t\t\t\t\t\t\t\t<select class=\"form-control roles\" data-timeid=\"".concat(timeslot.timeid, "\">\n\t\t\t\t\t\t\t\t\t").concat(roles.map(function (r) {
      return "<option value=".concat(r.job_code, " ").concat(timeslot.roleId == r.job_code ? 'selected' : '', ">").concat(r.job_desc, "</option>");
    }), "\n\t\t\t\t\t\t\t\t  </select>\n\t\t\t\t\t\t\t</td>") : '', "\n                    <td class=\"").concat(timeslot.insource == 2 ? 'warning' : '', " ").concat(timeslot.overBreak ? 'red' : '', " ").concat(timeslot.typeid == 1 ? 'vacation' : '', " ").concat(timeslot.typeid == 2 ? 'pto' : '', "\">\n\t\t\t\t\t\t").concat(timeslot.punchintime ? moment.unix(timeslot.punchintime).tz(timeslot.punchintimezone).format('h:mm a') : '00:00 AM', " ").concat(timeslot.insource == 2 ? '*' : '', "\n\t\t\t\t\t</td>\n                    <td class=\"").concat(timeslot.outsource == 2 ? 'warning' : '', "  ").concat(timeslot.typeid == 1 ? 'vacation' : '', " ").concat(timeslot.typeid == 2 ? 'pto' : '', "\">\n\t\t\t\t\t\t").concat(timeslot.punchouttime ? moment.unix(timeslot.punchouttime).tz(timeslot.punchouttimezone).format('h:mm a') : '- -', "\n\t\t\t\t\t</td>\n                    <td class=").concat(sum.toFixed(2) > 6 ? 'red' : '', ">\n\t\t\t\t\t\t").concat(sum.toFixed(2), "\n\t\t\t\t\t\t").concat(timeslot.userid == timeslot.lasteditedby && timeslot.typeid == 0 ? '' : '<button class="btn btn-defaults btn-xs" id=' + timeslot.timeid + 'info><i class="glyphicon glyphicon-info-sign"></i></button>', "\n\t\t\t\t\t</td>\n\t\t\t\t\t").concat((isManager && isLocation || isPayroll) && empid != myEmpid ? "<td>\n\t\t\t\t\t\t\t\t<button class=\"btn btn-danger btn-small\" onclick='deleteTimeslot(this)' data-id=".concat(timeslot.timeid, "\n\t\t\t\t\t\t\t\tdata-toggle=\"tooltip\" data-placement=\"top\" title=\"Delete timeslot\"\n\t\t\t\t\t\t\t\t><i class=\"glyphicon glyphicon-remove\"></i></button>\n\t\t\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-default btn-small\" onclick='makeEdit(this)'\n\t\t\t\t\t\t\t\t\tdata-toggle=\"tooltip\" data-placement=\"top\" title=\"Edit timeslot\"\n\t\t\t\t\t\t\t\t\tdata-id=").concat(timeslot.timeid, "\n\t\t\t\t\t\t\t\t\tdata-in=").concat(timeslot.punchintime, "\n\t\t\t\t\t\t\t\t\tdata-out=").concat(timeslot.punchouttime, "\n\t\t\t\t\t\t\t\t\tdata-timezone=").concat(timeslot.punchintimezone, "><i class=\"glyphicon glyphicon-pencil\"></i></button>\n\t\t\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-default btn-small\" onclick='addLunchslot(this)'\n\t\t\t\t\t\t\t\t\tdata-toggle=\"tooltip\" data-placement=\"top\" title=\"Create Lunchpunch\"\n\t\t\t\t\t\t\t\t\tdata-id=").concat(timeslot.timeid, "\n\t\t\t\t\t\t\t\t\tdata-in=").concat(timeslot.punchintime, "\n\t\t\t\t\t\t\t\t\tdata-out=").concat(timeslot.punchouttime, "><i class=\"glyphicon glyphicon-apple\"></i></button>\n\t\t\t\t\t\t\t</td>") : '', "\n                </tr>\n            ")).insertBefore($element);
    setPopover(timeslot.timeid);
    $('.datetime').datetimepicker();
  }

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
              html += "\n\t\t\t\t\t\t\t\t\t<p>Check in changed from <b>".concat(moment.unix(c.oldintime).format('h:mm a'), "</b> to <b>").concat(moment.unix(c.newintime).format('h:mm a'), "</b></p>\n\t\t\t\t\t\t\t\t");
            }
          } else if (c.oldouttime !== c.newouttime) {
            if (c.editedby == "99999") {
              html += '<p>You were autosigned out at midnight</p>';
            } else {
              html += "\n\t\t\t\t\t\t\t\t\t<p>Check out changed from <b>".concat(moment.unix(c.oldouttime).format('h:mm a'), "</b> to <b>").concat(moment.unix(c.newouttime).format('h:mm a'), "</b></p>\n\t\t\t\t\t\t\t\t");
            }
          }
        });
      }

      $("#".concat(id, "info")).popover({
        template: "<div id=".concat(id, " class=\"popover\" role=\"tooltip\">\n\t\t\t\t\t\t\t<div class=\"arrow\"></div>\n\t\t\t\t\t\t\t<h3 class=\"popover-title\"></h3>\n\t\t\t\t\t\t\t<div class=\"popover-content\"></div>\n\t\t\t\t\t\t</div>"),
        html: true,
        container: "#".concat(id, "info"),
        title: 'Change Log',
        content: html
      });
      $("#".concat(id, "info")).on('click', function () {
        ga('send', 'event', 'Timeclock', 'showChangeLog');
        $("#".concat(id)).popover('show');
      });
      $(".popover").on('show.bs.popover', function () {
        setTimeout(function () {
          $("#".concat(id)).popover('hide');
        }, 2000);
      });
    });
  }

  $('#end').on('dp.change', function () {
    if (empid) {
      buildTable();
      getTimesheet();
    }
  });
  $('#dateFilter').on('dp.change', function () {
    getDateRange($('#dateFilter').data("DateTimePicker").date().weekday(5).hour(23).minute(59).format("M/D/Y"), true);
    displayDateRange();
    getTips();
  });

  var getInitialState = function getInitialState() {
    if (isLocation) {
      $('#employees').toggle();
      $('#employeesLoader').toggle();
      $.ajax({
        url: "./php/main.php?module=admin&action=getLocationEmployees"
      }).done(function (employees) {
        if (employees && employees.length > 0) {
          var active = 0,
              nonActive = 0,
              booth = 0,
              power = 0,
              wash = 0,
              managers = 0,
              other = 0;
          employees.forEach(function (e) {
            if (e.todayHours) {
              var r = e.role.toLowerCase();
              e.hoursWorked = (e.hoursWorked / 60).toFixed(2);
              e.todayHours = (e.todayHours / 60).toFixed(2);
              e.breakTime = (e.breakTime / 60).toFixed(2);

              if (!e.workingNow) {
                active++;
                $('#workedTable').append("\n\t\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t\t<td>".concat(active, "</td>\n\t\t\t\t\t\t\t\t\t\t<td>").concat(e.todayHours, "</td>\n\t\t\t\t\t\t\t\t\t\t<td>").concat(e.name, "</td>\n\t\t\t\t\t\t\t\t\t\t<td>").concat(e.breakTime, "</td>\n\t\t\t\t\t\t\t\t\t\t<td><a class=\"btn btn-default\" onclick=\"getTimesheet(").concat(e.id, ")\">View Timesheet</a></td>\n\t\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t"));
              } else {
                if (r.match(/power|program/g)) {
                  power++;
                  $('#powerTable').append("\n\t\t\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t\t\t<td>".concat(moment.unix(e.startTime).format('h:mm a'), "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.name, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.todayHours, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.hoursWorked, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.breakTime, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.isMinor ? '<i class="fas fa-child"></i>' : '', "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.role, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td><a class=\"btn btn-default\" onclick=\"getTimesheet(").concat(e.id, ")\">View Timesheet</a></td>\n\t\t\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t\t"));
                } else if (r.match(/bd|advisor/g)) {
                  booth++;
                  $('#boothTable').append("\n\t\t\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t\t\t<td>".concat(moment.unix(e.startTime).format('h:mm a'), "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.name, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.todayHours, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.hoursWorked, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.breakTime, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.isMinor ? '<i class="fas fa-child"></i>' : '', "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.role, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td><a class=\"btn btn-default\" onclick=\"getTimesheet(").concat(e.id, ")\">View Timesheet</a></td>\n\t\t\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t\t"));
                } else if (r.match(/wash t/g)) {
                  wash++;
                  $('#washTable').append("\n\t\t\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t\t\t<td>".concat(moment.unix(e.startTime).format('h:mm a'), "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.name, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.todayHours, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.hoursWorked, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.breakTime, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.isMinor ? '<i class="fas fa-child"></i>' : '', "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.role, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td><a class=\"btn btn-default\" onclick=\"getTimesheet(").concat(e.id, ")\">View Timesheet</a></td>\n\t\t\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t\t"));
                } else if (r.match(/manager|supervisor/g)) {
                  managers++;
                  $('#managementTable').append("\n\t\t\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t\t\t<td>".concat(moment.unix(e.startTime).format('h:mm a'), "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.todayHours, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.name, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.hasBreak ? '<i class="fas fa-check"></i>' : '', "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td><a class=\"btn btn-default\" onclick=\"getTimesheet(").concat(e.id, ")\">View Timesheet</a></td>\n\t\t\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t\t"));
                } else {
                  other++;
                  $('#otherTable').append("\n\t\t\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t\t\t<td>".concat(e.todayHours, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.name, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td>").concat(e.role, "</td>\n\t\t\t\t\t\t\t\t\t\t\t<td><a class=\"btn btn-default\" onclick=\"getTimesheet(").concat(e.id, ")\">View Timesheet</a></td>\n\t\t\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t\t"));
                }
              }
            } else {
              nonActive++;
              $('#totalTable').append("\n\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t<td>".concat(nonActive, "</td>\n\t\t\t\t\t\t\t\t\t<td>").concat(e.todayHours, "</td>\n\t\t\t\t\t\t\t\t\t<td>").concat(e.name, "</td>\n\t\t\t\t\t\t\t\t\t<td>").concat(e.hasBreak ? '<i class="fas fa-check"></i>' : '', "</td>\n\t\t\t\t\t\t\t\t\t<td><a class=\"btn btn-default\" onclick=\"getTimesheet(").concat(e.id, ")\">View Timesheet</a></td>\n\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t"));
            }
          });
          $('#boothCount').text(booth);
          $('#powerCount').text(power);
          $('#washCount').text(wash);
          $('#managersCount').text(managers);
          $('#otherCount').text(other);
          $('#workingCount').text(booth + power + wash + managers + other);
          $('#activeCount').text(active);
          $('#nonActiveCount').text(nonActive);
        } else {
          $('#employees').html('No Employees found for you');
        }

        $('#employees').toggle();
        $('#employeesLoader').toggle();
      });
    } else {
      var dashboard;
      dashboard = $('#dashboardTable').DataTable({
        "ajax": "./php/main.php?module=admin&action=".concat(isLocation ? 'getLocationEmployees' : 'getMyEmployees'),
        "destroy": true,
        "searching": true,
        fixedColumns: false,
        pageLength: 100,
        "columns": [{
          "data": "name",
          "render": function render(data, type, row) {
            return row.isMinor ? data + ' <i class="fas fa-child"></i>' : data;
          }
        }, {
          "data": "role",
          render: function render(data, type, row) {
            return data ? data + ' <span class="badge badge-primary">' + row.hoursWorked.toFixed(2) + '</span>' : '';
          }
        }, {
          "data": "hasBreak",
          render: function render(data) {
            return data ? '<i class="fas fa-check"></i>' : '';
          }
        }, {
          "data": "todayHours",
          render: function render(data) {
            return data.toFixed(2);
          }
        }, {
          "data": "thisWeekHours",
          render: function render(data) {
            return data.toFixed(2);
          }
        }, {
          "data": "lastWeekHours",
          render: function render(data) {
            return data.toFixed(2);
          }
        }, {
          "data": "thisWeekHours",
          render: function render(data, row) {
            return (40 - data).toFixed(2);
          }
        }, {
          "data": "id",
          render: function render(data) {
            return "<a class=\"btn btn-default\" onclick=\"getTimesheet(".concat(data, ")\">View Timesheet</a>");
          }
        }],
        "order": [[1, "desc"]]
      });
    }
  };

  if (isManager) getInitialState();
  var now = new Date();
  var nowStr = parseInt(now.getMonth()) + 1 + "/" + now.getDate() + "/" + now.getFullYear();
  getDateRange(nowStr, false);
  displayDateRange();
  getTips();
});

function getTips() {
  glbDataTable = $('#tipContainer').DataTable({
    "createdRow": function createdRow(row, data, dataIndex) {
      if (data[3] > 0 && data[8] == 0 && data[1] != moment().format("MM/DD/Y")) {
        $(row).addClass("suspect");
      }
    },
    dom: 'Blfrtip',
    buttons: [{
      extend: "csv",
      exportOptions: {
        columns: [0, 1, 2, 3, 4, 5, 6, 7, 8]
      }
    }, {
      extend: "excel",
      exportOptions: {
        columns: [0, 1, 2, 3, 4, 5, 6, 7, 8]
      }
    }],
    "ajax": "./php/getTips.php?startDate=" + calSelectStartDate.getTime() / 1000 + "&endDate=" + calSelectEndDate.getTime() / 1000,
    "destroy": true,
    "searching": true,
    "columnDefs": [{
      "targets": 0,
      "width": "200px"
    }, // name
    {
      "targets": 1,
      "width": "135px",
      "type": "date"
    }, // date
    {
      "targets": 5,
      "width": "100px"
    }, {
      "targets": [3, 4, 6, 7, 8],
      "width": "125px",
      "type": "num",
      render: $.fn.dataTable.render.number(',', '.', 2) // tips

    }],
    fixedColumns: false,
    "order": [[1, "desc"]],
    "lengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]]
  });
  var data = glbDataTable.buttons.exportData({
    columns: ':visible'
  });
}

function reviewTip(obj, num) {
  $.ajax({
    url: "./php/reviewTip.php",
    data: {
      id: num
    }
  }).done(function (data) {
    var success = false;

    if (typeof data[0] != 'undefined') {
      if (typeof data[0]['status'] != 'undefined') {
        if (typeof data[0]['status'] != 'success') {
          success = true;
        }
      }
    }

    if (success) {
      $(obj).parent().html(data[0]['reviewName']);
    } else {}
  });
}

function displayDateRange() {
  $("#dateRangeDisplay").html("Showing for date range: " + (calSelectStartDate.getMonth() + 1) + "/" + calSelectStartDate.getDate() + "/" + calSelectStartDate.getFullYear() + "  -  " + (calSelectEndDate.getMonth() + 1) + "/" + calSelectEndDate.getDate() + "/" + calSelectEndDate.getFullYear());
}

var remove_obj = '';
var remove_num = '';
var remove_empnum = '';
var remove_date = '';

function removeTip(obj, num, empnum, date) {
  remove_obj = obj;
  remove_num = num;
  remove_empnum = empnum;
  remove_date = date;
  $("#removeTipModal").modal("show");
}

function confirmRemoveTip() {
  $.ajax({
    url: "./php/removeTip.php",
    data: {
      "num": remove_num,
      "empnum": remove_empnum,
      "date": remove_date
    }
  }).done(function (data) {
    remove_obj = '';
    remove_num = '';
    remove_empnum = '';
    remove_date = '';
    glbDataTable.ajax.reload();
    $("#removeTipModal").modal("hide");
  });
} //dateStr = mm/dd/yyyy


function getDateRange(dateStr, boolStyle) {
  /*
  DOW (payroll week = 6 - 5):
  0 - sun
  6 - sat
  	*/
  var dateArray = dateStr.split("/");
  var year = dateArray[2];
  var month = dateArray[0];
  var day = dateArray[1];
  var epoch = Date.parse(year + '/' + month + '/' + day);
  var date = new Date(epoch);
  var oneDay = 24 * 60 * 60 * 1000;
  var dow = date.getDay();
  var daysTillStart = 0;
  var daysTillEnd = 0;

  switch (dow) {
    case 0:
      //Sunday
      daysTillStart = -1;
      daysTillEnd = 5;
      break;

    case 1:
      //Monday
      daysTillStart = -2;
      daysTillEnd = 4;
      break;

    case 2:
      //Tuesday
      daysTillStart = -3;
      daysTillEnd = 3;
      break;

    case 3:
      //Wednesday
      daysTillStart = -4;
      daysTillEnd = 2;
      break;

    case 4:
      //Thursday
      daysTillStart = -5;
      daysTillEnd = 1;
      break;

    case 5:
      //Friday
      daysTillStart = -6;
      daysTillEnd = 0;
      break;

    case 6:
      //Saturday
      daysTillStart = 0;
      daysTillEnd = 6;
      break;

    default:
      break;
  }

  calSelectStartDate = new Date(epoch + oneDay * daysTillStart);
  calSelectEndDate = new Date(epoch + oneDay * daysTillEnd);

  if (boolStyle) {
    $(".adminCalWeekHighlight").removeClass("adminCalWeekHighlight");
    var tmpEpoch = calSelectStartDate.getTime();
    var tmpDate = '';

    while (tmpDate < calSelectEndDate.getTime()) {
      tmpDate = new Date(tmpEpoch);
      var calObj = $(".xdsoft_date[data-date=" + tmpDate.getDate() + "][data-month=" + tmpDate.getMonth() + "][data-year=" + tmpDate.getFullYear() + "]")[0];
      $(calObj).addClass("adminCalWeekHighlight");
      tmpEpoch += oneDay;
    }
  }
}