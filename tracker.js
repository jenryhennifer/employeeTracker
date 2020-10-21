var mysql = require('mysql');
var inquirer = require('inquirer');
var banner = require('./banner.js');

var connection = mysql.createConnection({
  host: 'localhost',

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: 'root',

  // Your password
  password: 'password',
  database: 'employeeTracker',
});

connection.connect((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  banner.banner();
  start();
});

function start() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'AddViewUpdate',
        message: 'Would you like to:',
        choices: [
          'Add Resource',
          'Delete Resource',
          'View Resource',
          'Update Employee',
          'Quit',
        ],
      },
    ])
    .then((res) => {

      switch (res.AddViewUpdate) {
        case 'Add Resource':
          return add();
        case 'Delete Resource':
          return deleteRequest();
        case 'View Resource':
          return view();
        case 'Update Employee':
          return updateEmployee();
        default:
          return console.log('goodbye');
      }
    });
}

function add() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'addChoice',
        message: 'What would you like to add?',
        choices: ['Department', 'Role', 'Employee', 'Back'],
      },
    ])
    .then((res) => {

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
    });
}

//functions for ADD
function addDepartment() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'Name of Department:',
      },
    ])
    .then((res) => {
      connection.query('INSERT INTO departments SET ?', [
        {
          dept_name: res.departmentName,
        },
      ]);
      start();
    });
}

function addRole() {
  //picks up department data
  connection.query('SELECT * FROM departments', (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement

    //creates an array of just item names
    var departmentNames = res.map((dept) => dept.dept_name);
    var departmentList = res;

    inquirer
      .prompt([
        {
          type: 'input',
          name: 'roleTitle',
          message: 'Role Title: ',
        },
        {
          type: 'input',
          name: 'roleSalary',
          message: 'Role Salary: ',
        },
        {
          type: 'list',
          name: 'roleDept',
          message: 'Choose a department',
          choices: departmentNames,
        },
      ])
      .then((answer) => {
        var dept = departmentList.find(
          (department) => department.dept_name === answer.roleDept
        );

        connection.query('INSERT INTO roles SET ?', [
          {
            title: answer.roleTitle,
            salary: answer.roleSalary,
            dept_id: dept.id,
          },
        ]);
        start();
      });
  });
}

function addEmployee() {
  connection.query('SELECT * FROM roles', (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement

    //creates an array of just item names
    const roleNames = res.map((role) => role.title);
    const roleList = res;

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'Would you like to add a manager or an employee?',
          choices: ['Manager', 'Employee'],
        },
      ])
      .then((answer) => {
        if (answer.choice === 'Manager') {
          inquirer
            .prompt([
              {
                type: 'input',
                name: 'firstName',
                message: 'First Name: ',
              },
              {
                type: 'input',
                name: 'lastName',
                message: 'Last Name: ',
              },
              {
                type: 'list',
                name: 'role',
                message: 'Role: ',
                choices: roleNames,
              },
            ])
            .then((answer) => {
              const chosenRole = res.find((role) => role.title === answer.role);
              connection.query('INSERT INTO employees SET ?', [
                {
                  first_name: answer.firstName,
                  last_name: answer.lastName,
                  role_id: chosenRole.id,
                  manager_id: null,
                },
              ]);
              start();
            });
        } else {
          //NEED TO ACCESS ROLES CHECK IF YOU CAN SELECT FROM BOTH :)
          connection.query(
            'SELECT * FROM employeeTracker.employees WHERE manager_id IS null',
            (err, response) => {
              if (err) throw err;
              //   const managers = response.filter((manager) => {parseInt(manager.manager_id) < 1})
              const managerList = response.map((manager) =>
                manager.first_name.concat(' ', manager.last_name)
              );
              inquirer
                .prompt([
                  {
                    type: 'input',
                    name: 'firstName',
                    message: 'First Name: ',
                  },
                  {
                    type: 'input',
                    name: 'lastName',
                    message: 'Last Name: ',
                  },
                  {
                    type: 'list',
                    name: 'role',
                    message: 'Role: ',
                    choices: roleNames,
                  },
                  {
                    type: 'list',
                    name: 'manager',
                    message: 'Manager: ',
                    choices: managerList,
                  },
                ])
                .then((answer) => {
                  var chosenRole = res.find(
                    (role) => role.title === answer.role
                  );

                  var chosenManager = answer.manager;
                  var man = chosenManager.split(' ');

                  var choice = response.find((manager) => {
                    if (
                      manager.first_name === man[0] &&
                      manager.last_name === man[1]
                    ) {
                      return manager.id;
                    }
                  });

                  connection.query('INSERT INTO employees SET ?', [
                    {
                      first_name: answer.firstName,
                      last_name: answer.lastName,
                      role_id: chosenRole.role_id,
                      manager_id: choice.id,
                    },
                  ]);
                  start();
                });
            }
          );
        }
      });
  });
}

///////////////////////////////////////////////////////////////////////////////////////
//functions for DELETE
function deleteRequest() {
  inquirer
    .prompt({
      type: 'list',
      name: 'deleteChoice',
      message: 'what would you like to delete?',
      choices: ['Department', 'Role', 'Employee', 'Back'],
    })
    .then((res) => {
      switch (res.deleteChoice) {
        case 'Department':
          return deleteDepartment();
        case 'Role':
          return deleteRole();
        case 'Employee':
          return deleteEmployee();
        default:
          start();
      }
    });
}

function deleteDepartment() {
  connection.query('SELECT * FROM departments', (err, res) => {
    var departmentNames = res.map((dept) => dept.dept_name);
    inquirer
      .prompt({
        type: 'list',
        name: 'roleDept',
        message: 'Choose a department to delete',
        choices: departmentNames,
      })
      .then((res) => {
        const name = res.roleDept;
        connection.query('DELETE FROM departments WHERE dept_name = ?', [name]);
        start();
      });
  });
}

function deleteRole() {
  connection.query('SELECT * FROM roles', (err, res) => {
    var roleNames = res.map((name) => name.title);
    inquirer
      .prompt({
        type: 'list',
        name: 'roleName',
        message: 'Choose a role to delete',
        choices: roleNames,
      })
      .then((res) => {
        const name = res.roleName;
        connection.query('DELETE FROM roles WHERE title = ?', [name]);
        start();
      });
  });
}

function deleteEmployee() {
  connection.query('SELECT * FROM employees', (err, res) => {
    const employeeName = res.map((name) =>
      name.first_name.concat(' ', name.last_name)
    );
    inquirer
      .prompt({
        type: 'list',
        name: 'employeeNames',
        message: 'Choose an employee to delete',
        choices: employeeName,
      })
      .then((answer) => {
        var chosenEmployee = answer.employeeNames;
        var empSplit = chosenEmployee.split(' ');
        var choice = res.find((employee) => {
          if (
            employee.first_name === empSplit[0] &&
            employee.last_name === empSplit[1]
          ) {
            return employee.id;
          }
        });
        choice = choice.id;

        connection.query('DELETE FROM employees WHERE id = ?', [choice]);
        start();
      });
  });
}

///////////////////////////////////////////////////////////////////////////////////////

//functions for VIEW
function view() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'viewChoice',
        message: 'What would you like to view?',
        choices: [
          'All Departments',
          'All Roles',
          'All Employees',
          'By Manager',
          'Back',
        ],
      },
    ])
    .then((res) => {
      switch (res.viewChoice) {
        case 'All Departments':
          return showDepartments();
        case 'All Roles':
          return showRoles();
        case 'All Employees':
          return showEmployees();
        case 'By Manager':
          return viewEmployeesByManager();
        default:
          return start();
      }
    });
}

function showDepartments() {
  connection.query('SELECT * FROM departments', (err, res) => {
    if (err) throw err;
    console.log('DEPARTMENTS');
    console.table(res);
    start();
  });
}
function showRoles() {
  connection.query('SELECT * FROM roles', (err, res) => {
    if (err) throw err;
    console.log('ROLES');
    console.table(res);
    start();
  });
}
function showEmployees() {
  connection.query('SELECT * FROM employees', (err, res) => {
    if (err) throw err;
    console.log('EMPLOYEES');
    console.table(res);
    start();
  });
}
function viewEmployeesByManager() {
  connection.query(
    'SELECT * FROM employees WHERE manager_id IS null',
    (err, res) => {
      const managerList = res.map((manager) =>
        manager.first_name.concat(' ', manager.last_name)
      );
      inquirer
        .prompt({
          type: 'list',
          name: 'manager',
          message: 'Which manager would you like to view the employees for?',
          choices: managerList,
        })
        .then((answer) => {
          var chosenManager = answer.manager;
          var manSplit = chosenManager.split(' ');

          var choice = res.find((manager) => {
            if (
              manager.first_name === manSplit[0] &&
              manager.last_name === manSplit[1]
            ) {
              return manager.id;
            }
          });
          connection.query(
            'SELECT * FROM employees WHERE manager_id = ?',
            [choice.id],
            (err, res) => {
              console.log('EMPLOYEES UNDER: ' + chosenManager);
              console.table(res);
              start();
            }
          );
        });
    }
  );
}

///////////////////////////////////////////////////////////////////////////////////////
//UPDATE Employee

function updateEmployee() {
  connection.query('SELECT * FROM employees', (err, res) => {
    const employeeNames = res.map((name) =>
      name.first_name.concat(' ', name.last_name)
    );

    inquirer
      .prompt({
        type: 'list',
        name: 'employeeName',
        message: 'Whose role would you like to update?',
        choices: employeeNames,
      })
      .then((answer) => {
        var chosenEmployee = answer.employeeName;
        var empSplit = chosenEmployee.split(' ');

        var empChoice = res.find((emp) => {
          if (emp.first_name === empSplit[0] && emp.last_name === empSplit[1]) {
            return emp.id;
          }
        });

        connection.query('SELECT * FROM roles', (err, response) => {
          var role = response.map((role) => role.title);

          inquirer
            .prompt({
              type: 'list',
              name: 'newRole',
              message: 'What role would you like to change to?',
              choices: role,
            })
            .then((choice) => {
              var roleID = response.find(
                (title) => title.title === choice.newRole
              );
              roleID = roleID.id;
              connection.query(
                'UPDATE employees SET role_id = ? WHERE id = ?',
                [roleID, empChoice.id]
              );
              start();
            });
        });
      });
  });
}
