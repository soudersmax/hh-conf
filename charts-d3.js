// charts-d3.js: Render bar charts for each question across all programs

// Load the JSON data (fetch from local file)
document.addEventListener('DOMContentLoaded', function() {
	fetch('program_evaluation_summary.json')
		.then(response => response.json())
		.then(data => {
			populateDropdowns(data);
			renderAllBarCharts(data);

			// Add event listeners for dropdowns
			document.getElementById('month-select').addEventListener('change', function() {
				filterAndRenderCharts(data);
			});
			document.getElementById('program-select').addEventListener('change', function() {
				filterAndRenderCharts(data);
			});
		});
function filterAndRenderCharts(data) {
	const month = document.getElementById('month-select').value;
	const program = document.getElementById('program-select').value;

	let filtered = data;
	if (month) {
		filtered = filtered.filter(d => d.Month === month);
	}
	if (program) {
		filtered = filtered.filter(d => d["Program Name"] === program);
	}
	renderAllBarCharts(filtered);
}
});

function populateDropdowns(data) {
	// Get unique months and program names
	const months = [...new Set(data.map(d => d.Month))].sort();
	const programs = [...new Set(data.map(d => d["Program Name"]))].sort();

	const monthSelect = document.getElementById('month-select');
	const programSelect = document.getElementById('program-select');

	// Remove all except first option
	monthSelect.length = 1;
	programSelect.length = 1;

	months.forEach(month => {
		const opt = document.createElement('option');
		opt.value = month;
		opt.textContent = month;
		monthSelect.appendChild(opt);
	});
	programs.forEach(program => {
		const opt = document.createElement('option');
		opt.value = program;
		opt.textContent = program;
		programSelect.appendChild(opt);
	});
}

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
		margin: { t: 40, b: 120 },
		xaxis: { tickangle: -45 }
	};
	Plotly.newPlot(divId, [trace], layout);
}

function renderAllBarCharts(data) {
	// Aggregate and render for each question
	const questions = [
		{ type: 'intentions', div: 'intentionsBar' },
		{ type: 'purchase_reason', div: 'purchaseReasonBar' },
		{ type: 'impacts', div: 'impactsBar' }
	];
	questions.forEach(q => {
		const counts = aggregateCounts(data, q.type);
		renderBarChart(q.div, counts);
	});

	// Calculate stats from all_responses for filtered programs
	let allRatings = [];
	data.forEach(d => {
		if (d.Ratings && Array.isArray(d.Ratings.all_responses)) {
			allRatings = allRatings.concat(d.Ratings.all_responses);
		}
	});
	let totalResponses = allRatings.length;
	let minRating = allRatings.length ? Math.min(...allRatings) : 'N/A';
	let maxRating = allRatings.length ? Math.max(...allRatings) : 'N/A';
	let avgRating = allRatings.length ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2) : 'N/A';

	document.getElementById('stat1').textContent = `Total Responses: ${totalResponses}`;
	document.getElementById('stat2').textContent = `Minimum Rating: ${minRating}`;
	document.getElementById('stat3').textContent = `Maximum Rating: ${maxRating}`;
	document.getElementById('stat4').textContent = `Average Rating: ${avgRating}`;
}
