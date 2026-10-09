/**
 * Hodman Restaurant Halls & Cafeteria System
 * Purchase Management Module
 * Components: Purchase Report, Payments Report, Supplier List, Supplier Statement, Vendor Payment
 */

class PurchaseModule {
  constructor() {
    this.containerId = 'purchase-content-container';
    this.activeTab = 'purchase-report'; // 'purchase-report' | 'payments-report' | 'supplier-list' | 'supplier-statement' | 'vendor-payment'
    this.selectedSupplierId = 'SUP-101';
    this.selectedInvoiceId = null;
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.eventsBound = false;
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-extrabold text-xs border border-blue-500/30">
                <i class="fa-solid fa-truck-field"></i> Procurement & Payables
              </span>
              <h2 class="text-xl md:text-2xl font-black text-white font-brand-serif">Purchase Management</h2>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Track vendor invoices, food supplies, dairy/meat procurements, payments, and supplier statements.
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex flex-wrap items-center gap-2.5">
            <button id="btn-open-new-purchase" class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
              <i class="fa-solid fa-file-circle-plus"></i> New Purchase Invoice
            </button>
            <button id="btn-open-vendor-pay-modal" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
              <i class="fa-solid fa-hand-holding-dollar"></i> Pay Vendor
            </button>
            <button id="btn-open-add-supplier" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all">
              <i class="fa-solid fa-user-plus text-amber-400"></i> Add Supplier
            </button>
          </div>
        </div>

        <!-- Subtabs Navigation (The 5 requested sections) -->
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button class="purchase-subtab-btn ${this.activeTab === 'purchase-report' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'} px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap" data-tab="purchase-report">
            <i class="fa-solid fa-file-invoice"></i> Purchase Report
          </button>
          <button class="purchase-subtab-btn ${this.activeTab === 'payments-report' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'} px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap" data-tab="payments-report">
            <i class="fa-solid fa-money-bill-transfer"></i> Payments Report
          </button>
          <button class="purchase-subtab-btn ${this.activeTab === 'supplier-list' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'} px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap" data-tab="supplier-list">
            <i class="fa-solid fa-address-book"></i> Supplier List
          </button>
          <button class="purchase-subtab-btn ${this.activeTab === 'supplier-statement' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'} px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap" data-tab="supplier-statement">
            <i class="fa-solid fa-book-journal-whills"></i> Supplier Statement
          </button>
          <button class="purchase-subtab-btn ${this.activeTab === 'vendor-payment' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'} px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap" data-tab="vendor-payment">
            <i class="fa-solid fa-credit-card"></i> Vendor Payment
          </button>
        </div>

        <!-- Dynamic Subtab View Container -->
        <div id="purchase-tab-content" class="w-full"></div>
      </div>
    `;

    this.bindTabEvents();
    this.renderActiveTabContent();
  }

  bindTabEvents() {
    document.querySelectorAll('.purchase-subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.render();
      });
    });

    const btnNewPurchase = document.getElementById('btn-open-new-purchase');
    if (btnNewPurchase) {
      btnNewPurchase.onclick = () => this.openNewPurchaseModal();
    }

    const btnVendorPay = document.getElementById('btn-open-vendor-pay-modal');
    if (btnVendorPay) {
      btnVendorPay.onclick = () => {
        this.activeTab = 'vendor-payment';
        this.render();
      };
    }

    const btnAddSup = document.getElementById('btn-open-add-supplier');
    if (btnAddSup) {
      btnAddSup.onclick = () => this.openAddSupplierModal();
    }
  }

  renderActiveTabContent() {
    const tabContent = document.getElementById('purchase-tab-content');
    if (!tabContent) return;

    switch (this.activeTab) {
      case 'purchase-report':
        this.renderPurchaseReport(tabContent);
        break;
      case 'payments-report':
        this.renderPaymentsReport(tabContent);
        break;
      case 'supplier-list':
        this.renderSupplierList(tabContent);
        break;
      case 'supplier-statement':
        this.renderSupplierStatement(tabContent);
        break;
      case 'vendor-payment':
        this.renderVendorPaymentForm(tabContent);
        break;
      default:
        this.renderPurchaseReport(tabContent);
    }
  }

  // ================= 1. PURCHASE REPORT =================
  renderPurchaseReport(container) {
    const invoices = window.restaurantDB.getPurchaseInvoices().filter(invoice => invoice.status !== 'void');
    const totalPurchases = invoices.reduce((sum, i) => sum + i.total, 0);
    const totalPaid = invoices.reduce((sum, i) => sum + i.paid, 0);
    const totalBalance = invoices.reduce((sum, i) => sum + i.balance, 0);

    const filtered = invoices.filter(inv => {
      const matchSearch = !this.searchQuery ||
        inv.id.toLowerCase().includes(this.searchQuery) ||
        inv.supplierName.toLowerCase().includes(this.searchQuery) ||
        inv.itemsSummary.toLowerCase().includes(this.searchQuery);

      const matchStatus = this.statusFilter === 'all' || inv.status === this.statusFilter;
      return matchSearch && matchStatus;
    });

    container.innerHTML = `
      <div class="space-y-4">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl border border-blue-500/30">
              <i class="fa-solid fa-cart-flatbed"></i>
            </div>
            <div>
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Purchases</p>
              <h3 class="text-xl font-black text-white font-mono">$${totalPurchases.toFixed(2)}</h3>
              <p class="text-[10px] text-slate-500 font-bold">${invoices.length} Invoices logged</p>
            </div>
          </div>

          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/30">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <div>
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Disbursed</p>
              <h3 class="text-xl font-black text-emerald-400 font-mono">$${totalPaid.toFixed(2)}</h3>
              <p class="text-[10px] text-slate-500 font-bold">Payments cleared</p>
            </div>
          </div>

          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/30">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Outstanding Payables</p>
              <h3 class="text-xl font-black text-amber-400 font-mono">$${totalBalance.toFixed(2)}</h3>
              <p class="text-[10px] text-amber-500/80 font-bold">Owed to suppliers</p>
            </div>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <div class="flex items-center gap-2 flex-1 min-w-[240px]">
            <i class="fa-solid fa-magnifying-glass text-slate-400 text-xs"></i>
            <input type="text" id="purchase-search-input" value="${this.searchQuery}" placeholder="Search invoice #, supplier, or items..." class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 w-full outline-none focus:border-blue-500 font-bold">
          </div>

          <div class="flex items-center gap-2">
            <select id="purchase-status-filter" class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold outline-none focus:border-blue-500">
              <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="paid" ${this.statusFilter === 'paid' ? 'selected' : ''}>Paid In Full</option>
              <option value="partial" ${this.statusFilter === 'partial' ? 'selected' : ''}>Partial Balance</option>
              <option value="unpaid" ${this.statusFilter === 'unpaid' ? 'selected' : ''}>Unpaid</option>
            </select>
            <button id="btn-print-purchase-report" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700">
              <i class="fa-solid fa-print text-emerald-400"></i> Print Report
            </button>
          </div>
        </div>

        <!-- Invoices Table -->
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                  <th class="py-3 px-4">Invoice #</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Supplier</th>
                  <th class="py-3 px-4">Supplies / Items</th>
                  <th class="py-3 px-4 text-right">Total ($)</th>
                  <th class="py-3 px-4 text-right">Paid ($)</th>
                  <th class="py-3 px-4 text-right">Balance ($)</th>
                  <th class="py-3 px-4 text-center">Status</th>
                  <th class="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-semibold">
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="9" class="py-8 text-center text-slate-400">No purchase records found.</td>
                  </tr>
                ` : filtered.map(inv => `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-blue-400">${inv.id}</td>
                    <td class="py-3 px-4 text-slate-300">${inv.date}</td>
                    <td class="py-3 px-4 font-bold text-white">${inv.supplierName}</td>
                    <td class="py-3 px-4 text-slate-300 max-w-xs truncate">${inv.itemsSummary}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-white">$${inv.total.toFixed(2)}</td>
                    <td class="py-3 px-4 text-right font-mono text-emerald-400">$${inv.paid.toFixed(2)}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold ${inv.balance > 0 ? 'text-amber-400' : 'text-slate-500'}">$${inv.balance.toFixed(2)}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        inv.status === 'partial' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }">
                        ${inv.status}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      ${inv.balance > 0 ? `
                        <button class="btn-fast-pay-invoice px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold border border-emerald-500/40 transition-colors" data-id="${inv.id}" data-sup="${inv.supplierId}" data-supname="${inv.supplierName}" data-balance="${inv.balance}">
                          Pay Bill
                        </button>
                      ` : `
                        <span class="text-slate-500 text-[11px] font-bold"><i class="fa-solid fa-check"></i> Cleared</span>
                      `}
                      <button class="btn-delete-purchase-invoice ml-2 px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg text-[10px] font-bold border border-red-500/40 transition-colors" data-id="${inv.id}" title="Remove invoice from active report">
                        <i class="fa-solid fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Filter events
    document.getElementById('purchase-search-input')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderPurchaseReport(container);
    });

    document.getElementById('purchase-status-filter')?.addEventListener('change', (e) => {
      this.statusFilter = e.target.value;
      this.renderPurchaseReport(container);
    });

    document.getElementById('btn-print-purchase-report')?.addEventListener('click', () => {
      this.printPurchaseReport(filtered, totalPurchases, totalPaid, totalBalance);
    });

    container.querySelectorAll('.btn-fast-pay-invoice').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedSupplierId = btn.dataset.sup;
        this.selectedInvoiceId = btn.dataset.id;
        this.activeTab = 'vendor-payment';
        this.render();
      });
    });

    container.querySelectorAll('.btn-delete-purchase-invoice').forEach(btn => {
      btn.addEventListener('click', () => {
        const invoice = window.restaurantDB.getPurchaseInvoices().find(item => item.id === btn.dataset.id);
        if (!invoice || invoice.status === 'void') return;
        const openBalance = Number(invoice.balance || 0);
        const warning = openBalance > 0
          ? ` The outstanding supplier balance of $${openBalance.toFixed(2)} will be reduced.`
          : '';
        if (!confirm(`Remove invoice ${invoice.id} from the active report? Existing payment records will be kept.${warning}`)) return;
        if (window.restaurantDB.deletePurchaseInvoice(invoice.id)) {
          window.showToast?.(`Invoice ${invoice.id} removed from the active report.`, 'success');
          this.render();
        }
      });
    });
  }

  // ================= 2. PAYMENTS REPORT =================
  renderPaymentsReport(container) {
    const payments = window.restaurantDB.getPurchasePayments();
    const totalDisbursed = payments.reduce((sum, p) => sum + p.amount, 0);

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div>
            <h3 class="text-base font-extrabold text-white flex items-center gap-2">
              <i class="fa-solid fa-receipt text-emerald-400"></i> Vendor Disbursements History
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Chronological record of all payments made to food & supplies vendors.</p>
          </div>
          <div class="text-right">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Paid Out</span>
            <div class="text-xl font-black text-emerald-400 font-mono">$${totalDisbursed.toFixed(2)}</div>
          </div>
        </div>

        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                  <th class="py-3 px-4">Voucher #</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Supplier / Vendor</th>
                  <th class="py-3 px-4">Payment Channel</th>
                  <th class="py-3 px-4">Ref / Txn #</th>
                  <th class="py-3 px-4 text-right">Amount Paid</th>
                  <th class="py-3 px-4">Notes</th>
                  <th class="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-semibold">
                ${payments.length === 0 ? `
                  <tr>
                    <td colspan="8" class="py-8 text-center text-slate-400">No payment records yet.</td>
                  </tr>
                ` : payments.map(pay => `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-amber-400">${pay.id}</td>
                    <td class="py-3 px-4 text-slate-300">${pay.date}</td>
                    <td class="py-3 px-4 font-bold text-white">${pay.supplierName}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                        ${pay.paymentMethod}
                      </span>
                    </td>
                    <td class="py-3 px-4 font-mono text-slate-300">${pay.reference}</td>
                    <td class="py-3 px-4 text-right font-mono font-black text-emerald-400">$${pay.amount.toFixed(2)}</td>
                    <td class="py-3 px-4 text-slate-400 max-w-xs truncate">${pay.notes || '-'}</td>
                    <td class="py-3 px-4 text-center">
                      <button class="btn-print-voucher px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold border border-slate-700" data-id="${pay.id}">
                        <i class="fa-solid fa-print"></i> Voucher
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-print-voucher').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const p = payments.find(x => x.id === id);
        if (p) this.printVendorVoucher(p);
      });
    });
  }

  // ================= 3. SUPPLIER LIST =================
  renderSupplierList(container) {
    const suppliers = window.restaurantDB.getSuppliers();
    const totalOwed = suppliers.reduce((sum, s) => sum + s.balance, 0);

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div>
            <h3 class="text-base font-extrabold text-white flex items-center gap-2">
              <i class="fa-solid fa-address-book text-blue-400"></i> Vendor & Supplier Directory
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Manage food vendors, contact info, credit terms, and balances.</p>
          </div>
          <div class="text-right">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Vendor Payables</span>
            <div class="text-xl font-black text-amber-400 font-mono">$${totalOwed.toFixed(2)}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${suppliers.map(sup => `
            <div class="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all">
              <div>
                <div class="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h4 class="font-extrabold text-sm text-white">${sup.name}</h4>
                    <span class="text-[11px] font-bold text-blue-400">${sup.category}</span>
                  </div>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${sup.balance > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
                    ${sup.balance > 0 ? 'Debt Owed' : 'Settled'}
                  </span>
                </div>

                <div class="py-3 space-y-1.5 text-xs text-slate-300">
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-user text-slate-500 w-4"></i>
                    <span>${sup.contactPerson || 'Vendor Rep'}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-phone text-slate-500 w-4"></i>
                    <span class="font-mono font-bold">${sup.phone}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-location-dot text-slate-500 w-4"></i>
                    <span class="text-slate-400 truncate">${sup.address}</span>
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-800 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-slate-400 uppercase">Current Balance Due:</span>
                  <span class="text-base font-black font-mono ${sup.balance > 0 ? 'text-amber-400' : 'text-slate-400'}">$${sup.balance.toFixed(2)}</span>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <button class="btn-supplier-statement w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1.5" data-id="${sup.id}">
                    <i class="fa-solid fa-file-lines text-blue-400"></i> Statement
                  </button>
                  <button class="btn-pay-supplier w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5" data-id="${sup.id}">
                    <i class="fa-solid fa-money-bill-wave"></i> Pay Vendor
                  </button>
                </div>
                <button class="btn-delete-supplier w-full py-2 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold border border-red-900/70" data-id="${sup.id}" data-name="${sup.name}"><i class="fa-solid fa-trash"></i> Delete Supplier</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-supplier-statement').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedSupplierId = btn.dataset.id;
        this.activeTab = 'supplier-statement';
        this.render();
      });
    });

    container.querySelectorAll('.btn-pay-supplier').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedSupplierId = btn.dataset.id;
        this.activeTab = 'vendor-payment';
        this.render();
      });
    });
    container.querySelectorAll('.btn-delete-supplier').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm(`Delete supplier “${btn.dataset.name}”? Existing purchase records will remain.`)) return;
        if (window.restaurantDB.deleteSupplier(btn.dataset.id)) {
          window.showToast?.('Supplier deleted.', 'success');
          this.render();
        }
      });
    });
  }

  // ================= 4. SUPPLIER STATEMENT =================
  renderSupplierStatement(container) {
    const suppliers = window.restaurantDB.getSuppliers();
    const allInvoices = window.restaurantDB.getPurchaseInvoices();
    const invoices = allInvoices.filter(invoice => invoice.status !== 'void');
    const payments = window.restaurantDB.getPurchasePayments();
    const voidInvoiceIds = new Set(allInvoices.filter(invoice => invoice.status === 'void').map(invoice => invoice.id));

    const selectedSup = suppliers.find(s => s.id === this.selectedSupplierId) || suppliers[0];
    if (!selectedSup) {
      container.innerHTML = `<p class="text-slate-400 text-center py-8 font-bold">No suppliers found.</p>`;
      return;
    }
    this.selectedSupplierId = selectedSup.id;

    // Build ledger entries
    const ledger = [];
    invoices.filter(i => i.supplierId === selectedSup.id).forEach(inv => {
      ledger.push({
        date: inv.date,
        type: 'Purchase Invoice',
        ref: inv.id,
        description: inv.itemsSummary,
        debit: inv.total,
        credit: 0
      });
    });

    payments.filter(p => p.supplierId === selectedSup.id && !(p.invoiceId && voidInvoiceIds.has(p.invoiceId))).forEach(pay => {
      ledger.push({
        date: pay.date,
        type: 'Payment Cleared',
        ref: pay.id,
        description: `${pay.paymentMethod} - ${pay.reference} (${pay.notes || ''})`,
        debit: 0,
        credit: pay.amount
      });
    });

    // Sort by date ascending
    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    let running = 0;
    const ledgerRows = ledger.map(entry => {
      running += (entry.debit - entry.credit);
      return {
        ...entry,
        balance: running
      };
    });

    const totalDebit = ledger.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = ledger.reduce((sum, e) => sum + e.credit, 0);
    const closingBalance = totalDebit - totalCredit;

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Controls Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div class="flex items-center gap-3">
            <label class="text-xs font-bold text-slate-400 uppercase">Select Supplier:</label>
            <select id="statement-supplier-select" class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold outline-none focus:border-blue-500">
              ${suppliers.map(s => `
                <option value="${s.id}" ${s.id === selectedSup.id ? 'selected' : ''}>${s.name} (Balance: $${s.balance.toFixed(2)})</option>
              `).join('')}
            </select>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-print-supplier-statement" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors">
              <i class="fa-solid fa-print text-emerald-400"></i> Print Statement
            </button>
            <button id="btn-statement-pay-now" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all">
              <i class="fa-solid fa-wallet"></i> Settle Balance
            </button>
          </div>
        </div>

        <!-- Supplier Info Banner -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-black text-white">${selectedSup.name}</h3>
            <p class="text-xs text-slate-400">
              ${selectedSup.category} • ${selectedSup.contactPerson} • ${selectedSup.phone} • ${selectedSup.address}
            </p>
          </div>
          <div class="flex items-center gap-6">
            <div>
              <p class="text-[10px] font-bold uppercase text-slate-400">Total Billed</p>
              <p class="text-base font-black font-mono text-white">$${totalDebit.toFixed(2)}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase text-slate-400">Total Paid</p>
              <p class="text-base font-black font-mono text-emerald-400">$${totalCredit.toFixed(2)}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase text-slate-400">Net Due</p>
              <p class="text-lg font-black font-mono text-amber-400">$${closingBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <!-- Statement Ledger Table -->
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Txn #</th>
                  <th class="py-3 px-4">Type</th>
                  <th class="py-3 px-4">Description</th>
                  <th class="py-3 px-4 text-right">Debit ($)</th>
                  <th class="py-3 px-4 text-right">Credit ($)</th>
                  <th class="py-3 px-4 text-right">Balance ($)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-semibold">
                ${ledgerRows.length === 0 ? `
                  <tr>
                    <td colspan="7" class="py-8 text-center text-slate-400">No transactions recorded for this supplier.</td>
                  </tr>
                ` : ledgerRows.map(row => `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-4 text-slate-300">${row.date}</td>
                    <td class="py-3 px-4 font-mono font-bold text-blue-400">${row.ref}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${row.debit > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
                        ${row.type}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-slate-300 max-w-sm truncate">${row.description}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-white">${row.debit > 0 ? '$' + row.debit.toFixed(2) : '-'}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-emerald-400">${row.credit > 0 ? '$' + row.credit.toFixed(2) : '-'}</td>
                    <td class="py-3 px-4 text-right font-mono font-black text-amber-400">$${row.balance.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('statement-supplier-select')?.addEventListener('change', (e) => {
      this.selectedSupplierId = e.target.value;
      this.renderSupplierStatement(container);
    });

    document.getElementById('btn-statement-pay-now')?.addEventListener('click', () => {
      this.activeTab = 'vendor-payment';
      this.render();
    });

    document.getElementById('btn-print-supplier-statement')?.addEventListener('click', () => {
      this.printSupplierStatement(selectedSup, ledgerRows, totalDebit, totalCredit, closingBalance);
    });
  }

  // ================= 5. VENDOR PAYMENT =================
  renderVendorPaymentForm(container) {
    const suppliers = window.restaurantDB.getSuppliers();
    const selectedInvoice = this.selectedInvoiceId
      ? window.restaurantDB.getPurchaseInvoices().find(invoice => invoice.id === this.selectedInvoiceId)
      : null;
    const selectedSup = suppliers.find(s => s.id === (selectedInvoice?.supplierId || this.selectedSupplierId)) || suppliers[0];
    if (selectedInvoice && selectedInvoice.supplierId !== selectedSup.id) this.selectedInvoiceId = null;
    const payableBalance = selectedInvoice ? Number(selectedInvoice.balance || 0) : Number(selectedSup.balance || 0);

    container.innerHTML = `
      <div class="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-lg font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-credit-card text-emerald-400"></i> Vendor Debt Settlement & Payment
            </h3>
            <p class="text-xs text-slate-400">Record payout to suppliers via EVC Plus, Premier Bank, or Cash Drawer.</p>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/30">
            Payment Terminal
          </span>
        </div>

        <form id="vendor-pay-form" class="space-y-4 text-xs font-bold">
          <div>
            <label class="block text-slate-300 mb-1">Select Supplier / Vendor *</label>
            <select id="vpay-supplier-select" ${selectedInvoice ? 'disabled' : ''} class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-blue-500 disabled:opacity-70">
              ${suppliers.map(s => `
                <option value="${s.id}" ${s.id === selectedSup.id ? 'selected' : ''} data-balance="${s.balance}">
                  ${s.name} (Current Due: $${s.balance.toFixed(2)})
                </option>
              `).join('')}
            </select>
          </div>

          ${selectedInvoice ? `<div class="rounded-xl bg-blue-500/10 border border-blue-500/30 px-3 py-2 text-blue-200">Paying invoice <strong>${selectedInvoice.id}</strong> · ${selectedInvoice.itemsSummary}</div>` : ''}

          <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <p class="text-[11px] text-amber-400 font-extrabold uppercase">Outstanding Debt Due</p>
              <p class="text-xs text-slate-400">Amount currently owed to this supplier</p>
            </div>
            <div id="vpay-balance-display" class="text-2xl font-black font-mono text-amber-400">
              $${payableBalance.toFixed(2)}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-slate-300 mb-1">Amount to Pay ($ USD) *</label>
              <input type="number" step="0.01" min="0.01" max="${payableBalance.toFixed(2)}" id="vpay-amount" required value="${payableBalance > 0 ? payableBalance.toFixed(2) : ''}" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-base font-black outline-none focus:border-emerald-500" />
            </div>

            <div>
              <label class="block text-slate-300 mb-1">Payment Method *</label>
              <select id="vpay-method" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-emerald-500">
                <option value="EVC Plus (709275)">EVC Plus Merchant (709275)</option>
                <option value="Premier Bank (673836)">Premier Bank (673836)</option>
                <option value="e-Dahab (099859)">e-Dahab (099859)</option>
                <option value="Cash Drawer">Cash Drawer (Cashier Maryam)</option>
                <option value="e-Besa (940396)">e-Besa (940396)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-slate-300 mb-1">Transaction Ref # / Mobile Voucher</label>
              <input type="text" id="vpay-reference" placeholder="e.g. EVC-982312 / PB-4410" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono" />
            </div>

            <div>
              <label class="block text-slate-300 mb-1">Payment Date</label>
              <input type="date" id="vpay-date" value="${new Date().toISOString().slice(0, 10)}" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div>
            <label class="block text-slate-300 mb-1">Notes / Supply Description</label>
            <input type="text" id="vpay-notes" placeholder="e.g. Settle camel meat delivery invoices" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500" />
          </div>

          <button type="submit" class="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 transition-all text-sm flex items-center justify-center gap-2">
            <i class="fa-solid fa-check-circle"></i> Confirm &amp; Disburse Payment
          </button>
        </form>
      </div>
    `;

    const supSelect = document.getElementById('vpay-supplier-select');
    const balanceDisplay = document.getElementById('vpay-balance-display');
    const amountInput = document.getElementById('vpay-amount');

    if (supSelect) {
      supSelect.addEventListener('change', () => {
        this.selectedSupplierId = supSelect.value;
        const opt = supSelect.selectedOptions[0];
        const bal = parseFloat(opt.dataset.balance) || 0;
        if (balanceDisplay) balanceDisplay.textContent = `$${bal.toFixed(2)}`;
        if (amountInput) amountInput.value = bal > 0 ? bal.toFixed(2) : '50.00';
      });
    }

    document.getElementById('vendor-pay-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const supId = supSelect.value;
      const s = suppliers.find(x => x.id === supId);
      const amount = parseFloat(amountInput.value);

      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
      }

      if (this.selectedInvoiceId) {
        const invoice = window.restaurantDB.getPurchaseInvoices().find(item => item.id === this.selectedInvoiceId);
        if (!invoice || invoice.supplierId !== s.id || amount > Number(invoice.balance || 0)) {
          alert('The payment amount cannot exceed this invoice’s remaining balance.');
          return;
        }
      }

      const payment = window.restaurantDB.recordVendorPayment({
        supplierId: s.id,
        supplierName: s.name,
        invoiceId: this.selectedInvoiceId,
        date: document.getElementById('vpay-date').value,
        amount,
        paymentMethod: document.getElementById('vpay-method').value,
        reference: document.getElementById('vpay-reference').value.trim() || `VP-${Date.now().toString().slice(-5)}`,
        notes: document.getElementById('vpay-notes').value.trim()
      });

      if (!payment) {
        alert('This invoice could not be paid. Refresh the report and check its remaining balance.');
        return;
      }

      window.showToast?.(`${this.selectedInvoiceId ? `Invoice ${this.selectedInvoiceId} updated. ` : ''}Payment of $${amount.toFixed(2)} to ${s.name} recorded!`, 'success');
      this.printVendorVoucher(payment);
      this.selectedInvoiceId = null;
      this.activeTab = 'purchase-report';
      this.render();
    });
  }

  // ================= MODALS & PRINTING =================
  openNewPurchaseModal() {
    let modal = document.getElementById('purchase-new-invoice-modal');
    if (!modal) {
      const suppliers = window.restaurantDB.getSuppliers();
      const modalHtml = `
        <div id="purchase-new-invoice-modal" class="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 class="font-extrabold text-sm text-white flex items-center gap-2">
                <i class="fa-solid fa-file-circle-plus text-blue-400"></i> Record New Purchase Invoice
              </h3>
              <button onclick="document.getElementById('purchase-new-invoice-modal').classList.add('hidden')" class="text-slate-400 hover:text-white p-1">
                <i class="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form id="purchase-new-invoice-form" class="space-y-3.5 text-xs font-bold">
              <div>
                <label class="block text-slate-300 mb-1">Select Supplier *</label>
                <select id="modal-pur-supplier" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500">
                  ${suppliers.map(s => `<option value="${s.id}" data-name="${s.name}">${s.name}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block text-slate-300 mb-1">Items Summary / Supplies *</label>
                <input type="text" id="modal-pur-items" required placeholder="e.g. 50kg Camel Meat, 20kg Basmati Rice" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-300 mb-1">Total Bill Amount ($) *</label>
                  <input type="number" step="0.50" id="modal-pur-total" required placeholder="e.g. 450.00" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label class="block text-slate-300 mb-1">Initial Paid Amount ($)</label>
                  <input type="number" step="0.50" id="modal-pur-paid" value="0.00" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-300 mb-1">Payment Method</label>
                  <select id="modal-pur-method" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500">
                    <option value="Credit / Pay Later">Credit / Pay Later</option>
                    <option value="EVC Plus">EVC Plus</option>
                    <option value="Premier Bank">Premier Bank</option>
                    <option value="Cash Drawer">Cash Drawer</option>
                    <option value="e-Dahab">e-Dahab</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-300 mb-1">Received By</label>
                  <input type="text" id="modal-pur-received" placeholder="e.g. Sahra Hassan" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500" />
                </div>
              </div>

              <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl mt-2 shadow-lg shadow-blue-500/25 transition-all">
                Save Purchase Invoice
              </button>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modal = document.getElementById('purchase-new-invoice-modal');

      document.getElementById('purchase-new-invoice-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const supSelect = document.getElementById('modal-pur-supplier');
        const opt = supSelect.selectedOptions[0];
        const supplierId = supSelect.value;
        const supplierName = opt.dataset.name;
        const total = parseFloat(document.getElementById('modal-pur-total').value);
        const paid = parseFloat(document.getElementById('modal-pur-paid').value) || 0;

        window.restaurantDB.addPurchaseInvoice({
          supplierId,
          supplierName,
          itemsSummary: document.getElementById('modal-pur-items').value.trim(),
          total,
          paid,
          paymentMethod: document.getElementById('modal-pur-method').value,
          receivedBy: document.getElementById('modal-pur-received').value.trim() || 'Storekeeper'
        });

        // If initial payment was made, record payment voucher
        if (paid > 0) {
          window.restaurantDB.recordVendorPayment({
            supplierId,
            supplierName,
            amount: paid,
            paymentMethod: document.getElementById('modal-pur-method').value,
            notes: 'Advance down-payment on purchase invoice'
          });
        }

        modal.classList.add('hidden');
        document.getElementById('purchase-new-invoice-form').reset();
        window.showToast?.(`Purchase invoice recorded!`, 'success');
        this.render();
      });
    }

    modal.classList.remove('hidden');
  }

  openAddSupplierModal() {
    let modal = document.getElementById('purchase-add-supplier-modal');
    if (!modal) {
      const modalHtml = `
        <div id="purchase-add-supplier-modal" class="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 class="font-extrabold text-sm text-white flex items-center gap-2">
                <i class="fa-solid fa-truck-ramp-box text-amber-400"></i> Add New Supplier / Vendor
              </h3>
              <button onclick="document.getElementById('purchase-add-supplier-modal').classList.add('hidden')" class="text-slate-400 hover:text-white p-1">
                <i class="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form id="purchase-add-supplier-form" class="space-y-3 text-xs font-bold">
              <div>
                <label class="block text-slate-300 mb-1">Company / Supplier Name *</label>
                <input type="text" id="modal-sup-name" required placeholder="e.g. Al-Nuur Halal Poultry & Eggs" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-300 mb-1">Category *</label>
                  <select id="modal-sup-category" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500">
                    <option value="Meat & Poultry">Meat &amp; Poultry</option>
                    <option value="Fresh Produce & Herbs">Fresh Produce</option>
                    <option value="Grains & Spices">Grains &amp; Spices</option>
                    <option value="Dairy & Beverages">Dairy &amp; Beverages</option>
                    <option value="Packaging & Supplies">Packaging</option>
                    <option value="Cleaning & Sanitation">Cleaning &amp; Sanitation</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-300 mb-1">Phone Number *</label>
                  <input type="text" id="modal-sup-phone" required placeholder="0615..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 font-mono" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-300 mb-1">Contact Person</label>
                  <input type="text" id="modal-sup-contact" placeholder="e.g. Ahmed Noor" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label class="block text-slate-300 mb-1">Credit Limit ($)</label>
                  <input type="number" step="100" id="modal-sup-limit" value="2000" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label class="block text-slate-300 mb-1">Market / Address</label>
                <input type="text" id="modal-sup-address" placeholder="e.g. Bakaara Market, Hodan" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500" />
              </div>
              <button type="submit" class="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl mt-2 shadow-lg shadow-amber-600/25 transition-all">
                Save Supplier
              </button>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modal = document.getElementById('purchase-add-supplier-modal');

      document.getElementById('purchase-add-supplier-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        window.restaurantDB.addSupplier({
          name: document.getElementById('modal-sup-name').value.trim(),
          category: document.getElementById('modal-sup-category').value,
          phone: document.getElementById('modal-sup-phone').value.trim(),
          contactPerson: document.getElementById('modal-sup-contact').value.trim(),
          creditLimit: parseFloat(document.getElementById('modal-sup-limit').value) || 2000,
          address: document.getElementById('modal-sup-address').value.trim()
        });

        modal.classList.add('hidden');
        document.getElementById('purchase-add-supplier-form').reset();
        window.showToast?.('Supplier added successfully!', 'success');
        this.activeTab = 'supplier-list';
        this.render();
      });
    }

    modal.classList.remove('hidden');
  }

  printVendorVoucher(payment) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Voucher - ${payment.id}</title>
        <style>
          body { font-family: 'Poppins', sans-serif; font-size: 13px; color: #000; padding: 25px; line-height: 1.5; font-weight: 600; }
          .center { text-align: center; }
          .header { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 15px; }
          .box { border: 1px solid #000; padding: 12px; margin: 15px 0; border-radius: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ddd; padding: 8px 10px; font-size: 12px; text-align: left; }
          th { background: #f0f0f0; font-weight: 800; }
          .sign { margin-top: 40px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="center header">
          <h2 style="margin:0; font-size: 18px;">HODMAN RESTAURANT &amp; HALLS</h2>
          <p style="margin:2px 0; font-size: 11px;">VENDOR PAYMENT DISBURSEMENT VOUCHER</p>
          <p style="margin:0; font-size: 11px;">Date: ${payment.date} • Voucher Ref: <strong>${payment.id}</strong></p>
        </div>

        <div class="box">
          <p><strong>Paid To (Vendor):</strong> ${payment.supplierName}</p>
          <p><strong>Payment Amount:</strong> <span style="font-size: 16px; font-weight: 900;">$${payment.amount.toFixed(2)} USD</span></p>
          <p><strong>Payment Channel:</strong> ${payment.paymentMethod}</p>
          <p><strong>Transaction Reference:</strong> ${payment.reference}</p>
          <p><strong>Notes:</strong> ${payment.notes || 'Full / partial procurement settlement'}</p>
        </div>

        <div class="sign" style="margin-top: 50px;">
          <div>
            <p>_______________________</p>
            <p><strong>Disbursed By (Cashier/Admin)</strong></p>
          </div>
          <div>
            <p>_______________________</p>
            <p><strong>Received By (Vendor Signature)</strong></p>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  }

  printSupplierStatement(supplier, ledger, totalDebit, totalCredit, closing) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Supplier Statement - ${supplier.name}</title>
        <style>
          body { font-family: 'Poppins', sans-serif; font-size: 12px; color: #000; padding: 20px; font-weight: 600; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 11px; }
          th { background: #f3f4f6; font-weight: 800; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin:0;">HODMAN RESTAURANT &amp; HALLS</h2>
          <h3 style="margin:4px 0;">SUPPLIER STATEMENT OF ACCOUNT</h3>
          <p style="margin:0; font-size: 11px;">Vendor: <strong>${supplier.name}</strong> • Phone: ${supplier.phone}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Txn Ref</th>
              <th>Type</th>
              <th>Description</th>
              <th class="text-right">Debit ($)</th>
              <th class="text-right">Credit ($)</th>
              <th class="text-right">Balance ($)</th>
            </tr>
          </thead>
          <tbody>
            ${ledger.map(r => `
              <tr>
                <td>${r.date}</td>
                <td>${r.ref}</td>
                <td>${r.type}</td>
                <td>${r.description}</td>
                <td class="text-right">${r.debit > 0 ? '$' + r.debit.toFixed(2) : '-'}</td>
                <td class="text-right">${r.credit > 0 ? '$' + r.credit.toFixed(2) : '-'}</td>
                <td class="text-right"><strong>$${r.balance.toFixed(2)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right;">
          <p>Total Billed: $${totalDebit.toFixed(2)}</p>
          <p>Total Paid: $${totalCredit.toFixed(2)}</p>
          <h3>Closing Debt Balance: $${closing.toFixed(2)}</h3>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  }

  printPurchaseReport(invoices, totalPurchases, totalPaid, totalBalance) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Procurement Report</title>
        <style>
          body { font-family: 'Poppins', sans-serif; font-size: 12px; color: #000; padding: 20px; font-weight: 600; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 11px; }
          th { background: #f3f4f6; font-weight: 800; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin:0;">HODMAN RESTAURANT &amp; HALLS</h2>
          <h3 style="margin:4px 0;">PURCHASE &amp; PROCUREMENT REGISTER</h3>
          <p style="margin:0; font-size: 11px;">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Items Summary</th>
              <th class="text-right">Total ($)</th>
              <th class="text-right">Paid ($)</th>
              <th class="text-right">Balance ($)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.map(i => `
              <tr>
                <td>${i.id}</td>
                <td>${i.date}</td>
                <td><strong>${i.supplierName}</strong></td>
                <td>${i.itemsSummary}</td>
                <td class="text-right">$${i.total.toFixed(2)}</td>
                <td class="text-right">$${i.paid.toFixed(2)}</td>
                <td class="text-right"><strong>$${i.balance.toFixed(2)}</strong></td>
                <td>${i.status.toUpperCase()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right;">
          <p>Total Purchases: $${totalPurchases.toFixed(2)}</p>
          <p>Total Disbursed: $${totalPaid.toFixed(2)}</p>
          <h3>Total Outstanding Payables: $${totalBalance.toFixed(2)}</h3>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

window.initPurchase = () => {
  window.purchaseModule = new PurchaseModule();
};
