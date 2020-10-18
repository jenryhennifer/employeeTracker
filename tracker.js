var mysql = require('mysql');
var inquirer = require('inquirer');


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

function start() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'AddViewUpdate',
                message: 'Would you like to:',
                choices: ['Add Resource', 'View Resource', 'Update Employee', 'Quit']
            }
        ]).then(function (res) {
            console.log(res)

            switch (res.AddViewUpdate) {
                case 'Add Resource':
                    return add();
                case 'View Resource':
                    return view();
                case 'Update Employee':
                    return updateEmployee();
                default:
                    return console.log('goodbye');
            }
        })
}

function add() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'addChoice',
                message: 'What would you like to add?',
                choices: ['Department', 'Role', 'Employee', 'Back']
            }
        ]).then(function (res) {
            console.log(res)

            switch (res.addChoice) {
                case 'Department':
                    return addDepartment();
                case 'Role':
                    return addRole();
                case 'Employee':
                    return addEmployee();
                default:
                    return start();
            }

        })
}

//functions for ADD
function addDepartment() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'departmentName',
                message: 'Name of Department:'
            }
        ]).then(function (res) {
            var query = connection.query(
                'INSERT INTO departments SET ?',
                [{
                    dept_name: res.departmentName
                }]
            )
            start();
        })
}

function addRole() {
    //picks up department data
    connection.query('SELECT * FROM departments', function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement

        //creates an array of just item names
        var departmentNames = res.map(dept => dept.dept_name);
        var departmentList = res

        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'roleTitle',
                    message: 'Role Title: '
                },
                {
                    type: 'input',
                    name: 'roleSalary',
                    message: 'Role Salary: '
                },
                {
                    type: 'list',
                    name: 'roleDept',
                    message: 'Choose a department',
                    choices: departmentNames
                }
            ]).then(function (answer) {

                var dept = departmentList.find(department => department.dept_name === answer.roleDept)

                var query = connection.query(
                    'INSERT INTO roles SET ?',
                    [{
                        title: answer.roleTitle,
                        salary: answer.roleSalary,
                        dept_id: dept.id
                    }]
                );
                start();
            })
    })
}

function addEmployee() {
    connection.query('SELECT * FROM roles', function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement

        //creates an array of just item names
        var roleNames = res.map(role => role.title);
        var roleList = res;

        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'choice',
                    message: 'Would you like to add a manager or an employee?',
                    choices: ['Manager', 'Employee']
                }
            ]).then(function (answer) {
                if (answer.choice === 'Manager') {
                    inquirer
                        .prompt([
                            {
                                type: 'input',
                                name: 'firstName',
                                message: 'First Name: '
                            },
                            {
                                type: 'input',
                                name: 'lastName',
                                message: 'Last Name: '
                            }
                        ]).then(function (answer) {
                            var query = connection.query(
                                'INSERT INTO employees SET ?',
                                [{
                                    first_name: answer.firstName,
                                    last_name: answer.lastName,
                                    role_id: roleList[0].id,
                                    manager_id: 'no manager'
                                }]
                            );
                            start();
                        })
                } else {
                    runEmployeeQuestions();
                }
            })


    })
}

function runEmployeeQuestions() {
    connection.query('SELECT * FROM employees', function (err, res) {
        if (err) throw err;
        console.log(res)
        const managerFilter = res.find(manID => manID.role_id === 1)
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'First Name: '
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'Last Name: '
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'Role: ',
                    choices: roleNames
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Manager: ',
                    choices: managerFilter
                }
            ]).then(function (answer) {

                var query = connection.query(
                    'INSERT INTO employees SET ?',
                    [{
                        first_name: answer.firstName,
                        last_name: answer.lastName,
                        role_id: answer.role,
                 
                    }]
                );
                start();
            })
    })
}


function view() {

}

function updateEmployee() {

}