/**
 * Hodman Restaurant & Halls Management System
 * Hall Bookings Ledger, Customer Thermal Receipt & Capacity Management
 * Matching live hodman.ganacsibile.com design
 */

class HallsModule {
  constructor() {
    this.containerId = 'halls-content-container';
    this.bookingsDbKey = 'hodman_hall_bookings';
    this.hallsDbKey = 'hodman_halls_config';
    
    this.activeTab = 'complete'; // 'pending' | 'complete'
    this.activePeriod = 'monthly'; // 'daily' | 'weekly' | 'monthly'
    this.activeHallFilter = 'all'; // 'all' | '1' | '2'
    this.searchQuery = '';
    this.editingBookingId = null;
    this.activeReceiptBooking = null;

    this.halls = this.loadHalls();
    this.bookings = this.loadBookings();
    this.eventsBound = false;
  }

  loadHalls() {
    const stored = localStorage.getItem(this.hallsDbKey);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      { id: 1, name: 'Hall 1', capacity: 300, defaultRate: 2.50, description: 'Main Banquet & Wedding Hall' },
      { id: 2, name: 'Hall 2', capacity: 200, defaultRate: 2.50, description: 'Conference & Event Hall' }
    ];
  }

  loadBookings() {
    const stored = localStorage.getItem(this.bookingsDbKey);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return this.getDefaultBookings();
  }

  getDefaultBookings() {
    return [
      {
        id: 'HB-1001',
        hallId: 1,
        hallName: 'Hall 1',
        name: 'Muzamil Mohamed Abdulahi',
        phone: '615166569',
        date: '2026-06-13',
        guest: 200.00,
        extra: 0.00,
        exAmount: 0.00,
        discount: 0.00,
        rate: 2.50,
        total: 500.00,
        advance: 500.00,
        remaining: 0.00,
        status: 'complete'
      },
      {
        id: 'HB-1002',
        hallId: 1,
        hallName: 'Hall 1',
        name: 'Mahad',
        phone: '612017176',
        date: '2026-06-16',
        guest: 200.00,
        extra: 0.00,
        exAmount: 0.00,
        discount: 0.00,
        rate: 2.50,
        total: 500.00,
        advance: 500.00,
        remaining: 0.00,
        status: 'complete'
      },
      {
        id: 'HB-1003',
        hallId: 2,
        hallName: 'Hall 2',
        name: 'Maxamed Cabdi',
        phone: '6195836',
        date: '2026-06-30',
        guest: 200.00,
        extra: 0.00,
        exAmount: 0.00,
        discount: 0.00,
        rate: 2.50,
        total: 500.00,
        advance: 500.00,
        remaining: 0.00,
        status: 'complete'
      },
      {
        id: 'HB-1004',
        hallId: 1,
        hallName: 'Hall 1',
        name: 'Nageeye',
        phone: '612007148',
        date: '2026-08-13',
        guest: 200.00,
        extra: 20.00,
        exAmount: 220.00,
        discount: 10.00,
        rate: 11.00,
        total: 2420.00,
        advance: 2410.00,
        remaining: 0.00,
        status: 'complete',
        note: 'Adv - Disc: $2,400.00'
      },
      {
        id: 'HB-1005',
        hallId: 2,
        hallName: 'Hall 2',
        name: 'Maxamad Cali Nuur',
        phone: '0615277772',
        date: '2026-08-14',
        guest: 80.00,
        extra: 10.00,
        exAmount: 100.00,
        discount: 0.00,
        rate: 10.00,
        total: 900.00,
        advance: 900.00,
        remaining: 0.00,
        status: 'complete'
      },
      {
        id: 'HB-1006',
        hallId: 1,
        hallName: 'Hall 1',
        name: 'Ahmed Nuur Guuleed',
        phone: '617889900',
        date: '2026-09-28',
        guest: 150.00,
        extra: 0.00,
        exAmount: 0.00,
        discount: 0.00,
        rate: 3.50,
        total: 525.00,
        advance: 200.00,
        remaining: 325.00,
        status: 'pending'
      },
      {
        id: 'HB-1007',
        hallId: 2,
        hallName: 'Hall 2',
        name: 'Faarax Cali Diiriye',
        phone: '615554433',
        date: '2026-09-30',
        guest: 120.00,
        extra: 10.00,
        exAmount: 50.00,
        discount: 0.00,
        rate: 4.00,
        total: 530.00,
        advance: 150.00,
        remaining: 380.00,
        status: 'pending'
      }
    ];
  }

  saveBookings() {
    localStorage.setItem(this.bookingsDbKey, JSON.stringify(this.bookings));
  }

  calculateTotals(items) {
    let amount = 0;
    let discount = 0;
    let advance = 0;
    let remaining = 0;

    items.forEach(b => {
      amount += (b.total || 0);
      discount += (b.discount || 0);
      advance += (b.advance || 0);
      remaining += (b.remaining !== undefined ? b.remaining : (b.total - b.advance));
    });

    return { amount, discount, advance, remaining };
  }

  getFilteredBookings() {
    return this.bookings.filter(b => {
      if (this.activeTab !== 'all' && b.status !== this.activeTab) {
        return false;
      }
      if (this.activeHallFilter !== 'all' && String(b.hallId) !== String(this.activeHallFilter)) {
        return false;
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchName = (b.name || '').toLowerCase().includes(q);
        const matchPhone = (b.phone || '').toLowerCase().includes(q);
        const matchHall = (b.hallName || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchHall) return false;
      }
      return true;
    });
  }

  renderHallsView() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const filtered = this.getFilteredBookings();
    const totals = this.calculateTotals(filtered);

    const pendingCount = this.bookings.filter(b => b.status === 'pending').length;
    const completeCount = this.bookings.filter(b => b.status === 'complete').length;

    container.innerHTML = `
      <div class="halls-system-wrap pb-10">
        <!-- Top Toolbar & Hall Switcher -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <!-- Hall selector pills -->
          <div class="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button 
              class="hall-select-btn px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${this.activeHallFilter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}" 
              data-hall-filter="all"
            >
              <i class="fa-solid fa-hotel mr-1.5"></i> All Halls (2)
            </button>
            <button 
              class="hall-select-btn px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${this.activeHallFilter === '1' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}" 
              data-hall-filter="1"
            >
              <i class="fa-solid fa-archway mr-1.5"></i> Hall 1 (Cap: 300)
            </button>
            <button 
              class="hall-select-btn px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${this.activeHallFilter === '2' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}" 
              data-hall-filter="2"
            >
              <i class="fa-solid fa-archway mr-1.5"></i> Hall 2 (Cap: 200)
            </button>
          </div>

          <!-- Time period tabs (Daily / Weekly / Monthly) + New Booking Button -->
          <div class="flex items-center gap-2.5">
            <div class="inline-flex rounded-xl p-1 bg-slate-900 border border-slate-800 text-xs font-bold">
              <button class="period-btn px-3 py-1.5 rounded-lg transition-all ${this.activePeriod === 'daily' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-400 hover:text-white'}" data-period="daily">Daily</button>
              <button class="period-btn px-3 py-1.5 rounded-lg transition-all ${this.activePeriod === 'weekly' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-400 hover:text-white'}" data-period="weekly">Weekly</button>
              <button class="period-btn px-3 py-1.5 rounded-lg transition-all ${this.activePeriod === 'monthly' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-400 hover:text-white'}" data-period="monthly">Monthly</button>
            </div>

            <button 
              id="btn-open-create-hall-booking" 
              class="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <i class="fa-solid fa-plus-circle"></i> + New Hall Booking
            </button>
          </div>
        </div>

        <!-- Main White Card Container (Matching Hodman Screenshot) -->
        <div class="bg-white text-slate-900 rounded-3xl shadow-xl border border-slate-200 p-5 md:p-7 transition-all">
          
          <!-- Card Header: Tabs + Search Input -->
          <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <!-- Booking Status Tabs -->
            <div class="flex items-center gap-3">
              <button 
                class="booking-tab-btn px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${this.activeTab === 'pending' ? 'bg-[#0222D6] text-white shadow-md shadow-blue-600/30 font-extrabold' : 'text-blue-600 hover:bg-blue-50 font-semibold'}" 
                data-tab="pending"
              >
                Pending Bookings (${pendingCount})
              </button>
              <button 
                class="booking-tab-btn px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${this.activeTab === 'complete' ? 'bg-[#0222D6] text-white shadow-md shadow-blue-600/30 font-extrabold' : 'text-blue-600 hover:bg-blue-50 font-semibold'}" 
                data-tab="complete"
              >
                Complete Bookings (${completeCount})
              </button>
            </div>

            <!-- Search box -->
            <div class="w-full sm:w-72">
              <div class="relative">
                <input 
                  type="text" 
                  id="hall-search-input" 
                  placeholder="Search Name Or Tell..." 
                  value="${this.searchQuery}"
                  class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm"
                />
                ${this.searchQuery ? `
                  <button id="btn-clear-hall-search" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Light Green Totals Banner (Exact Match with Image) -->
          <div class="mt-4 mb-4 bg-[#d8f2e2] text-[#0d5e36] px-4 py-3 rounded-lg text-xs md:text-sm font-semibold tracking-wide border border-[#b2e5c6] flex flex-wrap items-center justify-between gap-2 shadow-sm">
            <span class="font-bold">
              ${this.activeTab === 'complete' ? 'Complete Totals:' : 'Pending Totals:'}
            </span>
            <div class="flex flex-wrap gap-2 md:gap-4 font-bold text-slate-800">
              <span>Amount <strong class="text-[#0d5e36] font-black">$${totals.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></span>
              <span class="text-slate-300">|</span>
              <span>Discount <strong class="text-[#0d5e36] font-black">$${totals.discount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></span>
              <span class="text-slate-300">|</span>
              <span>Advance <strong class="text-[#0d5e36] font-black">$${totals.advance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></span>
              <span class="text-slate-300">|</span>
              <span>Remaining <strong class="${totals.remaining < 0 ? 'text-red-600' : 'text-[#0d5e36]'} font-black">$${totals.remaining.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></span>
            </div>
          </div>

          <!-- Bookings Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black tracking-wider">
                  <th class="py-3 px-2">#</th>
                  <th class="py-3 px-2">HALL</th>
                  <th class="py-3 px-3">NAME</th>
                  <th class="py-3 px-2">PHONE</th>
                  <th class="py-3 px-2">DATE</th>
                  <th class="py-3 px-2 text-center">GUEST (PEOPLE)</th>
                  <th class="py-3 px-2">EXTRA</th>
                  <th class="py-3 px-2">EX-AMOUNT</th>
                  <th class="py-3 px-2">DISCOUNT</th>
                  <th class="py-3 px-2 text-center">RATE</th>
                  <th class="py-3 px-2">TOTAL</th>
                  <th class="py-3 px-2">ADVANCE</th>
                  <th class="py-3 px-2">REMAINING</th>
                  <th class="py-3 px-2 text-center">EDIT PAY</th>
                  <th class="py-3 px-2 text-center">AR</th>
                  <th class="py-3 px-2 text-center">RECEIPT</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="16" class="py-12 text-center text-slate-400">
                      <div class="flex flex-col items-center justify-center gap-2">
                        <i class="fa-solid fa-calendar-xmark text-4xl text-slate-300"></i>
                        <span class="font-bold text-sm text-slate-500">No ${this.activeTab} bookings found for this filter</span>
                        <button class="mt-2 text-xs text-blue-600 font-bold hover:underline" id="btn-empty-add-booking">+ Create First Booking</button>
                      </div>
                    </td>
                  </tr>
                ` : filtered.map((b, idx) => this.renderTableRow(b, idx + 1)).join('')}
              </tbody>
            </table>
          </div>

          <!-- Table Footer Watermark -->
          <div class="mt-8 pt-4 border-t border-slate-100 text-center">
            <p class="text-xs font-semibold text-[#bfa15f] tracking-wide">
              <span class="font-bold underline decoration-[#bfa15f]/50">DEV: Jookar</span>
            </p>
          </div>

        </div>
      </div>

      <!-- Add/Edit Booking Modal -->
      ${this.renderBookingModal()}

      <!-- Customer Hall Receipt Modal (80mm Thermal Format) -->
      ${this.renderReceiptModal()}
    `;

    if (!this.eventsBound) {
      this.bindEvents();
      this.eventsBound = true;
    }
  }

  renderTableRow(b, index) {
    const isComplete = b.status === 'complete';
    const hallBadge = b.hallId === 1 
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">Hall 1</span>'
      : '<span class="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">Hall 2</span>';

    return `
      <tr class="hover:bg-slate-50/80 transition-colors group">
        <td class="py-3 px-2 font-bold text-slate-500">${index}</td>
        <td class="py-3 px-2">${hallBadge}</td>
        <td class="py-3 px-3 font-bold text-slate-900">${b.name}</td>
        <td class="py-3 px-2 font-mono text-slate-600">${b.phone}</td>
        <td class="py-3 px-2 text-slate-600 whitespace-nowrap">${b.date}</td>
        
        <!-- GUEST (Quantity of people with increase / decrease controls) -->
        <td class="py-3 px-2 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
            <button 
              class="btn-step-guest text-slate-500 hover:text-red-600 hover:bg-white w-5 h-5 rounded flex items-center justify-center font-black text-xs transition-colors" 
              data-id="${b.id}" 
              data-delta="-10"
              title="Decrease 10 people"
            >-</button>
            <span class="font-bold text-slate-900 font-mono min-w-[50px] text-center">${Number(b.guest).toFixed(2)}</span>
            <button 
              class="btn-step-guest text-slate-500 hover:text-emerald-600 hover:bg-white w-5 h-5 rounded flex items-center justify-center font-black text-xs transition-colors" 
              data-id="${b.id}" 
              data-delta="10"
              title="Increase 10 people"
            >+</button>
          </div>
        </td>

        <td class="py-3 px-2 text-slate-600">${Number(b.extra || 0).toFixed(2)}</td>
        <td class="py-3 px-2 text-slate-600 font-mono">${Number(b.exAmount || 0).toFixed(2)}</td>
        <td class="py-3 px-2 text-slate-600 font-mono">${Number(b.discount || 0).toFixed(2)}</td>
        
        <!-- RATE (Price per person with increase / decrease controls) -->
        <td class="py-3 px-2 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
            <button 
              class="btn-step-rate text-emerald-700 hover:text-red-600 hover:bg-white w-5 h-5 rounded flex items-center justify-center font-black text-xs transition-colors" 
              data-id="${b.id}" 
              data-delta="-0.50"
              title="Decrease price by $0.50"
            >-</button>
            <span class="font-extrabold text-emerald-800 font-mono min-w-[50px] text-center">$${Number(b.rate).toFixed(2)}</span>
            <button 
              class="btn-step-rate text-emerald-700 hover:text-emerald-900 hover:bg-white w-5 h-5 rounded flex items-center justify-center font-black text-xs transition-colors" 
              data-id="${b.id}" 
              data-delta="0.50"
              title="Increase price by $0.50"
            >+</button>
          </div>
        </td>

        <!-- TOTAL -->
        <td class="py-3 px-2 font-bold text-slate-900 font-mono">$${Number(b.total).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        
        <!-- ADVANCE (With Adv - Disc note if applicable) -->
        <td class="py-3 px-2 whitespace-nowrap">
          <div class="font-bold text-slate-900 font-mono">$${Number(b.advance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          ${b.note ? `<div class="text-[10px] text-slate-500 font-medium">${b.note}</div>` : ''}
        </td>

        <!-- REMAINING -->
        <td class="py-3 px-2 font-bold font-mono ${b.remaining > 0 ? 'text-red-600' : 'text-emerald-700'}">
          $${Number(b.remaining || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </td>

        <!-- EDIT PAY Button (Exact style from screenshot) -->
        <td class="py-3 px-2 text-center">
          <button 
            class="btn-edit-booking px-3 py-1 bg-white border border-slate-300 hover:border-blue-600 hover:text-blue-600 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-all"
            data-id="${b.id}"
          >
            Edit
          </button>
        </td>

        <!-- AR Button (Make AR / Settle) -->
        <td class="py-3 px-2 text-center whitespace-nowrap">
          <button 
            class="btn-make-ar px-3 py-1 rounded-lg text-xs font-extrabold text-white transition-all shadow-sm ${isComplete ? 'bg-[#69748c] hover:bg-[#586278]' : 'bg-[#0222D6] hover:bg-blue-800'}"
            data-id="${b.id}"
            title="${isComplete ? 'Booking Settled & Complete' : 'Mark Complete'}"
          >
            Make AR
          </button>
        </td>

        <!-- RECEIPT BUTTON (Dedicated button to view & print customer invoice) -->
        <td class="py-3 px-2 text-center whitespace-nowrap">
          <button 
            class="btn-view-receipt px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 mx-auto"
            data-id="${b.id}"
            title="Generate & Print Official Customer Hall Receipt"
          >
            <i class="fa-solid fa-receipt text-[11px]"></i> Receipt
          </button>
        </td>
      </tr>
    `;
  }

  renderBookingModal() {
    return `
      <div id="hall-booking-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-white text-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200">
          
          <div class="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 id="hall-modal-title" class="text-base font-black text-slate-900 flex items-center gap-2">
                <i class="fa-solid fa-calendar-check text-[#0222D6]"></i> New Hall Booking
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Hodman Restaurant &amp; Halls Reservation</p>
            </div>
            <button id="btn-close-hall-modal" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <form id="hall-booking-form" class="space-y-4 mt-4 text-xs">
            <input type="hidden" id="hall-booking-id" value="" />

            <!-- Hall selection -->
            <div>
              <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Select Hall</label>
              <div class="grid grid-cols-2 gap-3">
                <label class="cursor-pointer border-2 border-blue-600 bg-blue-50/50 rounded-xl p-3 flex items-center gap-3 hall-radio-card transition-all">
                  <input type="radio" name="hall-choice" value="1" checked class="text-blue-600 focus:ring-blue-500" />
                  <div>
                    <strong class="block text-slate-900 font-bold text-xs">Hall 1 (Main Hall)</strong>
                    <span class="text-[11px] text-slate-500">Capacity: 300 guests</span>
                  </div>
                </label>
                <label class="cursor-pointer border-2 border-slate-200 rounded-xl p-3 flex items-center gap-3 hall-radio-card transition-all">
                  <input type="radio" name="hall-choice" value="2" class="text-blue-600 focus:ring-blue-500" />
                  <div>
                    <strong class="block text-slate-900 font-bold text-xs">Hall 2 (Event Hall)</strong>
                    <span class="text-[11px] text-slate-500">Capacity: 200 guests</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Customer Name & Phone -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Customer Name *</label>
                <input type="text" id="hall-cust-name" required placeholder="e.g. Muzamil Mohamed" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 font-medium" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number *</label>
                <input type="text" id="hall-cust-phone" required placeholder="e.g. 615166569" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 font-mono font-medium" />
              </div>
            </div>

            <!-- Date & Status -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Event / Booking Date *</label>
                <input type="date" id="hall-booking-date" required class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 font-medium" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Booking Status</label>
                <select id="hall-booking-status" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 font-semibold">
                  <option value="complete">Complete Booking (Active)</option>
                  <option value="pending">Pending Booking (Tentative)</option>
                </select>
              </div>
            </div>

            <!-- Highlighted Section: GUEST QUANTITY & RATE WITH STEPPER CONTROLS -->
            <div class="bg-blue-50/70 border border-blue-200 p-3.5 rounded-2xl space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Guest Quantity -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="font-black text-blue-900 uppercase tracking-wider">Guest (Qty of People) *</label>
                    <span class="text-[10px] text-blue-600 font-bold">Attendees</span>
                  </div>
                  <div class="flex items-center">
                    <button type="button" id="modal-guest-minus" class="w-9 h-9 rounded-l-xl bg-slate-200 hover:bg-slate-300 font-black text-sm text-slate-700 flex items-center justify-center transition-colors">-</button>
                    <input type="number" step="1" id="hall-guest-qty" required value="200" class="w-full bg-white border-y border-slate-300 py-2 text-center text-xs font-mono font-black text-slate-900 outline-none focus:border-blue-600" />
                    <button type="button" id="modal-guest-plus" class="w-9 h-9 rounded-r-xl bg-slate-200 hover:bg-slate-300 font-black text-sm text-slate-700 flex items-center justify-center transition-colors">+</button>
                  </div>
                </div>

                <!-- Price / Rate per Person -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="font-black text-blue-900 uppercase tracking-wider">Rate / Price ($ USD) *</label>
                    <span class="text-[10px] text-blue-600 font-bold">Per Person</span>
                  </div>
                  <div class="flex items-center">
                    <button type="button" id="modal-rate-minus" class="w-9 h-9 rounded-l-xl bg-slate-200 hover:bg-slate-300 font-black text-sm text-slate-700 flex items-center justify-center transition-colors">-</button>
                    <input type="number" step="0.50" id="hall-rate-price" required value="2.50" class="w-full bg-white border-y border-slate-300 py-2 text-center text-xs font-mono font-black text-emerald-700 outline-none focus:border-blue-600" />
                    <button type="button" id="modal-rate-plus" class="w-9 h-9 rounded-r-xl bg-slate-200 hover:bg-slate-300 font-black text-sm text-slate-700 flex items-center justify-center transition-colors">+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Extra, Extra Amount, Discount, Advance -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label class="block font-bold text-slate-600 uppercase tracking-wider mb-1">Extra Guests</label>
                <input type="number" step="1" id="hall-extra-qty" value="0" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono" />
              </div>
              <div>
                <label class="block font-bold text-slate-600 uppercase tracking-wider mb-1">Ex-Amount ($)</label>
                <input type="number" step="1" id="hall-extra-amount" value="0" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono" />
              </div>
              <div>
                <label class="block font-bold text-slate-600 uppercase tracking-wider mb-1">Discount ($)</label>
                <input type="number" step="1" id="hall-discount" value="0" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono" />
              </div>
              <div>
                <label class="block font-bold text-slate-600 uppercase tracking-wider mb-1">Advance ($)</label>
                <input type="number" step="1" id="hall-advance" value="0" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono" />
              </div>
            </div>

            <!-- Dynamic Live Calculation Breakdown Box -->
            <div class="bg-slate-100 rounded-2xl p-4 border border-slate-200 space-y-1.5">
              <div class="flex justify-between text-slate-600 font-medium">
                <span>Base Total (<span id="calc-guest-display">200</span> guests &times; $<span id="calc-rate-display">2.50</span>):</span>
                <span id="calc-base-subtotal" class="font-mono font-bold text-slate-800">$500.00</span>
              </div>
              <div class="flex justify-between text-slate-600 font-medium">
                <span>Extra Charges - Discount:</span>
                <span id="calc-extra-adj" class="font-mono font-bold text-slate-800">$0.00</span>
              </div>
              <div class="flex justify-between text-slate-900 font-extrabold text-sm pt-1.5 border-t border-slate-200">
                <span>Total Calculated Amount:</span>
                <span id="calc-grand-total" class="font-mono text-[#0222D6] font-black text-base">$500.00</span>
              </div>
              <div class="flex justify-between text-slate-700 font-bold pt-1">
                <span>Remaining Balance Due:</span>
                <span id="calc-remaining-balance" class="font-mono text-emerald-700 font-black">$0.00</span>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center justify-between pt-2">
              <button 
                type="button" 
                id="btn-delete-booking" 
                class="text-red-500 hover:text-red-700 font-bold text-xs py-2 px-3 rounded-lg hover:bg-red-50 transition-colors hidden"
              >
                <i class="fa-solid fa-trash-can mr-1"></i> Delete Booking
              </button>
              <div class="flex items-center gap-2 ml-auto">
                <button 
                  type="button" 
                  id="btn-cancel-hall-modal" 
                  class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-6 py-2.5 rounded-xl bg-[#0222D6] hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
                >
                  <i class="fa-solid fa-check"></i> Save &amp; Print Receipt
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>
    `;
  }

  renderReceiptModal() {
    return `
      <div id="hall-receipt-modal" class="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl relative flex flex-col max-h-[92vh]">
          
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
            <div>
              <h3 class="font-extrabold text-sm text-white flex items-center gap-2">
                <i class="fa-solid fa-receipt text-blue-400"></i> Customer Hall Booking Receipt
              </h3>
              <p class="text-[11px] text-slate-400">Ready for 80mm roll printer</p>
            </div>
            <button id="btn-close-receipt-modal" class="text-slate-400 hover:text-white p-1">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <!-- Printable Receipt Container (Thermal Paper White Preview) -->
          <div class="my-3 overflow-y-auto flex-1 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex justify-center">
            <div id="hall-receipt-content-area" class="w-full max-w-[340px]">
              <!-- Injected by generateCustomerReceiptHtml() -->
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-3 border-t border-slate-800 flex items-center gap-2 flex-shrink-0">
            <button 
              id="btn-print-hall-receipt-direct" 
              class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              <i class="fa-solid fa-print"></i> Print Customer Receipt (80mm)
            </button>
            <button 
              id="btn-dismiss-receipt-modal" 
              class="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors border border-slate-700"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    `;
  }

  generateCustomerReceiptHtml(booking) {
    const settings = (window.restaurantDB && window.restaurantDB.getSettings) 
      ? window.restaurantDB.getSettings() 
      : { address: 'albarko . NBC', phone: '061300711', evcCode: '709275', edahabCode: '099859', premierCode: '673836', ebesaCode: '940396' };

    const totalFormatted = Number(booking.total).toFixed(2);
    const advanceFormatted = Number(booking.advance).toFixed(2);
    const remainingFormatted = Number(booking.remaining || 0).toFixed(2);

    const evc = settings.evcCode || '709275';
    const edahab = settings.edahabCode || '099859';
    const premier = settings.premierCode || '673836';
    const ebesa = settings.ebesaCode || '940396';

    // Strict Bold Pure Black styling, NO black lines, clean spacing
    return `
      <div class="receipt-paper" style="background:#ffffff; color:#000000; font-family:'Courier New', monospace; font-weight:700; font-size:13px; line-height:1.45; padding:10px 8px; width:100%; box-sizing:border-box;">
        
        <!-- Official Hodman Header with Winged Heart Logo -->
        <div style="text-align:center; margin-bottom:10px; color:#000000;">
          <div style="margin:0 auto 6px auto; width:68px; height:68px;">
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
          <div style="font-size:24px; font-weight:900; letter-spacing:0.5px; line-height:1.1; color:#000000;">Hodman</div>
          <div style="font-size:13px; font-weight:900; letter-spacing:1.5px; text-transform:uppercase; margin-top:3px; color:#000000;">RESTAURANT HALLS &amp; CAFETERIA</div>
          <div style="font-size:13px; font-weight:800; margin-top:2px; color:#000000;">${settings.address || 'albarko . NBC'}</div>
          <div style="font-size:13px; font-weight:900; color:#000000;">Tel: ${settings.phone || '061300711'}</div>
        </div>

        <!-- Voucher Title -->
        <div style="text-align:center; font-weight:900; font-size:14px; margin-bottom:8px; text-transform:uppercase; color:#000000;">
          *** HALL BOOKING RECEIPT ***
        </div>

        <!-- Booking Meta & Customer Info -->
        <div style="font-size:13px; font-weight:800; line-height:1.6; margin-bottom:8px; margin-top:6px; color:#000000;">
          <div style="display:flex; justify-content:space-between;">
            <span>Customer: <strong style="font-weight:900; color:#000000;">${booking.name}</strong></span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Phone: <strong style="font-weight:900; color:#000000;">${booking.phone}</strong></span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Reserved Hall: <strong style="font-weight:900; color:#000000;">${booking.hallName || (booking.hallId === 1 ? 'Hall 1' : 'Hall 2')}</strong></span>
            <span>Ref #: <strong style="font-weight:900; color:#000000;">${booking.id}</strong></span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Event Date: <strong style="font-weight:900; color:#000000;">${booking.date}</strong></span>
            <span>Status: <strong style="font-weight:900; text-transform:uppercase; color:#000000;">${booking.status || 'COMPLETE'}</strong></span>
          </div>
        </div>

        <!-- Booking Line Items -->
        <table style="width:100%; border-collapse:collapse; font-size:13px; color:#000000; font-weight:800; margin-top:6px;">
          <thead>
            <tr style="text-align:left; font-weight:900;">
              <th style="padding:4px 0; width:24px; color:#000000;">NO</th>
              <th style="padding:4px 4px; color:#000000;">DESCRIPTION</th>
              <th style="text-align:right; padding:4px 4px; color:#000000;">QTY</th>
              <th style="text-align:right; padding:4px 4px; color:#000000;">RATE</th>
              <th style="text-align:right; padding:4px 0; color:#000000;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr style="vertical-align:top; font-weight:800; color:#000000;">
              <td style="padding:5px 0; font-weight:900; color:#000000;">1</td>
              <td style="padding:5px 4px; color:#000000;">
                <div style="font-weight:900; font-size:13.5px; color:#000000;">${booking.hallName || 'Hall'} Guest Attendance</div>
              </td>
              <td style="text-align:right; padding:5px 4px; font-weight:900; color:#000000;">${Number(booking.guest).toFixed(2)}</td>
              <td style="text-align:right; padding:5px 4px; font-weight:800; color:#000000;">$${Number(booking.rate).toFixed(2)}</td>
              <td style="text-align:right; padding:5px 0; font-weight:900; color:#000000;">$${(booking.guest * booking.rate).toFixed(2)}</td>
            </tr>

            ${booking.extra > 0 || booking.exAmount > 0 ? `
              <tr style="vertical-align:top; font-weight:800; color:#000000;">
                <td style="padding:5px 0; font-weight:900; color:#000000;">2</td>
                <td style="padding:5px 4px; color:#000000;">
                  <div style="font-weight:900; font-size:13.5px; color:#000000;">Extra Guests &amp; Services</div>
                </td>
                <td style="text-align:right; padding:5px 4px; font-weight:900; color:#000000;">${Number(booking.extra || 0).toFixed(2)}</td>
                <td style="text-align:right; padding:5px 4px; font-weight:800; color:#000000;">-</td>
                <td style="text-align:right; padding:5px 0; font-weight:900; color:#000000;">$${Number(booking.exAmount || 0).toFixed(2)}</td>
              </tr>
            ` : ''}

            ${booking.discount > 0 ? `
              <tr style="vertical-align:top; font-weight:800; color:#000000;">
                <td style="padding:5px 0; font-weight:900; color:#000000;">3</td>
                <td style="padding:5px 4px; color:#000000;">
                  <div style="font-weight:900; font-size:13.5px; color:#000000;">Discount Deduction</div>
                </td>
                <td style="text-align:right; padding:5px 4px; font-weight:900; color:#000000;">1.00</td>
                <td style="text-align:right; padding:5px 4px; font-weight:800; color:#000000;">-</td>
                <td style="text-align:right; padding:5px 0; font-weight:900; color:#000000;">-$${Number(booking.discount).toFixed(2)}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>

        <!-- Totals Breakdown -->
        <div style="font-size:13.5px; font-weight:800; line-height:1.6; color:#000000; margin-top:8px;">
          <div style="display:flex; justify-content:space-between;">
            <span>Subtotal:</span>
            <span style="font-weight:900; color:#000000;">$${totalFormatted}</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:19px; font-weight:900; margin:8px 0 5px 0; color:#000000;">
          <span>TOTAL:</span>
          <span style="font-weight:900; color:#000000;">$${totalFormatted}</span>
        </div>

        <div style="font-size:13.5px; font-weight:800; display:flex; justify-content:space-between; margin-top:2px; color:#000000;">
          <span>Advance Paid:</span>
          <span style="font-weight:900; color:#000000;">$${advanceFormatted}</span>
        </div>

        <div style="font-size:13.5px; font-weight:900; display:flex; justify-content:space-between; margin-top:2px; color:#000000;">
          <span>Remaining Balance:</span>
          <span style="font-weight:900; color:#000000;">$${remainingFormatted}</span>
        </div>

        <!-- Mobile Money Merchant Codes -->
        <div style="font-size:12.5px; font-weight:800; margin-top:8px; margin-bottom:4px; line-height:1.8; color:#000000;">
          <div><strong>Merchant: *789*${evc}*${totalFormatted}#</strong></div>
          <div><strong>Edahab: *113*${edahab}*${totalFormatted}#</strong></div>
          <div><strong>Premier Wallet: ${premier}</strong></div>
          <div><strong>Ebesa: ${ebesa}</strong></div>
        </div>

        <!-- Footer -->
        <div style="text-align:center; font-weight:800; font-size:13px; margin-top:10px; line-height:1.6; color:#000000;">
          <div>Thank you for choosing</div>
          <div style="font-weight:900;">Hodman Restaurant Halls &amp; Cafeteria!</div>
          <div>Please come again.</div>
        </div>

        <div style="text-align:center; font-size:11px; font-weight:800; color:#000000; margin-top:8px;">
          DEV: Jookar
        </div>

      </div>
    `;
  }

  showReceiptModal(booking) {
    this.activeReceiptBooking = booking;
    const modal = document.getElementById('hall-receipt-modal');
    const container = document.getElementById('hall-receipt-content-area');
    if (!modal || !container) return;

    container.innerHTML = this.generateCustomerReceiptHtml(booking);
    modal.classList.remove('hidden');
  }

  closeReceiptModal() {
    const modal = document.getElementById('hall-receipt-modal');
    if (modal) modal.classList.add('hidden');
    this.activeReceiptBooking = null;
  }

  printThermalReceipt(booking) {
    if (!booking) return;

    const receiptHtml = this.generateCustomerReceiptHtml(booking);

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
        <title>Receipt - ${booking.name}</title>
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
            color: #000000 !important;
            font-family: 'Courier New', Courier, monospace;
            font-size: 13.5px;
            font-weight: 700 !important;
            line-height: 1.45;
            width: 80mm;
            margin: 0 auto;
            padding: 6px 8px;
            overflow: visible;
          }
        </style>
      </head>
      <body>
        ${receiptHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 150);
          };
        </script>
      </body>
      </html>
    `);
    frameDoc.close();
  }

  bindEvents() {
    const root = document.getElementById(this.containerId);
    if (!root) return;

    // Search input
    root.addEventListener('input', (e) => {
      if (e.target.id === 'hall-search-input') {
        this.searchQuery = e.target.value;
        this.renderHallsView();
      }
    });

    // Clear search
    root.addEventListener('click', (e) => {
      if (e.target.closest('#btn-clear-hall-search')) {
        this.searchQuery = '';
        this.renderHallsView();
        return;
      }

      // Booking Tab Filter (Pending / Complete)
      const tabBtn = e.target.closest('.booking-tab-btn');
      if (tabBtn) {
        this.activeTab = tabBtn.dataset.tab;
        this.renderHallsView();
        return;
      }

      // Hall Filter Pills (All / Hall 1 / Hall 2)
      const hallBtn = e.target.closest('.hall-select-btn');
      if (hallBtn) {
        this.activeHallFilter = hallBtn.dataset.hallFilter;
        this.renderHallsView();
        return;
      }

      // Period Filter (Daily / Weekly / Monthly)
      const periodBtn = e.target.closest('.period-btn');
      if (periodBtn) {
        this.activePeriod = periodBtn.dataset.period;
        this.renderHallsView();
        return;
      }

      // Quick Rate Step (+ / -) directly in table
      const rateStepBtn = e.target.closest('.btn-step-rate');
      if (rateStepBtn) {
        const id = rateStepBtn.dataset.id;
        const delta = parseFloat(rateStepBtn.dataset.delta);
        this.stepRate(id, delta);
        return;
      }

      // Quick Guest Step (+ / -) directly in table
      const guestStepBtn = e.target.closest('.btn-step-guest');
      if (guestStepBtn) {
        const id = guestStepBtn.dataset.id;
        const delta = parseFloat(guestStepBtn.dataset.delta);
        this.stepGuest(id, delta);
        return;
      }

      // Open Modal to Create Booking
      if (e.target.closest('#btn-open-create-hall-booking') || e.target.closest('#btn-empty-add-booking')) {
        this.openBookingModal(null);
        return;
      }

      // Edit Booking from table
      const editBtn = e.target.closest('.btn-edit-booking');
      if (editBtn) {
        const id = editBtn.dataset.id;
        this.openBookingModal(id);
        return;
      }

      // Make AR action button
      const arBtn = e.target.closest('.btn-make-ar');
      if (arBtn) {
        const id = arBtn.dataset.id;
        this.handleMakeAR(id);
        return;
      }

      // Dedicated Receipt Button click
      const receiptBtn = e.target.closest('.btn-view-receipt');
      if (receiptBtn) {
        const id = receiptBtn.dataset.id;
        const b = this.bookings.find(item => item.id === id);
        if (b) {
          this.showReceiptModal(b);
        }
        return;
      }

      // Close Booking modal
      if (e.target.closest('#btn-close-hall-modal') || e.target.closest('#btn-cancel-hall-modal')) {
        this.closeBookingModal();
        return;
      }

      // Close Receipt modal
      if (e.target.closest('#btn-close-receipt-modal') || e.target.closest('#btn-dismiss-receipt-modal')) {
        this.closeReceiptModal();
        return;
      }

      // Direct Print button inside Receipt modal
      if (e.target.closest('#btn-print-hall-receipt-direct')) {
        if (this.activeReceiptBooking) {
          this.printThermalReceipt(this.activeReceiptBooking);
          if (window.showToast) {
            window.showToast('Sending receipt to 80mm printer...', 'info');
          }
        }
        return;
      }

      // Delete booking
      if (e.target.closest('#btn-delete-booking')) {
        this.deleteBooking(this.editingBookingId);
        return;
      }

      // Modal Steppers for Guest
      if (e.target.closest('#modal-guest-minus')) {
        const input = document.getElementById('hall-guest-qty');
        if (input) {
          input.value = Math.max(1, (parseFloat(input.value) || 0) - 10);
          this.updateModalCalculations();
        }
        return;
      }
      if (e.target.closest('#modal-guest-plus')) {
        const input = document.getElementById('hall-guest-qty');
        if (input) {
          input.value = (parseFloat(input.value) || 0) + 10;
          this.updateModalCalculations();
        }
        return;
      }

      // Modal Steppers for Rate
      if (e.target.closest('#modal-rate-minus')) {
        const input = document.getElementById('hall-rate-price');
        if (input) {
          input.value = Math.max(0.5, (parseFloat(input.value) || 0) - 0.50).toFixed(2);
          this.updateModalCalculations();
        }
        return;
      }
      if (e.target.closest('#modal-rate-plus')) {
        const input = document.getElementById('hall-rate-price');
        if (input) {
          input.value = ((parseFloat(input.value) || 0) + 0.50).toFixed(2);
          this.updateModalCalculations();
        }
        return;
      }
    });

    // Form Submit
    root.addEventListener('submit', (e) => {
      if (e.target.id === 'hall-booking-form') {
        e.preventDefault();
        this.saveModalBooking();
      }
    });

    // Live calculation on modal input changes
    root.addEventListener('input', (e) => {
      if (e.target.closest('#hall-booking-form')) {
        this.updateModalCalculations();
      }
    });
  }

  // Quick adjust Rate in row
  stepRate(bookingId, delta) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const newRate = Math.max(0.5, (booking.rate || 0) + delta);
    booking.rate = parseFloat(newRate.toFixed(2));
    
    // Recalculate
    const subtotal = (booking.guest * booking.rate) + (booking.exAmount || 0);
    booking.total = Math.max(0, subtotal - (booking.discount || 0));
    booking.remaining = Math.max(0, booking.total - (booking.advance || 0));

    this.saveBookings();
    this.renderHallsView();

    if (window.showToast) {
      window.showToast(`Updated ${booking.name}'s rate to $${booking.rate.toFixed(2)} (Total: $${booking.total.toFixed(2)})`, 'success');
    }
  }

  // Quick adjust Guest count in row
  stepGuest(bookingId, delta) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const newGuest = Math.max(1, (booking.guest || 0) + delta);
    booking.guest = newGuest;
    
    // Recalculate
    const subtotal = (booking.guest * booking.rate) + (booking.exAmount || 0);
    booking.total = Math.max(0, subtotal - (booking.discount || 0));
    booking.remaining = Math.max(0, booking.total - (booking.advance || 0));

    this.saveBookings();
    this.renderHallsView();

    if (window.showToast) {
      window.showToast(`Updated guest count to ${booking.guest} (Total: $${booking.total.toFixed(2)})`, 'info');
    }
  }

  openBookingModal(bookingId = null) {
    this.editingBookingId = bookingId;
    const modal = document.getElementById('hall-booking-modal');
    if (!modal) return;

    const form = document.getElementById('hall-booking-form');
    const title = document.getElementById('hall-modal-title');
    const deleteBtn = document.getElementById('btn-delete-booking');

    if (bookingId) {
      const b = this.bookings.find(item => item.id === bookingId);
      if (!b) return;

      title.innerHTML = `<i class="fa-solid fa-pen-to-square text-[#0222D6]"></i> Edit Booking: ${b.name}`;
      deleteBtn.classList.remove('hidden');

      document.getElementById('hall-booking-id').value = b.id;
      document.getElementById('hall-cust-name').value = b.name;
      document.getElementById('hall-cust-phone').value = b.phone;
      document.getElementById('hall-booking-date').value = b.date;
      document.getElementById('hall-booking-status').value = b.status || 'complete';
      document.getElementById('hall-guest-qty').value = b.guest;
      document.getElementById('hall-rate-price').value = Number(b.rate).toFixed(2);
      document.getElementById('hall-extra-qty').value = b.extra || 0;
      document.getElementById('hall-extra-amount').value = b.exAmount || 0;
      document.getElementById('hall-discount').value = b.discount || 0;
      document.getElementById('hall-advance').value = b.advance || 0;

      const radio = form.querySelector(`input[name="hall-choice"][value="${b.hallId}"]`);
      if (radio) radio.checked = true;

    } else {
      title.innerHTML = `<i class="fa-solid fa-calendar-check text-[#0222D6]"></i> New Hall Booking`;
      deleteBtn.classList.add('hidden');
      form.reset();

      document.getElementById('hall-booking-id').value = '';
      document.getElementById('hall-booking-date').value = new Date().toISOString().slice(0, 10);
      document.getElementById('hall-guest-qty').value = '200';
      document.getElementById('hall-rate-price').value = '2.50';
      document.getElementById('hall-extra-qty').value = '0';
      document.getElementById('hall-extra-amount').value = '0';
      document.getElementById('hall-discount').value = '0';
      document.getElementById('hall-advance').value = '500';
      document.getElementById('hall-booking-status').value = 'complete';

      const defaultRadio = form.querySelector('input[name="hall-choice"][value="1"]');
      if (defaultRadio) defaultRadio.checked = true;
    }

    this.updateModalCalculations();
    modal.classList.remove('hidden');
  }

  closeBookingModal() {
    const modal = document.getElementById('hall-booking-modal');
    if (modal) modal.classList.add('hidden');
    this.editingBookingId = null;
  }

  updateModalCalculations() {
    const guest = parseFloat(document.getElementById('hall-guest-qty')?.value) || 0;
    const rate = parseFloat(document.getElementById('hall-rate-price')?.value) || 0;
    const extraAmount = parseFloat(document.getElementById('hall-extra-amount')?.value) || 0;
    const discount = parseFloat(document.getElementById('hall-discount')?.value) || 0;
    const advance = parseFloat(document.getElementById('hall-advance')?.value) || 0;

    const baseSubtotal = guest * rate;
    const netExtra = extraAmount - discount;
    const grandTotal = Math.max(0, baseSubtotal + extraAmount - discount);
    const remaining = grandTotal - advance;

    const guestDisp = document.getElementById('calc-guest-display');
    const rateDisp = document.getElementById('calc-rate-display');
    const subtotalDisp = document.getElementById('calc-base-subtotal');
    const extraAdjDisp = document.getElementById('calc-extra-adj');
    const totalDisp = document.getElementById('calc-grand-total');
    const remainingDisp = document.getElementById('calc-remaining-balance');

    if (guestDisp) guestDisp.textContent = guest;
    if (rateDisp) rateDisp.textContent = rate.toFixed(2);
    if (subtotalDisp) subtotalDisp.textContent = `$${baseSubtotal.toFixed(2)}`;
    if (extraAdjDisp) extraAdjDisp.textContent = `${netExtra >= 0 ? '+' : ''}$${netExtra.toFixed(2)}`;
    if (totalDisp) totalDisp.textContent = `$${grandTotal.toFixed(2)}`;
    if (remainingDisp) {
      remainingDisp.textContent = `$${remaining.toFixed(2)}`;
      remainingDisp.className = remaining < 0 ? 'font-mono text-red-600 font-black' : 'font-mono text-emerald-700 font-black';
    }
  }

  saveModalBooking() {
    const id = document.getElementById('hall-booking-id').value;
    const form = document.getElementById('hall-booking-form');
    const selectedHallId = parseInt(form.querySelector('input[name="hall-choice"]:checked')?.value || '1');
    const hallName = selectedHallId === 1 ? 'Hall 1' : 'Hall 2';

    const name = document.getElementById('hall-cust-name').value.trim();
    const phone = document.getElementById('hall-cust-phone').value.trim();
    const date = document.getElementById('hall-booking-date').value;
    const status = document.getElementById('hall-booking-status').value;

    const guest = parseFloat(document.getElementById('hall-guest-qty').value) || 0;
    const rate = parseFloat(document.getElementById('hall-rate-price').value) || 0;
    const extra = parseFloat(document.getElementById('hall-extra-qty').value) || 0;
    const exAmount = parseFloat(document.getElementById('hall-extra-amount').value) || 0;
    const discount = parseFloat(document.getElementById('hall-discount').value) || 0;
    const advance = parseFloat(document.getElementById('hall-advance').value) || 0;

    const total = Math.max(0, (guest * rate) + exAmount - discount);
    const remaining = total - advance;

    let targetBooking = null;

    if (id) {
      // Edit existing
      const index = this.bookings.findIndex(b => b.id === id);
      if (index !== -1) {
        this.bookings[index] = {
          ...this.bookings[index],
          hallId: selectedHallId,
          hallName,
          name,
          phone,
          date,
          status,
          guest,
          rate,
          extra,
          exAmount,
          discount,
          advance,
          total,
          remaining
        };
        targetBooking = this.bookings[index];
      }
    } else {
      // Create new
      targetBooking = {
        id: `HB-${Date.now().toString().slice(-4)}`,
        hallId: selectedHallId,
        hallName,
        name,
        phone,
        date,
        status,
        guest,
        rate,
        extra,
        exAmount,
        discount,
        advance,
        total,
        remaining
      };
      this.bookings.unshift(targetBooking);
    }

    this.saveBookings();
    this.closeBookingModal();
    this.renderHallsView();

    if (window.showToast) {
      window.showToast(`Hall booking for ${name} saved successfully!`, 'success');
    }

    // Automatically open receipt preview for customer
    if (targetBooking) {
      setTimeout(() => {
        this.showReceiptModal(targetBooking);
      }, 200);
    }
  }

  deleteBooking(id) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this hall booking?')) return;

    this.bookings = this.bookings.filter(b => b.id !== id);
    this.saveBookings();
    this.closeBookingModal();
    this.renderHallsView();

    if (window.showToast) {
      window.showToast('Booking deleted successfully.', 'warning');
    }
  }

  handleMakeAR(id) {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return;

    // Toggle complete or show AR summary
    if (booking.status === 'pending') {
      booking.status = 'complete';
      if (booking.remaining > 0) {
        booking.advance = booking.total;
        booking.remaining = 0;
      }
      this.saveBookings();
      this.renderHallsView();
      if (window.showToast) {
        window.showToast(`Booking for ${booking.name} marked as Complete & Settled!`, 'success');
      }
    }

    // Always show official customer receipt modal
    this.showReceiptModal(booking);
  }
}

window.initHalls = () => {
  window.hallsModule = new HallsModule();
};
