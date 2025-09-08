// charts-d3.js: Render bar charts for each question across all programs

// Load the JSON data (fetch from local file)
document.addEventListener('DOMContentLoaded', function() {
    fetch('Data/program_evaluation_summary.json')
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
	// Filter out categories with zero values and sort bars in descending order by value
	const entries = Object.entries(counts)
		.filter(([_, value]) => value > 0)
		.sort((a, b) => b[1] - a[1]);
	// Multi-line wrap every 4 words
	function wrapLabel(label) {
		const words = label.split(' ');
		let lines = [];
		for (let i = 0; i < words.length; i += 4) {
			lines.push(words.slice(i, i + 4).join(' '));
		}
		return lines.join('<br>');
	}
	const labels = entries.map(e => {
		let label = e[0];
		if (["other_intention", "other_reason", "other_impact"].includes(label)) label = "Other";
		return wrapLabel(label);
	});
	const values = entries.map(e => e[1]);
	const trace = {
		x: labels,
		y: values,
		type: 'bar',
		marker: { color: '#95bc67' }
	};
	const layout = {
		margin: { t: 40, b: 120 }, // less space below
		plot_bgcolor: '#e2e5d6',
		paper_bgcolor: '#e2e5d6',
		font: { color: '#e2e5d6' },
		xaxis: {
			tickangle: -45, // rotate labels for readability
			tickfont: { size: 12, color: '#233c4d' },
			color: '#233c4d',
			automargin: true
		},
		yaxis: {
			tickfont: { size: 12, color: '#233c4d' },
			color: '#233c4d'
		}
	};
	Plotly.newPlot(divId, [trace], layout);
}

function renderAllBarCharts(data) {
	// Aggregate and render for each question
	const questions = [
		{
			type: 'What was your intention for attending this program?',
			div: 'intentionsBar',
			header: 'intentionsBar-header'
		},
		{
			type: 'What factors influenced your choice to attend this program, specifically?',
			div: 'purchaseReasonBar',
			header: 'purchaseReasonBar-header'
		},
		{
			type: 'Which of these statements best summarizes what you are taking away from your program experience and how you expect to integrate your experience into your daily life and/or within your own community?',
			div: 'impactsBar',
			header: 'impactsBar-header'
		}
	];
	questions.forEach(q => {
		const counts = aggregateCounts(data, q.type);
		renderBarChart(q.div, counts);
		// Set header text from first available question text in filtered data
		let questionText = '';
		for (const d of data) {
			const found = d.Responses.find(r => r.Question === q.type);
			if (found) {
				questionText = found.Question;
				break;
			}
		}
		document.getElementById(q.header).textContent = questionText ? questionText.charAt(0).toUpperCase() + questionText.slice(1).replace('_', ' ') : '';
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

	document.getElementById('stat1').innerHTML = `<span class="stat-label">Total Responses</span><span class="stat-value">${totalResponses}</span>`;
	document.getElementById('stat2').innerHTML = `<span class="stat-label">Minimum Rating</span><span class="stat-value">${minRating}</span>`;
	document.getElementById('stat3').innerHTML = `<span class="stat-label">Maximum Rating</span><span class="stat-value">${maxRating}</span>`;
	document.getElementById('stat4').innerHTML = `<span class="stat-label">Average Rating</span><span class="stat-value">${avgRating}</span>`;
}
