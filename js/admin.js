$(document).ready(function(){
	//Javascript letiables
	let date = moment();

	// HTML Buttons

	// Event Listeners

	// Functions
	getInitialState = () => {
		$.ajax({
			url: `./php/main.php?action=getEmployees`
		}).done((result) => {
			employees = result.employees;
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
