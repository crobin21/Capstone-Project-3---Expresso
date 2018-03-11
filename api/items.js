const express = require('express');
const itemsRouter = express.Router({mergeParams: true});

const sqlite = require('sqlite3')
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite')

itemsRouter.param('menuItemId', (req,res,next,menuItemId) => {
  const sql = `SELECT * FROM MenuItem where MenuItem.id = ${menuItemId};`

  db.get(sql, (error, menuItem) => {
    if(error) {
      next(error);
    } else if (menuItem) {
      req.menuItem = menuItem
      next();
    } else {
      res.sendStatus(404)
    }
  });
});

itemsRouter.get('/', (req,res,next) => {
    const sql = `SELECT * FROM MenuItem WHERE menu_id=${req.params.menuId};`
    db.all(sql, (error, menuItems) => {
      if(error) {
        return res.sendStatus(400)
      }
      res.status(200).send({menuItems});
    });
});

itemsRouter.post('/', (req,res,next) => {
    const name = req.body.menuItem.name, description = req.body.menuItem.description,
          inventory = req.body.menuItem.inventory, price = req.body.menuItem.price,
          menu_id = req.params.menuId;
    const sql = 'INSERT INTO MenuItem (name,description,inventory,price,menu_id) ' +
                'VALUES ($name,$description,$inventory,$price,$menu_id);';
    const values = {
      $name: name,
      $description: description,
      $inventory: inventory,
      $price: price,
      $menu_id: menu_id
    };

    if (!name || !description || !price) {
      return res.sendStatus(400);
    };

    db.run(sql, values, function (error) {
      if(error) {
        return res.sendStatus(400);
      } else {
        db.get(`SELECT * FROM MenuItem where MenuItem.id = ${this.lastID};`,
        (error, menuItem) => {
          res.status(201).send({menuItem});
        });
      }
    });
});

itemsRouter.put('/:menuItemId', (req,res,next) => {
    const menuItem = req.params.menuItemId, name = req.body.menuItem.name, description = req.body.menuItem.description,
          inventory = req.body.menuItem.inventory, price = req.body.menuItem.price,
          menuId = req.params.menuId;

    if (!name || !description || !inventory || !price) {
      return res.sendStatus(400);
    };

    const sql = 'UPDATE MenuItem SET name = $name, description = $description, ' +
                'inventory = $inventory, price = $price, menu_id = $menuId ' +
                'WHERE MenuItem.id = $menuItem';
    const values = {
      $name: name,
      $description: description,
      $inventory: inventory,
      $price: price,
      $menuId: menuId,
      $menuItem: menuItem
    };

    db.run(sql, values, function (error) {
      if(error){
        return res.sendStatus(400);
      } else {
        db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${menuItem};`,
          (error, menuItem) => {
            res.status(200).send({menuItem});
      })
    }
  })
});

itemsRouter.delete('/:menuItemId', (req,res,next) => {
  const sql = `DELETE FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId};`

  db.run(sql, (error) => {
    if(error) {
      return res.sendStatus(400);
    }
    res.sendStatus(204);
  })
});
module.exports = itemsRouter;
