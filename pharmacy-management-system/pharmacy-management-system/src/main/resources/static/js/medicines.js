let currentUser = null;
let suppliers = [];

(async () => {
    currentUser = await requireAuth();
    if (!currentUser) return;
    renderSidebar('medicines', currentUser);

    const isAdmin = currentUser.role === 'ADMIN';
    document.getElementById('addBtn').style.display = isAdmin ? 'inline-block' : 'none';

    await loadSuppliers();
    await loadMedicines();

    document.getElementById('addBtn').addEventListener('click', () => openModal());
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('medicineForm').addEventListener('submit', saveMedicine);
    document.getElementById('searchInput').addEventListener('input', debounce(loadMedicines, 300));
})();

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

async function loadSuppliers() {
    suppliers = await apiFetch('/api/suppliers');
    const select = document.getElementById('supplierId');
    select.innerHTML = '<option value="">-- None --</option>' +
        suppliers.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
}

async function loadMedicines() {
    const search = document.getElementById('searchInput').value;
    const url = search ? `/api/medicines?search=${encodeURIComponent(search)}` : '/api/medicines';
    const medicines = await apiFetch(url);
    const isAdmin = currentUser.role === 'ADMIN';

    const rows = medicines.map(m => {
        const today = new Date();
        const expiry = m.expiryDate ? new Date(m.expiryDate) : null;
        let statusBadge = '<span class="badge ok">OK</span>';
        if (m.quantity <= m.reorderLevel) {
            statusBadge = '<span class="badge low">Low Stock</span>';
        } else if (expiry && (expiry - today) / (1000 * 3600 * 24) <= 30) {
            statusBadge = '<span class="badge soon">Expiring Soon</span>';
        }

        const actions = isAdmin ? `
            <button class="btn btn-sm" onclick='editMedicine(${JSON.stringify(m).replace(/'/g, "&apos;")})'>Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteMedicine(${m.id})">Delete</button>
        ` : '-';

        return `<tr>
            <td>${escapeHtml(m.name)}</td>
            <td>${escapeHtml(m.category || '-')}</td>
            <td>${escapeHtml(m.manufacturer || '-')}</td>
            <td>${escapeHtml(m.batchNumber || '-')}</td>
            <td>${m.quantity}</td>
            <td>${formatCurrency(m.unitPrice)}</td>
            <td>${m.expiryDate || '-'}</td>
            <td>${statusBadge}</td>
            <td>${actions}</td>
        </tr>`;
    }).join('');

    document.getElementById('tableBody').innerHTML = rows || '<tr><td colspan="9" class="empty-state">No medicines found</td></tr>';
}

function openModal() {
    document.getElementById('modalTitle').textContent = 'Add Medicine';
    document.getElementById('medicineForm').reset();
    document.getElementById('medId').value = '';
    document.getElementById('reorderLevel').value = 10;
    document.getElementById('modalBackdrop').classList.add('open');
}

function editMedicine(m) {
    document.getElementById('modalTitle').textContent = 'Edit Medicine';
    document.getElementById('medId').value = m.id;
    document.getElementById('name').value = m.name || '';
    document.getElementById('category').value = m.category || '';
    document.getElementById('manufacturer').value = m.manufacturer || '';
    document.getElementById('batchNumber').value = m.batchNumber || '';
    document.getElementById('quantity').value = m.quantity;
    document.getElementById('unitPrice').value = m.unitPrice;
    document.getElementById('reorderLevel').value = m.reorderLevel;
    document.getElementById('expiryDate').value = m.expiryDate || '';
    document.getElementById('supplierId').value = m.supplier ? m.supplier.id : '';
    document.getElementById('modalBackdrop').classList.add('open');
}

function closeModal() {
    document.getElementById('modalBackdrop').classList.remove('open');
}

async function saveMedicine(e) {
    e.preventDefault();
    const id = document.getElementById('medId').value;
    const supplierId = document.getElementById('supplierId').value;

    const payload = {
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        manufacturer: document.getElementById('manufacturer').value,
        batchNumber: document.getElementById('batchNumber').value,
        quantity: parseInt(document.getElementById('quantity').value, 10),
        unitPrice: parseFloat(document.getElementById('unitPrice').value),
        reorderLevel: parseInt(document.getElementById('reorderLevel').value || '10', 10),
        expiryDate: document.getElementById('expiryDate').value || null,
        supplier: supplierId ? { id: parseInt(supplierId, 10) } : null
    };

    try {
        if (id) {
            await apiFetch(`/api/medicines/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
            await apiFetch('/api/medicines', { method: 'POST', body: JSON.stringify(payload) });
        }
        closeModal();
        await loadMedicines();
    } catch (err) {
        alert(err.message);
    }
}

async function deleteMedicine(id) {
    if (!confirm('Delete this medicine?')) return;
    try {
        await apiFetch(`/api/medicines/${id}`, { method: 'DELETE' });
        await loadMedicines();
    } catch (err) {
        alert(err.message);
    }
}
