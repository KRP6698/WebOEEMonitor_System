
/**
 * Dashboard Logic
 */

let allRecords = [];
let charts = {};

// Initialize dashboard
async function initDashboard() {
    await loadRecords();
    updateKPIs();
    updateCharts();
    updateRecentRecords();
    loadMachineList();
}

// Load records from Supabase
async function loadRecords() {
    try {
        const { data, error } = await supabase
            .from('oee_records')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        
        allRecords = data;
    } catch (error) {
        console.error('Error loading records:', error);
        alert('ไม่สามารถโหลดข้อมูลได้: ' + error.message);
    }
}

// Update KPI cards
function updateKPIs() {
    const filtered = getFilteredRecords();
    
    if (filtered.length === 0) {
        document.getElementById('oee-value').textContent = '--';
        document.getElementById('oee-status').textContent = 'ไม่มีข้อมูล';
        return;
    }
    
    // Calculate averages
    const avgOEE = filtered.reduce((sum, r) => sum + r.oee, 0) / filtered.length;
    const avgA = filtered.reduce((sum, r) => sum + r.availability, 0) / filtered.length;
    const avgP = filtered.reduce((sum, r) => sum + r.performance, 0) / filtered.length;
    const avgQ = filtered.reduce((sum, r) => sum + r.quality, 0) / filtered.length;
    
    // Update OEE
    document.getElementById('oee-value').textContent = formatPercent(avgOEE);
    document.getElementById('oee-status').textContent = getOEEStatusText(avgOEE);
    document.getElementById('oee-status').className = 'kpi-status ' + getOEEStatus(avgOEE);
    
    // Update components
    document.getElementById('availability-value').textContent = formatPercent(avgA);
    document.getElementById('performance-value').textContent = formatPercent(avgP);
    document.getElementById('quality-value').textContent = formatPercent(avgQ);
    
    // Calculate trends (compare with previous period)
    const previousRecords = getPreviousPeriodRecords();
    if (previousRecords.length > 0) {
        const prevA = previousRecords.reduce((sum, r) => sum + r.availability, 0) / previousRecords.length;
        const prevP = previousRecords.reduce((sum, r) => sum + r.performance, 0) / previousRecords.length;
        const prevQ = previousRecords.reduce((sum, r) => sum + r.quality, 0) / previousRecords.length;
        
        updateTrend('availability-trend', avgA - prevA);
        updateTrend('performance-trend', avgP - prevP);
        updateTrend('quality-trend', avgQ - prevQ);
    }
}

function updateTrend(elementId, change) {
    const element = document.getElementById(elementId);
    const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
    const className = change > 0 ? 'status-good' : change < 0 ? 'status-poor' : '';
    element.textContent = `${arrow} ${Math.abs(change).toFixed(1)}%`;
    element.className = 'kpi-trend ' + className;
}

// Get filtered records
function getFilteredRecords() {
    let filtered = [...allRecords];
    
    // Filter by machine
    const machine = document.getElementById('machine-filter')?.value;
    if (machine && machine !== 'all') {
        filtered = filtered.filter(r => r.machine_id === machine);
    }
    
    // Filter by shift
    const shift = document.getElementById('shift-filter')?.value;
    if (shift && shift !== 'all') {
        filtered = filtered.filter(r => r.shift == shift);
    }
    
    // Filter by date range
    const range = document.getElementById('date-range')?.value;
    if (range) {
        const today = new Date();
        const cutoffDate = new Date();
        
        if (range === 'today') {
            cutoffDate.setHours(0, 0, 0, 0);
        } else if (range === 'week') {
            cutoffDate.setDate(today.getDate() - 7);
        } else if (range === 'month') {
            cutoffDate.setDate(today.getDate() - 30);
        }
        
        filtered = filtered.filter(r => new Date(r.date) >= cutoffDate);
    }
    
    return filtered;
}

function getPreviousPeriodRecords() {
    const range = document.getElementById('date-range')?.value || 'week';
    const today = new Date();
    let startDate, endDate;
    
    if (range === 'today') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = new Date(today);
        endDate.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 14);
        endDate = new Date(today);
        endDate.setDate(today.getDate() - 7);
    } else if (range === 'month') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 60);
        endDate = new Date(today);
        endDate.setDate(today.getDate() - 30);
    }
    
    return allRecords.filter(r => {
        const date = new Date(r.date);
        return date >= startDate && date < endDate;
    });
}

// Update recent records table
function updateRecentRecords() {
    const filtered = getFilteredRecords().slice(0, 10);
    const tbody = document.getElementById('records-body');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">ไม่มีข้อมูล</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(r => `
        <tr>
            <td>${formatDate(r.date)}</td>
            <td>${r.machine_id}</td>
            <td>กะ ${r.shift}</td>
            <td><strong class="${getOEEStatus(r.oee)}">${formatPercent(r.oee)}</strong></td>
            <td>${formatPercent(r.availability)}</td>
            <td>${formatPercent(r.performance)}</td>
            <td>${formatPercent(r.quality)}</td>
            <td class="${getOEEStatus(r.oee)}">${getOEEStatusText(r.oee)}</td>
        </tr>
    `).join('');
}

// Load machine list for filter
async function loadMachineList() {
    const select = document.getElementById('machine-filter');
    if (!select) return;
    
    const machines = [...new Set(allRecords.map(r => r.machine_id))];
    
    machines.forEach(machine => {
        const option = document.createElement('option');
        option.value = machine;
        option.textContent = machine;
        select.appendChild(option);
    });
}

// Refresh data
async function refreshData() {
    document.querySelector('.btn-refresh').textContent = '⏳ กำลังโหลด...';
    await loadRecords();
    updateKPIs();
    updateCharts();
    updateRecentRecords();
    document.querySelector('.btn-refresh').textContent = '🔄 รีเฟรช';
}

// Event listeners
document.getElementById('machine-filter')?.addEventListener('change', () => {
    updateKPIs();
    updateCharts();
    updateRecentRecords();
});

document.getElementById('date-range')?.addEventListener('change', () => {
    updateKPIs();
    updateCharts();
    updateRecentRecords();
});

document.getElementById('shift-filter')?.addEventListener('change', () => {
    updateKPIs();
    updateCharts();
    updateRecentRecords();
});

// Initialize on page load
if (document.getElementById('oee-value')) {
    initDashboard();
}