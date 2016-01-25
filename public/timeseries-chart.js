
(function(){

  /**
   * Class that represents timeseries chart.
   */
  function TimeseriesChart(container, options){

    // private variables
    var x, y, xAxis, yAxis, line, svg, brush,
      options = options || {}, selectable = false,
      margin = {top: 25, right: 0, bottom: 25, left: 50},
      eventHandlers = {}, canvas, drawOnCanvas = false;

    // init timeseries chart
    var _init = function(){ // constructor for this class

      if (!container){
        throw 'Invalid chart container';
      }

      container.innerHTML = ''; // clear container

      margin = options.margin || margin;
      selectable = options.selectable || selectable;
      drawOnCanvas = options.drawOnCanvas || drawOnCanvas;

      var width = container.offsetWidth - margin.left - margin.right;
      var height = container.offsetHeight - margin.top - margin.bottom;

      x = d3.time.scale()
        .range([0, width]);

      y = d3.scale.linear()
        .range([height, 0]);

      xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(5);

      yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(5);

      svg = d3.select(container).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg.append('g')
        .attr('class', 'x axis')
			  .attr('transform', 'translate(0,' + height + ')');

      svg.append('g')
        .attr('class', 'y axis');

      if (!drawOnCanvas){
        line = d3.svg.line()
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); });

        svg.append('path')
          .attr('class', 'line');
      }else{
        canvas = d3.select(container).append('canvas')
          .attr('width', width)
          .attr('height', height)
          .style('top', margin.top + 'px')
          .style('left', margin.left + 'px');
      }


      if (selectable){

        brush = d3.svg.brush()
          .x(x)
          .on('brushend', function(){
            if (typeof eventHandlers['selectend'] === 'function'){
              eventHandlers['selectend'].call(container, {selection: brush.extent()});
            }
          })
          .on('brush', function(){
            if (typeof eventHandlers['select'] === 'function'){
              eventHandlers['select'].call(container, {selection: brush.extent()});
            }
          });

        svg.append('g')
          .attr('class', 'x brush')
          .call(brush)
          .selectAll('rect')
          .attr('height', height);
      }

      var infoGroup = svg.append('g')
        .attr('class', 'info');

      infoGroup.append('text')
        .attr('class', 'count')
        .attr('x', width)
        .attr('y', -margin.top);

      infoGroup.append('text')
        .attr('class', 'time')
        .attr('x', width)
        .attr('y', -margin.top + 12);

    };

    /**
     * Function to draw line on html5 canvas.
     */
    var canvasLine = function(canvas, data){

      var n = data.length;
      canvas.each(function draw() {
  			var ctx = this.getContext('2d'),
  			    i = 0;

        // clear
        ctx.clearRect(0, 0, this.width, this.height);

  			ctx.strokeStyle = 'steelblue';
  			ctx.lineWidth = 1.5;
  			ctx.lineCap = 'butt';
  			ctx.miterLimit = 10;
        ctx.lineJoin = 'miter';

  			ctx.beginPath();
  			ctx.moveTo.apply(ctx, getCoordinates(data[0]));
  			while (++i < n) {
  				ctx.lineTo.apply(ctx, getCoordinates(data[i]));
  			}
  			ctx.stroke();

		  });

      function getCoordinates(d) {
			  return [x(d[0]), y(d[1])];
		  }
    };

    /**
     * Update chart with new data.
     */
    this.update = function(dataUrl, animate, callback){

      callback = callback || function(){};

      d3.json(dataUrl, function(error, result){

        var data = result.data;

        // update scales
        x.domain(d3.extent(data, function(d) { return d[0]; }));
        y.domain(d3.extent(data, function(d) { return d[1]; }));

        if (animate){
          // update axes
          svg.selectAll('g .x.axis')
            .transition()
            .call(xAxis);

          svg.selectAll('g .y.axis')
            .transition()
            .call(yAxis);

          // update line
          if (!drawOnCanvas){
            svg.selectAll('.line')
              .datum(data)
              .transition()
      				.attr('d', line);
          }else{
            canvas.call(canvasLine, data);
          }
        }else{
          // update axes
          svg.selectAll('g .x.axis')
            .call(xAxis);

          svg.selectAll('g .y.axis')
            .call(yAxis);

          // update line
          if (!drawOnCanvas){
            svg.selectAll('.line')
              .datum(data)
      				.attr('d', line);
          }else{
            canvas.call(canvasLine, data);
          }
        }

        svg.selectAll('g .info .count')
          .datum(data.length)
          .text(function(d){
            return 'Point Count: ' + d;
          });

        svg.selectAll('g .info .time')
          .datum(result.time)
          .text(function(d){
            return 'Time Taken: ' + (d / 1000) + 'secs';
          });

        callback();

      });
      return this;
    };

    /**
     * Update selection region mask based on x axis values.
     */
    this.updateSelectionMask = function(selection, animate){
      if (selectable){
        var xEntent = x.domain();
        if (selection[0].getTime() > xEntent[1].getTime() ||
          selection[1].getTime() < xEntent[0].getTime()){
            svg.select('g .brush').call(brush.clear());
        }else{
          brush.extent(selection);
          if (animate){
            brush(svg.select('g .brush').transition());
          }else{
            brush(svg.select('g .brush'));
          }
        }
      }
      return this;
    };

    /**
     * Attach an event to chart.
     */
    this.on = function(event, handler){
      eventHandlers[event] = handler;
      return this;
    };

    /**
     * Returns chart container dom element.
     */
    this.container = function(){
      return container;
    };

    /**
     * Select a portion of the chart based on pixel values
     * programatically.
     */
    this.select = function(selectRegion){
      if (selectable){
        var w = x.range()[1];
        if (!selectRegion && !brush.empty()){
          this.updateSelectionMask(brush.extent());
        }else{
          selectRegion = selectRegion || [w/3, (2 * w)/3]; // default select region - middle portion
          this.updateSelectionMask([x.invert(selectRegion[0]), x.invert(selectRegion[1])]);
        }

        if (typeof eventHandlers['select'] === 'function'){
          eventHandlers['select'].call(container, {selection: brush.extent()});
        }
        if (typeof eventHandlers['selectend'] === 'function'){
          eventHandlers['selectend'].call(container, {selection: brush.extent()});
        }
      }
    };

    // Call constructor
    _init();
  }

  // make it globally available
  if (!window.createTimeseriesChart){
    window.createTimeseriesChart = function(container, options){
      return new TimeseriesChart(container, options);
    };
  }

})();
