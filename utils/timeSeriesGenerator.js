

function randomInt(low, high){
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function random (low, high) {
  return Math.random() * (high - low) + low;
}

exports.generate = function(startTimeInMillis, timeInterval, pointCount){
  var data = [], time, value;

  var valueRange = [0, 100];

  var threshold = random(valueRange[0] , valueRange[1]);
  var direction = randomInt(-1, 1);

  var directionChangeCount = 10;
  var directionChangeThreshold = 20;
  var valueChangeThreshold = 10;

  var thresholdEnd;

  for (var i = 0; i < pointCount; i++){
    time = startTimeInMillis + (i * timeInterval);

    if (i % directionChangeCount === 0){

      // changes direction after specific count
      direction = randomInt(-1, 1);

      thresholdEnd = threshold + (directionChangeThreshold * direction);
      thresholdEnd = (thresholdEnd < valueRange[0]) ? valueRange[0] : thresholdEnd;
      thresholdEnd = (thresholdEnd > valueRange[1]) ? valueRange[1] : thresholdEnd;

      threshold = random(Math.min(threshold, thresholdEnd),
        Math.max(threshold, thresholdEnd));
    }

    value = random((threshold - valueChangeThreshold) < 0 ? 0 :
      (threshold - valueChangeThreshold), threshold);

    data.push([time, value]);
  }
  return data;
};
