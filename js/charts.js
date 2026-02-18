
/**
 * Chart.js Integration
 */

function updateCharts() {
    updateTrendChart();
    updateComponentsChart();
    updateLossesChart();
    updateMachineChart();
}

// Trend Chart
function updateTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    const filtered = getFilteredRecords().slice(0, 7).reverse();
    
    if (charts.trend) charts.trend.destroy();
    
    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filtered.map(r => formatDate(r.date)),
            datasets: [{
                label: 'OEE %',
                data: filtered.map(r => r.oee),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: value => value + '%'
                    }
                }
            }
        }
    });
}

// Components Chart
function updateComponentsChart() {
    const ctx = document.getElementById('componentsChart');
    if (!ctx) return;
    
    const filtered = getFilteredRecords();
    if (filtered.length === 0) return;
    
    const avgA = filtered.reduce((sum, r) => sum + r.availability, 0) / filtered.length;
    const avgP = filtered.reduce((sum, r) => sum + r.performance, 0) / filtered.length;
    const avgQ = filtered.reduce((sum, r) => sum + r.quality, 0) / filtered.length;
    
    if (charts.components) charts.components.destroy();
    
    charts.components = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Availability', 'Performance', 'Quality'],
            datasets: [{
                label: 'Percentage',
                data: [avgA, avgP, avgQ],
                backgroundColor: [
                    'rgba(245, 87, 108, 0.8)',
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(67, 233, 123, 0.8)'
                ],
                borderColor: [
                    'rgb(245, 87, 108)',
                    'rgb(79, 172, 254)',
                    'rgb(67, 233, 123)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: value => value + '%'
                    }
                }
            }
        }
    });
}

// Losses Chart
function updateLossesChart() {
    const ctx = document.getElementById('lossesChart');
    if (!ctx) return;
    
    const filtered = getFilteredRecords();
    if (filtered.length === 0) return;
    
    const losses = {
        'Breakdowns': filtered.reduce((sum, r) => sum + (r.breakdown_time || 0), 0),
        'Setup/Changeover': filtered.reduce((sum, r) => sum + (r.setup_time || 0), 0),
        'Minor Stops': filtered.reduce((sum, r) => sum + (r.minor_stops || 0), 0),
        'Material Shortage': filtered.reduce((sum, r) => sum + (r.material_shortage || 0), 0),
        'Startup Rejects': filtered.reduce((sum, r) => sum + (r.startup_rejects || 0), 0),
        'Production Rejects': filtered.reduce((sum, r) => sum + (r.production_rejects || 0), 0)
    };
    
    if (charts.losses) charts.losses.destroy();
    
    charts.losses = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(losses),
            datasets: [{
                data: Object.values(losses),
                backgroundColor: [
                    '#ff6b6b',
                    '#ee5a6f',
                    '#feca57',
                    '#48dbfb',
                    '#ff9ff3',
                    '#54a0ff'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Machine Chart
function updateMachineChart() {
    const ctx = document.getElementById('machineChart');
    if (!ctx) return;
    
    const filtered = getFilteredRecords();
    
    // Group by machine
    const machineData = {};
    filtered.forEach(r => {
        if (!machineData[r.machine_id]) {
            machineData[r.machine_id] = [];
        }
        machineData[r.machine_id].push(r.oee);
    });
    
    const machines = Object.keys(machineData);
    const avgOEE = machines.map(m => 
        machineData[m].reduce((sum, oee) => sum + oee, 0) / machineData[m].length
    );
    
    if (charts.machine) charts.machine.destroy();
    
    charts.machine = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: machines,
            datasets: [{
                label: 'Average OEE %',
                data: avgOEE,
                backgroundColor: avgOEE.map(v => 
                    v >= 85 ? 'rgba(67, 233, 123, 0.8)' :
                    v >= 70 ? 'rgba(254, 202, 87, 0.8)' :
                    'rgba(255, 107, 107, 0.8)'
                ),
                borderColor: avgOEE.map(v =>
                    v >= 85 ? 'rgb(67, 233, 123)' :
                    v >= 70 ? 'rgb(254, 202, 87)' :
                    'rgb(255, 107, 107)'
                ),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: value => value + '%'
                    }
                }
            }
        }
    });
}