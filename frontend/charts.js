// 數據可視化邏輯
let burnChart;
let holdersChart;

export function initCharts() {
    const ctxBurn = document.getElementById('burnChart')?.getContext('2d');
    const ctxHolders = document.getElementById('holdersChart')?.getContext('2d');

    if (ctxBurn) {
        burnChart = new Chart(ctxBurn, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'AEG Burned',
                    data: [12000, 19000, 31000, 50000, 80000, 120000],
                    borderColor: '#0784c3',
                    backgroundColor: 'rgba(7, 132, 195, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    if (ctxHolders) {
        holdersChart = new Chart(ctxHolders, {
            type: 'doughnut',
            data: {
                labels: ['Exchange', 'Team', 'Community', 'Burned'],
                datasets: [{
                    data: [20, 10, 60, 10],
                    backgroundColor: [
                        '#0784c3',
                        '#ff9500',
                        '#00d395',
                        '#ff3b30'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#666' }
                    }
                }
            }
        });
    }
}

export function updateCharts(data) {
    // 未來實際連網後在此更新數據
}
