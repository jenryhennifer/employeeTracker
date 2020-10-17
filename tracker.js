var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: 'localhost',
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: 'root',
  
    // Your password
    password: 'password',
    database: 'employeeTracker'
  });

  connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
  });

function start(){
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'AddViewUpdate',
                message: 'Would you like to:',
                choices: ['Add Resource', 'View Resource']
            }
        ]).then(function(res){
            console.log(res)
        })
  }