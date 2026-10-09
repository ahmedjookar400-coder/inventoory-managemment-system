/**
 * Hodman Restaurant System - POS Module
 * Features realistic payment collection (Cash, EVC Plus/Mobile, Card),
 * animated processing sequence, and dual-printer output:
 * - Printer 1: Kitchen Printer (ONLY Order Name & Quantity for chefs)
 * - Printer 2: Cashier/Customer Printer (Full itemized financial bill)
 */

class PosModule {
  constructor() {
    this.cart = [];
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.orderType = 'dine-in';
    this.selectedTable = 'Table 1';
    this.customerName = '';
    this.currentCompletedOrder = null;
    this.currentReceiptTab = 'customer'; // 'customer' or 'kitchen'

    this.initElements();
    this.bindEvents();
    this.renderCategories();
    this.renderMenu();
    this.renderCart();
  }

  initElements() {
    this.categoryContainer = document.getElementById('pos-categories');
    this.menuContainer = document.getElementById('pos-menu-grid');
    this.cartItemsContainer = document.getElementById('cart-items-container');
    this.cartEmptyState = document.getElementById('cart-empty-state');
    this.cartSubtotalEl = document.getElementById('cart-subtotal');
    this.cartTaxEl = document.getElementById('cart-tax');
    this.cartTotalEl = document.getElementById('cart-total');
    this.cartBadgeEl = document.getElementById('pos-cart-badge');
    this.orderTypeSelect = document.getElementById('order-type-select');
    this.tableSelect = document.getElementById('table-select');
    this.customerNameInput = document.getElementById('customer-name-input');
    this.searchInput = document.getElementById('menu-search-input');
    this.checkoutBtn = document.getElementById('btn-checkout');
    this.clearCartBtn = document.getElementById('btn-clear-cart');

    // Modals
    this.checkoutModal = document.getElementById('checkout-modal');
    this.processingModal = document.getElementById('payment-processing-modal');
    this.receiptModal = document.getElementById('receipt-modal');
    this.customerReceiptArea = document.getElementById('printable-customer-receipt');
    this.kitchenReceiptArea = document.getElementById('printable-kitchen-receipt');
  }

  bindEvents() {
    document.getElementById('btn-pos-add-dish')?.addEventListener('click', () => this.openAddDish());
    document.getElementById('btn-pos-order-history')?.addEventListener('click', () => this.openOrderHistory());
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderMenu();
      });
    }

    if (this.orderTypeSelect) {
      this.orderTypeSelect.addEventListener('change', (e) => {
        this.orderType = e.target.value;
        if (this.orderType === 'takeout' || this.orderType === 'delivery') {
          this.tableSelect.disabled = true;
          this.tableSelect.value = this.orderType === 'takeout' ? 'Takeaway' : 'Delivery';
        } else {
          this.tableSelect.disabled = false;
          this.tableSelect.value = 'Table 1';
        }
        this.selectedTable = this.tableSelect.value;
      });
    }

    if (this.tableSelect) {
      this.tableSelect.addEventListener('change', (e) => {
        this.selectedTable = e.target.value;
      });
    }

    if (this.customerNameInput) {
      this.customerNameInput.addEventListener('input', (e) => {
        this.customerName = e.target.value;
      });
    }

    if (this.clearCartBtn) {
      this.clearCartBtn.addEventListener('click', () => {
        if (this.cart.length === 0) return;
        if (confirm('Are you sure you want to clear the current order?')) {
          this.clearCart();
        }
      });
    }

    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => {
        if (this.cart.length === 0) return;
        this.openCheckoutModal();
      });
    }

    // "Send to Open Bill / Furan" — creates an unpaid deferred order
    const openBillBtn = document.getElementById('btn-send-to-open-bill');
    if (openBillBtn) {
      openBillBtn.addEventListener('click', () => {
        if (this.cart.length === 0) return;
        const { subtotal, tax, discount, total } = this.calculateTotals();
        const orderData = {
          orderType: this.orderType,
          tableNumber: this.selectedTable,
          customerName: this.customerName || `Guest (${this.selectedTable})`,
          paymentMethod: 'pending',
          paymentStatus: 'unpaid',
          isUnpaid: true,
          items: [...this.cart],
          subtotal, tax, discount, total,
          cashReceived: 0, change: 0
        };
        const newOrder = window.restaurantDB.createOrder(orderData);
        // Print kitchen chit for the kitchen printer
        if (window.posModule) {
          this.openReceiptModal(newOrder);
        }
        this.checkoutModal.classList.add('hidden');
        this.clearCart();
        window.showToast?.(`Order #${newOrder.orderNumber} sent to open bills (Furan). Cashier will collect payment.`, 'warning');
        if (window.unpaidModule) window.unpaidModule.render();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.searchInput && !this.isModalOpen()) {
        e.preventDefault();
        this.searchInput?.focus();
      }
    });

    window.restaurantDB.subscribe('menu', () => this.renderMenu());
    window.restaurantDB.subscribe('categories', () => {
      this.renderCategories();
      this.renderMenu();
    });
  }

  isModalOpen() {
    return (this.checkoutModal && !this.checkoutModal.classList.contains('hidden')) ||
           (this.processingModal && !this.processingModal.classList.contains('hidden')) ||
           (this.receiptModal && !this.receiptModal.classList.contains('hidden'));
  }

  renderCategories() {
    if (!this.categoryContainer) return;
    const categories = window.restaurantDB.getCategories();

    this.categoryContainer.innerHTML = categories.map(cat => `
      <button 
        class="category-pill flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
          this.activeCategory === cat.id 
            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 ring-2 ring-orange-400' 
            : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50'
        }"
        data-category="${cat.id}"
      >
        <i class="fa-solid ${cat.icon || 'fa-tag'} text-xs"></i>
        <span>${cat.name}</span>
      </button>
    `).join('');

    this.categoryContainer.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.getAttribute('data-category');
        this.renderCategories();
        this.renderMenu();
      });
    });
  }

  renderMenu() {
    if (!this.menuContainer) return;
    const menu = window.restaurantDB.getMenu();

    const filtered = menu.filter(item => {
      const matchesCategory = this.activeCategory === 'all' || item.categoryId === this.activeCategory;
      const matchesSearch = !this.searchQuery || 
        item.name.toLowerCase().includes(this.searchQuery) ||
        (item.description && item.description.toLowerCase().includes(this.searchQuery));
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      this.menuContainer.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400">
          <i class="fa-solid fa-bowl-food text-5xl mb-3 text-slate-600"></i>
          <p class="text-base font-medium">No dishes match your search.</p>
        </div>
      `;
      return;
    }

    this.menuContainer.innerHTML = filtered.map(item => {
      const inCart = this.cart.find(c => c.id === item.id);
      const cartQty = inCart ? inCart.quantity : 0;
      const isAvailable = item.available !== false;

      return `
        <div class="menu-card bg-slate-800/90 rounded-2xl border ${isAvailable ? 'border-slate-700/60' : 'border-red-500/40 opacity-60'} overflow-hidden flex flex-col justify-between group">
          <div class="relative h-44 overflow-hidden bg-slate-900">
            <img 
              src="${item.image}" 
              alt="${item.name}" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'"
            />
            <span class="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md text-orange-400 font-bold px-2.5 py-1 rounded-lg text-sm border border-orange-500/20 shadow-md font-mono">
              $${item.price.toFixed(2)}
            </span>
            ${cartQty > 0 ? `
              <span class="absolute top-2.5 left-2.5 bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full text-xs shadow-md flex items-center gap-1">
                <i class="fa-solid fa-check text-[10px]"></i> ${cartQty} in cart
              </span>
            ` : ''}
            ${!isAvailable ? `
              <span class="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 font-extrabold text-sm uppercase tracking-wider backdrop-blur-[2px]">
                Out of Stock
              </span>
            ` : ''}
          </div>
          <div class="p-4 flex flex-col flex-1 justify-between">
            <div>
              <h3 class="font-bold text-white text-base leading-snug group-hover:text-orange-400 transition-colors">${item.name}</h3>
              <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">${item.description || ''}</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
              <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">${item.categoryId.replace('_', ' ')}</span>
              <button 
                class="btn-add-item bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20 ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}"
                data-id="${item.id}"
                ${!isAvailable ? 'disabled' : ''}
              >
                <i class="fa-solid fa-plus text-[11px]"></i> Add
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.menuContainer.querySelectorAll('.btn-add-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.addToCart(Number(btn.getAttribute('data-id')));
      });
    });
  }

  addToCart(id) {
    const item = window.restaurantDB.getMenuItemById(id);
    if (!item || item.available === false) return;

    const existing = this.cart.find(c => c.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        notes: ''
      });
    }

    this.renderCart();
    this.renderMenu();
    window.showToast?.(`Added "${item.name}" to ticket`, 'success');
  }

  removeFromCart(id) {
    this.cart = this.cart.filter(c => c.id !== id);
    this.renderCart();
    this.renderMenu();
  }

  updateQuantity(id, delta) {
    const item = this.cart.find(c => c.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(id);
    } else {
      this.renderCart();
      this.renderMenu();
    }
  }

  updateItemNote(id, note) {
    const item = this.cart.find(c => c.id === id);
    if (item) {
      item.notes = note;
    }
  }

  clearCart() {
    this.cart = [];
    this.renderCart();
    this.renderMenu();
  }

  calculateTotals() {
    const settings = window.restaurantDB.getSettings();
    const taxRate = settings.taxRate || 0.05;

    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    const discount = 0;
    const total = subtotal + tax - discount;

    return { subtotal, tax, discount, total };
  }

  renderCart() {
    const totalItems = this.cart.reduce((sum, i) => sum + i.quantity, 0);
    if (this.cartBadgeEl) {
      this.cartBadgeEl.textContent = totalItems;
      this.cartBadgeEl.classList.toggle('hidden', totalItems === 0);
    }

    if (this.cart.length === 0) {
      if (this.cartEmptyState) this.cartEmptyState.classList.remove('hidden');
      if (this.cartItemsContainer) this.cartItemsContainer.innerHTML = '';
      if (this.checkoutBtn) {
        this.checkoutBtn.disabled = true;
        this.checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
      this.updateSummaryDisplay(0, 0, 0);
      return;
    }

    if (this.cartEmptyState) this.cartEmptyState.classList.add('hidden');
    if (this.checkoutBtn) {
      this.checkoutBtn.disabled = false;
      this.checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    const { subtotal, tax, total } = this.calculateTotals();
    this.updateSummaryDisplay(subtotal, tax, total);

    if (this.cartItemsContainer) {
      this.cartItemsContainer.innerHTML = this.cart.map(item => `
        <div class="cart-item bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 mb-2.5">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <h4 class="font-semibold text-white text-sm leading-tight">${item.name}</h4>
              <span class="text-xs text-orange-400 font-medium font-mono">$${item.price.toFixed(2)} each</span>
            </div>
            <button 
              class="btn-remove-item text-slate-500 hover:text-red-400 p-1 transition-colors"
              data-id="${item.id}"
              title="Remove item"
            >
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>

          <div class="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-700/40">
            <div class="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
              <button 
                class="btn-qty-minus w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white rounded active:bg-slate-800 text-xs transition-colors"
                data-id="${item.id}"
              >
                <i class="fa-solid fa-minus"></i>
              </button>
              <span class="w-8 text-center text-xs font-bold text-white font-mono">${item.quantity}</span>
              <button 
                class="btn-qty-plus w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white rounded active:bg-slate-800 text-xs transition-colors"
                data-id="${item.id}"
              >
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
            <span class="font-bold text-white text-sm font-mono">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>

          <input 
            type="text" 
            placeholder="Kitchen notes (e.g. well done, no onions)..." 
            class="input-item-note w-full mt-2 text-xs bg-slate-900/80 text-slate-200 placeholder-slate-500 px-2.5 py-1.5 rounded-lg border border-slate-700/60 focus:border-orange-500 outline-none"
            data-id="${item.id}"
            value="${item.notes || ''}"
          />
        </div>
      `).join('');

      this.cartItemsContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', () => this.removeFromCart(Number(btn.dataset.id)));
      });

      this.cartItemsContainer.querySelectorAll('.btn-qty-minus').forEach(btn => {
        btn.addEventListener('click', () => this.updateQuantity(Number(btn.dataset.id), -1));
      });

      this.cartItemsContainer.querySelectorAll('.btn-qty-plus').forEach(btn => {
        btn.addEventListener('click', () => this.updateQuantity(Number(btn.dataset.id), 1));
      });

      this.cartItemsContainer.querySelectorAll('.input-item-note').forEach(input => {
        input.addEventListener('change', (e) => {
          this.updateItemNote(Number(input.dataset.id), e.target.value.trim());
        });
      });
    }
  }

  updateSummaryDisplay(subtotal, tax, total) {
    if (this.cartSubtotalEl) this.cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (this.cartTaxEl) this.cartTaxEl.textContent = `$${tax.toFixed(2)}`;
    if (this.cartTotalEl) this.cartTotalEl.textContent = `$${total.toFixed(2)}`;
  }

  // ================= PAYMENT PROCESS & MONEY COLLECTION =================
  openCheckoutModal() {
    if (!this.checkoutModal) return;
    const { subtotal, tax, total } = this.calculateTotals();

    const checkoutTotalEl = document.getElementById('checkout-modal-total');
    const checkoutItemsSummaryEl = document.getElementById('checkout-items-summary');
    const cashInput = document.getElementById('checkout-cash-amount');
    const changeDueEl = document.getElementById('checkout-change-due');
    let paymentMethod = 'cash';

    if (checkoutTotalEl) checkoutTotalEl.textContent = `$${total.toFixed(2)}`;

    if (checkoutItemsSummaryEl) {
      checkoutItemsSummaryEl.innerHTML = this.cart.map(i => `
        <div class="flex justify-between text-xs py-1 border-b border-slate-800">
          <span class="text-slate-300 font-medium">${i.quantity}x ${i.name}</span>
          <span class="text-white font-semibold font-mono">$${(i.price * i.quantity).toFixed(2)}</span>
        </div>
      `).join('');
    }

    if (cashInput) cashInput.value = total.toFixed(2);
    if (changeDueEl) changeDueEl.textContent = '$0.00';

    // Payment method selector
    const methodBtns = document.querySelectorAll('.payment-method-btn');
    const cashSection = document.getElementById('checkout-cash-section');
    const mobileSection = document.getElementById('checkout-mobile-section');
    const cardSection = document.getElementById('checkout-card-section');

    const showPaymentSection = (method) => {
      paymentMethod = method;
      methodBtns.forEach(b => {
        b.classList.remove('border-orange-500', 'bg-orange-500/20');
        if (b.dataset.method === method) {
          b.classList.add('border-orange-500', 'bg-orange-500/20');
        }
      });

      if (cashSection) cashSection.style.display = method === 'cash' ? 'block' : 'none';
      if (mobileSection) mobileSection.style.display = method === 'mobile' ? 'block' : 'none';
      if (cardSection) cardSection.style.display = method === 'card' ? 'block' : 'none';
    };

    methodBtns.forEach(btn => {
      btn.onclick = () => showPaymentSection(btn.dataset.method);
    });

    showPaymentSection('cash');

    // Quick cash calculations
    const updateChange = () => {
      const received = parseFloat(cashInput.value) || 0;
      const change = Math.max(0, received - total);
      if (changeDueEl) changeDueEl.textContent = `$${change.toFixed(2)}`;

      const statusEl = document.getElementById('cash-balance-status');
      if (statusEl) {
        if (received < total - 0.001) {
          statusEl.textContent = `Short by $${(total - received).toFixed(2)}`;
          statusEl.className = 'text-xs font-bold text-red-400 font-mono';
        } else {
          statusEl.textContent = '✓ Amount Satisfied';
          statusEl.className = 'text-xs font-bold text-emerald-400 font-mono';
        }
      }
    };

    document.querySelectorAll('.quick-cash-btn').forEach(btn => {
      btn.onclick = () => {
        const val = btn.dataset.amount;
        if (val === 'exact') {
          cashInput.value = total.toFixed(2);
        } else {
          cashInput.value = parseFloat(val).toFixed(2);
        }
        updateChange();
      };
    });

    if (cashInput) cashInput.oninput = updateChange;
    updateChange();

    // Confirm button -> Launches Money Verification & Printing Flow!
    const confirmBtn = document.getElementById('btn-confirm-payment');
    confirmBtn.onclick = () => {
      let cashReceived = total;
      let change = 0;

      if (paymentMethod === 'cash') {
        cashReceived = parseFloat(cashInput?.value) || total;
        if (cashReceived < total - 0.001) {
          alert('Cash received is less than total amount due.');
          return;
        }
        change = Math.max(0, cashReceived - total);
      } else if (paymentMethod === 'mobile') {
        const phone = document.getElementById('mobile-customer-phone')?.value.trim();
        if (!phone) {
          alert('Please enter the customer mobile number or confirm payment.');
          return;
        }
      }

      const orderData = {
        orderType: this.orderType,
        tableNumber: this.selectedTable,
        customerName: this.customerName || (this.orderType === 'takeout' ? 'Takeout Customer' : `Guest (${this.selectedTable})`),
        paymentMethod,
        items: [...this.cart],
        subtotal,
        tax,
        discount: 0,
        total,
        cashReceived,
        change
      };

      this.checkoutModal.classList.add('hidden');
      this.startPaymentProcessing(orderData);
    };

    this.checkoutModal.classList.remove('hidden');
  }

  // Realistic Payment Collection & Order Processing
  startPaymentProcessing(orderData) {
    if (!this.processingModal) return;

    const progressBar = document.getElementById('processing-progress-bar');
    const stepText = document.getElementById('processing-step-text');
    const statusSubtext = document.getElementById('processing-subtext');
    const spinnerIcon = document.getElementById('processing-spinner-icon');
    const checkmarkIcon = document.getElementById('processing-check-icon');

    this.processingModal.classList.remove('hidden');
    if (progressBar) progressBar.style.width = '20%';
    if (spinnerIcon) spinnerIcon.classList.remove('hidden');
    if (checkmarkIcon) checkmarkIcon.classList.add('hidden');

    if (stepText) stepText.textContent = `Collecting $${orderData.total.toFixed(2)} via ${orderData.paymentMethod.toUpperCase()}...`;
    if (statusSubtext) statusSubtext.textContent = 'Verifying funds and recording transaction...';

    // Step 1: Money Received (400ms)
    setTimeout(() => {
      if (progressBar) progressBar.style.width = '55%';
      if (stepText) stepText.textContent = `Money Received! (${orderData.paymentMethod === 'cash' ? 'Cash Stored in Drawer' : orderData.paymentMethod === 'mobile' ? 'Mobile Money Confirmed' : 'Card Authorized'})`;
      if (statusSubtext) statusSubtext.textContent = 'Routing print jobs to Kitchen & Cashier printers...';
    }, 450);

    // Step 2: Routing to Kitchen Printer (ONLY Name & Qty) and Cashier Printer (1100ms)
    setTimeout(() => {
      if (progressBar) progressBar.style.width = '85%';
      if (stepText) stepText.textContent = 'Kitchen Printer: Preparing Order Chit (Name & Qty)...';
      if (statusSubtext) statusSubtext.textContent = `Cashier Printer: Generating Customer Receipt...`;
    }, 1150);

    // Step 3: Approved & Printed (1800ms)
    setTimeout(() => {
      if (progressBar) progressBar.style.width = '100%';
      if (spinnerIcon) spinnerIcon.classList.add('hidden');
      if (checkmarkIcon) checkmarkIcon.classList.remove('hidden');
      if (stepText) stepText.textContent = 'Transaction Completed & Ready to Print!';
      if (statusSubtext) statusSubtext.textContent = 'Choose printer: Kitchen Printer or Cashier Bill';
      window.playOrderChime?.();
    }, 1850);

    // Step 4: Open Receipt Modal (2500ms)
    setTimeout(() => {
      const newOrder = window.restaurantDB.createOrder(orderData);
      this.currentCompletedOrder = newOrder;

      this.processingModal.classList.add('hidden');
      this.clearCart();
      this.openReceiptModal(newOrder);
      window.showToast?.(`Order ${newOrder.orderNumber} completed & ready to print!`, 'success');
    }, 2500);
  }

  // ================= SETTLE AN EXISTING UNPAID ORDER (from Open Bills view) =================
  openSettleUnpaidModal(order) {
    if (!this.checkoutModal || !order) return;
    const settings = window.restaurantDB.getSettings();
    const taxRate = settings.taxRate || 0.05;

    const total = order.total;
    let paymentMethod = 'cash';

    const checkoutTotalEl = document.getElementById('checkout-modal-total');
    const checkoutItemsSummaryEl = document.getElementById('checkout-items-summary');
    const cashInput = document.getElementById('checkout-cash-amount');
    const changeDueEl = document.getElementById('checkout-change-due');

    if (checkoutTotalEl) checkoutTotalEl.textContent = `$${total.toFixed(2)}`;

    if (checkoutItemsSummaryEl) {
      checkoutItemsSummaryEl.innerHTML = (order.items || []).map(i => `
        <div class="flex justify-between text-xs py-1 border-b border-slate-800">
          <span class="text-slate-300 font-medium">${i.quantity}x ${i.name}</span>
          <span class="text-white font-semibold font-mono">$${(i.price * i.quantity).toFixed(2)}</span>
        </div>
      `).join('') + `
        <div class="flex justify-between text-xs py-2 border-t border-slate-700 mt-1 font-bold">
          <span class="text-amber-400">⚠ Settling Unpaid Order #${order.orderNumber}</span>
        </div>
      `;
    }

    if (cashInput) cashInput.value = total.toFixed(2);
    if (changeDueEl) changeDueEl.textContent = '$0.00';

    const methodBtns = document.querySelectorAll('.payment-method-btn');
    const cashSection = document.getElementById('checkout-cash-section');
    const mobileSection = document.getElementById('checkout-mobile-section');
    const cardSection = document.getElementById('checkout-card-section');

    const showPaymentSection = (method) => {
      paymentMethod = method;
      methodBtns.forEach(b => {
        b.classList.remove('border-orange-500', 'bg-orange-500/20');
        if (b.dataset.method === method) b.classList.add('border-orange-500', 'bg-orange-500/20');
      });
      if (cashSection) cashSection.style.display = method === 'cash' ? 'block' : 'none';
      if (mobileSection) mobileSection.style.display = method === 'mobile' ? 'block' : 'none';
      if (cardSection) cardSection.style.display = method === 'card' ? 'block' : 'none';
    };

    methodBtns.forEach(btn => { btn.onclick = () => showPaymentSection(btn.dataset.method); });
    showPaymentSection('cash');

    const updateChange = () => {
      const received = parseFloat(cashInput.value) || 0;
      const change = Math.max(0, received - total);
      if (changeDueEl) changeDueEl.textContent = `$${change.toFixed(2)}`;
      const statusEl = document.getElementById('cash-balance-status');
      if (statusEl) {
        if (received < total - 0.001) {
          statusEl.textContent = `Short by $${(total - received).toFixed(2)}`;
          statusEl.className = 'text-xs font-bold text-red-400 font-mono';
        } else {
          statusEl.textContent = '✓ Amount Satisfied';
          statusEl.className = 'text-xs font-bold text-emerald-400 font-mono';
        }
      }
    };

    document.querySelectorAll('.quick-cash-btn').forEach(btn => {
      btn.onclick = () => {
        cashInput.value = btn.dataset.amount === 'exact' ? total.toFixed(2) : parseFloat(btn.dataset.amount).toFixed(2);
        updateChange();
      };
    });

    if (cashInput) cashInput.oninput = updateChange;
    updateChange();

    const confirmBtn = document.getElementById('btn-confirm-payment');
    confirmBtn.onclick = () => {
      let cashReceived = total;
      let change = 0;
      if (paymentMethod === 'cash') {
        cashReceived = parseFloat(cashInput?.value) || total;
        if (cashReceived < total - 0.001) {
          alert('Cash received is less than total amount due.');
          return;
        }
        change = Math.max(0, cashReceived - total);
      } else if (paymentMethod === 'mobile' && !document.getElementById('mobile-customer-phone')?.value.trim()) {
        alert('Please enter the customer mobile number or confirm payment.');
        return;
      }

      this.checkoutModal.classList.add('hidden');

      // Run payment processing animation, then settle the existing order
      const processingModal = this.processingModal;
      const progressBar = document.getElementById('processing-progress-bar');
      const stepText = document.getElementById('processing-step-text');
      const statusSubtext = document.getElementById('processing-subtext');
      const spinnerIcon = document.getElementById('processing-spinner-icon');
      const checkmarkIcon = document.getElementById('processing-check-icon');

      if (processingModal) processingModal.classList.remove('hidden');
      if (progressBar) progressBar.style.width = '20%';
      if (spinnerIcon) spinnerIcon.classList.remove('hidden');
      if (checkmarkIcon) checkmarkIcon.classList.add('hidden');
      if (stepText) stepText.textContent = `Collecting $${total.toFixed(2)} for Table ${order.tableNumber}...`;
      if (statusSubtext) statusSubtext.textContent = 'Settling open bill...';

      setTimeout(() => { if (progressBar) progressBar.style.width = '70%'; }, 500);
      setTimeout(() => {
        if (progressBar) progressBar.style.width = '100%';
        if (spinnerIcon) spinnerIcon.classList.add('hidden');
        if (checkmarkIcon) checkmarkIcon.classList.remove('hidden');
        if (stepText) stepText.textContent = 'Bill Settled!';
        if (statusSubtext) statusSubtext.textContent = 'Printing receipt...';
        window.playOrderChime?.();
      }, 1400);

      setTimeout(() => {
        const settledOrder = window.restaurantDB.settleOrderPayment
          ? window.restaurantDB.settleOrderPayment(order.id, { paymentMethod, cashReceived, change })
          : order;

        if (processingModal) processingModal.classList.add('hidden');
        this.openReceiptModal(settledOrder || order);
        window.showToast?.(`Order #${order.orderNumber} settled!`, 'success');
        if (window.unpaidModule) window.unpaidModule.render();
      }, 2200);
    };

    this.checkoutModal.classList.remove('hidden');
  }

  openOrderHistory() {
    let modal = document.getElementById('pos-order-history-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pos-order-history-modal';
      modal.className = 'fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4';
      document.body.appendChild(modal);
    }
    const orders = window.restaurantDB.getOrders().slice().sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
    const dateToClear = this.historyDateToClear || (() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; })();
    this.historyDateToClear = dateToClear;
    const visibleOrders = orders.filter(order => {
      const date = new Date(order.createdAt);
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}` === dateToClear;
    });
    modal.innerHTML = `<section class="pos-history-dialog bg-white text-slate-900 w-full max-w-7xl max-h-[92vh] rounded-[24px] overflow-hidden shadow-2xl">
      <header class="flex items-center justify-between gap-4 px-6 sm:px-7 py-4 bg-gradient-to-r from-[#3d408e] to-[#20234e] text-white">
        <h2 class="m-0 flex items-center gap-3 text-xl sm:text-2xl font-bold"><i class="fa-regular fa-clock text-blue-100"></i> Order History</h2>
        <button id="pos-history-close" class="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 hover:text-white text-2xl transition-colors" aria-label="Close order history" title="Close">&times;</button>
      </header>
      <div class="p-4 sm:p-6 lg:p-7 overflow-auto max-h-[calc(92vh-72px)]">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 text-sm">
          <p class="m-0 text-slate-500">Showing ${dateToClear} · ${visibleOrders.length} order(s)</p>
          <div class="flex flex-wrap items-center gap-2">
            <label class="flex items-center gap-2 text-xs font-medium text-slate-600">History date <input id="pos-history-clear-date" type="date" value="${dateToClear}" class="border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800"></label>
            <button id="pos-history-clear-day" class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">Clear Selected Day</button>
          </div>
        </div>
        <div class="pos-history-table-wrap overflow-auto rounded-2xl border border-[#343b88]">
          <table class="pos-history-table w-full text-sm text-left">
            <thead><tr><th>No</th><th>Name</th><th>Tell</th><th>Ref No</th><th>Total</th><th>Username</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>${visibleOrders.length ? visibleOrders.map((o, index) => {
              const orderDate = new Date(o.createdAt);
              const dateLabel = `${orderDate.getFullYear()}-${String(orderDate.getMonth()+1).padStart(2,'0')}-${String(orderDate.getDate()).padStart(2,'0')}`;
              const customerPhone = o.customerPhone || o.phone || '0';
              const username = o.serverName || o.createdBy || o.cashierName || '—';
              return `<tr>
                <td>${index + 1}</td><td>${o.customerName || 'Cash'}</td><td>${customerPhone}</td>
                <td><span class="pos-history-ref">${o.orderNumber}</span></td>
                <td class="pos-history-total">${Number(o.total || 0).toFixed(4)}</td><td>${username}</td><td>${dateLabel}</td>
                <td class="whitespace-nowrap"><button class="pos-history-edit" data-id="${o.id}"><i class="fa-regular fa-pen-to-square"></i> Edit / Add Items</button><button class="pos-history-remove" data-id="${o.id}" aria-label="Remove order ${o.orderNumber}" title="Remove order"><i class="fa-solid fa-trash"></i></button></td>
              </tr>`;
            }).join('') : '<tr><td colspan="8" class="pos-history-empty">No orders for this date. History is empty.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </section>`;
    modal.classList.remove('hidden');
    modal.querySelector('#pos-history-close').onclick = () => modal.classList.add('hidden');
    modal.querySelector('#pos-history-clear-date').onchange = e => { this.historyDateToClear = e.target.value; this.openOrderHistory(); };
    modal.querySelector('#pos-history-clear-day').onclick = () => {
      const date = modal.querySelector('#pos-history-clear-date').value;
      if (!date) return alert('Choose a date to clear.');
      if (!confirm(`Permanently clear every order from ${date}? This cannot be undone.`)) return;
      const count = window.restaurantDB.clearOrdersForDate(date);
      window.showToast?.(`${count} order(s) cleared for ${date}.`, 'success');
      this.openOrderHistory();
    };
    modal.querySelectorAll('.pos-history-edit').forEach(btn => btn.onclick = () => {
      const order = window.restaurantDB.getOrders().find(o => o.id === btn.dataset.id);
      if (!order) return;
      this.openOrderEditor(order);
    });
    modal.querySelectorAll('.pos-history-remove').forEach(btn => btn.onclick = () => {
      const order = window.restaurantDB.getOrderById(btn.dataset.id);
      if (!order || !confirm(`Remove order #${order.orderNumber} from history?`)) return;
      window.restaurantDB.deleteOrder(order.id);
      this.openOrderHistory();
    });
  }

  openOrderEditor(order) {
    let modal = document.getElementById('pos-order-editor-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pos-order-editor-modal';
      modal.className = 'fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4';
      document.body.appendChild(modal);
    }
    const menu = window.restaurantDB.getMenu();
    const items = (order.items || []).map((item, index) => `<div class="grid grid-cols-[1fr_90px_90px_72px] gap-2 items-center border-b border-slate-200 py-2"><span class="text-sm font-bold">${item.name}<small class="block text-slate-500">$${Number(item.price).toFixed(2)} each</small></span><label class="text-[10px] text-slate-500">Qty<input class="edit-order-qty w-full border rounded p-1 text-slate-900" type="number" min="1" step="1" value="${item.quantity}" data-index="${index}"></label><span class="text-sm">$${(item.price * item.quantity).toFixed(2)}</span><button type="button" class="edit-order-remove px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold" data-index="${index}">Remove</button></div>`).join('');
    modal.innerHTML = `<div class="bg-white text-slate-900 rounded-2xl p-5 w-full max-w-2xl max-h-[90vh] overflow-auto"><div class="flex items-center justify-between mb-4"><h3 class="font-black text-lg">Edit Order #${order.orderNumber}</h3><button id="edit-order-close" class="px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-bold">Close</button></div>
      <label class="block text-xs font-bold mb-3">Customer<input id="edit-order-customer" class="mt-1 w-full border rounded-lg p-2" value="${order.customerName || ''}"></label><label class="block text-xs font-bold mb-4">Table / service location<input id="edit-order-table" class="mt-1 w-full border rounded-lg p-2" value="${order.tableNumber || ''}"></label>
      <div class="flex flex-wrap gap-2 mb-3"><select id="edit-order-menu-item" class="flex-1 min-w-[180px] border rounded-lg p-2">${menu.map(item=>`<option value="${item.id}">${item.name} — $${Number(item.price).toFixed(2)}</option>`).join('')}</select><input id="edit-order-add-qty" type="number" min="1" step="1" value="1" class="w-20 border rounded-lg p-2" aria-label="Quantity"><button id="edit-order-add-item" class="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Add Order Item</button></div>
      <div id="edit-order-items" class="mb-4">${items || '<p class="text-sm text-slate-500 py-3">No items in this order.</p>'}</div><button id="edit-order-save" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-extrabold">Save Changes</button></div>`;
    modal.classList.remove('hidden');
    const workingItems = (order.items || []).map(item => ({ ...item }));
    const drawItems = () => {
      const target = modal.querySelector('#edit-order-items');
      target.innerHTML = workingItems.length ? workingItems.map((item,index)=>`<div class="grid grid-cols-[1fr_90px_90px_72px] gap-2 items-center border-b border-slate-200 py-2"><span class="text-sm font-bold">${item.name}<small class="block text-slate-500">$${Number(item.price).toFixed(2)} each</small></span><label class="text-[10px] text-slate-500">Qty<input class="edit-order-qty w-full border rounded p-1 text-slate-900" type="number" min="1" step="1" value="${item.quantity}" data-index="${index}"></label><span class="text-sm">$${(item.price * item.quantity).toFixed(2)}</span><button type="button" class="edit-order-remove px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold" data-index="${index}">Remove</button></div>`).join('') : '<p class="text-sm text-slate-500 py-3">No items in this order.</p>';
      target.querySelectorAll('.edit-order-qty').forEach(input => input.onchange = () => { workingItems[Number(input.dataset.index)].quantity = Number(input.value); drawItems(); });
      target.querySelectorAll('.edit-order-remove').forEach(button => button.onclick = () => { workingItems.splice(Number(button.dataset.index),1); drawItems(); });
    };
    drawItems();
    modal.querySelector('#edit-order-close').onclick = () => modal.classList.add('hidden');
    modal.querySelector('#edit-order-add-item').onclick = () => {
      const item = menu.find(entry => entry.id === Number(modal.querySelector('#edit-order-menu-item').value));
      const quantity = Number(modal.querySelector('#edit-order-add-qty').value);
      if (!item || !Number.isInteger(quantity) || quantity < 1) return alert('Choose a dish and a valid whole-number quantity.');
      const existing = workingItems.find(entry => entry.id === item.id);
      if (existing) existing.quantity += quantity;
      else workingItems.push({ id: item.id, name: item.name, price: Number(item.price), quantity, notes: '' });
      drawItems();
    };
    modal.querySelector('#edit-order-save').onclick = () => {
      if (!workingItems.length) return alert('An order must contain at least one item. Remove the whole order from history if it should be deleted.');
      if (workingItems.some(item => !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1)) return alert('Enter a valid whole-number quantity for every item.');
      const subtotal = workingItems.reduce((sum,item)=>sum+Number(item.price)*Number(item.quantity),0);
      const tax = Number((subtotal * (window.restaurantDB.getSettings().taxRate || 0.05)).toFixed(2));
      window.restaurantDB.updateOrder(order.id, { customerName: modal.querySelector('#edit-order-customer').value.trim() || 'Guest', tableNumber: modal.querySelector('#edit-order-table').value.trim(), items: workingItems, subtotal, tax, total: Number((subtotal+tax).toFixed(2)) });
      modal.classList.add('hidden');
      this.openOrderHistory();
      window.showToast?.(`Order #${order.orderNumber} updated.`, 'success');
    };
  }

  openAddDish() {
    const categories = window.restaurantDB.getCategories();
    let modal = document.getElementById('pos-add-dish-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pos-add-dish-modal';
      modal.className = 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `<form class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 space-y-4 text-white">
      <div class="flex justify-between items-center"><h2 class="font-black text-lg"><i class="fa-solid fa-plus-circle text-orange-500"></i> Add New Dish to Menu</h2><button type="button" id="pos-dish-cancel" class="text-slate-400 hover:text-white">Close</button></div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><label class="sm:col-span-2 text-xs font-bold text-slate-300">Dish name<input name="name" required class="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" placeholder="e.g. Somali Grilled Fish"></label><label class="text-xs font-bold text-slate-300">Category<select name="categoryId" class="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white">${categories.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></label>
      <label class="text-xs font-bold text-slate-300">Price ($)<input name="price" type="number" min="0" step="0.01" required class="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" placeholder="15.00"></label><label class="sm:col-span-2 text-xs font-bold text-slate-300">Image URL (optional)<input name="image" type="url" class="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" placeholder="https://..."></label>
      <label class="sm:col-span-3 text-xs font-bold text-slate-300">Description<textarea name="description" rows="3" class="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"></textarea></label></div>
      <button class="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 rounded-xl text-sm font-extrabold"><i class="fa-solid fa-floppy-disk"></i> Save &amp; Publish Dish</button></form>`;
    modal.classList.remove('hidden');
    modal.querySelector('#pos-dish-cancel').onclick = () => modal.classList.add('hidden');
    modal.querySelector('form').onsubmit = e => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const item = window.restaurantDB.addMenuItem({ name: String(form.get('name')).trim(), categoryId: form.get('categoryId'), price: Number(form.get('price')), image: String(form.get('image')).trim(), description: String(form.get('description')).trim() });
      modal.classList.add('hidden');
      window.showToast?.(`${item.name} added to the menu`, 'success');
    };
  }

  // ================= TWO-PRINTER RECEIPT GENERATION =================
  openReceiptModal(order) {
    if (!this.receiptModal || !order) return;
    const settings = window.restaurantDB.getSettings();

    // 1. GENERATE PRINTER 2: FULL CUSTOMER BILL / CASHIER RECEIPT (80mm Standard Format)
    const totalAmount = order.total.toFixed(2);
    const evc  = settings.evcMerchantCode   || '709275';
    const edahab = settings.edahabCode      || '099859';
    const premier = settings.premierWalletCode || '673836';
    const ebesa = settings.ebesaCode        || '940396';

    const customerReceiptHtml = `
      <div class="receipt-paper" id="printable-customer-receipt-content" style="font-weight: 700; color: #000000;">

        <!-- Official Hodman Header with Winged Heart Logo -->
        <div style="text-align:center; margin-bottom:10px; color: #000000;">
          <div style="margin: 0 auto 6px auto; width: 68px; height: 68px;">
            <svg viewBox="0 0 500 500" width="100%" height="100%">
              <circle cx="250" cy="250" r="236" fill="#000000"/>
              <circle cx="250" cy="250" r="218" fill="none" stroke="#ffffff" stroke-width="5"/>
              <!-- Left Wing -->
              <path d="M175,235 C130,170 75,150 40,162 C50,195 72,222 105,238 C80,242 55,262 65,288 C85,288 112,272 138,256 Z" fill="#ffffff"/>
              <!-- Right Wing -->
              <path d="M325,235 C370,170 425,150 460,162 C450,195 428,222 395,238 C420,242 445,262 435,288 C415,288 388,272 362,256 Z" fill="#ffffff"/>
              <!-- Center Heart -->
              <path d="M250,335 C195,285 180,230 212,192 C238,165 250,202 250,212 C250,202 262,165 288,192 C320,230 305,285 250,335 Z" fill="#ffffff"/>
            </svg>
          </div>
          <div style="font-size: 24px; font-weight: 900; letter-spacing: 0.5px; font-family: 'Playfair Display', Georgia, serif; line-height: 1.1; color: #000000;">Hodman</div>
          <div style="font-size: 13px; font-weight: 900; letter-spacing: 1.8px; text-transform: uppercase; margin-top: 3px; color: #000000;">Restaurant Halls &amp; Cafeteria</div>
          <div style="font-size: 13px; font-weight: 800; margin-top: 2px; color: #000000;">${settings.address || 'Mogadishu, Somalia'}</div>
          <div style="font-size: 13px; font-weight: 900; color: #000000;">Tel: ${settings.phone || '+252 61 500 1234'}</div>
        </div>

        <!-- Order Meta -->
        <div style="font-size: 13px; font-weight: 800; line-height: 1.6; margin-bottom: 6px; margin-top: 6px; color: #000000;">
          <div style="display:flex; justify-content:space-between;">
            <span>Waiter: <strong style="font-weight: 900; color: #000000;">${order.serverName || 'Staff'}</strong></span>
            <span>Table: <strong style="font-weight: 900; color: #000000;">${order.tableNumber || 'Table 1'}</strong></span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Date: <strong style="font-weight: 800; color: #000000;">${new Date(order.createdAt).toISOString().replace('T',' ').slice(0,19)}</strong></span>
            <span>Ref #: <strong style="font-weight: 900; color: #000000;">${order.orderNumber ? order.orderNumber.replace('HD-','') : '0000'}</strong></span>
          </div>
        </div>

        <!-- Items Table (80mm Wide Format, High Contrast Bold) -->
        <table style="width:100%; border-collapse:collapse; font-size:13px; color: #000000; font-weight: 800;">
          <thead>
            <tr style="text-align: left; font-weight: 900;">
              <th style="padding: 4px 0; width: 24px; color: #000000;">NO</th>
              <th style="padding: 4px 4px; color: #000000;">ITEM</th>
              <th style="text-align: right; padding: 4px 4px; white-space: nowrap; color: #000000;">QTY</th>
              <th style="text-align: right; padding: 4px 4px; white-space: nowrap; color: #000000;">PRICE</th>
              <th style="text-align: right; padding: 4px 0; white-space: nowrap; color: #000000;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, idx) => `
              <tr style="vertical-align: top; font-weight: 800; color: #000000;">
                <td style="padding: 5px 0; font-weight: 900; color: #000000;">${idx + 1}</td>
                <td style="padding: 5px 4px; color: #000000;">
                  <div style="font-weight: 900; font-size: 13.5px; color: #000000;">${item.name}</div>
                  ${item.notes ? `<div style="font-size: 12px; font-weight: 900; color: #000000; font-style: italic;">* ${item.notes}</div>` : ''}
                </td>
                <td style="text-align: right; padding: 5px 4px; font-weight: 900; color: #000000;">${item.quantity}.00</td>
                <td style="text-align: right; padding: 5px 4px; font-weight: 800; color: #000000;">$${item.price.toFixed(2)}</td>
                <td style="text-align: right; padding: 5px 0; font-weight: 900; color: #000000;">$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals (Bold & Clear) -->
        <div style="font-size: 13.5px; font-weight: 800; line-height: 1.6; color: #000000; margin-top: 8px;">
          <div style="display:flex; justify-content:space-between;">
            <span>Subtotal:</span>
            <span style="font-weight: 900; color: #000000;">$${order.subtotal.toFixed(2)}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Tax (5%):</span>
            <span style="font-weight: 900; color: #000000;">$${order.tax.toFixed(2)}</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; font-size: 19px; font-weight: 900; margin: 8px 0 5px 0; color: #000000;">
          <span>TOTAL:</span>
          <span style="font-weight: 900; color: #000000;">$${totalAmount}</span>
        </div>

        ${order.paymentMethod === 'cash' && order.change > 0 ? `
        <div style="font-size: 13.5px; font-weight: 800; display:flex; justify-content:space-between; margin-top: 2px; color: #000000;">
          <span>Change:</span>
          <span style="font-weight: 900; color: #000000;">$${order.change.toFixed(2)}</span>
        </div>
        ` : ''}

        <!-- Mobile Money Merchant Codes (Extra Bold) -->
        <div style="font-size: 12.5px; font-weight: 800; margin-top: 8px; margin-bottom: 4px; line-height: 1.8; color: #000000;">
          <div><strong>Merchant: *789*${evc}*${totalAmount}#</strong></div>
          <div><strong>Edahab: *113*${edahab}*${totalAmount}#</strong></div>
          <div><strong>Premier Wallet: ${premier}</strong></div>
          <div><strong>Ebesa: ${ebesa}</strong></div>
        </div>

        <!-- Footer -->
        <div style="text-align:center; font-weight: 800; font-size: 13px; margin-top: 10px; line-height: 1.6; color: #000000;">
          <div>Thank you for visiting</div>
          <div style="font-weight: 900;">Hodman Restaurant Halls &amp; Cafeteria!</div>
          <div>Please come again.</div>
        </div>

        <div style="text-align:center; font-size: 11px; font-weight: 800; color: #000000; margin-top: 8px;">
          DEV: Jookar
        </div>

      </div>
    `;

    // 2. GENERATE PRINTER 1: KITCHEN CHIT (80mm Large Cooks Copy, Extra Bold)
    const kitchenChitHtml = `
      <div class="kitchen-chit-paper" id="printable-kitchen-receipt-content" style="font-weight: 800; color: #000000;">
        <div style="text-align:center; padding-bottom: 6px; border-bottom: 3px solid #000000; color: #000000;">
          <h2 style="font-size: 20px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: #000000;">*** KITCHEN ORDER CHIT ***</h2>
          <p style="font-size: 13px; font-weight: 900; color: #000000; text-transform: uppercase;">Kitchen Printer (Cooks Copy)</p>
        </div>

        <div style="font-size: 13.5px; font-weight: 800; padding: 6px 0; border-bottom: 2px dashed #000000; line-height: 1.6; color: #000000;">
          <div style="display:flex; justify-content:space-between; font-size: 16px; font-weight: 900;">
            <span style="color: #000000;">TICKET #${order.orderNumber}</span>
            <span style="border: 2px solid #000000; padding: 0 6px; border-radius: 4px; font-size: 13px; font-weight: 900; color: #000000;">${order.orderType ? order.orderType.toUpperCase() : 'DINE-IN'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size: 16px; font-weight: 900; margin-top: 2px; color: #000000;">
            <span>TABLE: ${order.tableNumber}</span>
            <span>${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size: 12.5px; font-weight: 800; color: #000000;">
            <span>Server: ${order.serverName || 'Staff'}</span>
            <span>Date: ${new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <!-- STRICTLY ONLY ORDER NAME AND ORDER QUANTITY (NO PRICES, EXTRA BOLD) -->
        <div style="padding: 8px 0; color: #000000;">
          <div style="display:flex; justify-content:space-between; border-bottom: 2.5px solid #000000; padding-bottom: 3px; font-size: 14px; font-weight: 900; color: #000000;">
            <span style="width: 55px; color: #000000;">QTY</span>
            <span style="flex: 1; padding-left: 8px; color: #000000;">ORDER ITEM NAME</span>
          </div>
          <div style="padding-top: 6px;">
            ${order.items.map(item => `
              <div style="border-bottom: 1.5px dashed #000000; padding: 6px 0; color: #000000;">
                <div style="display:flex; align-items:flex-start;">
                  <span style="width: 55px; font-size: 22px; font-weight: 900; font-family: 'Courier New', monospace; color: #000000;">
                    ${item.quantity}x
                  </span>
                  <div style="flex: 1; padding-left: 8px;">
                    <h3 style="font-size: 18px; font-weight: 900; line-height: 1.2; color: #000000;">
                      ${item.name}
                    </h3>
                    ${item.notes ? `
                      <p style="font-size: 13px; font-weight: 900; color: #000000; margin-top: 3px; border: 1.5px solid #000000; padding: 2px 6px; border-radius: 4px;">
                        ⚠️ Note: ${item.notes}
                      </p>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="border-top: 2.5px dashed #000000; padding-top: 6px; text-align: center; font-size: 14px; font-weight: 900; color: #000000;">
          <p>TOTAL ITEMS TO PREPARE: ${order.items.reduce((s, i) => s + i.quantity, 0)}</p>
          <p style="font-size: 12px; font-weight: 900; color: #000000; margin-top: 2px;">=== END OF KITCHEN ORDER ===</p>
        </div>
      </div>
    `;

    // Render into view containers
    if (this.customerReceiptArea) this.customerReceiptArea.innerHTML = customerReceiptHtml;
    if (this.kitchenReceiptArea) this.kitchenReceiptArea.innerHTML = kitchenChitHtml;

    // Default tab setup (Customer vs Kitchen preview)
    const btnTabCustomer = document.getElementById('btn-tab-receipt-customer');
    const btnTabKitchen = document.getElementById('btn-tab-receipt-kitchen');
    const viewCustomer = document.getElementById('preview-customer-container');
    const viewKitchen = document.getElementById('preview-kitchen-container');

    const setPreviewTab = (tab) => {
      this.currentReceiptTab = tab;
      if (tab === 'customer') {
        btnTabCustomer?.classList.add('bg-blue-600', 'text-white');
        btnTabCustomer?.classList.remove('bg-slate-800', 'text-slate-300');
        btnTabKitchen?.classList.remove('bg-blue-600', 'text-white');
        btnTabKitchen?.classList.add('bg-slate-800', 'text-slate-300');
        viewCustomer?.classList.remove('hidden');
        viewKitchen?.classList.add('hidden');
      } else {
        btnTabKitchen?.classList.add('bg-blue-600', 'text-white');
        btnTabKitchen?.classList.remove('bg-slate-800', 'text-slate-300');
        btnTabCustomer?.classList.remove('bg-blue-600', 'text-white');
        btnTabCustomer?.classList.add('bg-slate-800', 'text-slate-300');
        viewKitchen?.classList.remove('hidden');
        viewCustomer?.classList.add('hidden');
      }
    };

    if (btnTabCustomer) btnTabCustomer.onclick = () => setPreviewTab('customer');
    if (btnTabKitchen) btnTabKitchen.onclick = () => setPreviewTab('kitchen');
    setPreviewTab('customer');

    // Isolated Clean Thermal Printing for 80mm Printer (Extra Bold, Pure Black)
    const printCleanThermal = (htmlContent, title = 'Hodman Receipt') => {
      let printFrame = document.getElementById('thermal-print-iframe');
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'thermal-print-iframe';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        printFrame.style.visibility = 'hidden';
        document.body.appendChild(printFrame);
      }

      const frameDoc = printFrame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0mm !important;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color: #000000 !important;
              font-weight: 700 !important;
            }
            html, body {
              background: #ffffff !important;
              background-color: #ffffff !important;
              color: #000000 !important;
              font-family: 'Courier New', Courier, monospace;
              font-size: 13.5px;
              font-weight: 700 !important;
              line-height: 1.45;
              width: 80mm;
              margin: 0 auto;
              padding: 5px 6px;
              overflow: visible;
            }
            .receipt-paper, .kitchen-chit-paper {
              width: 100% !important;
              max-width: 100% !important;
              background: #ffffff !important;
              color: #000000 !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              font-weight: 700 !important;
            }
            .receipt-divider {
              border: none !important;
              border-top: 1.5px dashed #000000 !important;
              margin: 7px 0;
            }
            .receipt-divider-solid {
              border: none !important;
              border-top: 2px solid #000000 !important;
              margin: 6px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-weight: 700 !important;
            }
            th, td {
              color: #000000 !important;
              font-weight: 700 !important;
            }
            strong, th, h2, h3 {
              font-weight: 900 !important;
              color: #000000 !important;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
              height: 0;
              margin: 12px 0;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        } catch (err) {
          console.error('Printing error:', err);
        }
      }, 200);
    };

    // Printing Triggers
    const btnPrintCustomer = document.getElementById('btn-print-customer-only');
    if (btnPrintCustomer) {
      btnPrintCustomer.onclick = () => {
        printCleanThermal(customerReceiptHtml, `Customer Bill - ${order.orderNumber}`);
      };
    }

    const btnPrintKitchen = document.getElementById('btn-print-kitchen-only');
    if (btnPrintKitchen) {
      btnPrintKitchen.onclick = () => {
        printCleanThermal(kitchenChitHtml, `Kitchen Chit - ${order.orderNumber}`);
      };
    }

    const btnPrintBoth = document.getElementById('btn-print-both-printers');
    if (btnPrintBoth) {
      btnPrintBoth.onclick = () => {
        const combinedHtml = `
          ${customerReceiptHtml}
          <div class="page-break"></div>
          ${kitchenChitHtml}
        `;
        printCleanThermal(combinedHtml, `All Tickets - ${order.orderNumber}`);
      };
    }

    const closeBtn = document.getElementById('btn-close-receipt');
    if (closeBtn) {
      closeBtn.onclick = () => {
        this.receiptModal.classList.add('hidden');
      };
    }

    this.receiptModal.classList.remove('hidden');
  }
}

window.initPos = () => {
  window.posModule = new PosModule();
};
