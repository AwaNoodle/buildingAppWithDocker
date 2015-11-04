var express = require('express');
//var bodyParser = require('body-parser');

var app = express();
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended:true}));

var whereIsRoute = require('./routes/whereIsRoutes.js')();
app.use('/api/whereis', whereIsRoute);

app.get('/', function(req, res){
  res.send('Welcome to my API');
})

var port = 7788;
app.listen(port, function() {
  console.log('Running API on port ' + port)
});

module.exports = app;
