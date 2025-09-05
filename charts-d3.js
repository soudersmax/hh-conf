// charts-d3.js: Render bar charts for each question across all programs

// Load the JSON data (fetch from local file)
fetch('program_evaluation_summary.json')
	.then(response => response.json())
	.then(data => {
		renderAllBarCharts(data);
	});

function aggregateCounts(data, questionType) {
	// Aggregate counts for each answer across all programs
	const counts = {};
	data.forEach(program => {
		const responses = program.Responses.find(r => r.Question === questionType);
		if (responses) {
			Object.entries(responses.counts).forEach(([key, value]) => {
				if (!counts[key]) counts[key] = 0;
				counts[key] += value;
			});
		}
	});
	return counts;
}

function renderBarChart(divId, counts, title) {
	const labels = Object.keys(counts);
	const values = labels.map(l => counts[l]);
	const trace = {
		x: labels,
		y: values,
		type: 'bar',
		marker: { color: 'rgba(55,128,191,0.7)' }
	};
	const layout = {
		title: title,
		margin: { t: 40, b: 120 },
		xaxis: { tickangle: -45 }
	};
	Plotly.newPlot(divId, [trace], layout);
}

function renderAllBarCharts(data) {
	// Aggregate and render for each question
	const questions = [
		{ type: 'intentions', div: 'intentionsBar', title: 'Intentions Across All Programs' },
		{ type: 'purchase_reason', div: 'purchaseReasonBar', title: 'Purchase Reason Across All Programs' },
		{ type: 'impacts', div: 'impactsBar', title: 'Impacts Across All Programs' }
	];
	questions.forEach(q => {
		const counts = aggregateCounts(data, q.type);
		renderBarChart(q.div, counts, q.title);
	});
}
