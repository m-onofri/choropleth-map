const w = 1240;
const h = 600;
const margin = {top: 50, right: 50, bottom: 150, left: 75};

const color = d3.schemeOranges[8];
const threshold = d3.scaleThreshold()
                    .domain([12.5, 25.0, 37.5, 50.0, 62.5, 75.0, 87.5, 100])
                    .range(color);

console.log(color);

const path = d3.geoPath();

const canvas = d3.select(".graph")
                 .append("svg")
                 .attr("width", w)
                 .attr("height", h);

const tip = d3.tip()
              .attr("class", "d3-tip")
              .attr("id", "tooltip")
              .html(function(d){
                return d;
              })
              .direction("n")
              .offset([-30,0]);

canvas.call(tip);
              
Promise.all([
  d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json"),
  d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json")
]).then(function([education, counties]) { 
  canvas.append("g")
        .attr("class", "counties")
        .selectAll('path')
		    .data(topojson.feature(counties, counties.objects.counties).features)
		    .enter()
		    .append('path')
		    .attr('class', 'county')
        .attr("fill", function(d, i) {
          const value = education.filter((e) => e.fips === d.id)[0].bachelorsOrHigher;
          return threshold(value);
        })
		    .attr('d', path)
        .attr("data-fips", function(d) {
          return d.id
        })
        .attr("data-education", function(d) {
          const county = education.filter((e) => e.fips === d.id);
          return county[0].bachelorsOrHigher;
        })
        .on('mouseover', function(d) {
          const county = education.filter((e) => e.fips === d.id);
          const html =  county[0].area_name + ": " +   county[0].bachelorsOrHigher + "%";
          tip.attr("data-education",  county[0].bachelorsOrHigher)
          tip.show(html, this);
        })
        .on('mouseout', tip.hide);
  
  //Legend
  const x = d3.scaleLinear()
              .domain([0, 100])
              .range([0, 320]);

  const legendAxis = d3.axisBottom(x)
                        .tickSize(16, 0)
                        .tickValues(threshold.domain())
                        .tickFormat(function(x) { return x + '%' });

  const legend = canvas.append("g")
                       .attr("id", "legend")
                       .attr('transform', `translate(${500}, ${20})`)
                       .call(legendAxis);
  
  legend.selectAll("rect")
        .data(threshold.range().map(function(color) {
          const d = threshold.invertExtent(color);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
        .enter().insert("rect")
        .attr("height", 16)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return threshold(d[0]); });
});

