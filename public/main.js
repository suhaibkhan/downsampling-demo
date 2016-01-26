
(function(){

  var charts = {}, chartGroupId = -1, selection;

  // updates selected region on other main charts
  var updateSelection = function(e){
    if (e.type === 'event'){ // discard for manually triggered
      // apply selection for other charts
      for (var key in charts){
        if (charts.hasOwnProperty(key) && charts[key].main.container() !== this.container()){
          charts[key].main.updateSelectionMask(e.selection);
        }
      }
    }
  };

  var updateLinkChart = function(e){

    // current selection is saved
    selection = e.selection;

    if (e.type === 'event'){
      // updates data on all link charts
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
    }else{

      // update link of source chart

      var mainEl = this.container();
      var groupId = parseInt(mainEl.parentNode.getAttribute('data-chart-group'));
      var downSamplingMethod =
        mainEl.parentNode.getAttribute('data-sampling-method') || 'raw';

      var link = charts[groupId].link;

      var url = 'data?startTime=' + e.selection[0].getTime() + '&endTime=' +
        e.selection[1].getTime() + '&downSamplingMethod=' + downSamplingMethod +
        '&threshold=' + link.container().offsetWidth;

      // update
      link.update(url, true);
    }
  };

  var drawCharts = function(chartContainer){

    var groupId = parseInt(chartContainer.getAttribute('data-chart-group'));
    var downSamplingMethod =
      chartContainer.getAttribute('data-sampling-method') || 'raw';
    var chartWidth = (document.body.offsetWidth - 50)/2;

    // create charts
    charts[groupId] = {};
    var chartElems = chartContainer.querySelectorAll('.chart');
    Array.prototype.forEach.call(chartElems, function(chartEl, chartIndex){
      // set chart width
      chartEl.style.width = chartWidth + 'px';
      // set chart height
      chartEl.style.height = (chartWidth/4) + 'px';

      if (chartIndex == 0){

        // create main chart
        // and save in charts object
        charts[groupId].main = createTimeseriesChart(chartEl,
          {selectable : true, drawOnCanvas: true})
          .update('data?downSamplingMethod=' + downSamplingMethod + '&threshold=' + chartEl.offsetWidth,
            false, function(){
              // after loading, update right chart with selection
              this.select(selection);
            })
          .on('selectend', updateLinkChart)
          .on('select', updateSelection);

      }else if (chartIndex == 1){
        // create link zoom chart
        // and save in charts object
        charts[groupId].link = createTimeseriesChart(chartEl,
          {selectable : false, drawOnCanvas: true});
      }

    });
  };

  var createChartBlock = function(samplingAlgoKey, samplingAlgoName){

    // unique id for chart group
    chartGroupId++;

    var chartContainer = document.createElement('div');
    chartContainer.setAttribute('data-sampling-method', samplingAlgoKey);
    chartContainer.setAttribute('data-chart-group', chartGroupId);
    chartContainer.setAttribute('class', 'chartcontainer');

    var detailText;

    // get detail text
    var detailElem = document.getElementById('detailContainer')
      .querySelectorAll('[data-sampling-method="' + samplingAlgoKey + '"]')[0];
    if (detailElem){
      detailText = detailElem.innerHTML;
    }

    var innerContents = [];
    innerContents.push('<h2>' + samplingAlgoName + '</h2>');
    innerContents.push('<a class="buttons delete"></a>');
    if (detailText){
      innerContents.push('<div class="detail">' + detailText + '</div>');
    }else{
      innerContents.push('<br style="clear: both"/>');
    }
    innerContents.push('<div class="chart main"></div>');
    innerContents.push('<div class="chart link"></div>');
    innerContents.push('<br style="clear: both"/>');

    chartContainer.innerHTML = innerContents.join('\n');

    // append to page
    document.getElementById('container').appendChild(chartContainer);

    // register delete button event
    chartContainer.querySelectorAll('.delete')[0].addEventListener('click', function(){
      // delete chart object
      delete charts[parseInt(this.parentNode.getAttribute('data-chart-group'))];
      // delete chart container from dom
      document.getElementById('container').removeChild(this.parentNode);
    });

    // draw
    drawCharts(chartContainer);

  };

  var redraw = function(){
    for (var groupId in charts){
      if (charts.hasOwnProperty(groupId)){
        drawCharts(charts[groupId].main.container().parentNode);
      }
    }
  };

  var init = function(){

    // list of available algorithms
    var algoList = [
      {name: 'Raw Data', key: 'raw'},
      {name: 'Random Downsampling', key: 'random'},
      {name: 'Sum Downsampling', key: 'sum'},
      {name: 'Average Downsampling', key: 'average'},
      {name: 'Combined Minimum-Maximum Downsampling', key: 'minmax'},
      {name: 'Largest Triangle Three Buckets Downsampling', key: 'lttb'}
    ];

    var algoSelectHtml = '';
    algoList.forEach(function(o, i){
      algoSelectHtml += '<option value="' + o.key + '">' + o.name + '</option>';
    });

    var algoSelectElem = document.getElementById('algoSelect');
    algoSelectElem.innerHTML = algoSelectHtml;

    // initial charts to be visualized
    var initialAlgoList = [0, 1, 3];
    initialAlgoList.forEach(function(algoIndex, i){
      createChartBlock(algoList[algoIndex].key, algoList[algoIndex].name);
    });

    document.getElementById('drawChartsBtn').addEventListener('click', function(){
      var samplingAlgoKey = algoSelectElem.value;
      // find name from algoList
      var samplingAlgoName =
        algoList.filter(function(o){ return o.key === samplingAlgoKey; })[0].name;

      // create chart block
      createChartBlock(samplingAlgoKey, samplingAlgoName);
    });

    // add resize event handler
    window.onresize = redraw;

  };

  // call init on window onload
  window.onload = init;

})();
