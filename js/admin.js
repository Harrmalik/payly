'use strict';

$(document).ready(function(){
	//Javascript letiables
	let date = moment();

	// HTML Buttons

	// Event Listeners

	// Functions
	let getInitialState = () => {
		$.ajax({
			url: `./php/main.php?action=getEmployees`
		}).done((result) => {
			let employees = result.employees;
 employees = [{
 	id: 23112,
 	name: "Dockery Ken"
 },
 {
 	id: 25345,
 	name: "Johannes, Robert"
 },
 {
 	id: 25348,
 	name: "Reichert, Norman"
 },
 {
 	id: 25850,
 	name: "Zimmerman, James"
 },
 {
 	id: 26011,
 	name: "Donna R. Kull"
 },
 {
 	id: 28627,
 	name: "Noworyta, Stephen"
 },
 {
 	id: 80372,
 	name: "Pinkney, Jonathan"
 },
 {
 	id: 80592,
 	name: "Panepinto, Nichol"
 },
 {
 	id: 82821,
 	name: "Treat, Robert"
 }]
			if (employees.length > 0) {
				employees.forEach((employee) => {
					$('#list').append(`
						<li class="list-group-item">${employee.name} <br><a class="label label-primary" href="./timesheet.php?empid=${employee.id}" target="_blank">View Timesheet</a></li>
					`)
				});
			} else {
				$('#employees').html('You are in charge of no employees');
			}
	    });
	};

	getInitialState();
});
