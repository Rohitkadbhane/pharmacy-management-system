let currentUser = null;

(async () => {
    currentUser = await requireAuth();
    if (!currentUser) return;
    renderSidebar('suppliers', currentUser);

    const isAdmin = currentUser.role === 'ADMIN';
    document.getElementById('addBtn').style.display = isAdmin ? 'inline-block' : 'none';

    await loadSuppliers();

    document.getElementById('addBtn').addEventListener('click', openModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('supplierForm').addEventListener('submit', saveSupplier);
})();

async function loadSuppliers() {
    const suppliers = await apiFetch('/api/suppliers');
    const isAdmin = currentUser.role === 'ADMIN';

    const rows = suppliers.map(s => {
        const actions = isAdmin ? `
            <button class="btn btn-sm" onclick='editSupplier(${JSON.stringify(s).replace(/'/g, "&apos;")})'>Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteSupplier(${s.id})">Delete</button>
        ` : '-';

        return `<tr>
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.contactPerson || '-')}</td>
            <td>${escapeHtml(s.phone || '-')}</td>
            <td>${escapeHtml(s.email || '-')}</td>
            <td>${escapeHtml(s.address || '-')}</td>
            <td>${actions}</td>
        </tr>`;
    }).join('');

    document.getElementById('tableBody').innerHTML = rows || '<tr><td colspan="6" class="empty-state">No suppliers found</td></tr>';
}

function openModal() {
    document.getElementById('modalTitle').textContent = 'Add Supplier';
    document.getElementById('supplierForm').reset();
    document.getElementById('supId').value = '';
    document.getElementById('modalBackdrop').classList.add('open');
}

function editSupplier(s) {
    document.getElementById('modalTitle').textContent = 'Edit Supplier';
    document.getElementById('supId').value = s.id;
    document.getElementById('name').value = s.name || '';
    document.getElementById('contactPerson').value = s.contactPerson || '';
    document.getElementById('phone').value = s.phone || '';
    document.getElementById('email').value = s.email || '';
    document.getElementById('address').value = s.address || '';
    document.getElementById('modalBackdrop').classList.add('open');
}

function closeModal() {
    document.getElementById('modalBackdrop').classList.remove('open');
}

async function saveSupplier(e) {
    e.preventDefault();
    const id = document.getElementById('supId').value;
    const payload = {
        name: document.getElementById('name').value,
        contactPerson: document.getElementById('contactPerson').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value
    };

    try {
        if (id) {
            await apiFetch(`/api/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
            await apiFetch('/api/suppliers', { method: 'POST', body: JSON.stringify(payload) });
        }
        closeModal();
        await loadSuppliers();
    } catch (err) {
        alert(err.message);
    }
}

async function deleteSupplier(id) {
    if (!confirm('Delete this supplier?')) return;
    try {
        await apiFetch(`/api/suppliers/${id}`, { method: 'DELETE' });
        await loadSuppliers();
    } catch (err) {
        alert(err.message);
    }
}
