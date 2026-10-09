/**
 * Hodman Restaurant System - Kitchen Display System (KDS) Module
 * Live order ticket queue, dynamic timers, status workflow, and audio chime.
 */

class KdsModule {
  constructor() {
    this.activeFilter = 'active'; // 'active', 'pending', 'preparing', 'ready', 'completed'
    this.timerInterval = null;

    this.initElements();
    this.bindEvents();
    this.renderTickets();
    this.startTimerTicker();
  }

  initElements() {
    this.ticketsContainer = document.getElementById('kds-tickets-grid');
    this.activeCountBadge = document.getElementById('kds-active-count');
    this.filterButtons = document.querySelectorAll('.kds-filter-btn');
  }

  bindEvents() {
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach(b => {
          b.classList.remove('bg-orange-500', 'text-white');
          b.classList.add('bg-slate-800', 'text-slate-300');
        });
        btn.classList.add('bg-orange-500', 'text-white');
        btn.classList.remove('bg-slate-800', 'text-slate-300');

        this.activeFilter = btn.dataset.filter;
        this.renderTickets();
      });
    });

    // Reactive DB updates
    window.restaurantDB.subscribe('orderCreated', (order) => {
      this.renderTickets();
      window.playOrderChime?.();
    });

    window.restaurantDB.subscribe('orderUpdated', () => {
      this.renderTickets();
    });
  }

  startTimerTicker() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.updateElapsedTimes();
    }, 1000);
  }

  getFilteredOrders() {
    const allOrders = window.restaurantDB.getOrders();

    if (this.activeFilter === 'active') {
      return allOrders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
    }
    if (this.activeFilter === 'completed') {
      return allOrders.filter(o => o.status === 'completed').slice(0, 15);
    }
    return allOrders.filter(o => o.status === this.activeFilter);
  }

  formatElapsedTime(createdAt) {
    const elapsedSec = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }

  getUrgencyClass(createdAt, status) {
    if (status === 'completed') return { border: 'border-slate-700/60', text: 'text-slate-400', badge: 'bg-slate-700 text-slate-300' };

    const elapsedMins = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
    if (elapsedMins >= 20) {
      return { border: 'border-red-500/80 ticket-urgent', text: 'text-red-400 font-bold', badge: 'bg-red-500/20 text-red-400 border border-red-500/30' };
    }
    if (elapsedMins >= 10) {
      return { border: 'border-amber-500/80 ticket-warning', text: 'text-amber-400 font-semibold', badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' };
    }
    return { border: 'border-slate-700', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
  }

  updateElapsedTimes() {
    const timerElements = document.querySelectorAll('.kds-elapsed-timer');
    timerElements.forEach(el => {
      const createdAt = el.dataset.time;
      const status = el.dataset.status;
      if (createdAt && status !== 'completed') {
        el.textContent = this.formatElapsedTime(createdAt);
      }
    });
  }

  renderTickets() {
    if (!this.ticketsContainer) return;
    const orders = this.getFilteredOrders();
    const activeOrders = window.restaurantDB.getActiveOrders();

    if (this.activeCountBadge) {
      this.activeCountBadge.textContent = `${activeOrders.length} Active`;
    }

    // Update notification badge on header if exists
    const navBadge = document.getElementById('nav-kds-badge');
    if (navBadge) {
      navBadge.textContent = activeOrders.length;
      navBadge.classList.toggle('hidden', activeOrders.length === 0);
    }

    if (orders.length === 0) {
      this.ticketsContainer.innerHTML = `
        <div class="col-span-full py-24 text-center text-slate-400">
          <i class="fa-solid fa-bell-concierge text-5xl mb-3 text-slate-600"></i>
          <p class="text-lg font-semibold text-slate-300">Kitchen Queue is Clear</p>
          <p class="text-xs text-slate-500 mt-1">New incoming orders from POS terminal will appear here automatically.</p>
        </div>
      `;
      return;
    }

    this.ticketsContainer.innerHTML = orders.map(order => {
      const urgency = this.getUrgencyClass(order.createdAt, order.status);
      const isDineIn = order.orderType === 'dine-in';

      let statusBadge = '';
      let actionButtons = '';

      switch (order.status) {
        case 'pending':
          statusBadge = `<span class="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span> Pending</span>`;
          actionButtons = `
            <button class="kds-action-btn w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95" data-id="${order.id}" data-action="preparing">
              <i class="fa-solid fa-fire-burner"></i> Start Cooking
            </button>
          `;
          break;
        case 'preparing':
          statusBadge = `<span class="bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"><i class="fa-solid fa-fire text-[10px]"></i> Preparing</span>`;
          actionButtons = `
            <button class="kds-action-btn w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95" data-id="${order.id}" data-action="ready">
              <i class="fa-solid fa-bell"></i> Mark as Ready
            </button>
          `;
          break;
        case 'ready':
          statusBadge = `<span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"><i class="fa-solid fa-check text-[10px]"></i> Ready to Serve</span>`;
          actionButtons = `
            <button class="kds-action-btn w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95" data-id="${order.id}" data-action="completed">
              <i class="fa-solid fa-circle-check"></i> Complete & Archive
            </button>
          `;
          break;
        case 'completed':
          statusBadge = `<span class="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-xs font-medium">Completed</span>`;
          actionButtons = `
            <button class="kds-action-btn w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all" data-id="${order.id}" data-action="ready">
              <i class="fa-solid fa-rotate-left text-[10px]"></i> Recall to Ready
            </button>
          `;
          break;
      }

      return `
        <div class="kds-ticket bg-slate-800/90 rounded-2xl border ${urgency.border} p-4 flex flex-col justify-between shadow-xl transition-all">
          <div>
            <!-- Header -->
            <div class="flex items-start justify-between border-b border-slate-700/60 pb-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-base font-extrabold text-white tracking-wide">#${order.orderNumber}</span>
                  ${statusBadge}
                </div>
                <div class="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span class="font-bold text-orange-400 flex items-center gap-1">
                    <i class="fa-solid ${isDineIn ? 'fa-chair' : 'fa-bag-shopping'}"></i> ${order.tableNumber}
                  </span>
                  <span>•</span>
                  <span>${order.customerName}</span>
                </div>
                <div class="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <i class="fa-solid fa-user-tag text-[9px] text-orange-400"></i>
                  <span>Server: <strong class="text-slate-300">${order.serverName || 'Staff'}</strong></span>
                </div>
              </div>
              <div class="text-right">
                <span class="kds-elapsed-timer inline-block text-xs font-mono px-2 py-0.5 rounded-md ${urgency.badge}" data-time="${order.createdAt}" data-status="${order.status}">
                  ${this.formatElapsedTime(order.createdAt)}
                </span>
                <div class="text-[10px] text-slate-500 mt-1">
                  ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <!-- Items List -->
            <div class="py-3 space-y-2.5">
              ${order.items.map(item => `
                <div class="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span class="flex-shrink-0 w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 font-extrabold text-xs flex items-center justify-center border border-orange-500/30">
                    ${item.quantity}x
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-white leading-tight">${item.name}</p>
                    ${item.notes ? `
                      <p class="text-[11px] text-amber-300/90 font-medium italic mt-0.5 flex items-center gap-1">
                        <i class="fa-solid fa-triangle-exclamation text-[9px]"></i> ${item.notes}
                      </p>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-3 border-t border-slate-700/60 mt-2">
            ${actionButtons}
          </div>
        </div>
      `;
    }).join('');

    // Wire up status change buttons
    this.ticketsContainer.querySelectorAll('.kds-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.id;
        const newStatus = btn.dataset.action;
        window.restaurantDB.updateOrderStatus(orderId, newStatus);
        window.showToast?.(`Order updated to "${newStatus.toUpperCase()}"`, 'info');
      });
    });
  }
}

window.initKds = () => {
  window.kdsModule = new KdsModule();
};
