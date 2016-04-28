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
		prompt.get(prompts.menuSchema, function(err, res){
			switch(res.action){
				case 'products': sqlQueries.showProducts(); break;
				case 'low inventory': sqlQueries.showLow(); break;
				case 'add inventory': prompts.addInventory(); break;
				case 'new product': prompts.addProduct(); break;
				default: console.log(colors.blue('Commands:\n')+colors.bold('products: ')+'Shows all products in inventory.\n'+colors.bold('low inventory: ')+'View products with a low inventory.\n'+colors.bold('add inventory: ')+'Update the inventory of an item.\n'+colors.bold('new product: ')+'Add a new product to the inventory.\n'); prompts.mainMenu();
			}
		})
	},
	addInventory: function(){
		prompt.get(prompts.invSchema, function(err, res){
			sqlQueries.addInventory(res.itemId,res.quantity);
		})
	},
	addProduct: function(){
		prompt.get(prompts.addSchema, function(err, res){
			var newProduct = {
				ItemID: res.itemId,
				ProductName: res.name, 
				DepartmentName: res.department,
				DepartmentID: Number(res.DepartmentId),
				Price: Number(res.price), 
				StockQuantity: Number(res.quantity)
			}
			sqlQueries.addProduct(newProduct)
		})
	},
	menuSchema: {
		properties: {
			action: {
				description: 'Next action',
				type: 'string',
			}
		}
	},
	invSchema: {
		properties: {
			itemId: {
				description: 'ItemID of product',
				type: 'string',
				required: true,
				pattern: /(^[0-9][0-9][0-9][a-z][a-z][a-z]$)/i,
				message: 'Must fit format (123ABC, 999YYY)'
			},
			quantity: {
				description: 'Quantity to add',
				type: 'number',
				required: true,
				message: 'Please enter a valid number'
			}
		}
	},
	addSchema: {
		properties: {
			itemId: {
				description: 'Item ID',
				type: 'string',
				required: true,
				pattern: /(^[0-9][0-9][0-9][a-z][a-z][a-z]$)/i,
				message: 'Must fit format (123ABC, 999YYY)'
			},
			name: {
				description: 'Name of product',
				type: 'string',
				required: true,
				message: 'Enter the name of the new product'
			},
			department: {
				description: 'Department',
				type: 'string',
				required: true,
				message: 'Enter the name of the Department'
			},
			DepartmentId: {
				description: 'Department ID',
				type: 'string',
				required: true,
				pattern: /(^[0-9]*$)/,
				message: 'Enter the department number'
			},
			price: {
				description: 'Price',
				type: 'string',
				required: true,
				pattern: /(^[0-9]*\.[0-9][0-9]$)/i,
				message: 'Must fit format (12.34, 999.00)'
			},
			quantity: {
				description: 'Quantity',
				type: 'string',
				required: true,
				pattern: /(^[0-9]*$)/,
				message: 'Enter a number'
			}
		}
	}
};

var sqlQueries = {
	showProducts: function(){
		connection.query('SELECT * FROM Products', function(err, res){
			sqlQueries.logOutQuery(res);
		})
	},
	showLow: function(){
		connection.query('SELECT * FROM Products WHERE StockQuantity < 15', function(err, res){
			sqlQueries.logOutQuery(res);
		})
	},
	addInventory: function(id, amount){
		connection.query('UPDATE Products SET StockQuantity = StockQuantity + ' + amount + ' WHERE ItemID = \"' + id + '\"', function(err, res){
			if (err || res.affectedRows == 0) {
				console.log('Something went wrong. Please check the item ID and try again.')
			} else { console.log('Inventory updated successfully') }
			prompts.mainMenu();
		})
	},
	addProduct: function(product){
		connection.query('INSERT INTO Products SET ? ', product, function(err, res){
			if (err) {
				if (err.errno == 1452) {
					console.log('The department ID you entered does not exit. Item was not added.')
				}
				else if (err.errno ==  1062) {
					console.log('That Item ID is already in use.')
				}
			} else if(!err){
				console.log(product.ProductName + ' successfully added.');
			}
			prompts.mainMenu();
		})
	},
	logOutQuery: function(queryResult) {
		for (var i = 0; i < queryResult.length; i++) {
			console.log('---------------------------');
			console.log('      Item: ' + queryResult[i].ProductName);
			console.log('    ItemID: ' + queryResult[i].ItemID);
			console.log('Department: ' + queryResult[i].DepartmentName);
			console.log('     Price: $' + queryResult[i].Price);
			console.log('  In stock: '+ queryResult[i].StockQuantity);
		}
		console.log('---------------------------');
		prompts.mainMenu();
	},
}
connection.connect(function(err){
	if (err) {
		console.log(err);
		return;
	}
	console.log('Press enter to view commands');
	prompts.mainMenu();
});