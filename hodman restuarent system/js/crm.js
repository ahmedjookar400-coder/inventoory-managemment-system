/**
 * Hodman Restaurant Halls & Cafeteria System
 * Customers (CRM) Management Module
 * Components: Customers List, Customer Statement, Customer Balance
 */

class CrmModule {
  constructor() {
    this.containerId = 'crm-content-container';
    this.activeTab = 'customers-list'; // 'customers-list' | 'customer-statement' | 'customer-balance'
    
    this.customersDbKey = 'hodman_customers';
    this.txnsDbKey = 'hodman_customer_txns';

    this.selectedCustomerId = 'CUST-101';
    this.searchQuery = '';
    this.categoryFilter = 'all';

    this.customers = this.loadCustomers();
    this.transactions = this.loadTransactions();
    this.eventsBound = false;
  }

  loadCustomers() {
    const stored = localStorage.getItem(this.customersDbKey);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      {
        id: 'CUST-101',
        name: 'Muzamil Mohamed Abdulahi',
        phone: '615166569',
        address: 'Wadajir, Mogadishu',
        category: 'Hall Booking Client',
        totalOrders: 6,
        totalSpent: 1250.00,
        balance: 0.00,
        creditLimit: 500.00,
        status: 'active'
      },
      {
        id: 'CUST-102',
        name: 'Ahmed Warsame Guled',
        phone: '617889900',
        address: 'Hodan, Mogadishu',
        category: 'Credit Customer',
        totalOrders: 14,
        totalSpent: 980.00,
        balance: 325.00,
        creditLimit: 600.00,
        status: 'active'
      },
      {
        id: 'CUST-103',
        name: 'Dahabshiil Bank Corp',
        phone: '0612007148',
        address: 'KM4 Business Center',
        category: 'Corporate Client',
        totalOrders: 28,
        totalSpent: 4200.00,
        balance: 550.00,
        creditLimit: 2000.00,
        status: 'active'
      },
      {
        id: 'CUST-104',
        name: 'Sahra Cali Nuur',
        phone: '0615277772',
        address: 'Hamar Weyne',
        category: 'VIP Dining',
        totalOrders: 22,
        totalSpent: 1650.00,
        balance: 0.00,
        creditLimit: 400.00,
        status: 'active'
      },
      {
        id: 'CUST-105',
        name: 'Faarax Cali Diiriye',
        phone: '615554433',
        address: 'Dayniile, Mogadishu',
        category: 'Hall Booking Client',
        totalOrders: 3,
        totalSpent: 750.00,
        balance: 380.00,
        creditLimit: 500.00,
        status: 'active'
      },
      {
        id: 'CUST-106',
        name: 'Hassan Mohamed Noor',
        phone: '6195836',
        address: 'Shibis, Mogadishu',
        category: 'Regular Customer',
        totalOrders: 19,
        totalSpent: 620.00,
        balance: 0.00,
        creditLimit: 200.00,
        status: 'active'
      }
    ];
  }

  loadTransactions() {
    const stored = localStorage.getItem(this.txnsDbKey);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      { id: 'TXN-501', customerId: 'CUST-101', date: '2026-06-13', ref: 'HB-1001', type: 'Hall 1 Wedding Booking', debit: 500.00, credit: 0.00, balance: 500.00 },
      { id: 'TXN-502', customerId: 'CUST-101', date: '2026-06-13', ref: 'EVC-7729', type: 'Advance Payment Received', debit: 0.00, credit: 500.00, balance: 0.00 },
      { id: 'TXN-503', customerId: 'CUST-102', date: '2026-09-20', ref: 'INV-4821', type: 'Restaurant Dine-in Bill', debit: 125.00, credit: 0.00, balance: 125.00 },
      { id: 'TXN-504', customerId: 'CUST-102', date: '2026-09-25', ref: 'INV-4903', type: 'Takeout & Catering Bill', debit: 200.00, credit: 0.00, balance: 325.00 },
      { id: 'TXN-505', customerId: 'CUST-103', date: '2026-09-15', ref: 'INV-4701', type: 'Corporate Buffet Luncheon', debit: 1200.00, credit: 0.00, balance: 1200.00 },
      { id: 'TXN-506', customerId: 'CUST-103', date: '2026-09-22', ref: 'BNK-3891', type: 'Bank Wire Payment', debit: 0.00, credit: 650.00, balance: 550.00 },
      { id: 'TXN-507', customerId: 'CUST-105', date: '2026-09-26', ref: 'HB-1007', type: 'Hall 2 Banquet Reservation', debit: 530.00, credit: 0.00, balance: 530.00 },
      { id: 'TXN-508', customerId: 'CUST-105', date: '2026-09-26', ref: 'EVC-8841', type: 'Mobile Money Advance Deposit', debit: 0.00, credit: 150.00, balance: 380.00 }
    ];
  }

  saveAll() {
    localStorage.setItem(this.customersDbKey, JSON.stringify(this.customers));
    localStorage.setItem(this.txnsDbKey, JSON.stringify(this.transactions));
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="crm-module-wrap space-y-6 text-white pb-12">
        
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-users-rectangle text-blue-500"></i> Customers Management (CRM)
            </h2>
            <p class="text-xs text-slate-300 font-bold mt-0.5">Customer Database, Financial Account Statements, and Receivables / Outstanding Balances</p>
          </div>
          <div class="flex items-center gap-2">
            <button id="btn-open-add-customer" class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all">
              <i class="fa-solid fa-user-plus"></i> + Add New Customer
            </button>
          </div>
        </div>

        <!-- CRM Navigation Tabs -->
        <div class="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button class="crm-nav-btn px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${this.activeTab === 'customers-list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'}" data-tab="customers-list">
            <i class="fa-solid fa-address-book"></i> Customers List (${this.customers.length})
          </button>
          <button class="crm-nav-btn px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${this.activeTab === 'customer-statement' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'}" data-tab="customer-statement">
            <i class="fa-solid fa-receipt"></i> Customer Statement
          </button>
          <button class="crm-nav-btn px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${this.activeTab === 'customer-balance' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'}" data-tab="customer-balance">
            <i class="fa-solid fa-scale-balanced"></i> Customer Balance / Receivables
          </button>
        </div>

        <!-- Tab Content View Container -->
        <div id="crm-tab-content">
          ${this.renderActiveTabContent()}
        </div>

      </div>

      <!-- Modals Container -->
      ${this.renderModals()}
    `;

    if (!this.eventsBound) {
      this.bindEvents();
      this.eventsBound = true;
    }
  }

  renderActiveTabContent() {
    switch (this.activeTab) {
      case 'customers-list':
        return this.renderCustomersListTab();
      case 'customer-statement':
        return this.renderCustomerStatementTab();
      case 'customer-balance':
        return this.renderCustomerBalanceTab();
      default:
        return this.renderCustomersListTab();
    }
  }

  // ================= 1. CUSTOMERS LIST TAB =================
  renderCustomersListTab() {
    const activeCustomers = this.customers.filter(c => c.status !== 'deleted');
    const filtered = activeCustomers.filter(c => {
      const matchSearch = !this.searchQuery || 
        c.name.toLowerCase().includes(this.searchQuery) ||
        c.phone.includes(this.searchQuery) ||
        c.id.toLowerCase().includes(this.searchQuery);
      
      const matchCat = this.categoryFilter === 'all' || c.category === this.categoryFilter;
      return matchSearch && matchCat;
    });

    const totalBalance = activeCustomers.reduce((sum, c) => sum + c.balance, 0);

    return `
      <div class="space-y-6">
        
        <!-- Search and Filters Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div class="relative flex-1 min-w-[240px]">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              id="crm-search-input" 
              placeholder="Search customer name, phone, account #..." 
              value="${this.searchQuery}"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 font-bold outline-none focus:border-blue-500"
            />
          </div>

          <div class="flex items-center gap-2">
            <select id="crm-category-filter" class="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 font-bold outline-none focus:border-blue-500">
              <option value="all">All Customer Types</option>
              <option value="Regular Customer">Regular Diners</option>
              <option value="VIP Dining">VIP Diners</option>
              <option value="Corporate Client">Corporate Clients</option>
              <option value="Hall Booking Client">Hall Booking Clients</option>
              <option value="Credit Customer">Credit Customers</option>
            </select>
          </div>
        </div>

        <!-- Table Container -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th class="py-3 px-3">CUST #</th>
                  <th class="py-3 px-3">CUSTOMER NAME</th>
                  <th class="py-3 px-3">PHONE</th>
                  <th class="py-3 px-3">LOCATION</th>
                  <th class="py-3 px-3">CATEGORY</th>
                  <th class="py-3 px-3">TOTAL ORDERS</th>
                  <th class="py-3 px-3">TOTAL SPENT</th>
                  <th class="py-3 px-3">BALANCE DUE</th>
                  <th class="py-3 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/70 font-medium">
                ${filtered.length === 0 ? `
                  <tr><td colspan="9" class="py-8 text-center text-slate-500 font-bold text-xs">No matching customers found</td></tr>
                ` : filtered.map(c => `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-3 font-mono font-bold text-blue-400">${c.id}</td>
                    <td class="py-3 px-3">
                      <strong class="text-white font-extrabold text-xs block">${c.name}</strong>
                    </td>
                    <td class="py-3 px-3 font-mono text-slate-300 font-bold">${c.phone}</td>
                    <td class="py-3 px-3 text-slate-400">${c.address || 'Mogadishu'}</td>
                    <td class="py-3 px-3">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        ${c.category}
                      </span>
                    </td>
                    <td class="py-3 px-3 font-mono font-bold text-slate-200">${c.totalOrders} orders</td>
                    <td class="py-3 px-3 font-mono font-bold text-emerald-400">$${c.totalSpent.toFixed(2)}</td>
                    <td class="py-3 px-3 font-mono font-black ${c.balance > 0 ? 'text-red-400 text-sm' : 'text-slate-400'}">
                      $${c.balance.toFixed(2)}
                    </td>
                    <td class="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button class="btn-view-statement px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg text-xs font-bold transition-all" data-id="${c.id}">
                        <i class="fa-solid fa-file-invoice text-blue-400"></i> Statement
                      </button>
                      <button class="btn-collect-payment px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg text-xs font-bold transition-all" data-id="${c.id}">
                        <i class="fa-solid fa-hand-holding-dollar"></i> Settle
                      </button>
                      <button class="btn-delete-customer px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-lg text-xs font-bold transition-all" data-id="${c.id}" title="Remove customer from the active list; past records are retained">
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
  }

  // ================= 2. CUSTOMER STATEMENT TAB =================
  renderCustomerStatementTab() {
    const customer = this.customers.find(c => c.id === this.selectedCustomerId) || this.customers[0];
    const txns = this.transactions.filter(t => t.customerId === customer.id);

    const totalDebit = txns.reduce((s, t) => s + (t.debit || 0), 0);
    const totalCredit = txns.reduce((s, t) => s + (t.credit || 0), 0);
    const closingBalance = totalDebit - totalCredit;

    return `
      <div class="space-y-6">
        
        <!-- Customer Selector Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-xl">
          <div class="flex items-center gap-3">
            <label class="text-xs font-black uppercase text-slate-400 tracking-wider">Select Customer Statement:</label>
            <select id="crm-statement-cust-select" class="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-bold outline-none focus:border-blue-500">
              ${this.customers.map(c => `
                <option value="${c.id}" ${c.id === customer.id ? 'selected' : ''}>
                  ${c.name} (${c.phone}) - Due: $${c.balance.toFixed(2)}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-print-statement" class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all">
              <i class="fa-solid fa-print"></i> Print Official Statement
            </button>
          </div>
        </div>

        <!-- Customer Summary Header Card -->
        <div class="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span class="text-[10px] font-extrabold uppercase text-slate-500 tracking-widest block">Account Holder</span>
              <h3 class="text-base font-black text-white mt-1">${customer.name}</h3>
              <p class="text-xs text-slate-400 font-mono mt-0.5">Tel: ${customer.phone}</p>
              <p class="text-xs text-slate-500">${customer.address}</p>
            </div>

            <div>
              <span class="text-[10px] font-extrabold uppercase text-slate-500 tracking-widest block">Customer Category</span>
              <span class="inline-block mt-1 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">
                ${customer.category}
              </span>
              <p class="text-[11px] text-slate-400 mt-2 font-medium">Credit Limit: $${customer.creditLimit?.toFixed(2) || '500.00'}</p>
            </div>

            <div>
              <span class="text-[10px] font-extrabold uppercase text-slate-500 tracking-widest block">Statement Metrics</span>
              <div class="mt-1 text-xs space-y-1">
                <div class="flex justify-between text-slate-300 font-bold">
                  <span>Total Billed:</span>
                  <span class="font-mono text-white">$${totalDebit.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-slate-300 font-bold">
                  <span>Total Paid:</span>
                  <span class="font-mono text-emerald-400">$${totalCredit.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-center">
              <span class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Current Account Balance</span>
              <h2 class="text-2xl font-black font-mono mt-1 ${closingBalance > 0 ? 'text-red-400' : 'text-emerald-400'}">
                $${closingBalance.toFixed(2)}
              </h2>
              <span class="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                ${closingBalance > 0 ? 'Payment Outstanding Due' : 'Account Settled / Up-to-Date'}
              </span>
            </div>
          </div>
        </div>

        <!-- Transactions Ledger Table -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <h4 class="text-xs font-black uppercase text-slate-300 tracking-wider mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-list-check text-blue-400"></i> Chronological Statement Ledger
          </h4>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th class="py-3 px-3">DATE</th>
                  <th class="py-3 px-3">TXN #</th>
                  <th class="py-3 px-3">REFERENCE</th>
                  <th class="py-3 px-3">DESCRIPTION / SERVICE</th>
                  <th class="py-3 px-3 text-right">DEBIT (CHARGES)</th>
                  <th class="py-3 px-3 text-right">CREDIT (PAYMENTS)</th>
                  <th class="py-3 px-3 text-right">RUNNING BALANCE</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/70 font-medium">
                ${txns.length === 0 ? `
                  <tr><td colspan="7" class="py-8 text-center text-slate-500 font-bold text-xs">No transactions recorded for this customer yet</td></tr>
                ` : txns.map(t => `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-3 font-mono text-slate-300 font-bold">${t.date}</td>
                    <td class="py-3 px-3 font-mono text-blue-400 font-bold">${t.id}</td>
                    <td class="py-3 px-3 font-mono text-slate-400">${t.ref || '-'}</td>
                    <td class="py-3 px-3 text-white font-bold">${t.type}</td>
                    <td class="py-3 px-3 font-mono text-right font-bold ${t.debit > 0 ? 'text-red-400' : 'text-slate-500'}">
                      ${t.debit > 0 ? `$${t.debit.toFixed(2)}` : '-'}
                    </td>
                    <td class="py-3 px-3 font-mono text-right font-bold ${t.credit > 0 ? 'text-emerald-400' : 'text-slate-500'}">
                      ${t.credit > 0 ? `$${t.credit.toFixed(2)}` : '-'}
                    </td>
                    <td class="py-3 px-3 font-mono text-right font-black text-amber-400 text-sm">
                      $${t.balance.toFixed(2)}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // ================= 3. CUSTOMER BALANCE TAB =================
  renderCustomerBalanceTab() {
    const debtors = this.customers.filter(c => c.balance > 0);
    const totalReceivables = debtors.reduce((s, c) => s + c.balance, 0);

    return `
      <div class="space-y-6">
        
        <!-- Balance KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
            <div class="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center text-2xl font-bold border border-red-500/30">
              <i class="fa-solid fa-hand-holding-dollar"></i>
            </div>
            <div>
              <p class="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Receivables Due</p>
              <h3 class="text-2xl font-black text-white font-mono mt-0.5">$${totalReceivables.toFixed(2)}</h3>
              <p class="text-[10px] text-red-300 font-bold mt-0.5">Uncollected customer balances</p>
            </div>
          </div>

          <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
            <div class="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl font-bold border border-amber-500/30">
              <i class="fa-solid fa-users"></i>
            </div>
            <div>
              <p class="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Customers with Due Balance</p>
              <h3 class="text-2xl font-black text-white font-mono mt-0.5">${debtors.length} Accounts</h3>
              <p class="text-[10px] text-amber-300 font-bold mt-0.5">Require collection &amp; follow up</p>
            </div>
          </div>

          <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-xl">
            <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold border border-emerald-500/30">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <div>
              <p class="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Settled Clean Accounts</p>
              <h3 class="text-2xl font-black text-white font-mono mt-0.5">${this.customers.length - debtors.length} Accounts</h3>
              <p class="text-[10px] text-emerald-300 font-bold mt-0.5">Zero outstanding debt</p>
            </div>
          </div>
        </div>

        <!-- Debtors Table -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 class="text-sm font-black text-white flex items-center gap-2">
                <i class="fa-solid fa-scale-balanced text-red-400"></i> Customer Accounts Receivable Ledger
              </h3>
              <p class="text-[11px] text-slate-400 font-medium">Click "Settle Payment" to collect money via EVC Plus, Edahab, or Cash</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th class="py-3 px-3">ACCOUNT #</th>
                  <th class="py-3 px-3">CUSTOMER NAME</th>
                  <th class="py-3 px-3">PHONE</th>
                  <th class="py-3 px-3">CATEGORY</th>
                  <th class="py-3 px-3">CREDIT LIMIT</th>
                  <th class="py-3 px-3 font-mono">OUTSTANDING BALANCE</th>
                  <th class="py-3 px-3 text-right">COLLECT PAYMENT</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/70 font-medium">
                ${debtors.length === 0 ? `
                  <tr><td colspan="7" class="py-8 text-center text-emerald-400 font-bold text-xs">All customer accounts are settled and paid in full!</td></tr>
                ` : debtors.map(c => `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-3 font-mono font-bold text-blue-400">${c.id}</td>
                    <td class="py-3 px-3">
                      <strong class="text-white font-extrabold text-xs block">${c.name}</strong>
                    </td>
                    <td class="py-3 px-3 font-mono text-slate-300 font-bold">${c.phone}</td>
                    <td class="py-3 px-3">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        ${c.category}
                      </span>
                    </td>
                    <td class="py-3 px-3 font-mono text-slate-400">$${c.creditLimit?.toFixed(2) || '500.00'}</td>
                    <td class="py-3 px-3 font-mono font-black text-red-400 text-base">
                      $${c.balance.toFixed(2)}
                    </td>
                    <td class="py-3 px-3 text-right">
                      <button class="btn-collect-payment px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 ml-auto" data-id="${c.id}">
                        <i class="fa-solid fa-hand-holding-dollar"></i> Collect Payment
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
  }

  // ================= MODALS =================
  renderModals() {
    return `
      <!-- Add Customer Modal -->
      <div id="crm-add-customer-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-user-plus text-blue-400"></i> Add New Customer
            </h3>
            <button onclick="document.getElementById('crm-add-customer-modal').classList.add('hidden')" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form id="crm-add-customer-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-300 mb-1">Customer Name *</label>
              <input type="text" id="crm-new-cust-name" required placeholder="e.g. Liban Warsame" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Phone Number *</label>
              <input type="text" id="crm-new-cust-phone" required placeholder="e.g. 0615998877" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Location / Address</label>
              <input type="text" id="crm-new-cust-address" placeholder="e.g. Hodan, Mogadishu" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Customer Category</label>
              <select id="crm-new-cust-category" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500">
                <option value="Regular Customer">Regular Diner</option>
                <option value="VIP Dining">VIP Diner</option>
                <option value="Hall Booking Client">Hall Booking Client</option>
                <option value="Corporate Client">Corporate Client</option>
                <option value="Credit Customer">Credit Customer</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Credit Limit ($ USD)</label>
              <input type="number" step="50" id="crm-new-cust-limit" value="500" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold outline-none focus:border-blue-500" />
            </div>
            <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-3 shadow-md transition-all">
              Save Customer Record
            </button>
          </form>
        </div>
      </div>

      <!-- Collect Payment Modal -->
      <div id="crm-collect-payment-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-hand-holding-dollar text-emerald-400"></i> Settle Customer Balance
            </h3>
            <button onclick="document.getElementById('crm-collect-payment-modal').classList.add('hidden')" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form id="crm-collect-payment-form" class="space-y-3 text-xs">
            <input type="hidden" id="crm-pay-cust-id" />
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span class="text-[10px] text-slate-400 uppercase font-bold">Selected Customer</span>
              <h4 id="crm-pay-cust-name" class="text-sm font-black text-white mt-0.5">Customer Name</h4>
              <p id="crm-pay-cust-balance" class="text-xs font-mono font-extrabold text-red-400 mt-1">Outstanding Due: $0.00</p>
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Amount to Pay ($ USD) *</label>
              <input type="number" step="0.01" id="crm-pay-amount" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base text-emerald-400 font-mono font-black outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Payment Method *</label>
              <select id="crm-pay-method" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500">
                <option value="EVC Plus">EVC Plus (*789*709275*...#)</option>
                <option value="Edahab">Edahab (*113*099859*...#)</option>
                <option value="Premier Wallet">Premier Wallet (673836)</option>
                <option value="Cash">Cash in Hand</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Reference / Note</label>
              <input type="text" id="crm-pay-ref" placeholder="e.g. Settled September balance" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500" />
            </div>
            <button type="submit" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl mt-3 shadow-lg shadow-emerald-600/30 transition-all">
              Record Payment &amp; Settle Balance
            </button>
          </form>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const root = document.getElementById(this.containerId);
    if (!root) return;

    root.addEventListener('click', (e) => {
      // Tab Navigation
      const navBtn = e.target.closest('.crm-nav-btn');
      if (navBtn) {
        this.activeTab = navBtn.dataset.tab;
        this.render();
        return;
      }

      // Open Add Customer Modal
      if (e.target.closest('#btn-open-add-customer')) {
        document.getElementById('crm-add-customer-modal')?.classList.remove('hidden');
        return;
      }

      // View Statement for specific customer
      const viewStmtBtn = e.target.closest('.btn-view-statement');
      if (viewStmtBtn) {
        this.selectedCustomerId = viewStmtBtn.dataset.id;
        this.activeTab = 'customer-statement';
        this.render();
        return;
      }

      // Open Collect Payment Modal
      const payBtn = e.target.closest('.btn-collect-payment');
      if (payBtn) {
        const custId = payBtn.dataset.id;
        const cust = this.customers.find(c => c.id === custId);
        if (cust) {
          document.getElementById('crm-pay-cust-id').value = cust.id;
          document.getElementById('crm-pay-cust-name').textContent = cust.name;
          document.getElementById('crm-pay-cust-balance').textContent = `Outstanding Due: $${cust.balance.toFixed(2)}`;
          document.getElementById('crm-pay-amount').value = cust.balance.toFixed(2);
          document.getElementById('crm-collect-payment-modal')?.classList.remove('hidden');
        }
        return;
      }

      // Archive the customer so POS and ledger history remain intact.
      const deleteCustomerBtn = e.target.closest('.btn-delete-customer');
      if (deleteCustomerBtn) {
        const customer = this.customers.find(c => c.id === deleteCustomerBtn.dataset.id);
        if (!customer) return;
        if (!confirm(`Remove ${customer.name} from the active customer list? Past orders and account records will be kept.`)) return;
        customer.status = 'deleted';
        customer.deletedAt = new Date().toISOString();
        this.saveAll();
        this.render();
        window.showToast?.('Customer deleted.', 'success');
        return;
      }

      // Print Statement
      if (e.target.closest('#btn-print-statement')) {
        const cust = this.customers.find(c => c.id === this.selectedCustomerId) || this.customers[0];
        this.printCustomerStatement(cust);
        return;
      }
    });

    // Handle Search
    root.addEventListener('input', (e) => {
      if (e.target.id === 'crm-search-input') {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      }
    });

    // Handle Category Filter
    root.addEventListener('change', (e) => {
      if (e.target.id === 'crm-category-filter') {
        this.categoryFilter = e.target.value;
        this.render();
      } else if (e.target.id === 'crm-statement-cust-select') {
        this.selectedCustomerId = e.target.value;
        this.render();
      }
    });

    // Handle Form Submits
    root.addEventListener('submit', (e) => {
      if (e.target.id === 'crm-add-customer-form') {
        e.preventDefault();
        this.saveNewCustomer();
      } else if (e.target.id === 'crm-collect-payment-form') {
        e.preventDefault();
        this.processCustomerPayment();
      }
    });
  }

  saveNewCustomer() {
    const name = document.getElementById('crm-new-cust-name').value.trim();
    const phone = document.getElementById('crm-new-cust-phone').value.trim();
    const address = document.getElementById('crm-new-cust-address').value.trim() || 'Mogadishu';
    const category = document.getElementById('crm-new-cust-category').value;
    const creditLimit = parseFloat(document.getElementById('crm-new-cust-limit').value) || 500;

    const newCust = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      name,
      phone,
      address,
      category,
      totalOrders: 0,
      totalSpent: 0,
      balance: 0,
      creditLimit,
      status: 'active'
    };

    this.customers.unshift(newCust);
    this.saveAll();
    document.getElementById('crm-add-customer-modal')?.classList.add('hidden');
    window.showToast?.(`Customer ${name} added successfully!`, 'success');
    this.render();
  }

  processCustomerPayment() {
    const custId = document.getElementById('crm-pay-cust-id').value;
    const amount = parseFloat(document.getElementById('crm-pay-amount').value) || 0;
    const method = document.getElementById('crm-pay-method').value;
    const ref = document.getElementById('crm-pay-ref').value.trim() || `RCPT-${Math.floor(1000 + Math.random() * 9000)}`;

    const cust = this.customers.find(c => c.id === custId);
    if (!cust) return;

    cust.balance = Math.max(0, cust.balance - amount);

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: cust.id,
      date: new Date().toISOString().slice(0, 10),
      ref,
      type: `Account Payment via ${method}`,
      debit: 0,
      credit: amount,
      balance: cust.balance
    };

    this.transactions.push(newTxn);
    this.saveAll();
    document.getElementById('crm-collect-payment-modal')?.classList.add('hidden');
    window.showToast?.(`Payment of $${amount.toFixed(2)} received from ${cust.name}!`, 'success');
    this.render();
  }

  printCustomerStatement(customer) {
    const txns = this.transactions.filter(t => t.customerId === customer.id);
    const totalDebit = txns.reduce((s, t) => s + (t.debit || 0), 0);
    const totalCredit = txns.reduce((s, t) => s + (t.credit || 0), 0);
    const closingBalance = totalDebit - totalCredit;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Customer Statement - ${customer.name}</title>
        <style>
          body { font-family: 'Poppins', Arial, sans-serif; font-size: 13px; font-weight: 600; padding: 25px; color: #000; }
          .center { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f0f0f0; font-weight: 800; }
          .text-right { text-align: right; }
          .header-box { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div>
            <h2>HODMAN RESTAURANT HALLS &amp; CAFETERIA</h2>
            <p>albarko . NBC • Tel: 061300711</p>
            <p>Mogadishu, Somalia</p>
          </div>
          <div style="text-align: right;">
            <h3>CUSTOMER ACCOUNT STATEMENT</h3>
            <p><strong>Account #:</strong> ${customer.id}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <p><strong>Customer:</strong> ${customer.name}</p>
          <p><strong>Phone:</strong> ${customer.phone}</p>
          <p><strong>Address:</strong> ${customer.address}</p>
          <p><strong>Category:</strong> ${customer.category}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Txn #</th>
              <th>Reference</th>
              <th>Description</th>
              <th class="text-right">Debit ($)</th>
              <th class="text-right">Credit ($)</th>
              <th class="text-right">Balance ($)</th>
            </tr>
          </thead>
          <tbody>
            ${txns.map(t => `
              <tr>
                <td>${t.date}</td>
                <td>${t.id}</td>
                <td>${t.ref || '-'}</td>
                <td>${t.type}</td>
                <td class="text-right">${t.debit > 0 ? '$' + t.debit.toFixed(2) : '-'}</td>
                <td class="text-right">${t.credit > 0 ? '$' + t.credit.toFixed(2) : '-'}</td>
                <td class="text-right"><strong>$${t.balance.toFixed(2)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right;">
          <p><strong>Total Billed:</strong> $${totalDebit.toFixed(2)}</p>
          <p><strong>Total Paid:</strong> $${totalCredit.toFixed(2)}</p>
          <h3>Closing Balance Due: $${closingBalance.toFixed(2)}</h3>
        </div>

        <div class="center" style="margin-top: 30px; font-size: 11px;">
          <p>Thank you for your business with Hodman Restaurant &amp; Halls!</p>
          <p>DEV: Jookar</p>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

window.initCrm = () => {
  window.crmModule = new CrmModule();
};
