function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

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