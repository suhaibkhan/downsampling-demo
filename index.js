var express = require('express');
var data = require('./utils/data');

var app = express();

app.set('port', (process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002));
app.set('ip', (process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'));

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

app.listen(app.get('port'), app.get('ip'), function() {
  console.log('Node app is running at ' + app.get('ip') + ':' + app.get('port'));
});
