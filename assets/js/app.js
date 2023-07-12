// Define chart configuration
const chartConfig = {
  height: 500,
  width: 800,
  margin: { top: 20, right: 40, bottom: 80, left: 100 },
  xAxisLabelX: "Obese (BMI > 30)(%)",
  xAxisLabelY: "Current Smoker (%)",
  analysisResponses: [
    "There is a strong negative correlation (-0.751735757) between having at least a Bachelor's Degree and being obese.",
    "There is a negative correlation (-0.617179941) between having at least a Bachelor's Degree and being a current smoker.",
    "There is a positive correlation (0.67396584) between being a high school graduate and being obese.",
    "There is a strong positive correlation (0.757923374) between being a high school graduate and being a current smoker."
  ]
};

// Select the chart container and append an SVG element
const svg = d3.select(".chart")
  .append("svg")
  .attr("width", 900)
  .attr("height", 500)
  .append("g")
  .attr("transform", "translate(100, 20)");

// Create a tooltip element
const tooltip = d3.select(".chart").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Define scales for the x-axis and y-axis
const yScale = d3.scaleLinear().range([480, 0]);
const xScale = d3.scaleLinear().range([0, 700]);

// Define axis functions for the x-axis and y-axis
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

// Variables for storing minimum and maximum values
let xMin, xMax, yMax;

// Function to find minimum and maximum values from data
function findMinAndMax(dataColumnX) {
  xMin = d3.min(myData, data => Number(data[dataColumnX]) * 0.8);
  xMax = d3.max(myData, data => Number(data[dataColumnX]) * 1.1);
  yMax = d3.max(myData, data => Number(data.bachelorOrHigher) * 1.1);
}

// Function to write analysis text based on selected axes
function writeAnalysis(xAxis, yAxis) {
  const analysisText = document.getElementById('analysis');
  const responses = chartConfig.analysisResponses;
  const responseIndex = xAxis === "obese" ? (yAxis === "bachelorOrHigher" ? 0 : 2) : (yAxis === "bachelorOrHigher" ? 1 : 3);
  analysisText.innerHTML = responses[responseIndex];
}

// Read data from CSV file
d3.csv("data.csv", function(err, myData) {
  if (err) throw err;

  // Data preprocessing: convert string values to numbers
  myData.forEach(data => {
    data.obese = Number(data.obese);
    data.bachelorOrHigher = Number(data.bachelorOrHigher);
    data.currentSmoker = Number(data.currentSmoker);
  });

  // Create the initial chart
  createChart("obese", "bachelorOrHigher");

  // Function to create/update the chart based on selected axes
  function createChart(xAxis, yAxis) {
    // Calculate the minimum and maximum values for the selected x-axis
    findMinAndMax(xAxis);

    // Set the domain for the x-axis and y-axis scales
    xScale.domain([xMin, xMax]);
    yScale.domain([0, yMax]);

    // Create a tooltip using D3.tip plugin
    const toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(data => {
        const itemName = data.state;
        const itemEdu = Number(data.bachelorOrHigher);
        const itemInfo = Number(data[xAxis]);
        const itemString = xAxis === "obese" ? "Obese: " : "Smoker: ";
        const eduString = yAxis === "bachelorOrHigher" ? "College Grad: " : "HS Grad: ";
        return `${itemName}<hr>${eduString}${itemEdu}%<br>${itemString}${itemInfo}%`;
      });

    // Call the tooltip on the SVG element
    svg.call(toolTip);

    // Create circles representing data points
    const circles = svg.selectAll("circle")
      .data(myData)
      .enter()
      .append("circle")
      .attr("cx", data => xScale(Number(data[xAxis])))
      .attr("cy", data => yScale(Number(data.bachelorOrHigher)))
      .attr("r", "12")
      .attr("fill", "lightblue")
      .on("mouseover", toolTip.show)
      .on("mouseout", toolTip.hide);

    // Add state abbreviations as labels for data points
    const texts = svg.selectAll("text")
      .data(myData)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("class", "stateText")
      .style("fill", "white")
      .style("font", "10px sans-serif")
      .style("font-weight", "bold")
      .text(data => data.abbr)
      .on("mouseover", toolTip.show)
      .on("mouseout", toolTip.hide)
      .attr("x", data => xScale(Number(data[xAxis])))
      .attr("y", data => yScale(Number(data.bachelorOrHigher)) + 4);

    // Append x-axis to the SVG
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0,480)")
      .call(xAxis);

    // Append y-axis to the SVG
    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    // Update the axis label for the y-axis
    svg.select(".axis-text[data-axis-name='bachelorOrHigher']").text("Bachelor's Degree or Greater");

    // Set the initial active and inactive classes for axis labels
    svg.selectAll(".axis-text")
      .classed("active", false)
      .classed("inactive", true);

    // Set the active class for the selected x-axis label
    svg.select(`.axis-text[data-axis-name='${xAxis}']`)
      .classed("inactive", false)
      .classed("active", true);

    // Write the analysis text based on the selected axes
    writeAnalysis(xAxis, yAxis);
  }

  // Event listener for clicking on axis labels
  d3.selectAll(".axis-text").on("click", function() {
    const clickedSelection = d3.select(this);
    const isClickedSelectionInactive = clickedSelection.classed("inactive");
    const clickedAxis = clickedSelection.attr("data-axis-name");

    if (isClickedSelectionInactive) {
      createChart(clickedAxis, currentAxisLabelY);
    }
  });
});
