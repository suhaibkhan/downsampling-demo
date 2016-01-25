
(function(){

  var charts = {};

  // updates selected region on other main charts
  var updateSelection = function(e){
    for (var key in charts){
      if (charts.hasOwnProperty(key) && charts[key].main.container() !== this){
        charts[key].main.updateSelectionMask(e.selection);
      }
    }
  };

  // updates data on all link charts
  var updateRightChart = function(e){

    for (var key in charts){
      if (charts.hasOwnProperty(key)){

        var el = charts[key].link.container();

        var downSamplingMethod =
          el.parentNode.getAttribute('data-sampling-method') || 'raw';

        var url = 'data?startTime=' + e.selection[0].getTime() + '&endTime=' +
          e.selection[1].getTime() + '&downSamplingMethod=' + downSamplingMethod +
          '&threshold=' + el.offsetWidth;

        // update
        charts[key].link.update(url, true);
      }
    }

  };

  var init = function(){

    /*
    // bing sampling algorithm select event
    document.getElementById('samplingAlgoSelect').addEventListener('change', function(){
      // get chart associated with select element
      var chartIndex = parseInt(this.getAttribute('data-chart-index'));
      var chart = charts[chartIndex].main;
      var el = chart.container();
      el.parentNode.setAttribute('data-sampling-method', this.value);
      chart.update('data?downSamplingMethod=' + this.value + '&threshold=' + el.offsetWidth,
        true, function(){
          chart.select();
      });
    });*/


    var chartWidth = (document.body.offsetWidth - 50)/2;
    var chartsLoaded = 0;

    // create and init charts
    var chartContainerElems = document.querySelectorAll('.chartcontainer');
    var noOfChartContainers = chartContainerElems.length;
    Array.prototype.forEach.call(chartContainerElems, function(groupEl, groupIndex){

      var downSamplingMethod = groupEl.getAttribute('data-sampling-method') || 'raw';
      charts[groupIndex] = {};

      var chartElems = groupEl.querySelectorAll('.chart');
      Array.prototype.forEach.call(chartElems, function(childEl, childIndex){

        // set chart width
        childEl.style.width = chartWidth + 'px';
        // set chart height
        childEl.style.height = (chartWidth/4) + 'px';

        if (childIndex == 0){

          // create main chart
          // and save in charts object
          charts[groupIndex].main = createTimeseriesChart(childEl,
            {selectable : true, drawOnCanvas: true})
            .update('data?downSamplingMethod=' + downSamplingMethod + '&threshold=' + childEl.offsetWidth,
              false, function(){
                // when all left side charts loaded
                // apply a default selection in left chart
                chartsLoaded++;
                if (chartsLoaded == noOfChartContainers){
                  // make default selection on last created chart
                  charts[groupIndex].main.select();
                }

              })
            .on('selectend', updateRightChart)
            .on('select', updateSelection);

        }else if (childIndex == 1){
          // create link zoom chart
          // and save in charts object
          charts[groupIndex].link = createTimeseriesChart(childEl,
            {selectable : false, drawOnCanvas: true});
        }

      });

    });

    // add resize event handler
    window.onresize = init;
  };

  // call init on window onload
  window.onload = init;

})();
