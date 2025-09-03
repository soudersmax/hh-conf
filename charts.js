// charts.js
// This file uses Plotly to create a bar graph from intentions_summary.json
// Dash is a Python framework, so for JS we use Plotly.js only

// Load intentions_summary.json and plot the chart
fetch('intentions_summary.json')
  .then(response => response.json())
  .then(data => {
    // Get columns except 'program_name' and 'Month'
    const columns = Object.keys(data[0]).filter(col => col !== 'program_name' && col !== 'Month');
    // Sum each column
    const sums = columns.map(col => data.reduce((acc, row) => acc + (Number(row[col]) || 0), 0));

    const trace = {
      x: columns,
      y: sums,
      type: 'bar',
      marker: { color: '#4fc3f7' }
    };

    const layout = {
      title: 'Intentions Summary',
      xaxis: { title: 'Intentions' },
      yaxis: { title: 'Sum' },
      plot_bgcolor: '#233c4d',
      paper_bgcolor: '#233c4d',
      font: { color: '#fff' }
    };

    Plotly.newPlot('intentions-bar-chart', [trace], layout);
  });

// To display the chart, add a <div id="intentions-bar-chart"></div> in your HTML
