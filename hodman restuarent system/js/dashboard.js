/** Responsive finance dashboard for the Hodman restaurant system. */
class DashboardModule {
  constructor() {
    this.containerId = 'dashboard-content-container';
    const today = this.localDate(new Date());
    this.dateFrom = today;
    this.dateTo = today;
    this.searchQuery = '';
    this.period = 'daily';
  }

  localDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  inRange(value) {
    if (!value) return false;
    const raw = String(value);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : this.localDate(new Date(value));
    return (!this.dateFrom || date >= this.dateFrom) && (!this.dateTo || date <= this.dateTo);
  }

  money(value) {
    return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    const currentUser = window.restaurantDB.getCurrentUser();
    if (!currentUser || !['admin', 'cashier'].includes(currentUser.role)) {
      container.innerHTML = `<div class="text-center py-20"><i class="fa-solid fa-lock text-amber-500 text-3xl mb-3"></i><h3>Access Restricted</h3><p>The dashboard is available to cashiers and administrators.</p></div>`;
      return;
    }

    const orders = window.restaurantDB.getOrders();
    const periodOrders = orders.filter(order => order.status !== 'cancelled' && this.inRange(order.createdAt));
    const paidOrders = periodOrders.filter(order => order.paymentStatus === 'paid');
    const unpaidOrders = periodOrders.filter(order => order.paymentStatus === 'unpaid' && order.status !== 'cancelled');
    const inventory = window.restaurantDB.getInventory();
    const inventoryCosts = new Map(inventory.map(item => [item.id, Number(item.costPerUnit || 0)]));
    const usedItems = (window.restaurantDB.getUsedItems?.() || []).filter(item => this.inRange(item.date));
    const kitchenCost = usedItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(inventoryCosts.get(item.itemId) || 0), 0);
    const supplierPayments = (window.restaurantDB.getPurchasePayments?.() || []).filter(payment => this.inRange(payment.date));
    const supplierTotal = (window.restaurantDB.getSuppliers?.() || []).reduce((sum, supplier) => sum + Number(supplier.balance || 0), 0);
    const bookings = (window.hallsModule?.bookings || []).filter(booking => this.inRange(booking.date));
    const dailySales = paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const cashBalance = paidOrders.filter(order => order.paymentMethod === 'cash').reduce((sum, order) => sum + Number(order.total || 0), 0);
    const unpaidTotal = unpaidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const vendorPaid = supplierPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const bookingCash = bookings.reduce((sum, booking) => sum + Number(booking.advance || 0), 0);
    const hallBalance = bookings.reduce((sum, booking) => sum + Number(booking.remaining || 0), 0);
    const advances = bookings.reduce((sum, booking) => sum + Number(booking.advance || 0), 0);
    const netSales = dailySales - kitchenCost;

    const metrics = [
      ['Daily Sales', dailySales, 'Paid POS orders', 'fa-cart-shopping', 'navy-green'],
      ['Kitchen Cost', kitchenCost, `${usedItems.length} stock usage records`, 'fa-store', 'red'],
      ['Cash Balance', cashBalance, 'Cash collected', 'fa-sack-dollar', 'blue'],
      ['Supplier Balance', supplierTotal, 'Outstanding supplier balance', 'fa-circle-check', 'green'],
      ['No Paid', unpaidTotal, `${unpaidOrders.length} unpaid orders`, 'fa-circle-xmark', 'orange'],
      ['Vendor Payments', vendorPaid, `${supplierPayments.length} payments`, 'fa-file-invoice-dollar', 'purple'],
      ['Booking Cash on Hand', bookingCash, `${bookings.length} bookings`, 'fa-calendar', 'gold'],
      ['Hall Cash Balance', hallBalance, 'Booking balance due', 'fa-sack-dollar', 'slate'],
      ['Daily Advance', advances, 'Booking advances received', 'fa-money-bill-wave', 'navy-green'],
      ['Purchase Spend', vendorPaid, 'Supplier payments in period', 'fa-basket-shopping', 'red'],
      ['Net Sales', netSales, 'Sales less kitchen cost', 'fa-chart-line', 'blue']
    ];

    const activity = [
      ...periodOrders.map(order => ({ date: order.createdAt, type: 'POS Order', name: order.customerName || 'Walk-in', account: order.tableNumber || 'POS', amount: order.total, discount: order.discount || 0, status: order.paymentStatus || '' })),
      ...supplierPayments.map(payment => ({ date: payment.date, type: 'Vendor Payment', name: payment.supplierName || 'Supplier', account: payment.reference || payment.paymentMethod || '', amount: payment.amount, discount: 0, status: payment.paymentMethod || '' })),
      ...bookings.map(booking => ({ date: booking.date, type: 'Hall Booking', name: booking.name, account: booking.hallName, amount: booking.total, discount: booking.discount || 0, status: booking.status })),
      ...usedItems.map(item => ({ date: item.date, type: 'Kitchen Use', name: item.itemName, account: item.department || '', amount: Number(item.quantity || 0) * Number(inventoryCosts.get(item.itemId) || 0), discount: 0, status: `${item.quantity} ${item.unit || ''}` }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).filter(row => !this.searchQuery || `${row.type} ${row.name} ${row.account} ${row.status}`.toLowerCase().includes(this.searchQuery));

    const actions = [
      ['fa-list', 'Receive Payment', 'unpaid'],
      ['fa-circle-plus', 'Hall Booking', 'hall-booking'],
      ['fa-money-bill-transfer', 'Vendor Payment', 'vendor-payment'],
      ['fa-cart-flatbed', 'Purchase', 'purchase'],
      ['fa-user-plus', 'Add Customer', 'crm'],
      ['fa-cash-register', 'New POS Order', 'pos']
    ];

    container.innerHTML = `<div class="dashboard-modern space-y-4">
      <section class="dash-quick-panel"><div class="dash-section-title">Quick Actions</div><div class="dash-quick-actions">${actions.map(([icon, label, action]) => `<button class="dash-action" data-action="${action}"><i class="fa-solid ${icon}"></i><span>${label}</span></button>`).join('')}</div></section>
      <section class="dash-metrics">${metrics.map(([label, amount, caption, icon, color]) => `<article class="dash-metric ${color}"><div><p>${label}</p><strong>${this.money(amount)}</strong><small>${caption}</small></div><span class="dash-metric-icon"><i class="fa-solid ${icon}"></i></span></article>`).join('')}</section>
      <div class="dash-period-row"><div class="dash-periods"><button data-period="daily" class="${this.period === 'daily' ? 'active' : ''}">Daily</button><button data-period="weekly" class="${this.period === 'weekly' ? 'active' : ''}">Weekly</button><button data-period="monthly" class="${this.period === 'monthly' ? 'active' : ''}">Monthly</button></div></div>
      <form id="dash-date-filter" class="dash-filter-bar"><label>Date From<input type="date" id="dash-date-from" value="${this.dateFrom}"></label><label>Date To<input type="date" id="dash-date-to" value="${this.dateTo}"></label><label class="dash-filter-search">Search<input type="search" id="dash-search" value="${this.searchQuery}" placeholder="Search activity..."></label><button type="submit">Search</button></form>
      <section class="dash-activity"><div class="dash-activity-heading"><div><h2>Activity &amp; Transactions</h2><p>${activity.length} records in selected dates</p></div><button id="dash-view-history">View Order History <i class="fa-solid fa-arrow-right"></i></button></div>
        <div class="overflow-x-auto"><table><thead><tr><th>Type</th><th>Vendor / Customer</th><th>Account</th><th>Amount</th><th>Discount</th><th>Date</th></tr></thead><tbody>${activity.length ? activity.map(row => `<tr><td><span class="dash-type">${row.type}</span><small>${row.status}</small></td><td>${row.name || '—'}</td><td>${row.account || '—'}</td><td>${this.money(row.amount)}</td><td>${this.money(row.discount)}</td><td>${new Date(row.date).toLocaleDateString()}</td></tr>`).join('') : '<tr><td colspan="6" class="dash-empty">No activity for this date range.</td></tr>'}</tbody></table></div>
      </section><footer class="dash-footer"><strong>DEV: Jookar</strong></footer>
    </div>`;

    this.bindEvents();
  }

  setPeriod(period) {
    const today = new Date();
    this.dateTo = this.localDate(today);
    if (period === 'daily') this.dateFrom = this.dateTo;
    if (period === 'weekly') {
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      this.dateFrom = this.localDate(monday);
    }
    if (period === 'monthly') this.dateFrom = this.localDate(new Date(today.getFullYear(), today.getMonth(), 1));
    this.period = period;
    this.render();
  }

  bindEvents() {
    document.querySelectorAll('.dash-action').forEach(button => button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'vendor-payment') {
        if (window.purchaseModule) { window.purchaseModule.activeTab = 'vendor-payment'; window.purchaseModule.render(); }
        window.authModule?.switchToView('purchase');
      } else if (action === 'crm') {
        window.authModule?.switchToView('crm');
        setTimeout(() => document.getElementById('btn-open-add-customer')?.click(), 0);
      } else if (action === 'hall-booking') {
        window.authModule?.switchToView('halls');
        setTimeout(() => document.getElementById('btn-open-create-hall-booking')?.click(), 0);
      } else if (action === 'halls') {
        window.authModule?.switchToView('halls');
      } else {
        window.authModule?.switchToView(action);
      }
    }));
    document.querySelectorAll('.dash-periods button').forEach(button => button.addEventListener('click', () => this.setPeriod(button.dataset.period)));
    document.getElementById('dash-date-filter')?.addEventListener('submit', event => {
      event.preventDefault();
      this.dateFrom = document.getElementById('dash-date-from').value;
      this.dateTo = document.getElementById('dash-date-to').value;
      this.searchQuery = document.getElementById('dash-search').value.trim().toLowerCase();
      this.render();
    });
    document.getElementById('dash-view-history')?.addEventListener('click', () => window.authModule?.switchToView('reports'));
  }
}

window.initDashboard = () => { window.dashboardModule = new DashboardModule(); };
