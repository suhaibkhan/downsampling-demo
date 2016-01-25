var timeSeriesGenerator = require('./timeSeriesGenerator');
var downSampler = require('./downSampler');

var startTimeInMillis = 1420070400000;
var timeInterval = 5 * 60 * 1000; // 5 mins
var pointCount = 100000;

var data = timeSeriesGenerator.generate(startTimeInMillis, timeInterval, pointCount);

exports.get = function(startTime, endTime, downSamplingMethod, threshold){
  var dataStartIndex = 0;
  var dataEndIndex = data.length - 1;
  var result;

  var accessor = function(d){return d[0];};

  if (!isNaN(startTime)){
    // find start index
    dataStartIndex = getClosestIndexFromSortedArray(data, startTime, accessor, false);
  }

  if (!isNaN(endTime) && dataStartIndex < data.length - 1){
    // find end index
    dataEndIndex = getClosestIndexFromSortedArray(data, endTime, accessor, true);
  }

  result = data.slice(dataStartIndex, dataEndIndex + 1);

  if (downSamplingMethod){
    result = downSampler.downSample(downSamplingMethod, result, threshold);
  }

  return result;
};

function getClosestIndexFromSortedArray(array, value, accessor, left){

  var firstIndex = 0, lastIndex = array.length - 1,
    index = -1, valuePresent = false;

  while (firstIndex <= lastIndex && !valuePresent){
    var arrayMidIndex = (lastIndex + firstIndex) / 2 | 0;

    var arrayValue = array[arrayMidIndex];
    if (accessor){
      arrayValue = accessor(arrayValue);
    }

    // save closest index
    index = arrayMidIndex;

    if (arrayValue === value){
      valuePresent = true;
    }else if (arrayValue > value){
      lastIndex = arrayMidIndex - 1;
    }else if (arrayValue < value){
      firstIndex = arrayMidIndex + 1;
    }
  }

  if (!valuePresent){
    var indexValue = array[index];
    if (accessor){
      indexValue = accessor(indexValue);
    }

    if (left){
      // get index of closest value which is less than given value
      if (indexValue > value){
        index = (index == 0) ? index : (index - 1);
      }
    }else{
      // get index of closest value which is greater than given value
      if (indexValue < value){
        index = (index == array.length - 1) ? index : (index + 1)
      }
    }
  }

  return index;
}
