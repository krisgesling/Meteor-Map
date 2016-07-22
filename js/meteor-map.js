/*** CONFIG ***/
var mapID = '#map-container';

// Map dimensions
var w = window.innerWidth;
var h = window.innerHeight;

var worldJSON = 'data/world-geo2-min.json';
var dataJSON = 'data/meteorite-strike-data.json';
var rScale;

function scaleCalc(data) {
    //console.log('ping');
  //console.log(data[1]);
  var rMax = d3.max(data, function(d) {
    return d.properties.mass ? d.properties.mass : 0;
  });

  rScale = d3.scale.log()
                .domain([0,rMax])
                .range([1,10]);

}

function sizeChange() {
  d3.select('#map-svg')
    .attr({
      width: window.innerWidth,
      height: window.innerHeight
    });
}

function renderMap(world, data) {


  function zoomed() {
        svg.attr('transform','translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
      }
  var scaleMod = window.innerwidth < 900 ? 20 : 180;
  var projection = d3.geo.miller()
      .translate([w/2,h/2])
      .scale(scaleMod);
  var path = d3.geo.path()
                   .projection(projection);

  var zoom = d3.behavior.zoom()
                   .scale(1)
                   .scaleExtent([1,12])
                   .on('zoom', zoomed);

  var svg = d3.select(mapID)
					  	.append('svg')
					  	.attr({
                width: w,
					  	  height: h,
                id: 'map-svg'
              })
              .style('background','#BECFE1')
              .append('g')
              .attr('id', 'firstG')
              .call(zoom)
              .append('g')
              .attr('id', 'secondG');

  svg.append("rect")
    .attr("class", "overlay")
    .attr("width", w)
    .attr("height", h)
  .style('background','#266D98');

  d3.json(world, function(json) {
        svg.selectAll('path')
           .data(json.features)
           .enter()
           .append('path')
           .attr('d', path)
           .attr('stroke', '#ccc')
           .attr('stroke-width', '0.2px')
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
        //return d.properties.mass/1000000+1;
        // need to shift to using scale
        return d.properties.mass ? rScale(d.properties.mass) : 1;
      })
      .style('fill', function (d) {
          return (d.properties.id ==  23593) ? '#6F1C2C' : 'yellow';
    });
  });
}

/*** Primary calls ***/
d3.json(dataJSON, function(error, json) {
  if (error) return console.warn(error);
    scaleCalc(json.features);
});
renderMap(worldJSON, dataJSON);

d3.select(window).on("resize", sizeChange);
