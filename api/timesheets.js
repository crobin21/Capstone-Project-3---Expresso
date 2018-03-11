const express = require('express');
const timesheetRouter = express.Router({mergeParams: true})

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.param('timesheetId', (req,res,next,timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId;'
  const values = {
    $timesheetId: timesheetId
  };

  db.get(sql, values, (error, timesheet) => {
    if(error) {
      next(error)
    } else if(timesheet) {
      req.timesheet = timesheet
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetRouter.get('/', (req,res,next) => {
    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id=$id';
    const values = {
      $id: req.params.employeeId
    };

    db.all(sql, values, (error, timesheets) => {
      if(error || timesheets === undefined) {
        return res.sendStatus(404);
      }
      res.status(200).send({timesheets});
    });
});

timesheetRouter.post('/', (req,res,next) => {
  const hours = req.body.timesheet.hours, rate = req.body.timesheet.rate,
        date = req.body.timesheet.date, employeeId = req.params.employeeId;
  const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) ' +
              'VALUES ($hours, $rate, $date, $employeeId)';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId
  };

  db.run(sql, values, function (error) {
    if(error) {
      return res.sendStatus(400);
    }
    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID};`,
    (error, timesheet) => {
      res.status(201).send({timesheet});
    })
  });
});

timesheetRouter.put('/:timesheetId', (req,res,next) => {
  const hours = req.body.timesheet.hours, rate = req.body.timesheet.rate,
        date = req.body.timesheet.date, employee_id = req.params.employeeId;
  const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, ' +
              'employee_id = $employeeId WHERE Timesheet.id = $timesheet';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employee_id,
    $timesheet: req.params.timesheetId
  };

  if(!hours || !rate || !date) {
    return res.sendStatus(400);
  }

  db.run(sql, values, (error) => {
    if(error) {
      return res.sendStatus(400);
    }
    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId};`,
    (error, timesheet) => {
      res.status(200).send({timesheet});
    })
  });
});

timesheetRouter.delete('/:timesheetId', (req,res,next) => {
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $id;'
  const values = {$id: req.params.timesheetId};

  db.run(sql, values, (error) => {
    if(error) {
      return res.sendStatus(400);
    }
    res.sendStatus(204);
  })
});

module.exports = timesheetRouter;
