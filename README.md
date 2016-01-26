### Comparison of timeseries data downsampling algorithms

Downsampling algorithms are tested on randomly generated 100,000 timeseries data points.
Live demo of this comparison can be viewed at http://downsampling-suhaibkhan.rhcloud.com

#### Algorithms Used
1. Average Downsampling
2. Combined Minimum - Maximum Downsampling
3. Largest Triangle Three Buckets Downsampling
4. Random Downsampling
5. Sum Downsampling

#### Implementation Details
This project uses NodeJS for the generation and sampling of the data points.
* NodeJS module with implementations of downsampling algorithms - [utils/downSampler.js](https://github.com/suhaibkhan/downsampling-demo/blob/master/utils/downSampler.js)
* NodeJS module for timeseries data generation - [utils/timeSeriesGenerator.js](https://github.com/suhaibkhan/downsampling-demo/blob/master/utils/timeSeriesGenerator.js)
D3.js along with HTML5 Canvas API is used for visualizing the data.
