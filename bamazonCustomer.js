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
	getItem: function(productsRes){
		prompt.get(prompts.schema, function(err, result) {
			for (var i = 0; i < productsRes.length; i++) {
				if (result.item == productsRes[i].ItemID) {
					prompts.getQuantity(result.item, productsRes[i].StockQuantity, productsRes[i].ProductName, productsRes[i].DepartmentName, productsRes[i].Price);
					match = true;
					break;
				} else {
					match = false;
				}
			}
			if (!match) {
				console.log(colors.red('That is not a valid ItemID. Try again.'));
				productsQuery(false);
			}
		})
	},
	getQuantity: function(id, stock, name, department, price){
		prompt.get(prompts.schema2, function(err, res) {
			if (res.quantity <= stock) {
				var insert = 'UPDATE Products JOIN Departments ON Products.DepartmentName = Departments.DepartmentName SET Products.StockQuantity = \'' + String((Number(stock) - Number(res.quantity))) + '\', Departments.TotalSales = Departments.TotalSales + \'' + String(((Number(price) * Number(res.quantity)).toFixed(2))) + '\' WHERE Products.ItemID = \'' + id + '\' AND Departments.DepartmentName = \'' + department + '\''
				connection.query(insert, function(err, result) {
					if (err) {console.log(err);return}
					console.log('---------------------------');
					console.log('You succesfully bought ' + res.quantity + ' of item "' + name + '".' );
					console.log('---------------------------');
					productsQuery(false);
				})
			} else{
				console.log('There is not enough in stock to fufill your order. Our most sincere apology.')
				prompts.getItem();
			}
		});
	},
	schema: {
    	properties: {
    		item: {
      			description: 'Enter the Item ID your desired purchase',
		      	type: 'string',
    		    required: true,
        		message: 'Please enter an Item ID'
    		}
	    }
	},
	schema2: {
		properties: {
			quantity: {
				description: 'How many would you like to buy',
				type: 'string',
				required: true,
				message: 'Must enter at least 1'
			}
		}
	}
}
function productsQuery(showList){
	connection.query('SELECT * FROM Products', function(err, res) {
		if (err) throw err;
		if (showList) listProducts(res);
		prompts.getItem(res);
	})
}
function listProducts(productsArray) {
	for (var i = 0; i < productsArray.length; i++) {
		console.log('---------------------------');
		console.log('Item: ' + productsArray[i].ProductName);
		console.log('ItemID: ' + productsArray[i].ItemID);
		console.log('Department: ' + productsArray[i].DepartmentName);
		console.log('Price: $' + productsArray[i].Price);
	}
	console.log('---------------------------');
}
connection.connect(function(err) {
	if (err) {
		console.error('error connecting!' + err);
		return;
	}
	console.log('connected as id ' + connection.threadId);
	productsQuery(true);
});


