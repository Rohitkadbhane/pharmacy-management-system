// Shared helpers for all pages

async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        credentials: 'same-origin'
    });

    if (res.status === 401) {
        window.location.href = '/login.html';
        return null;
    }

    let data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }

    if (!res.ok) {
        const message = (data && (data.error || data.message)) || 'Something went wrong';
        throw new Error(message);
    }
    return data;
}

async function requireAuth() {
    const me = await apiFetch('/api/auth/me');
    if (!me || !me.authenticated) {
        window.location.href = '/login.html';
        return null;
    }
    return me;
}

function logout() {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
        .finally(() => window.location.href = '/login.html');
}

function renderSidebar(activePage, user) {
    const isAdmin = user.role === 'ADMIN';
    const links = [
        { href: '/index.html', label: 'Dashboard', page: 'dashboard' },
        { href: '/medicines.html', label: 'Medicines', page: 'medicines' },
        { href: '/sales.html', label: 'Sales / Billing', page: 'sales' },
        { href: '/suppliers.html', label: 'Suppliers', page: 'suppliers' },
        { href: '/reports.html', label: 'Reports', page: 'reports' },
    ];
    if (isAdmin) {
        links.push({ href: '/users.html', label: 'Users', page: 'users' });
    }

    const navHtml = links.map(l =>
        `<a href="${l.href}" class="${l.page === activePage ? 'active' : ''}">${l.label}</a>`
    ).join('');

    document.getElementById('sidebar').innerHTML = `
        <div class="brand">Pharma<span>Manage</span></div>
        <nav>${navHtml}</nav>
        <div class="user-box">
            <div>${user.username}</div>
            <span class="role-badge">${user.role}</span>
            <div style="margin-top:0.75rem;">
                <button class="btn btn-secondary btn-sm btn-block" onclick="logout()">Logout</button>
            </div>
        </div>
    `;
}

function formatCurrency(n) {
    return '₹' + Number(n || 0).toFixed(2);
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
