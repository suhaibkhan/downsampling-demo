

var floor = Math.floor,
	abs = Math.abs,
  ceil = Math.ceil;


function randomInt(low, high){
  return floor(Math.random() * (high - low + 1)) + low;
}


exports.downSample = function(method, data, threshold){

  threshold = isNaN(threshold) ? 0 : threshold;

  if (method == 'lttb'){
    return largestTriangleThreeBuckets(data, threshold);
  }else if(method == 'random'){
    return randomSampling(data, threshold);
  }else if(method == 'average'){
    return averageSampling(data, threshold);
	}else if(method == 'sum'){
    return sumSampling(data, threshold);
  }else if(method == 'minmax'){
    return combinedMinMaxSampling(data, threshold);
  }
  return data;
};


function combinedMinMaxSampling(data, threshold){

  var data_length = data.length, i = 0;
  if (threshold >= data_length || threshold === 0) {
		return data; // Nothing to do
	}

  // threshold will be half of requested size as each
  // bucket returns two points
  threshold = floor(threshold/2);

  var sampled = [];

  while (i < data_length) {
    var size = ceil((data_length - i) / threshold--);
    var first = i;
    var last = (i + size - 1);

    var minIndex = first, maxIndex = first;
    for (var j = first + 1; j <= last; j++){
      if (data[j][1] < data[minIndex][1]){
        minIndex = j;
      }

      if (data[j][1] > data[maxIndex][1]){
        maxIndex = j;
      }
    }

    if (minIndex < maxIndex){
      sampled.push(data[minIndex]);
      sampled.push(data[maxIndex]);
    }else if (minIndex > maxIndex){
      sampled.push(data[maxIndex]);
      sampled.push(data[minIndex]);
    }else{
      sampled.push(data[maxIndex]);
    }

    i += size;
  }

  return sampled;

}

function sumSampling(data, threshold){

  var data_length = data.length, i = 0;
  if (threshold >= data_length || threshold === 0) {
		return data; // Nothing to do
	}

  var sampled = [];

  while (i < data_length) {
    var size = ceil((data_length - i) / threshold--);
    var first = i;
    var last = (i + size - 1);

    var sum = 0;
    for (var j = first; j <= last; j++){
      sum += data[j][1]; // sum of values in bucket
    }

    var timeIndex = first + floor((last - first)/2); // center of bucket

    sampled.push([data[timeIndex][0], sum]);

    i += size;
  }
  return sampled;
}

function averageSampling(data, threshold){

  var data_length = data.length, i = 0;
  if (threshold >= data_length || threshold === 0) {
		return data; // Nothing to do
	}

  var sampled = [];

  while (i < data_length) {
    var size = ceil((data_length - i) / threshold--);
    var first = i;
    var last = (i + size - 1);

    var sum = 0;
    for (var j = first; j <= last; j++){
      sum += data[j][1]; // sum of values in bucket
    }

    var timeIndex = first + floor((last - first)/2); // center of bucket

    sampled.push([data[timeIndex][0], sum/((last - first) + 1)]);

    i += size;
  }
  return sampled;
}

function randomSampling(data, threshold){
  var data_length = data.length, i = 0;
  if (threshold >= data_length || threshold === 0) {
		return data; // Nothing to do
	}

  var sampled = [];

  while (i < data_length) {
    var size = ceil((data_length - i) / threshold--);
    var first = i;
    var last = (i + size - 1);

    var randomIndex = randomInt(first, last);

    sampled.push(data[randomIndex]);

    i += size;
  }

  return sampled;
}

// https://github.com/pingec/downsample-lttb
function largestTriangleThreeBuckets(data, threshold) {

	var data_length = data.length;
	if (threshold >= data_length || threshold === 0) {
		return data; // Nothing to do
	}

	var sampled = [],
		sampled_index = 0;

	// Bucket size. Leave room for start and end data points
	var every = (data_length - 2) / (threshold - 2);

	var a = 0,  // Initially a is the first point in the triangle
		max_area_point,
		max_area,
		area,
		next_a;

	sampled[ sampled_index++ ] = data[ a ]; // Always add the first point

	for (var i = 0; i < threshold - 2; i++) {

		// Calculate point average for next bucket (containing c)
		var avg_x = 0,
			avg_y = 0,
			avg_range_start  = floor( ( i + 1 ) * every ) + 1,
			avg_range_end    = floor( ( i + 2 ) * every ) + 1;
		avg_range_end = avg_range_end < data_length ? avg_range_end : data_length;

		var avg_range_length = avg_range_end - avg_range_start;

		for ( ; avg_range_start<avg_range_end; avg_range_start++ ) {
		  avg_x += data[ avg_range_start ][ 0 ] * 1; // * 1 enforces Number (value may be Date)
		  avg_y += data[ avg_range_start ][ 1 ] * 1;
		}
		avg_x /= avg_range_length;
		avg_y /= avg_range_length;

		// Get the range for this bucket
		var range_offs = floor( (i + 0) * every ) + 1,
			range_to   = floor( (i + 1) * every ) + 1;

		// Point a
		var point_a_x = data[ a ][ 0 ] * 1, // enforce Number (value may be Date)
			point_a_y = data[ a ][ 1 ] * 1;

		max_area = area = -1;

		for ( ; range_offs < range_to; range_offs++ ) {
			// Calculate triangle area over three buckets
			area = abs( ( point_a_x - avg_x ) * ( data[ range_offs ][ 1 ] - point_a_y ) -
						( point_a_x - data[ range_offs ][ 0 ] ) * ( avg_y - point_a_y )
					  ) * 0.5;
			if ( area > max_area ) {
				max_area = area;
				max_area_point = data[ range_offs ];
				next_a = range_offs; // Next a is this b
			}
		}

		sampled[ sampled_index++ ] = max_area_point; // Pick this point from the bucket
		a = next_a; // This a is the next a (chosen b)
	}

	sampled[ sampled_index++ ] = data[ data_length - 1 ]; // Always add last

	return sampled;
}
