var express = require('express');
var router = express.Router();

module.exports = (db) => {
  router.get('/', (req, res, next) => {
    res.render('userlist')
  })

  router.get('/users/:id/todos', (req, res, next) => {
    res.render('todoslist', {executor: req.params.id})
  })

  return router
}