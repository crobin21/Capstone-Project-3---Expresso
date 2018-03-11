const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite')

db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS Employee;`)
    db.run(`DROP TABLE IF EXISTS Timesheet;`)
    db.run(`DROP TABLE IF EXISTS Menu;`)
    db.run(`DROP TABLE IF EXISTS MenuItem;`)
    db.run('CREATE TABLE IF NOT EXISTS `Employee` ( ' +
        '`id` INTEGER NOT NULL, ' +
        '`name` TEXT NOT NULL, ' +
        '`position` TEXT NOT NULL, ' +
        '`wage` INTEGER NOT NULL, ' +
        '`is_current_employee` INTEGER NOT NULL DEFAULT 1, ' +
        'PRIMARY KEY(`id`) )');
    db.run(`CREATE TABLE IF NOT EXISTS Timesheet (
    		id INT PRIMARY KEY,
    		hours INT NOT NULL,
    		rate INT NOT NULL,
    		date INT NOT NULL,
    		employee_id INT NOT NULL,
    		FOREIGN KEY (employee_id) REFERENCES Employee(id)
  			)`)
    db.run(`CREATE TABLE IF NOT EXISTS Menu(
    		id INT PRIMARY KEY,
    		title TEXT NOT NULL
  			)`)
    db.run(`CREATE TABLE IF NOT EXISTS MenuItem(
    		id INT PRIMARY KEY,
    		name TEXT NOT NULL,
    		description TEXT NOT NULL,
    		inventory INT NOT NULL,
    		price INT NOT NULL,
    		menu_id INT NOT NULL,
    		FOREIGN KEY(menu_id) REFERENCES Menu(id)
  			)`)
})
