/**
 * Hodman Restaurant System - Sales Reports & Analytics Module
 * KPIs, revenue summaries, best-sellers leaderboard, order history, and CSV export.
 */

class ReportsModule {
  constructor() {
    this.searchQuery = '';
    this.statusFilter = 'all';

    this.initElements();
    this.bindEvents();
    this.renderReports();
  }

  initElements() {
    this.kpiRevenueEl = document.getElementById('report-kpi-revenue');
    this.kpiOrdersEl = document.getElementById('report-kpi-orders');
    this.kpiAovEl = document.getElementById('report-kpi-aov');
    this.kpiActiveEl = document.getElementById('report-kpi-active');

    this.topItemsContainer = document.getElementById('report-top-items-list');
    this.paymentBreakdownContainer = document.getElementById('report-payment-breakdown');
    this.ordersTableBody = document.getElementById('report-orders-table-body');

    this.historySearchInput = document.getElementById('report-history-search');
    this.historyStatusFilter = document.getElementById('report-history-status');
    this.exportCsvBtn = document.getElementById('btn-export-csv');
    this.resetDataBtn = document.getElementById('btn-reset-data');
  }

  bindEvents() {
    if (this.historySearchInput) {
      this.historySearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderOrdersTable();
      });
    }

    if (this.historyStatusFilter) {
      this.historyStatusFilter.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.renderOrdersTable();
      });
    }

    if (this.exportCsvBtn) {
      this.exportCsvBtn.addEventListener('click', () => this.exportCsv());
    }

    if (this.resetDataBtn) {
      this.resetDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset and re-seed the system with fresh sample orders?')) {
          window.restaurantDB.resetToDefaults();
          this.renderReports();
          window.showToast?.('System data reset and re-seeded successfully!', 'info');
        }
      });
    }

    // Reactive DB updates
    window.restaurantDB.subscribe('*', () => {
      this.renderReports();
    });
  }

  renderReports() {
    const summary = window.restaurantDB.getReportsSummary();
    const currency = summary.currency || '$';

    // 1. KPI Cards
    if (this.kpiRevenueEl) this.kpiRevenueEl.textContent = `${currency}${summary.totalRevenue.toFixed(2)}`;
    if (this.kpiOrdersEl) this.kpiOrdersEl.textContent = summary.totalOrders;
    if (this.kpiAovEl) this.kpiAovEl.textContent = `${currency}${summary.averageOrderValue.toFixed(2)}`;
    if (this.kpiActiveEl) this.kpiActiveEl.textContent = summary.activeOrders;

    // 2. Payment Method Breakdown
    this.renderPaymentBreakdown(summary.paymentMethodStats, summary.totalRevenue);

    // 3. Top Items Leaderboard
    this.renderTopItems(summary.topItems, currency);

    // 4. Order History Table
    this.renderOrdersTable();
  }

  renderPaymentBreakdown(stats, totalRevenue) {
    if (!this.paymentBreakdownContainer) return;
    const total = totalRevenue > 0 ? totalRevenue : 1;

    const cashPct = Math.round(((stats.cash || 0) / total) * 100);
    const cardPct = Math.round(((stats.card || 0) / total) * 100);
    const mobilePct = Math.round(((stats.mobile || 0) / total) * 100);

    this.paymentBreakdownContainer.innerHTML = `
      <div class="space-y-3">
        <!-- Cash -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-300 font-medium flex items-center gap-1.5">
              <i class="fa-solid fa-money-bill-wave text-emerald-400"></i> Cash
            </span>
            <span class="text-white font-bold">$${(stats.cash || 0).toFixed(2)} (${cashPct}%)</span>
          </div>
          <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div class="bg-emerald-500 h-2 rounded-full transition-all duration-500" style="width: ${cashPct}%"></div>
          </div>
        </div>

        <!-- Mobile Money (EVC/Zaad) -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-300 font-medium flex items-center gap-1.5">
              <i class="fa-solid fa-mobile-screen-button text-orange-400"></i> Mobile Money (EVC / Zaad)
            </span>
            <span class="text-white font-bold">$${(stats.mobile || 0).toFixed(2)} (${mobilePct}%)</span>
          </div>
          <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div class="bg-orange-500 h-2 rounded-full transition-all duration-500" style="width: ${mobilePct}%"></div>
          </div>
        </div>

        <!-- Credit/Debit Card -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-300 font-medium flex items-center gap-1.5">
              <i class="fa-solid fa-credit-card text-blue-400"></i> Credit / Debit Card
            </span>
            <span class="text-white font-bold">$${(stats.card || 0).toFixed(2)} (${cardPct}%)</span>
          </div>
          <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" style="width: ${cardPct}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  renderTopItems(topItems, currency) {
    if (!this.topItemsContainer) return;

    if (!topItems || topItems.length === 0) {
      this.topItemsContainer.innerHTML = `
        <div class="text-center py-6 text-slate-500 text-xs">No sales recorded yet.</div>
      `;
      return;
    }

    this.topItemsContainer.innerHTML = topItems.map((item, index) => {
      const medals = ['🥇', '🥈', '🥉'];
      const rankBadge = index < 3 ? medals[index] : `#${index + 1}`;

      return `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold w-6 text-center text-slate-400">${rankBadge}</span>
            <div>
              <p class="text-xs font-bold text-white leading-tight">${item.name}</p>
              <span class="text-[11px] text-slate-400">${item.quantity} portions sold</span>
            </div>
          </div>
          <span class="font-bold text-xs text-orange-400 font-mono">${currency}${item.revenue.toFixed(2)}</span>
        </div>
      `;
    }).join('');
  }

  renderOrdersTable() {
    if (!this.ordersTableBody) return;
    const allOrders = window.restaurantDB.getOrders();

    const filtered = allOrders.filter(order => {
      const matchesSearch = !this.searchQuery ||
        order.orderNumber.toLowerCase().includes(this.searchQuery) ||
        (order.customerName && order.customerName.toLowerCase().includes(this.searchQuery)) ||
        (order.tableNumber && order.tableNumber.toLowerCase().includes(this.searchQuery));

      const matchesStatus = this.statusFilter === 'all' || order.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
      this.ordersTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-500 text-xs font-medium">
            No matching transaction records found.
          </td>
        </tr>
      `;
      return;
    }

    this.ordersTableBody.innerHTML = filtered.map(order => {
      let statusClass = '';
      switch (order.status) {
        case 'completed':
          statusClass = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
          break;
        case 'ready':
          statusClass = 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
          break;
        case 'preparing':
          statusClass = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
          break;
        default:
          statusClass = 'bg-slate-700/60 text-slate-300 border border-slate-600/40';
      }

      const itemsPreview = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

      return `
        <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors text-xs text-slate-300">
          <td class="py-3 px-4 font-mono font-bold text-white">#${order.orderNumber}</td>
          <td class="py-3 px-4 font-mono text-slate-400">
            ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </td>
          <td class="py-3 px-4 font-medium text-white">
            ${order.tableNumber}
            <div class="text-[10px] text-slate-400">${order.customerName}</div>
          </td>
          <td class="py-3 px-4 max-w-xs truncate text-slate-400" title="${itemsPreview}">
            ${itemsPreview}
          </td>
          <td class="py-3 px-4 capitalize">
            <span class="inline-flex items-center gap-1">
              <i class="fa-solid ${
                order.paymentMethod === 'cash' ? 'fa-money-bill-wave text-emerald-400' :
                order.paymentMethod === 'mobile' ? 'fa-mobile-screen text-orange-400' : 'fa-credit-card text-blue-400'
              } text-[10px]"></i>
              ${order.paymentMethod}
            </span>
          </td>
          <td class="py-3 px-4 font-mono font-bold text-white">$${order.total.toFixed(2)}</td>
          <td class="py-3 px-4">
            <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusClass}">
              ${order.status}
            </span>
          </td>
          <td class="py-3 px-4 text-right">
            <button 
              class="btn-view-history-receipt text-orange-400 hover:text-orange-300 hover:underline font-medium text-xs flex items-center gap-1 ml-auto"
              data-id="${order.id}"
            >
              <i class="fa-solid fa-receipt text-[11px]"></i> Receipt
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Wire up receipt buttons
    this.ordersTableBody.querySelectorAll('.btn-view-history-receipt').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.id;
        const order = window.restaurantDB.getOrderById(orderId);
        if (order && window.posModule) {
          window.posModule.openReceiptModal(order);
        }
      });
    });
  }

  exportCsv() {
    const orders = window.restaurantDB.getOrders();
    if (orders.length === 0) {
      alert('No order data to export.');
      return;
    }

    const headers = ['Order Number', 'Date', 'Time', 'Order Type', 'Table', 'Customer', 'Items Count', 'Payment Method', 'Subtotal', 'Tax', 'Total Amount', 'Status'];

    const rows = orders.map(o => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toISOString().split('T')[0]}"`,
      `"${new Date(o.createdAt).toLocaleTimeString()}"`,
      `"${o.orderType}"`,
      `"${o.tableNumber}"`,
      `"${o.customerName}"`,
      o.items.reduce((sum, i) => sum + i.quantity, 0),
      `"${o.paymentMethod}"`,
      o.subtotal.toFixed(2),
      o.tax.toFixed(2),
      o.total.toFixed(2),
      `"${o.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hodman_restaurant_sales_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.showToast?.('Sales report CSV downloaded!', 'success');
  }
}

window.initReports = () => {
  window.reportsModule = new ReportsModule();
};
