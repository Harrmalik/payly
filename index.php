<?php include_once './layouts/header.php' ?>
        <script src="./js/main.js"></script>
</head>

<body>
    <div class="panel panel-primary container">
        <div class="panel-heading">
            <p class="text-center"><img src="../CognosReports/images/delta_logo.png" width="150px" /></p>
            <h2 class="text-center">Check In Clock</h2>
        </div>
        
        <div class="panel-body">
            <div style="float: left">
                <h2>Welcome <?php echo USER::getUsername(); ?></h2>
            </div>
            
            <div style="float: right">
                <a href="../ApplicationPortal/dashboard.php" class="btn btn-primary" role="button">Dashboard</a>
            </div>

            <section class="mainBtns">
                <button type="button" class="btn btn-primary btn-lg" id="checkIn">Check In</button>
                <button type="button" class="btn btn-primary btn-lg" id="checkOut">Check Out</button>
                <button type="button" class="btn btn-default btn-lg" id="timesheet">View Timesheet</button>
            </section>

            <h3>Today's Hours</h3>

            <table class="table">
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>

                <tbody id="todayHours">
                    <tr>
                        <td id="today"></td>
                        <td id="timeIn">00:00</td>
                        <td id="timeOut">00:00</td>
                        <td id="hours">0</td>
                    </tr>
                </tbody>
                
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
                    <td>1</td>
                </tr>
            </table>
        </div>
    </div>
</body>
