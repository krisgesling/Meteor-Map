/*** CONFIG ***/
var mapID = '#map-container',
    colorScale = [ '#FF0000', '#E50000', '#C20000', '#A00000', '#500000'],
    worldJSON = 'data/world-geo2-min.json',
    dataJSON = 'data/meteorite-strike-data.json',
    maxR = 15; // max size (radius) of meteor markers

// Map dimensions
var w = window.innerWidth,
    h = window.innerHeight - 10;

// Called on window resize
function sizeChange() {
  d3.select('#map-svg')
    .attr({
      width: window.innerWidth,
      height: window.innerHeight - 10
    });
}

// Call meteorite data
function callMeteorite(data, svg, projection) {
  d3.json(data, function(error, json) {
    if (error) return console.warn(error);

    function massConvert(mass) {
      // Converts numbers into units of mass (g, kg, t)
      // Input number, output string
      switch (true) {
        case (mass < 1000):
          mass += 'g';
          break;
        case (mass < 1000000):
          mass = mass / 1000 + 'kg';
          break;
        case (mass >= 1000000):
          mass = mass / 1000000 + 't';
          break;
        default:
          break;
      }
      return mass;
    }

    // Place meteorite strike circles
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
      d3.select('.tooltip h2')
      .text(d.properties.name);
      d3.select('.tooltip p')
      .html('<span class="label">Landed:</span> ' + date.getFullYear() + '<br><span class="label">Mass:</span> ' + massConvert(d.properties.mass) + '<br><span class="label">Type:</span> ' + d.properties.recclass);
      var tooltipWidth = d3.select('.tooltip')
      .node().getBoundingClientRect().width;
      mousePos[0] = mousePos[0] < (w/2) ? mousePos[0] : mousePos[0] - tooltipWidth;
      var tooltipHeight = d3.select('.tooltip')
      .node().getBoundingClientRect().height;
      mousePos[1] = mousePos[1] < (h/2) ? mousePos[1] : mousePos[1] - tooltipHeight;
      d3.select('.tooltip')
        .classed('hidden', false);

      d3.select('.tooltip')
        .style({
          left: mousePos[0] + 'px',
          top: mousePos[1] + 'px'
        });
    })
    .on('mouseout', function() {
      d3.select('.tooltip')
        .classed('hidden', true);
    });
  });
}

function renderMap(world, data) {
  // Init map svg
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

  // Draw countries on map
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

    setTimeout(callMeteorite(data, svg, projection), 100);
  });
}

/*** Primary calls ***/
renderMap(worldJSON, dataJSON);
d3.select(window).on("resize", sizeChange);
