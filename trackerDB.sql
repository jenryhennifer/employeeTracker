DROP DATABASE IF EXISTS employeeTracker;
CREATE DATABASE employeeTracker;

USE employeeTracker;

CREATE TABLE departments(
  dept_id INT NOT NULL AUTO_INCREMENT,
  dept_name VARCHAR(30) NOT NULL,
  PRIMARY KEY (dept_id)
);

CREATE TABLE roles(
  role_id INT AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary VARCHAR(30),
  PRIMARY KEY (role_id),
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)

);


CREATE TABLE employees(
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (manager_id) REFERENCES employees(id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);


