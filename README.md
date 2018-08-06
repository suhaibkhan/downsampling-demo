### Comparison of timeseries data downsampling algorithms

Downsampling algorithms are tested on randomly generated 100,000 timeseries data points.
Live demo of this comparison can be viewed at http://live-down-sampling-demo.193b.starter-ca-central-1.openshiftapps.com/ 

#### Algorithms Used
1. Average Downsampling
2. Combined Minimum - Maximum Downsampling
3. Largest Triangle Three Buckets Downsampling
4. Random Downsampling
5. Sum Downsampling

#### Implementation Details
D3.js along with HTML5 Canvas API is used for visualizing the data and NodeJS is used for the generation and sampling of the data points.
* Module with implementations of downsampling algorithms - [utils/downSampler.js](https://github.com/suhaibkhan/downsampling-demo/blob/master/utils/downSampler.js)
* Module for timeseries data generation - [utils/timeSeriesGenerator.js](https://github.com/suhaibkhan/downsampling-demo/blob/master/utils/timeSeriesGenerator.js)
