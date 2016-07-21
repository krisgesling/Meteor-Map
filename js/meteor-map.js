// Map dimensions
var w = window.innerWidth;
var h = window.innerHeight;
var rScale;

var worldJSON = 'data/world-geo2-min.json';

var dataJSON = 'data/meteorite-strike-data.json';

function scaleCalc(data) {
    //console.log('ping');
  //console.log(data[1]);

  var rMax = d3.max(data, function(d) {
    //console.log(d);
    return d.properties.mass;
  });
    rScale = d3.scale.log()
    .domain([0,rMax])
    .range([1,10]);
}

function renderMap(world, data) {

  var projection = d3.geo.miller()
      .translate([w/2,h/2])
      .scale(180);
  var path = d3.geo.path()
                   .projection(projection);

  var svg = d3.select('body')
					  	.append('svg')
					  	.attr('width', w)
					  	.attr('height', h)
              .style('background','#eee');/*
              THIS IS FOR ZOOM
  .append("g")
    .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
  .append("g");

  svg.append("rect")
    .attr("class", "overlay")
    .attr("width", w)
    .attr("height", h)
  .style('background','#266D98');*/

  d3.json(world, function(json) {
        svg.selectAll('path')
           .data(json.features)
           .enter()
           .append('path')
           .attr('d', path)
           .attr('id', function(d) {
          return d.id;
        })
           .style('fill', '#004500');
});
  d3.json(data, function(json) {
    svg.selectAll('circle')
       .data(json.features)
       .enter()
       .append('circle')
       .attr('cx', function(d) {
         if (d.geometry) { return projection([d.geometry.coordinates[0],d.geometry.coordinates[1]])[0]; }
       })
      .attr('cy', function(d) {
         if (d.geometry) { return projection([d.geometry.coordinates[0],d.geometry.coordinates[1]])[1]; }
       })
      .attr('r', function(d) {
        return d.properties.mass/1000000+1;
        // need to shift to using scale
        // rScale(d.properties.mass);
      })
      .style('fill', function (d) {
          return (d.properties.id ==  23593) ? 'red' : 'yellow';
    });
  });
}

function addDataPoints(data) {

}
/*** Zooming ***/
function zoom() {
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

/*** Primary calls ***/
d3.json(dataJSON, function(error, json) {
  if (error) return console.warn(error);
    scaleCalc(json.features);
});
renderMap(worldJSON, dataJSON);


