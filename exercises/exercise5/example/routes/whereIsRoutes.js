var express = require('express');

var routes = function() {
  var whereIsController = require('../controllers/whereIsController.js')();
  var whereIsRouter = express.Router();
  whereIsRouter.route('/:person')
    .get(whereIsController.get);

  return whereIsRouter;
};

module.exports = routes;
