var mysql = require('mysql');
var prompt = require('prompt');
var colors = require('colors/safe');

prompt.start();

var connection = mysql.createConnection({
	host	: 'localhost',
	user	: 'root',
	password: '',
	database: 'Bamazon'
});
var prompts = {
	mainMenu: function(){
		prompt.get(prompts.schema, function(err, res){
			switch(res.action){
				case 'departments': sqlQueries.viewDepartments(); break;
				case 'new department': prompts.addDepartment(); break;
				default: prompts.mainMenu();
			}
		})
	},
	addDepartment: function(){
		prompt.get(prompts.schema2, function(err, res){
			var newDepartment = {
				DepartmentName: res.name,
				OverHeadCosts: res.overhead,
				TotalSales: res.sales
			}
			sqlQueries.addDepartment(newDepartment)
		})
	},
	schema: {
		properties: {
			action: {
				description: 'Next action',
				type: 'String',
				required: true,
				message:  'Enter an action, press enter to view commands'
			}
		}
	},
	schema2: {
		properties: {
			name: {
				description: 'Department name',
				type: 'string',
				required: true,
				message: 'Enter the name of the new department'
			},
			overhead: {
				description: 'Overhead costs',
				type: 'string',
				required: true,
				pattern: /(^[0-9]*\.[0-9][0-9]$)/i,
				message: 'Must fit format (12.34, 9999.00)'
			},
			sales: {
				description: 'Gross income from department',
				type: 'string',
				required: true,
				pattern: /(^[0-9]*\.[0-9][0-9]$)/i,
				message: 'Must fit format (12.34, 9999.00)'
			}
		}
	}
};
var sqlQueries = {
	viewDepartments: function(){
		var insert = 'SELECT DepartmentID, DepartmentName, OverHeadCosts, TotalSales AS ProductSales, (TotalSales -OverheadCosts) AS TotalProfit FROM Departments'
		connection.query(insert, function(err, res){
			if (err) {console.log(err)}
			for (var i = 0; i < res.length; i++) {
				
				console.log('---------------------------');
				console.log('  Department Id: ' + res[i].DepartmentID);
				console.log('Department Name: ' + res[i].DepartmentName);
				console.log(' Overhead Costs: ' + res[i].OverHeadCosts);
				console.log('  Product Sales: ' + res[i].ProductSales);
				console.log('   Total Profit: ' + (((res[i].TotalProfit) <= 0) ? colors.red(res[i].TotalProfit) : colors.green(res[i].TotalProfit)));
			}
			console.log('---------------------------');
			prompts.mainMenu();
		})
	},
	addDepartment: function(department){
		connection.query('INSERT INTO Departments SET ?', department, function(err, res){
			if (err) {console.log(err)}
		})
		prompts.mainMenu();
	}
}
connection.connect(function(err){
	if (err) {
		console.log(err);
		return;
	}
	console.log('connected as id ' + connection.threadId);
	prompts.mainMenu();
});
