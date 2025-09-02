function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selProgram");

  // Use the list of sample names to populate the select options
  d3.json("intentions_summary.json").then((data) => {
    var programNames = data.programs;

    programNames.forEach((program) => {
      selector
        .append("option")
        .text(program)
        .property("value", program);
    });

    // Use the first sample from the list to build the initial plots
    var firstProgram = programNames[0];
    buildCharts(firstProgram);
    buildMetadata(firstProgram);
  });
}

// Initialize the dashboard
init();

function optionChanged(newProgram) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newProgram);
  buildCharts(newProgram);
  
}
// Ratings Panel
function buildMetadata(program) {
  d3.json("intentions_summary.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(progObj => progObj.program == program);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#program-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);      
    });

  });
}