import * as d3 from "d3";
import "./styles.css";
import * as _ from "lodash";

var w = 900;
var h = 700;

let petalPath = "M 0,0 C -10, -10 -10, -40 0, -50 C 10, -40 10, -10, 0,0 ";

var svg = d3
  .select("div#container")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .style("background-color", "#c9e8fd")
  .attr("viewBox", "0 0 " + w + " " + h)
  .classed("svg-content", true);

var projection = d3
  .geoMercator()
  .translate([w / 2, h / 2])
  .scale(5300)
  .center([-105.5, 39]); //40, 104
var path = d3.geoPath().projection(projection);

// load data
var coloMap = d3.json("CO-counties.geojson"); //this is res[0]
const data = d3.csv("data/FakeData.csv", type); //this is res[1]
//var names = coloMap

//type conversion for data
function type(d) {
  return {
    county: d.County,
    energy: +d.PercentRenewable,
    ghg: +d.GHG,
    transit: +d.GreenTransit
  };
}

Promise.all([coloMap, data]).then((res) => {
  console.log(res[1]);

  const numData = res[1].length + 1;
  const energyMinMax = d3.extent(res[1], (d) => d.energy);
  const ghgMinMax = d3.extent(res[1], (d) => d.ghg);
  const sizeScale = d3.scaleLinear().domain(energyMinMax).range([0.25, 1]); //size mapped to energy
  const numPetalScale = d3.scaleQuantize().domain(ghgMinMax).range([5, 7, 12]); //number mapped to ghg
  const xScale = d3.scaleLinear().domain([0, numData]).range([0, 1000]);

  //for each county, return data (petSize, numPetals, petals (array of petals + angles))
  const flowersData = _.map(res[1], (d) => {
    const numPetals = numPetalScale(d.ghg);
    // console.log(numPetals);
    const petSize = sizeScale(d.energy);
    return {
      petSize,
      petals: _.times(numPetals, (i) => {
        return { angle: (360 * i) / numPetals, petalPath };
      }),
      numPetals
    };
  });

  //console.log(flowersData[0].petals);

  svg
    .selectAll("path")
    .data(res[0].features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", path);

  let flowers = svg
    .append("g")
    .selectAll()
    .data(res[0].features)
    .enter()
    .append("path")
    .attr("transform", (d) => `translate(${path.centroid(d)}) rotate(45)`)
    //.attr("transform", "rotate(45)") //rotates each petal
    //.attr("r", 2)
    .attr("d", petalPath)
    .attr("fill", "blue");

  let coordinates = projection([-104.990251, 39.7392358]);
  svg
    .append("circle")
    .attr("cx", coordinates[0])
    .attr("cy", coordinates[1])
    .attr("r", 5)
    .style("fill", "red");
});
//path.centroid(res);
