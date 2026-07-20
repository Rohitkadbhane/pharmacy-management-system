let revenueChart = null;
let topMedicinesChart = null;

(async () => {
    const user = await requireAuth();
    if (!user) return;
    renderSidebar('reports', user);

    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 30);
    document.getElementById('fromDate').value = monthAgo.toISOString().slice(0, 10);
    document.getElementById('toDate').value = today.toISOString().slice(0, 10);

    document.getElementById('applyBtn').addEventListener('click', loadReports);

    await loadReports();
    await loadAlerts();
})();

async function loadReports() {
    const from = document.getElementById('fromDate').value;
    const to = document.getElementById('toDate').value;

    const summary = await apiFetch(`/api/reports/sales-summary?from=${from}&to=${to}`);

    document.getElementById('summaryStats').innerHTML = `
        <div class="stat-card">
            <div class="label">Total Sales</div>
            <div class="value">${summary.totalSales}</div>
        </div>
        <div class="stat-card success">
            <div class="label">Total Revenue</div>
            <div class="value">${formatCurrency(summary.totalRevenue)}</div>
        </div>
    `;

    const labels = Object.keys(summary.revenueByDay);
    const values = Object.values(summary.revenueByDay);

    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(document.getElementById('revenueChart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Revenue (₹)',
                data: values,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });

    const topMedicines = await apiFetch('/api/reports/top-medicines?limit=6');
    if (topMedicinesChart) topMedicinesChart.destroy();
    topMedicinesChart = new Chart(document.getElementById('topMedicinesChart'), {
        type: 'bar',
        data: {
            labels: topMedicines.map(m => m.medicineName),
            datasets: [{
                label: 'Units Sold',
                data: topMedicines.map(m => m.totalQuantitySold),
                backgroundColor: '#16a34a'
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

async function loadAlerts() {
    const lowStock = await apiFetch('/api/reports/low-stock');
    document.getElementById('lowStockBody').innerHTML = lowStock.length
        ? lowStock.map(m => `<tr><td>${escapeHtml(m.name)}</td><td>${m.quantity}</td><td>${m.reorderLevel}</td></tr>`).join('')
        : '<tr><td colspan="3" class="empty-state">None</td></tr>';

    const expiring = await apiFetch('/api/reports/expiring?days=30');
    document.getElementById('expiringBody').innerHTML = expiring.length
        ? expiring.map(m => `<tr><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.batchNumber)}</td><td>${m.expiryDate}</td></tr>`).join('')
        : '<tr><td colspan="3" class="empty-state">None</td></tr>';
}
