/**
 * Hodman Restaurant Halls & Cafeteria System
 * Unpaid Orders & Open Bills Module
 * Matches exactly https://hodman.ganacsibile.com/Dashboard/unpaid and provided screenshot
 */

class UnpaidModule {
  constructor() {
    this.containerId = 'view-unpaid';
    this.activeTab = 'walkin-unpaid'; // 'walkin-unpaid' | 'paid-orders' | 'charged-orders'
    this.searchQuery = '';
    this.waiterFilter = 'all';
    this.sortBy = 'recent';
    const businessDate = window.restaurantDB.getBusinessDate?.() || this.localDate(new Date());
    this.dateFrom = businessDate;
    this.dateTo = businessDate;

    this.init();
  }

  init() {
    // Reactive DB subscriptions
    window.restaurantDB.subscribe('orderCreated', () => this.render());
    window.restaurantDB.subscribe('orderSettled', () => this.render());
    window.restaurantDB.subscribe('orderUpdated', () => this.render());
    window.restaurantDB.subscribe('orders', () => this.render());
    window.restaurantDB.subscribe('businessDayStarted', ({ nextDate } = {}) => {
      if (nextDate) {
        this.dateFrom = nextDate;
        this.dateTo = nextDate;
        this.searchQuery = '';
        this.waiterFilter = 'all';
        this.render();
      }
    });
  }

  localDate(value) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }

  orderBusinessDate(order) {
    const raw = order.paymentStatus === 'paid'
      ? (order.paidBusinessDate || order.businessDate || order.createdAt)
      : (order.businessDate || order.createdAt);
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(raw))) return String(raw);
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? String(raw || '').slice(0, 10) : this.localDate(date);
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const allUnpaid = window.restaurantDB.getUnpaidOrders ? window.restaurantDB.getUnpaidOrders() : [];
    const allOrders = window.restaurantDB.getOrders ? window.restaurantDB.getOrders() : [];

    const inSelectedRange = order => {
      const date = this.orderBusinessDate(order);
      return (!this.dateFrom || date >= this.dateFrom) && (!this.dateTo || date <= this.dateTo);
    };
    const periodUnpaid = allUnpaid.filter(inSelectedRange);
    const periodPaid = allOrders.filter(order => order.paymentStatus === 'paid' && order.status !== 'cancelled' && inSelectedRange(order));

    // Calculate Exact KPI Stats
    const totalUnpaidSum = periodUnpaid.reduce((sum, o) => sum + (o.total || 0), 0);
    const unpaidCount = periodUnpaid.length;

    const paidOrders = periodPaid;
    const totalPaidSum = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const paidCount = paidOrders.length;

    const totalSalesPU = totalUnpaidSum + totalPaidSum;
    const totalOrdersCount = unpaidCount + paidCount;

    // Filter and Sort orders
    let displayOrders = [];
    if (this.activeTab === 'walkin-unpaid') {
      displayOrders = [...periodUnpaid];
    } else if (this.activeTab === 'paid-orders') {
      displayOrders = [...paidOrders];
    } else {
      displayOrders = allOrders.filter(o => (o.paymentMethod === 'credit' || o.paymentMethod === 'charged') && inSelectedRange(o));
    }

    if (this.searchQuery) {
      displayOrders = displayOrders.filter(o => 
        (o.orderNumber && o.orderNumber.toLowerCase().includes(this.searchQuery)) ||
        (o.customerName && o.customerName.toLowerCase().includes(this.searchQuery)) ||
        (o.serverName && o.serverName.toLowerCase().includes(this.searchQuery)) ||
        (o.tableNumber && o.tableNumber.toLowerCase().includes(this.searchQuery))
      );
    }

    displayOrders = displayOrders.filter(inSelectedRange);

    if (this.waiterFilter !== 'all') {
      displayOrders = displayOrders.filter(o => 
        (o.serverName && o.serverName.toLowerCase().includes(this.waiterFilter.toLowerCase()))
      );
    }

    if (this.sortBy === 'recent') {
      displayOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (this.sortBy === 'oldest') {
      displayOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (this.sortBy === 'highest') {
      displayOrders.sort((a, b) => b.total - a.total);
    }

    // Generate waiters list for filter
    const waitersSet = new Set(['Axmed', 'ilyaas', 'Farhan Ali', 'Staff']);
    allOrders.forEach(o => { if (o.serverName) waitersSet.add(o.serverName.replace(/\s*\(.*\)/, '')); });
    const waitersList = Array.from(waitersSet);

    container.innerHTML = `
      <div class="space-y-4 text-slate-800">
        <!-- TOP NAVIGATION & CONTROLS -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-2">
          <!-- Left Sub-Tabs -->
          <div class="flex items-center gap-6">
            <button class="unpaid-tab-btn flex items-center gap-2 pb-2 text-sm font-extrabold transition-all border-b-2 ${this.activeTab === 'walkin-unpaid' ? 'border-[#433d18] text-[#433d18]' : 'border-transparent text-slate-400 hover:text-slate-600'}" data-tab="walkin-unpaid">
              <i class="fa-solid fa-cart-shopping"></i> Walk-in unpaid
            </button>
            <button class="unpaid-tab-btn flex items-center gap-2 pb-2 text-sm font-extrabold transition-all border-b-2 ${this.activeTab === 'paid-orders' ? 'border-[#433d18] text-[#433d18]' : 'border-transparent text-slate-400 hover:text-slate-600'}" data-tab="paid-orders">
              <i class="fa-solid fa-circle-check"></i> Paid Orders
            </button>
            <button class="unpaid-tab-btn flex items-center gap-2 pb-2 text-sm font-extrabold transition-all border-b-2 ${this.activeTab === 'charged-orders' ? 'border-[#433d18] text-[#433d18]' : 'border-transparent text-slate-400 hover:text-slate-600'}" data-tab="charged-orders">
              <i class="fa-solid fa-file-invoice"></i> Charged Orders
            </button>
          </div>

          <!-- Right Utility Buttons -->
          <div class="flex items-center gap-2">
            <button id="btn-unpaid-daily-report" class="px-3.5 py-1.5 rounded-full border border-sky-400 text-sky-600 bg-white hover:bg-sky-50 text-xs font-bold transition-all shadow-sm">
              Daily Report
            </button>
            <button id="btn-unpaid-report-detail" class="px-3.5 py-1.5 rounded-full border border-sky-400 text-sky-600 bg-white hover:bg-sky-50 text-xs font-bold transition-all shadow-sm">
              Report Detail
            </button>
            <button id="btn-unpaid-complete-day" class="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
              <i class="fa-solid fa-check"></i> Complete Day
            </button>
          </div>
        </div>

        <!-- 3 KPI SUMMARY CARDS (EXACT PICTURE MATCH) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 1. TOTAL SALES (P+U) -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-xl flex-shrink-0">
              <i class="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL SALES (P+U)</p>
              <h3 class="text-2xl font-black text-slate-900 font-mono leading-tight mt-0.5">
                $${totalSalesPU.toFixed(2)}
              </h3>
              <p class="text-[11px] text-slate-500 font-semibold">${totalOrdersCount} Orders</p>
            </div>
          </div>

          <!-- 2. TOTAL PAID -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0">
              <i class="fa-solid fa-coins"></i>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL PAID</p>
              <div class="flex items-center gap-3 text-xs font-mono font-bold mt-0.5">
                <span class="text-slate-500">EX VAT <strong class="text-slate-800">$${(totalPaidSum * 0.95).toFixed(2)}</strong></span>
                <span class="text-slate-500">INC VAT <strong class="text-emerald-600 font-black">$${totalPaidSum.toFixed(2)}</strong></span>
              </div>
              <p class="text-[11px] text-slate-500 font-semibold mt-0.5">${paidCount} Orders</p>
            </div>
          </div>

          <!-- 3. TOTAL UNPAID -->
          <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center text-xl flex-shrink-0">
              <i class="fa-solid fa-file-invoice"></i>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL UNPAID</p>
              <h3 class="text-2xl font-black text-rose-600 font-mono leading-tight mt-0.5">
                $${totalUnpaidSum.toFixed(2)}
              </h3>
              <p class="text-[11px] text-slate-500 font-semibold">${unpaidCount} Orders</p>
            </div>
          </div>
        </div>

        <!-- SEARCH & FILTER CONTEXT BAR (EXACT PICTURE MATCH) -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <!-- Search Context -->
            <div class="lg:col-span-2">
              <label class="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">SEARCH CONTEXT</label>
              <div class="flex items-center">
                <input
                  type="text"
                  id="unpaid-search-context"
                  value="${this.searchQuery}"
                  placeholder="Search Reference..."
                  class="w-full bg-slate-50 border border-slate-300 rounded-l-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#433d18]"
                />
                <button id="btn-unpaid-search-apply" class="px-3.5 py-2.5 bg-[#433d18] hover:bg-[#322d12] text-white rounded-r-xl text-xs transition-colors flex items-center justify-center">
                  <i class="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>

            <!-- Date From -->
            <div>
              <label class="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">DATE FROM</label>
              <input
                type="date"
                id="unpaid-date-from"
                value="${this.dateFrom}"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#433d18]"
              />
            </div>

            <!-- Date To -->
            <div>
              <label class="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">DATE TO</label>
              <input
                type="date"
                id="unpaid-date-to"
                value="${this.dateTo}"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#433d18]"
              />
            </div>

            <!-- Waiter -->
            <div>
              <label class="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">WAITER</label>
              <select id="unpaid-waiter-filter" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#433d18]">
                <option value="all" ${this.waiterFilter === 'all' ? 'selected' : ''}>All Waiters</option>
                ${waitersList.map(w => `<option value="${w}" ${this.waiterFilter === w ? 'selected' : ''}>${w}</option>`).join('')}
              </select>
            </div>

            <!-- Sort By & Apply -->
            <div class="flex items-center gap-2">
              <div class="flex-1">
                <label class="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">SORT BY</label>
                <select id="unpaid-sort-by" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#433d18]">
                  <option value="recent" ${this.sortBy === 'recent' ? 'selected' : ''}>Most Recent</option>
                  <option value="oldest" ${this.sortBy === 'oldest' ? 'selected' : ''}>Oldest</option>
                  <option value="highest" ${this.sortBy === 'highest' ? 'selected' : ''}>Highest Total</option>
                </select>
              </div>
              <button id="btn-unpaid-filter-apply" class="px-4 py-2 bg-[#433d18] hover:bg-[#322d12] text-white rounded-xl text-xs font-black transition-colors self-end h-[36px]">
                Apply
              </button>
            </div>
          </div>
        </div>

        <!-- ORDERS SLIPS GRID (EXACT 6-COLUMN PICTURE MATCH) -->
        <div id="unpaid-cards-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
          ${displayOrders.length === 0 ? `
            <div class="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div class="w-16 h-16 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mb-3">
                <i class="fa-solid fa-receipt"></i>
              </div>
              <h3 class="text-sm font-extrabold text-slate-800">No Orders in this category</h3>
              <p class="text-xs text-slate-400 mt-1">Change filters or create a new order in POS.</p>
            </div>
          ` : displayOrders.map(order => {
            const minutesAgo = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60));
            const timeAgo = minutesAgo < 1 ? 'Just now' : minutesAgo < 60 ? `${minutesAgo} min ago` : `${Math.floor(minutesAgo/60)} hr ago`;
            const orderNumClean = String(order.orderNumber).replace(/[^0-9]/g, '') || order.orderNumber;
            const subtotal = order.subtotal || (order.total * 0.95);
            const tax = order.tax || (order.total * 0.05);

            return `
              <div class="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <!-- Order Number & Status Badge -->
                  <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span class="text-base font-black text-slate-900 font-mono tracking-tight">
                      ${orderNumClean}
                    </span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                        : 'bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa]'
                    }">
                      ${order.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                    </span>
                  </div>

                  <!-- Metadata Rows with Icons -->
                  <div class="py-2.5 space-y-1 text-xs text-slate-700 font-bold border-b border-slate-100">
                    <div class="flex items-center gap-2">
                      <i class="fa-solid fa-user text-slate-400 text-[11px] w-4 text-center"></i>
                      <span class="truncate">${order.customerName || 'Cash'}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="fa-solid fa-landmark text-sky-500 text-[11px] w-4 text-center"></i>
                      <span>${order.tableNumber || 'Table 1'}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="fa-regular fa-clock text-amber-500 text-[11px] w-4 text-center"></i>
                      <span class="text-slate-500 text-[11px]">${timeAgo}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="fa-solid fa-user-check text-emerald-600 text-[11px] w-4 text-center"></i>
                      <span class="text-emerald-700">${order.serverName ? order.serverName.replace(/\s*\(.*\)/, '') : 'Staff'}</span>
                    </div>
                  </div>

                  <!-- Mini Items Table -->
                  <div class="py-2 min-h-[95px] max-h-[120px] overflow-y-auto">
                    <table class="w-full text-left text-[11px]">
                      <thead>
                        <tr class="text-[9px] font-black uppercase text-slate-400 border-b border-slate-100">
                          <th class="py-1 w-4">NO</th>
                          <th class="py-1">ITEM</th>
                          <th class="py-1 text-right">QTY</th>
                          <th class="py-1 text-right">PRICE</th>
                          <th class="py-1 text-right">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 font-semibold text-slate-700">
                        ${order.items.slice(0, 4).map((it, idx) => `
                          <tr>
                            <td class="py-1 text-slate-400 text-[10px]">${idx + 1}</td>
                            <td class="py-1 truncate max-w-[65px] font-bold text-slate-800">${it.name}</td>
                            <td class="py-1 text-right font-mono text-[10px]">${Number(it.quantity).toFixed(2)}</td>
                            <td class="py-1 text-right font-mono text-[10px]">${Number(it.price).toFixed(2)}</td>
                            <td class="py-1 text-right font-mono font-bold text-slate-900 text-[10px]">${(it.quantity * it.price).toFixed(2)}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>

                  <!-- Subtotal & Tax Lines -->
                  <div class="pt-2 border-t border-slate-100 text-[11px] space-y-0.5 text-slate-500 font-medium">
                    <div class="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span class="font-mono font-bold text-slate-700">$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span>Tax (5%)</span>
                      <span class="font-mono font-bold text-slate-700">$${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <!-- Total Amount -->
                  <div class="flex justify-between items-center pt-1.5 pb-2">
                    <span class="text-xs font-black text-slate-900">Total</span>
                    <span class="text-sm font-black text-slate-900 font-mono">$${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <!-- Action Section -->
                <div class="space-y-2 pt-2 border-t border-slate-100">
                  <!-- Process Pay Button (Dark Olive Solid) -->
                  <button 
                    class="btn-unpaid-process-pay w-full py-2 bg-[#3e3a17] hover:bg-[#2c2910] text-[#fef9c3] rounded-xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-1.5"
                    data-id="${order.id}"
                  >
                    <i class="fa-solid fa-credit-card text-[11px]"></i> Process Pay
                  </button>

                  <!-- 3 Bottom Icon Actions -->
                  <div class="grid grid-cols-3 gap-1.5">
                    <button class="btn-card-assign-customer py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center transition-colors text-xs" title="Customer Details / Split" data-id="${order.id}">
                      <i class="fa-regular fa-user"></i>
                    </button>
                    <button class="btn-card-edit-order py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center transition-colors text-xs" title="Edit in POS" data-id="${order.id}">
                      <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="btn-card-print-slip py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center transition-colors text-xs" title="Print Bill Slip" data-id="${order.id}">
                      <i class="fa-solid fa-print"></i>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateNavbarBadge();
  }

  bindEvents() {
    // Subtabs
    document.querySelectorAll('.unpaid-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.render();
      });
    });

    // Search context
    const searchInput = document.getElementById('unpaid-search-context');
    const applySearchBtn = document.getElementById('btn-unpaid-search-apply');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.searchQuery = searchInput.value.toLowerCase().trim();
          this.render();
        }
      });
    }
    if (applySearchBtn) {
      applySearchBtn.addEventListener('click', () => {
        if (searchInput) this.searchQuery = searchInput.value.toLowerCase().trim();
        this.render();
      });
    }

    // Filter Apply Button
    const filterApplyBtn = document.getElementById('btn-unpaid-filter-apply');
    if (filterApplyBtn) {
      filterApplyBtn.addEventListener('click', () => {
        const waiterSel = document.getElementById('unpaid-waiter-filter');
        const sortSel = document.getElementById('unpaid-sort-by');
        const dateFromInput = document.getElementById('unpaid-date-from');
        const dateToInput = document.getElementById('unpaid-date-to');

        if (waiterSel) this.waiterFilter = waiterSel.value;
        if (sortSel) this.sortBy = sortSel.value;
        if (dateFromInput) this.dateFrom = dateFromInput.value;
        if (dateToInput) this.dateTo = dateToInput.value;

        this.render();
      });
    }

    // Top Utility Buttons
    document.getElementById('btn-unpaid-daily-report')?.addEventListener('click', () => {
      window.reportsModule?.printDailyZReport ? window.reportsModule.printDailyZReport() : window.print();
    });

    document.getElementById('btn-unpaid-report-detail')?.addEventListener('click', () => {
      window.authModule?.switchToView('reports');
    });

    document.getElementById('btn-unpaid-complete-day')?.addEventListener('click', () => {
      const closingDate = window.restaurantDB.getBusinessDate();
      if (confirm(`Complete business day ${closingDate}? The orders will stay in history and new POS orders will start under the next date.`)) {
        const result = window.restaurantDB.completeBusinessDay();
        if (!result) return;
        this.dateFrom = result.nextDate;
        this.dateTo = result.nextDate;
        this.searchQuery = '';
        this.waiterFilter = 'all';
        this.render();
        const { paidTotal, unpaidTotal } = result.closure;
        window.showToast?.(`${closingDate} closed. New business day: ${result.nextDate}. Paid ${paidTotal.toFixed(2)}; unpaid ${unpaidTotal.toFixed(2)}.`, 'success');
      }
    });

    // Order Card Buttons
    // 1. Process Pay
    document.querySelectorAll('.btn-unpaid-process-pay').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.id;
        const order = window.restaurantDB.getOrderById(orderId);
        if (order) {
          this.openProcessPaymentModal(order);
        }
      });
    });

    // 2. Print Slip
    document.querySelectorAll('.btn-card-print-slip').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.id;
        const order = window.restaurantDB.getOrderById(orderId);
        if (order && window.posModule) {
          window.posModule.openReceiptModal(order);
        }
      });
    });

    // 3. Edit Order in POS
    document.querySelectorAll('.btn-card-edit-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.id;
        const order = window.restaurantDB.getOrderById(orderId);
        if (order && window.posModule) {
          // Load items to POS cart
          window.posModule.cart = order.items.map(it => ({ ...it }));
          window.posModule.selectedTable = order.tableNumber;
          window.posModule.customerName = order.customerName;
          window.posModule.renderCart();
          window.authModule?.switchToView('pos');
          window.showToast?.(`Order ${order.orderNumber} loaded into POS for editing`, 'info');
        }
      });
    });

    // 4. Assign Customer / CRM
    document.querySelectorAll('.btn-card-assign-customer').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.id;
        const custName = prompt('Enter customer name or account phone for this order:', 'Muzamil Mohamed');
        if (custName) {
          const orders = window.restaurantDB.getOrders();
          const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
          if (order) {
            order.customerName = custName;
            localStorage.setItem('hodman_orders', JSON.stringify(orders));
            window.showToast?.(`Customer assigned: ${custName}`, 'success');
            this.render();
          }
        }
      });
    });
  }

  openProcessPaymentModal(order) {
    let modal = document.getElementById('unpaid-process-pay-modal');
    if (!modal) {
      const modalHtml = `
        <div id="unpaid-process-pay-modal" class="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-800">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 class="font-black text-base text-slate-900 flex items-center gap-2">
                  <i class="fa-solid fa-credit-card text-[#433d18]"></i> Settle Order Payment
                </h3>
                <p id="proc-modal-orderno" class="text-xs text-slate-500 font-bold">Order #3281 • Table 1</p>
              </div>
              <button onclick="document.getElementById('unpaid-process-pay-modal').classList.add('hidden')" class="text-slate-400 hover:text-slate-700 p-1">
                <i class="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div class="py-4 space-y-4">
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase">Total Bill Due</span>
                <span id="proc-modal-total" class="text-2xl font-black font-mono text-slate-900">$0.00</span>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Select Payment Channel</label>
                <div class="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button type="button" class="proc-pay-method-btn p-2.5 rounded-xl border border-slate-300 hover:border-[#433d18] bg-slate-50 flex items-center gap-2 transition-all active" data-method="cash">
                    <i class="fa-solid fa-money-bill-wave text-emerald-600"></i> Cash Drawer
                  </button>
                  <button type="button" class="proc-pay-method-btn p-2.5 rounded-xl border border-slate-300 hover:border-[#433d18] bg-slate-50 flex items-center gap-2 transition-all" data-method="mobile">
                    <i class="fa-solid fa-mobile-screen-button text-blue-600"></i> EVC Plus (709275)
                  </button>
                  <button type="button" class="proc-pay-method-btn p-2.5 rounded-xl border border-slate-300 hover:border-[#433d18] bg-slate-50 flex items-center gap-2 transition-all" data-method="card">
                    <i class="fa-solid fa-building-columns text-purple-600"></i> Premier Bank
                  </button>
                  <button type="button" class="proc-pay-method-btn p-2.5 rounded-xl border border-slate-300 hover:border-[#433d18] bg-slate-50 flex items-center gap-2 transition-all" data-method="mobile">
                    <i class="fa-solid fa-wallet text-amber-600"></i> e-Dahab (099859)
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Cash / Amount Received ($)</label>
                <input type="number" step="0.50" id="proc-modal-received" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-lg font-mono font-black text-slate-900 outline-none focus:border-[#433d18]" />
              </div>

              <div class="flex items-center justify-between text-xs font-bold text-slate-500 pt-1">
                <span>Calculated Change:</span>
                <span id="proc-modal-change" class="font-mono text-emerald-600 font-black text-sm">$0.00</span>
              </div>
            </div>

            <button id="btn-confirm-process-payment" class="w-full py-3 bg-[#433d18] hover:bg-[#322d12] text-white font-black rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2">
              <i class="fa-solid fa-check"></i> Complete &amp; Print Customer Bill
            </button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modal = document.getElementById('unpaid-process-pay-modal');
    }

    let selectedMethod = 'cash';
    document.querySelectorAll('.proc-pay-method-btn').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('.proc-pay-method-btn').forEach(x => {
          x.classList.remove('bg-[#433d18]', 'text-white', 'border-[#433d18]');
          x.classList.add('bg-slate-50', 'text-slate-800', 'border-slate-300');
        });
        b.classList.remove('bg-slate-50', 'text-slate-800', 'border-slate-300');
        b.classList.add('bg-[#433d18]', 'text-white', 'border-[#433d18]');
        selectedMethod = b.dataset.method;
      };
    });

    const totalEl = document.getElementById('proc-modal-total');
    const orderNoEl = document.getElementById('proc-modal-orderno');
    const receivedInput = document.getElementById('proc-modal-received');
    const changeEl = document.getElementById('proc-modal-change');

    if (totalEl) totalEl.textContent = `$${order.total.toFixed(2)}`;
    if (orderNoEl) orderNoEl.textContent = `Order #${order.orderNumber} • ${order.tableNumber}`;
    if (receivedInput) {
      receivedInput.value = order.total.toFixed(2);
      receivedInput.oninput = () => {
        const rec = parseFloat(receivedInput.value) || 0;
        const change = Math.max(0, rec - order.total);
        if (changeEl) changeEl.textContent = `$${change.toFixed(2)}`;
      };
    }

    const confirmBtn = document.getElementById('btn-confirm-process-payment');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        const received = parseFloat(receivedInput.value) || order.total;
        const change = Math.max(0, received - order.total);

        window.restaurantDB.settleOrderPayment(order.id, {
          paymentMethod: selectedMethod,
          cashReceived: received,
          change
        });

        modal.classList.add('hidden');
        window.showToast?.(`Order ${order.orderNumber} settled successfully!`, 'success');
        this.render();

        if (window.posModule) {
          const settled = window.restaurantDB.getOrderById(order.id);
          window.posModule.openReceiptModal(settled || order);
        }
      };
    }

    modal.classList.remove('hidden');
  }

  updateNavbarBadge() {
    const allUnpaid = window.restaurantDB.getUnpaidOrders ? window.restaurantDB.getUnpaidOrders() : [];
    const count = allUnpaid.length;
    document.querySelectorAll('.unpaid-orders-badge').forEach(b => {
      b.textContent = count;
      if (count > 0) b.classList.remove('hidden');
      else b.classList.add('hidden');
    });
  }
}

window.initUnpaid = () => {
  window.unpaidModule = new UnpaidModule();
};
