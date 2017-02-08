<?php   include_once "./layouts/header.php"; ?>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.13/js/jquery.dataTables.min.js"></script>
    <script src="./js/timesheet.js"></script>
</head>

<body>
    <div class="panel panel-primary container">
        <div class="panel-heading">
            <p class="text-center"><img src="../CognosReports/images/delta_logo.png" width="150px" /></p>
            <h2 class="text-center">Check In Clock</h2>
        </div>
        <div class="panel-body">
            <div style="float: left">
                <h2><?php echo USER::getFullName(); ?> Timesheet for Week of <span id="startDate"></span> - <span id="endDate"></span></h2>
            </div>
            <div style="float: right">
                <a href="./" class="btn btn-primary" role="button">
			Sign Out
                </a>
                <a href="../ApplicationPortal/dashboard.php" class="btn btn-primary" role="button">Dashboard</a>
            </div>

        <table id="timesheet" class="table table-condensed">
            <tr id="saturday">
            </tr>

            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td id="saturdayHours" class="info"></td>
            </tr>

            <tr id="sunday">
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td id="sundayHours" class="info"></td>
            </tr>

            <tr id="monday">
            </tr>

            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td id="mondayHours" class="info"></td>
            </tr>

            <tr id="tuesday">
            </tr>

            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td id="tuesdayHours" class="info"></td>
            </tr>

            <tr id="wednesday">
            </tr>

            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td id="wednesdayHours" class="info"></td>
            </tr>



            <tr id="thursday">
            </tr>

            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td id="thursdayHours" class="info"></td>
            </tr>



            <tr id="friday">
            </tr>

            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td id="fridayHours" class="info"></td>
            </tr>

            <tr>
                <th></th>
                <th></th>
                <th></th>
                <th>Total Hours</th>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td id="totalHours" class="info"><b>0</b></td>
            </tr>
        </table>

        </div>
    </div>
</body>
