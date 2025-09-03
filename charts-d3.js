// charts-d3.js
// This file uses Plotly.js and d3.js to create a bar graph from intentions_summary.json

// Load intentions_summary.json using d3 and plot the chart with Plotly
function renderIntentionsBarChart() {
    d3.json('intentions_summary.json').then(function(data) {
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
}

// Call this function after the page loads
window.addEventListener('DOMContentLoaded', renderIntentionsBarChart);

// To display the chart, add a <div id="intentions-bar-chart"></div> in your HTML
// Make sure to include Plotly.js and d3.js in your HTML:
// <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
// <script src="https://d3js.org/d3.v7.min.js"></script>
// <script src="charts-d3.js"></script>
