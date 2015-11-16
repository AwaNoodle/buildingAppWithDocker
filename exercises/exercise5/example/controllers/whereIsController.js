var whereIsController = function() {
  var get = function(req, res) {
    if(req.params.person.toUpperCase() == 'LUKE') {
      res.status(404).send("No sign of Luke. Have you tried his desk?");
    } else {
      res.status(302).send("Found them. Let me show you where.");
    }
  };

  return {
    get: get
  }
}

module.exports = whereIsController;
