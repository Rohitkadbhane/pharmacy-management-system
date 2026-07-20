let cart = []; // { medicineId, name, unitPrice, quantity, availableStock }

(async () => {
    const user = await requireAuth();
    if (!user) return;
    renderSidebar('sales', user);

    document.getElementById('medicineSearch').addEventListener('input', debounce(searchMedicines, 300));
    document.getElementById('checkoutBtn').addEventListener('click', checkout);

    await loadSalesHistory();
})();

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

async function searchMedicines() {
    const query = document.getElementById('medicineSearch').value.trim();
    const resultsBox = document.getElementById('searchResults');
    if (!query) { resultsBox.innerHTML = ''; return; }

    const medicines = await apiFetch(`/api/medicines?search=${encodeURIComponent(query)}`);
    resultsBox.innerHTML = medicines.slice(0, 6).map(m => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0; border-bottom:1px solid #eee; font-size:0.85rem;">
            <span>${escapeHtml(m.name)} <span style="color:#6b7280;">(Stock: ${m.quantity}, ${formatCurrency(m.unitPrice)})</span></span>
            <button class="btn btn-sm" ${m.quantity <= 0 ? 'disabled' : ''} onclick='addToCart(${JSON.stringify(m).replace(/'/g, "&apos;")})'>Add</button>
        </div>
    `).join('') || '<p class="empty-state">No medicines found</p>';
}

function addToCart(medicine) {
    const existing = cart.find(c => c.medicineId === medicine.id);
    if (existing) {
        if (existing.quantity < medicine.quantity) {
            existing.quantity += 1;
        } else {
            alert('Not enough stock available');
        }
    } else {
        cart.push({
            medicineId: medicine.id,
            name: medicine.name,
            unitPrice: medicine.unitPrice,
            quantity: 1,
            availableStock: medicine.quantity
        });
    }
    renderCart();
}

function updateQty(medicineId, delta) {
    const item = cart.find(c => c.medicineId === medicineId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
        cart = cart.filter(c => c.medicineId !== medicineId);
    } else if (newQty <= item.availableStock) {
        item.quantity = newQty;
    } else {
        alert('Not enough stock available');
    }
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cartItems');
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-state">Cart is empty</p>';
    } else {
        container.innerHTML = cart.map(c => `
            <div class="cart-item">
                <span>${escapeHtml(c.name)} x ${c.quantity}</span>
                <span style="display:flex; align-items:center; gap:0.5rem;">
                    ${formatCurrency(c.unitPrice * c.quantity)}
                    <button class="btn btn-sm btn-secondary" onclick="updateQty(${c.medicineId}, -1)">-</button>
                    <button class="btn btn-sm btn-secondary" onclick="updateQty(${c.medicineId}, 1)">+</button>
                </span>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0);
    document.getElementById('cartTotal').textContent = formatCurrency(total);
}

async function checkout() {
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }

    const payload = {
        customerName: document.getElementById('customerName').value || 'Walk-in customer',
        items: cart.map(c => ({ medicineId: c.medicineId, quantity: c.quantity }))
    };

    try {
        await apiFetch('/api/sales', { method: 'POST', body: JSON.stringify(payload) });
        cart = [];
        renderCart();
        document.getElementById('customerName').value = '';
        document.getElementById('medicineSearch').value = '';
        document.getElementById('searchResults').innerHTML = '';
        await loadSalesHistory();
        alert('Sale completed successfully!');
    } catch (err) {
        alert(err.message);
    }
}

async function loadSalesHistory() {
    const sales = await apiFetch('/api/sales');
    const body = document.getElementById('salesHistoryBody');
    body.innerHTML = sales.slice(0, 15).map(s => `
        <tr>
            <td>#${s.id}</td>
            <td>${new Date(s.saleDate).toLocaleString()}</td>
            <td>${escapeHtml(s.customerName || '-')}</td>
            <td>${s.items ? s.items.length : 0}</td>
            <td>${formatCurrency(s.totalAmount)}</td>
        </tr>
    `).join('') || '<tr><td colspan="5" class="empty-state">No sales yet</td></tr>';
}
