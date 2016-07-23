/*** CONFIG ***/
var mapID = '#map-container',
    //colorScale = ['#F9CFD7', '#EF8096', '#B5435A', '#6F1C2C', '#321319'],
    //colorScale = ['#FF5050', '#FF1616', '#E20000', '#B10000', '#7D0000'],
    //colorScale = ['#FF5050', '#FF0000', '#B40000', '#8A0000', '#500000'],
    colorScale = [ '#FF0000', '#E50000', '#C20000', '#A00000', '#500000'],
    worldJSON = 'data/world-geo2-min.json',
    dataJSON = 'data/meteorite-strike-data.json';

// Map dimensions
var w = window.innerWidth,
    h = window.innerHeight,
    maxR = 15;

function sizeChange() {
  d3.select('#map-svg')
    .attr({
      width: window.innerWidth,
      height: window.innerHeight
    });
}

function renderMap(world, data) {
  var scaleMod = window.innerwidth < 900 ? 20 : 180;
  var projection = d3.geo.miller()
      .translate([w/2,h/2])
      .scale(scaleMod);
  var path = d3.geo.path()
                   .projection(projection);
  function zoomed() {
        svg.attr('transform','translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
      }
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

  d3.json(world, function(error, json) {
    if (error) return console.warn(error);
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
  d3.json(data, function(error, json) {
    if (error) return console.warn(error);

    svg.selectAll('circle')
       .data(json.features)
       .enter()
       .append('circle')
       .attr('cx', function(d) {
         if (d.geometry) {
           return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
         }
       })
      .attr('cy', function(d) {
         if (d.geometry) {
           return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
         }
       })
      .attr('r', function(d) {
        // Define size of circle based on mass of meteor.
        //Null also returns 1.
        var r = d3.scale.sqrt()
                  .domain([1, 23000000])
                  .rangeRound([1, maxR]);
        d.properties.r = r(Number(d.properties.mass));
        return d.properties.r;
      })
      .style('fill', function (d) {
        return colorScale[parseInt(d.properties.r / maxR * colorScale.length -1)];
      })

      // TOOLTIPS
      .on('mouseover', function(d) {
        var mousePos = d3.mouse(d3.select(mapID).node()),
            date = new Date(d.properties.year);
        //if (d.properties.mass > 1000000) {console.log(date.getFullYear());}
        d3.select('.tooltip h2')
          .text(d.properties.name);
        d3.select('.tooltip p')
          .html('Landed: ' + date.getFullYear() + '<br>Mass: ' + d.properties.mass + '<br>Classification: ' + d.properties.recclass);
        d3.select('.tooltip').classed('hidden', false);
      })
      .on('mouseout', function() {
        d3.select('.tooltip').classed('hidden', true);
      })
    ;

  });
}

/*** Primary calls ***/
renderMap(worldJSON, dataJSON);

d3.select(window).on("resize", sizeChange);
