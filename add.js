var mysql = require('mysql');
var inquirer = require('inquirer');

function add() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "addChoice",
        message: "What would you like to add?",
        choices: ["Department", "Role", "Employee", "Back"],
      },
    ])
    .then((res) => {
      console.log(res);

      switch (res.addChoice) {
        case "Department":
          return addDepartment();
        case "Role":
          return addRole();
        case "Employee":
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
        type: "input",
        name: "departmentName",
        message: "Name of Department:",
      },
    ])
    .then((res) => {
      var query = connection.query("INSERT INTO departments SET ?", [
        {
          dept_name: res.departmentName,
        },
      ]);
      start();
    });
}

function addRole() {
  //picks up department data
  connection.query("SELECT * FROM departments", (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement

    //creates an array of just item names
    var departmentNames = res.map((dept) => dept.dept_name);
    var departmentList = res;

    inquirer
      .prompt([
        {
          type: "input",
          name: "roleTitle",
          message: "Role Title: ",
        },
        {
          type: "input",
          name: "roleSalary",
          message: "Role Salary: ",
        },
        {
          type: "list",
          name: "roleDept",
          message: "Choose a department",
          choices: departmentNames,
        },
      ])
      .then((answer) => {
        var dept = departmentList.find(
          (department) => department.dept_name === answer.roleDept
        );

        var query = connection.query("INSERT INTO roles SET ?", [
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
  connection.query("SELECT * FROM roles", (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement

    //creates an array of just item names
    const roleNames = res.map((role) => role.title);
    const roleList = res;

    inquirer
      .prompt([
        {
          type: "list",
          name: "choice",
          message: "Would you like to add a manager or an employee?",
          choices: ["Manager", "Employee"],
        },
      ])
      .then((answer) => {
        if (answer.choice === "Manager") {
          inquirer
            .prompt([
              {
                type: "input",
                name: "firstName",
                message: "First Name: ",
              },
              {
                type: "input",
                name: "lastName",
                message: "Last Name: ",
              },
            ])
            .then((answer) => {
              var query = connection.query("INSERT INTO employees SET ?", [
                {
                  first_name: answer.firstName,
                  last_name: answer.lastName,
                  role_id: roleList[0].id,
                  manager_id: null,
                },
              ]);
              start();
            });
        } else {
          //NEED TO ACCESS ROLES CHECK IF YOU CAN SELECT FROM BOTH :)
          connection.query(
            "SELECT * FROM employees WHERE role_id = 1",
            (err, response) => {
              if (err) throw err;

              const managerNames = response.map((name) => name.first_name);
              const managerList = response;

              inquirer
                .prompt([
                  {
                    type: "input",
                    name: "firstName",
                    message: "First Name: ",
                  },
                  {
                    type: "input",
                    name: "lastName",
                    message: "Last Name: ",
                  },
                  {
                    type: "list",
                    name: "role",
                    message: "Role: ",
                    choices: roleNames,
                  },
                  {
                    type: "list",
                    name: "manager",
                    message: "Manager: ",
                    choices: managerNames,
                  },
                ])
                .then((answer) => {
                  var manager = managerList.find(
                    (man) => man.first_name === answer.manager
                  );
                  var role = roleList.find((r) => r.title === answer.role);

                  var query = connection.query("INSERT INTO employees SET ?", [
                    {
                      first_name: answer.firstName,
                      last_name: answer.lastName,
                      role_id: role.id,
                      manager_id: manager.id,
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

module.exports = {
  add,
  addDepartment,
  addRole,
  addEmployee,
};
