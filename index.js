var express = require('express');
var data = require('./utils/data');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.use('/data', function(req, res, next){
  // log req query
  // console.log(req.query);
  next();
});

app.get('/', function(req, res) {
  res.sendfile('index.html');
});

app.get('/data', function(req, res){

  var requestTime = new Date().getTime();

  var startTime = parseInt(req.query.startTime);
  var endTime = parseInt(req.query.endTime);
  var downSamplingMethod = req.query.downSamplingMethod;
  var threshold = parseInt(req.query.threshold);

  var resultData = data.get(startTime, endTime, downSamplingMethod, threshold);
  res.json({data: resultData, time: new Date().getTime() - requestTime});
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
