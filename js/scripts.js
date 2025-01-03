document.addEventListener('DOMContentLoaded', () => {
    const urlForm = document.getElementById('urlForm');
    const userUrlInput = document.getElementById('userUrl');
    const analysisTypeSelect = document.getElementById('analysisType');
    const startButton = document.getElementById('startButton');
    const loadingSection = document.getElementById('loadingSection');
    const resultsSection = document.getElementById('resultsSection');
    const compareSection = document.getElementById('compareSection');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    const urlValidationMessage = document.getElementById('urlValidationMessage');
    const statisticsElements = {
        impressions: document.getElementById('impressions'),
        clicks: document.getElementById('clicks'),
        ctr: document.getElementById('ctr'),
        cpm: document.getElementById('cpm'),
        revenue: document.getElementById('revenue')
    };

    let chart;
    let analysisHistory = JSON.parse(localStorage.getItem('analysisHistory')) || [];

    urlForm.addEventListener('submit', handleAnalysis);
    userUrlInput.addEventListener('input', validateUrlInput);
    analysisTypeSelect.addEventListener('change', updateAnalysisType);

    function validateUrlInput() {
        const url = userUrlInput.value.trim();
        if (isValidUrl(url)) {
            urlValidationMessage.textContent = 'Valid URL';
            urlValidationMessage.className = 'validation-message success';
        } else {
            urlValidationMessage.textContent = 'Please enter a valid URL';
            urlValidationMessage.className = 'validation-message error';
        }
    }

    function updateAnalysisType() {
        const analysisType = analysisTypeSelect.value;
        startButton.textContent = `Start ${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} Analysis`;
    }

    function handleAnalysis(event) {
        event.preventDefault();
        const url = userUrlInput.value.trim();
        const analysisType = analysisTypeSelect.value;

        if (!isValidUrl(url)) {
            showError('Please enter a valid URL.');
            return;
        }

        showLoading(true);
        hideError();
        hideResults();

        // Simulate API call
        setTimeout(() => {
            const statistics = generateRandomStatistics(analysisType);
            displayStatistics(statistics);
            updateChart(statistics);
            saveAnalysis(url, statistics, analysisType);
            updateComparisonTable();
            showLoading(false);
        }, 2000);
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function showLoading(isLoading) {
        loadingSection.classList.toggle('hidden', !isLoading);
        startButton.disabled = isLoading;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorSection.classList.remove('hidden');
    }

    function hideError() {
        errorSection.classList.add('hidden');
    }

    function hideResults() {
        resultsSection.classList.add('hidden');
        compareSection.classList.add('hidden');
    }

    function generateRandomStatistics(analysisType) {
        const baseImpressions = Math.floor(Math.random() * 1000000) + 100000;
        const multiplier = analysisType === 'basic' ? 1 : analysisType === 'advanced' ? 1.5 : 2;
        
        const impressions = Math.floor(baseImpressions * multiplier);
        const clicks = Math.floor(impressions * (Math.random() * 0.2 + 0.01));
        const ctr = ((clicks / impressions) * 100).toFixed(2);
        const cpm = (Math.random() * 20 + 5).toFixed(2);
        const revenue = ((impressions / 1000) * parseFloat(cpm)).toFixed(2);

        return { impressions, clicks, ctr, cpm, revenue };
    }

    function displayStatistics(statistics) {
        resultsSection.classList.remove('hidden');

        Object.entries(statistics).forEach(([key, value]) => {
            const element = statisticsElements[key];
            if (element) {
                animateValue(element, 0, value, 1500);
            }
        });
    }

    function animateValue(element, start, end, duration) {
        const startTimestamp = performance.now();
        const step = (timestamp) => {
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            let currentValue = progress * (end - start) + start;

            if (element.id === 'ctr' || element.id === 'cpm' || element.id === 'revenue') {
                currentValue = currentValue.toFixed(2);
                if (element.id === 'ctr') {
                    currentValue += '%';
                } else {
                    currentValue = '$' + currentValue;
                }
            } else {
                currentValue = Math.floor(currentValue);
            }

            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }

    function updateChart(statistics) {
        if (chart) {
            chart.destroy();
        }

        const ctx = document.getElementById('statsChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Impressions', 'Clicks', 'CTR (%)', 'CPM ($)', 'Revenue ($)'],
                datasets: [{
                    label: 'Statistics',
                    data: [
                        statistics.impressions,
                        statistics.clicks,
                        parseFloat(statistics.ctr),
                        parseFloat(statistics.cpm),
                        parseFloat(statistics.revenue)
                    ],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function saveAnalysis(url, statistics, analysisType) {
        analysisHistory.unshift({ url, statistics, analysisType, timestamp: new Date().toISOString() });
        if (analysisHistory.length > 5) {
            analysisHistory.pop();
        }
        localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
    }

    function updateComparisonTable() {
        const comparisonTable = document.getElementById('comparisonTable');
        compareSection.classList.remove('hidden');

        let tableHTML = `
            <tr>
                <th>URL</th>
                <th>Analysis Type</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>CPM</th>
                <th>Revenue</th>
            </tr>
        `;

        analysisHistory.forEach(item => {
            tableHTML += `
                <tr>
                    <td>${item.url}</td>
                    <td>${item.analysisType}</td>
                    <td>${item.statistics.impressions.toLocaleString()}</td>
                    <td>${item.statistics.clicks.toLocaleString()}</td>
                    <td>${item.statistics.ctr}%</td>
                    <td>$${item.statistics.cpm}</td>
                    <td>$${item.statistics.revenue}</td>
                </tr>
            `;
        });

        comparisonTable.innerHTML = tableHTML;
    }
});

