const express = require('express');
const menusRouter = express.Router()
const itemsRouter = require('./items.js')

const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite')

menusRouter.use('/:menuId/menu-items', itemsRouter);

menusRouter.param('menuId', (req,res,next,menuId) => {
  const sql = `SELECT * FROM Menu WHERE Menu.id = $menuId;`
  const values = {
    $menuId: menuId
  };

  db.get(sql, values, (error, menu) => {
    if(error) {
      next(error)
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404)
    }
  });
});

menusRouter.get('/:menuId', (req,res,next) => {
  res.status(200).send({menu: req.menu})
})

menusRouter.get('/', (req,res,next) => {
  db.all(`SELECT * FROM Menu;`, (error, menus) => {
    if(error) {
      return res.sendStatus(400)
    }
    res.status(200).send({menus})
  });
});

menusRouter.post('/', (req,res,next) => {
  const title = req.body.menu.title;
  const sql = 'INSERT INTO Menu (title) VALUES ($title);'
  const values = {
    $title: title
  };

  if(!title) {
    return res.sendStatus(400);
  };

  db.run(sql, values, function (error) {
    if(error){
      return res.send(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (error,menu) => {
        res.status(201).send({menu: menu})
      });
    }
  });
});

menusRouter.put('/:menuId', (req,res,next) => {
  const title = req.body.menu.title;
  const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
  const values = {
    $title: title,
    $menuId: req.params.menuId
  };

  if(!title) return res.sendStatus(400);

  db.run(sql, values, (error) => {
    if (error) {
      return res.sendStatus(400);
    }
    db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (err, menu) => {
      res.status(200).send({menu})
    });
  });
});

menusRouter.delete('/:menuId', (req,res,next) => {
    const menuId = req.params.menuId
    const sql = `DELETE FROM Menu WHERE Menu.id = ${menuId};`
    const validate = `SELECT * FROM MenuItem WHERE menu_id = ${menuId};`

    db.get(validate, (error, menuItems) => {
      if(error || menuItems) {
        return res.sendStatus(400);
      } else {
        db.run(sql,(error) => {
          if(error){
            return res.sendStatus(400);
          }
          res.sendStatus(204);
        })
      }
    })
});

module.exports = menusRouter;
