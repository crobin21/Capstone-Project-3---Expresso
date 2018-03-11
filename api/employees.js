const express = require('express');
const employeesRouter = express.Router();
const timesheetRouter = require('./timesheets.js')

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.param('employeeId', (req,res,next,employeeId) => {
  const sql = `SELECT * FROM Employee WHERE Employee.id = $employeeId;`
  const values = { $employeeId: employeeId};
  db.get(sql,values, (err, employee) => {
    if(err) {
      next(err);
    } else if(employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeesRouter.use('/:employeeId/timesheets', timesheetRouter);

employeesRouter.get('/', (req,res,next) => {
  const sql = `SELECT * FROM Employee WHERE is_current_employee = 1;`
  db.all(sql, (error, employees) => {
    if(error) {
      return res.sendStatus(400)
    }
    res.status(200).json({employees: employees});
  });
});

employeesRouter.get('/:employeeId', (req,res,next) => {
  res.status(200).send({employee: req.employee});
});

employeesRouter.post('/', (req,res,next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

  if(!name || !position || !wage) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) ' +
              'VALUES ($name,$position,$wage,$isCurrentEmployee)'
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
    db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
      (error, employee) => {
        if(error) {
          console.log(error);
        }
        res.status(201).json({employee: employee});
      });
    }
  });
});

employeesRouter.put('/:employeeId', (req,res,next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1,
        id = req.params.employeeId;

  if(!name || !position || !wage) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Employee SET name = $name, position = $position, ' +
      'wage = $wage, is_current_employee = $isCurrentEmployee ' +
      'WHERE Employee.id = $id';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee,
    $id: id
  };

  db.run(sql, values, (error) => {
    if(error) {
      return res.sendStatus(400)
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${id};`, (error, employee) => {
        res.status(200).send({employee})
      });
      }
  });
});

employeesRouter.delete('/:employeeId', (req,res,next) => {
  const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $id;'
  const values = {
    $id: req.params.employeeId
  };

  db.run(sql, values, (error) => {
    if(error) {
      next(error);
    }
    db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId};`, (error, employee) => {
      res.status(200).send({employee: employee})
    })
  })
});

module.exports = employeesRouter;
