let currentUser = null;

(async () => {
    currentUser = await requireAuth();
    if (!currentUser) return;
    if (currentUser.role !== 'ADMIN') {
        window.location.href = '/index.html';
        return;
    }
    renderSidebar('users', currentUser);

    await loadUsers();

    document.getElementById('addBtn').addEventListener('click', openModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('userForm').addEventListener('submit', saveUser);
})();

async function loadUsers() {
    const users = await apiFetch('/api/users');
    const rows = users.map(u => `
        <tr>
            <td>${escapeHtml(u.username)}</td>
            <td>${escapeHtml(u.fullName || '-')}</td>
            <td>${u.role}</td>
            <td>${u.enabled ? '<span class="badge ok">Active</span>' : '<span class="badge low">Disabled</span>'}</td>
            <td>
                <button class="btn btn-sm" onclick='editUser(${JSON.stringify(u).replace(/'/g, "&apos;")})'>Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Delete</button>
            </td>
        </tr>
    `).join('');
    document.getElementById('tableBody').innerHTML = rows || '<tr><td colspan="5" class="empty-state">No users found</td></tr>';
}

function openModal() {
    document.getElementById('modalTitle').textContent = 'Add User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('username').disabled = false;
    document.getElementById('passHint').textContent = '';
    document.getElementById('password').required = true;
    document.getElementById('modalBackdrop').classList.add('open');
}

function editUser(u) {
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userId').value = u.id;
    document.getElementById('username').value = u.username;
    document.getElementById('username').disabled = true;
    document.getElementById('fullName').value = u.fullName || '';
    document.getElementById('role').value = u.role;
    document.getElementById('enabled').checked = u.enabled;
    document.getElementById('password').value = '';
    document.getElementById('password').required = false;
    document.getElementById('passHint').textContent = '(leave blank to keep unchanged)';
    document.getElementById('modalBackdrop').classList.add('open');
}

function closeModal() {
    document.getElementById('modalBackdrop').classList.remove('open');
}

async function saveUser(e) {
    e.preventDefault();
    const id = document.getElementById('userId').value;

    const payload = {
        username: document.getElementById('username').value,
        fullName: document.getElementById('fullName').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        enabled: document.getElementById('enabled').checked
    };

    try {
        if (id) {
            await apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
            await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(payload) });
        }
        closeModal();
        await loadUsers();
    } catch (err) {
        alert(err.message);
    }
}

async function deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    try {
        await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
        await loadUsers();
    } catch (err) {
        alert(err.message);
    }
}
