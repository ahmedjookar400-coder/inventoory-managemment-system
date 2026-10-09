/**
 * Hodman Restaurant Halls & Cafeteria System
 * Human Resource (HR) Management Module
 * Components: Pay Salary, Salary Report, Weekly Schedule, Job Title List
 */

class HumanResourceModule {
  constructor() {
    this.containerId = 'hr-content-container';
    this.activeTab = 'pay-salary'; // 'pay-salary' | 'salary-report' | 'weekly-schedule' | 'job-titles'
    
    // DB Keys
    this.staffDbKey = 'hodman_hr_staff';
    this.salariesDbKey = 'hodman_hr_salaries';
    this.schedulesDbKey = 'hodman_hr_schedules';
    this.jobTitlesDbKey = 'hodman_hr_job_titles';

    this.staffList = this.loadStaff();
    this.salaryRecords = this.loadSalaries();
    this.schedules = this.loadSchedules();
    this.jobTitles = this.loadJobTitles();

    this.eventsBound = false;
  }

  loadStaff() {
    const stored = localStorage.getItem(this.staffDbKey);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      { id: 'ST-101', name: 'Mohamed Admin', title: 'General Manager', department: 'Management', phone: '0615001234', salary: 1200.00, status: 'active' },
      { id: 'ST-102', name: 'Maryam Cashier', title: 'Head Cashier', department: 'Service/POS', phone: '0615234567', salary: 500.00, status: 'active' },
      { id: 'ST-103', name: 'Ahmed Waiter', title: 'Senior Floor Waiter', department: 'Service/POS', phone: '0615345678', salary: 350.00, status: 'active' },
      { id: 'ST-104', name: 'Sahra Hassan', title: 'Executive Chef', department: 'Kitchen & Grill', phone: '0615456789', salary: 850.00, status: 'active' },
      { id: 'ST-105', name: 'Farhan Ali', title: 'Hall & Events Coordinator', department: 'Halls & Events', phone: '0615567890', salary: 600.00, status: 'active' },
      { id: 'ST-106', name: 'Khadra Nuur', title: 'Barista & Beverages', department: 'Cafeteria', phone: '0615678901', salary: 380.00, status: 'active' },
      { id: 'ST-107', name: 'Ilyas Guled', title: 'Grill Specialist', department: 'Kitchen & Grill', phone: '0615789012', salary: 550.00, status: 'active' }
    ];
  }

  loadSalaries() {
    const stored = localStorage.getItem(this.salariesDbKey);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      {
        id: 'PAY-8901',
        staffId: 'ST-102',
        staffName: 'Maryam Cashier',
        title: 'Head Cashier',
        department: 'Service/POS',
        month: 'September 2026',
        payDate: '2026-09-25',
        baseSalary: 500.00,
        bonus: 50.00,
        deduction: 0.00,
        netPay: 550.00,
        method: 'EVC Plus',
        refNumber: 'EVC-994821',
        status: 'paid',
        notes: 'Monthly on-time bonus'
      },
      {
        id: 'PAY-8902',
        staffId: 'ST-104',
        staffName: 'Sahra Hassan',
        title: 'Executive Chef',
        department: 'Kitchen & Grill',
        month: 'September 2026',
        payDate: '2026-09-25',
        baseSalary: 850.00,
        bonus: 100.00,
        deduction: 0.00,
        netPay: 950.00,
        method: 'Edahab',
        refNumber: 'ED-384102',
        status: 'paid',
        notes: 'Wedding banquet performance bonus'
      },
      {
        id: 'PAY-8903',
        staffId: 'ST-103',
        staffName: 'Ahmed Waiter',
        title: 'Senior Floor Waiter',
        department: 'Service/POS',
        month: 'September 2026',
        payDate: '2026-09-25',
        baseSalary: 350.00,
        bonus: 20.00,
        deduction: 15.00,
        netPay: 355.00,
        method: 'Cash',
        refNumber: 'CSH-0021',
        status: 'paid',
        notes: 'Deduction: Uniform replacement'
      }
    ];
  }

  loadSchedules() {
    const stored = localStorage.getItem(this.schedulesDbKey);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      { id: 'SCH-1', day: 'Monday', staffId: 'ST-102', staffName: 'Maryam Cashier', shift: 'Morning Shift (07:00 - 15:00)', role: 'Cashier Terminal 1' },
      { id: 'SCH-2', day: 'Monday', staffId: 'ST-104', staffName: 'Sahra Hassan', shift: 'Morning Shift (07:00 - 15:00)', role: 'Kitchen Head' },
      { id: 'SCH-3', day: 'Monday', staffId: 'ST-103', staffName: 'Ahmed Waiter', shift: 'Evening Shift (15:00 - 23:00)', role: 'Dine-In Area' },
      { id: 'SCH-4', day: 'Tuesday', staffId: 'ST-105', staffName: 'Farhan Ali', shift: 'Event Shift (16:00 - 00:00)', role: 'Hall 1 Banquet' },
      { id: 'SCH-5', day: 'Wednesday', staffId: 'ST-106', staffName: 'Khadra Nuur', shift: 'Morning Shift (07:00 - 15:00)', role: 'Coffee & Drinks' },
      { id: 'SCH-6', day: 'Friday', staffId: 'ST-107', staffName: 'Ilyas Guled', shift: 'Evening Shift (15:00 - 23:00)', role: 'Grill & BBQ' },
      { id: 'SCH-7', day: 'Saturday', staffId: 'ST-105', staffName: 'Farhan Ali', shift: 'Event Shift (16:00 - 00:00)', role: 'Hall 2 Wedding' }
    ];
  }

  loadJobTitles() {
    const stored = localStorage.getItem(this.jobTitlesDbKey);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      { id: 'JT-1', title: 'General Manager', department: 'Executive Management', baseSalary: 1200.00, count: 1, desc: 'Overall operations, system administration & finances' },
      { id: 'JT-2', title: 'Executive Chef', department: 'Kitchen & Grill', baseSalary: 850.00, count: 1, desc: 'Culinary standards, food safety and recipe management' },
      { id: 'JT-3', title: 'Head Cashier', department: 'Service/POS', baseSalary: 500.00, count: 2, desc: 'POS checkout, shift reconciliation, and receipt processing' },
      { id: 'JT-4', title: 'Hall & Events Coordinator', department: 'Halls & Events', baseSalary: 600.00, count: 1, desc: 'Hall 1 and Hall 2 event reservations, seating & guest logistics' },
      { id: 'JT-5', title: 'Grill Specialist', department: 'Kitchen & Grill', baseSalary: 550.00, count: 2, desc: 'Somali grills, steaks, fish and chicken preparation' },
      { id: 'JT-6', title: 'Senior Floor Waiter', department: 'Service/POS', baseSalary: 350.00, count: 4, desc: 'Table service, order taking and customer satisfaction' },
      { id: 'JT-7', title: 'Barista & Beverages', department: 'Cafeteria', baseSalary: 380.00, count: 2, desc: 'Specialty coffee, Somali spiced tea, smoothies and juices' },
      { id: 'JT-8', title: 'Kitchen Porter / Cleaner', department: 'Hygiene & Logistics', baseSalary: 280.00, count: 3, desc: 'Sanitization, dishwashing and hall turnover clean up' }
    ];
  }

  saveAll() {
    localStorage.setItem(this.staffDbKey, JSON.stringify(this.staffList));
    localStorage.setItem(this.salariesDbKey, JSON.stringify(this.salaryRecords));
    localStorage.setItem(this.schedulesDbKey, JSON.stringify(this.schedules));
    localStorage.setItem(this.jobTitlesDbKey, JSON.stringify(this.jobTitles));
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="hr-module-wrap space-y-6 text-white pb-12">
        
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-user-tie text-blue-500"></i> Human Resource (HR) Management
            </h2>
            <p class="text-xs text-slate-300 font-bold mt-0.5">Staff Payroll, Salary Reports, Weekly Shift Rosters &amp; Job Title Classifications</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="bg-blue-600/20 text-blue-300 border border-blue-500/40 text-xs px-3.5 py-1.5 rounded-full font-extrabold flex items-center gap-1.5">
              <i class="fa-solid fa-users text-blue-400"></i> ${this.staffList.length} Active Employees
            </span>
          </div>
        </div>

        <!-- HR Sub-Tab Navigation Bar -->
        <div class="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button class="hr-nav-btn px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${this.activeTab === 'pay-salary' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'}" data-tab="pay-salary">
            <i class="fa-solid fa-money-check-dollar"></i> Pay Salary
          </button>
          <button class="hr-nav-btn px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${this.activeTab === 'salary-report' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'}" data-tab="salary-report">
            <i class="fa-solid fa-file-invoice-dollar"></i> Salary Report
          </button>
          <button class="hr-nav-btn px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${this.activeTab === 'weekly-schedule' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'}" data-tab="weekly-schedule">
            <i class="fa-solid fa-calendar-week"></i> Weekly Schedule
          </button>
          <button class="hr-nav-btn px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${this.activeTab === 'job-titles' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'}" data-tab="job-titles">
            <i class="fa-solid fa-id-badge"></i> Job Title List
          </button>
        </div>

        <!-- Tab Content View Container -->
        <div id="hr-tab-content">
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
      case 'pay-salary':
        return this.renderPaySalaryTab();
      case 'salary-report':
        return this.renderSalaryReportTab();
      case 'weekly-schedule':
        return this.renderWeeklyScheduleTab();
      case 'job-titles':
        return this.renderJobTitlesTab();
      default:
        return this.renderPaySalaryTab();
    }
  }

  // ================= 1. PAY SALARY TAB =================
  renderPaySalaryTab() {
    const totalPayroll = this.staffList.reduce((sum, s) => sum + s.salary, 0);

    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Pay Form Card -->
        <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <h3 class="text-base font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-hand-holding-dollar text-emerald-400"></i> Process Staff Salary Payout
            </h3>
            <span class="text-xs font-bold text-slate-400 font-mono">Current Month: September 2026</span>
          </div>

          <form id="hr-pay-salary-form" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Select Employee *</label>
                <select id="hr-pay-staff-select" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-blue-500">
                  <option value="">-- Choose Staff Member --</option>
                  ${this.staffList.map(s => `
                    <option value="${s.id}" data-salary="${s.salary}" data-name="${s.name}" data-title="${s.title}" data-dept="${s.department}">
                      ${s.name} • ${s.title} ($${s.salary.toFixed(2)})
                    </option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Salary Month / Period *</label>
                <select id="hr-pay-month" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-blue-500">
                  <option value="September 2026" selected>September 2026</option>
                  <option value="October 2026">October 2026</option>
                  <option value="November 2026">November 2026</option>
                  <option value="August 2026">August 2026</option>
                </select>
              </div>
            </div>

            <!-- Salary Breakdown Calculations -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <label class="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Base Salary ($)</label>
                <input type="number" step="0.01" id="hr-pay-base" required value="0.00" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold outline-none focus:border-blue-500" />
              </div>
              <div>
                <label class="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Bonus / Overtime ($)</label>
                <input type="number" step="0.01" id="hr-pay-bonus" value="0.00" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono font-bold outline-none focus:border-blue-500" />
              </div>
              <div>
                <label class="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Deductions / Advance ($)</label>
                <input type="number" step="0.01" id="hr-pay-deduction" value="0.00" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-red-400 font-mono font-bold outline-none focus:border-blue-500" />
              </div>
            </div>

            <!-- Net Pay Highlight -->
            <div class="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/40 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span class="text-xs font-black uppercase text-blue-300 tracking-wider">Net Amount Payable</span>
                <p class="text-[11px] text-slate-400">Base Salary + Bonus - Deductions</p>
              </div>
              <span id="hr-pay-net-display" class="text-2xl font-black text-amber-400 font-mono">$0.00</span>
            </div>

            <!-- Payment Method & Reference -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Payment Method *</label>
                <select id="hr-pay-method" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-blue-500">
                  <option value="EVC Plus">EVC Plus (*789*...#)</option>
                  <option value="Edahab">Edahab (*113*...#)</option>
                  <option value="Premier Wallet">Premier Wallet / Bank</option>
                  <option value="Cash">Cash in Hand</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Transaction Ref / Phone</label>
                <input type="text" id="hr-pay-ref" placeholder="e.g. 615001234 or Ref #4892" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1">Notes / Description</label>
              <input type="text" id="hr-pay-notes" placeholder="e.g. September salary paid in full" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium outline-none focus:border-blue-500" />
            </div>

            <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2">
              <i class="fa-solid fa-check-circle"></i> Confirm &amp; Pay Salary (Generate Payslip)
            </button>
          </form>
        </div>

        <!-- Sidebar Summary Cards -->
        <div class="space-y-4">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h4 class="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
              <i class="fa-solid fa-chart-pie text-blue-400"></i> Monthly Payroll Budget
            </h4>
            <div class="space-y-3">
              <div class="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span class="text-xs text-slate-300 font-bold">Total Staff Count</span>
                <span class="text-base font-black text-white font-mono">${this.staffList.length}</span>
              </div>
              <div class="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span class="text-xs text-slate-300 font-bold">Total Monthly Base</span>
                <span class="text-base font-black text-amber-400 font-mono">$${totalPayroll.toFixed(2)}</span>
              </div>
              <div class="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span class="text-xs text-slate-300 font-bold">Paid This Month</span>
                <span class="text-base font-black text-emerald-400 font-mono">
                  $${this.salaryRecords.filter(r => r.month.includes('September')).reduce((s, r) => s + r.netPay, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Staff Directory Card -->
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Staff Pay Quick-List</h4>
              <button id="btn-open-add-staff" class="text-xs text-blue-400 hover:text-blue-300 font-bold">+ New Staff</button>
            </div>
            <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
              ${this.staffList.map(s => `
                <div class="flex items-center justify-between p-2.5 bg-slate-950/70 hover:bg-slate-950 rounded-xl border border-slate-800/60 transition-colors">
                  <div>
                    <strong class="block text-xs font-bold text-white">${s.name}</strong>
                    <span class="text-[10px] text-slate-400">${s.title}</span>
                  </div>
                  <span class="text-xs font-black font-mono text-emerald-400">$${s.salary.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // ================= 2. SALARY REPORT TAB =================
  renderSalaryReportTab() {
    const totalPaid = this.salaryRecords.reduce((sum, r) => sum + r.netPay, 0);
    const totalBonus = this.salaryRecords.reduce((sum, r) => sum + (r.bonus || 0), 0);
    const totalDeductions = this.salaryRecords.reduce((sum, r) => sum + (r.deduction || 0), 0);

    return `
      <div class="space-y-6">
        
        <!-- Summary KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/30">
              <i class="fa-solid fa-sack-dollar"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Disbursed</p>
              <h3 class="text-xl font-black text-white font-mono mt-0.5">$${totalPaid.toFixed(2)}</h3>
            </div>
          </div>

          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
            <div class="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold border border-blue-500/30">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Salary Vouchers</p>
              <h3 class="text-xl font-black text-white font-mono mt-0.5">${this.salaryRecords.length}</h3>
            </div>
          </div>

          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
            <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold border border-amber-500/30">
              <i class="fa-solid fa-gift"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bonuses</p>
              <h3 class="text-xl font-black text-white font-mono mt-0.5">$${totalBonus.toFixed(2)}</h3>
            </div>
          </div>

          <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
            <div class="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center text-xl font-bold border border-red-500/30">
              <i class="fa-solid fa-file-invoice"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Deductions</p>
              <h3 class="text-xl font-black text-white font-mono mt-0.5">$${totalDeductions.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <!-- Salary Report Table -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 class="text-sm font-black text-white flex items-center gap-2">
                <i class="fa-solid fa-table-list text-blue-400"></i> Staff Salary Payout History &amp; Vouchers
              </h3>
              <p class="text-[11px] text-slate-400 font-medium">Official salary vouchers and receipts record</p>
            </div>
            <button id="btn-print-salary-report" class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
              <i class="fa-solid fa-print text-blue-400"></i> Print Full Salary Report
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th class="py-3 px-3">VOUCHER #</th>
                  <th class="py-3 px-3">EMPLOYEE</th>
                  <th class="py-3 px-3">DEPARTMENT</th>
                  <th class="py-3 px-3">PERIOD</th>
                  <th class="py-3 px-3">PAY DATE</th>
                  <th class="py-3 px-3">BASE</th>
                  <th class="py-3 px-3">BONUS</th>
                  <th class="py-3 px-3">DEDUCT</th>
                  <th class="py-3 px-3">NET PAY</th>
                  <th class="py-3 px-3">METHOD</th>
                  <th class="py-3 px-3 text-right">PAYSLIP</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/70 font-medium">
                ${this.salaryRecords.map(r => `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-3 font-mono font-bold text-blue-400">${r.id}</td>
                    <td class="py-3 px-3">
                      <strong class="block text-white font-bold">${r.staffName}</strong>
                      <span class="text-[10px] text-slate-400">${r.title}</span>
                    </td>
                    <td class="py-3 px-3 text-slate-300">${r.department}</td>
                    <td class="py-3 px-3 text-slate-300">${r.month}</td>
                    <td class="py-3 px-3 font-mono text-slate-300">${r.payDate}</td>
                    <td class="py-3 px-3 font-mono text-white">$${r.baseSalary.toFixed(2)}</td>
                    <td class="py-3 px-3 font-mono text-emerald-400">+$${r.bonus.toFixed(2)}</td>
                    <td class="py-3 px-3 font-mono text-red-400">-$${r.deduction.toFixed(2)}</td>
                    <td class="py-3 px-3 font-mono font-black text-amber-400 text-sm">$${r.netPay.toFixed(2)}</td>
                    <td class="py-3 px-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        ${r.method}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-right">
                      <button class="btn-print-payslip px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all" data-id="${r.id}">
                        <i class="fa-solid fa-receipt text-blue-400"></i> Payslip
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

  // ================= 3. WEEKLY SCHEDULE TAB =================
  renderWeeklyScheduleTab() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return `
      <div class="space-y-6">
        
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="text-base font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-calendar-days text-blue-400"></i> 7-Day Staff Shift Roster
            </h3>
            <p class="text-xs text-slate-400">Schedule shifts for Kitchen, Cashier, Floor Waiters, and Banquet Halls</p>
          </div>
          <button id="btn-open-add-shift" class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all">
            <i class="fa-solid fa-plus-circle"></i> + Assign Shift
          </button>
        </div>

        <!-- 7-Day Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          ${days.map(day => {
            const daySchedules = this.schedules.filter(s => s.day.toLowerCase() === day.toLowerCase());

            return `
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col min-h-[300px] shadow-lg">
                <div class="pb-2 border-b border-slate-800 mb-3 flex items-center justify-between">
                  <span class="font-black text-xs text-white uppercase tracking-wider">${day}</span>
                  <span class="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-black text-blue-400 flex items-center justify-center">
                    ${daySchedules.length}
                  </span>
                </div>

                <div class="space-y-2 flex-1 overflow-y-auto">
                  ${daySchedules.length === 0 ? `
                    <div class="h-32 flex flex-col items-center justify-center text-slate-500 text-center">
                      <i class="fa-regular fa-calendar text-slate-600 text-xl mb-1"></i>
                      <span class="text-[10px] font-bold">No shifts assigned</span>
                    </div>
                  ` : daySchedules.map(s => `
                    <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-blue-500/50 transition-all group">
                      <div class="flex justify-between items-start">
                        <strong class="text-xs font-extrabold text-white leading-tight block">${s.staffName}</strong>
                        <button class="btn-delete-shift text-slate-600 hover:text-red-400 text-[10px]" data-id="${s.id}" title="Remove Shift">
                          <i class="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                      <span class="inline-block mt-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        ${s.shift}
                      </span>
                      <p class="text-[10px] text-slate-400 font-medium mt-1">${s.role}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  }

  // ================= 4. JOB TITLE LIST TAB =================
  renderJobTitlesTab() {
    return `
      <div class="space-y-6">
        
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="text-base font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-id-badge text-blue-400"></i> Restaurant Job Titles &amp; Department Structure
            </h3>
            <p class="text-xs text-slate-400">Standard job classifications, base salary brackets &amp; allocated staff</p>
          </div>
          <button id="btn-open-add-job-title" class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all">
            <i class="fa-solid fa-plus-circle"></i> + Add Job Title
          </button>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th class="py-3 px-3">CODE</th>
                  <th class="py-3 px-3">JOB TITLE</th>
                  <th class="py-3 px-3">DEPARTMENT</th>
                  <th class="py-3 px-3">RESPONSIBILITIES</th>
                  <th class="py-3 px-3">BASE SALARY</th>
                  <th class="py-3 px-3">STAFF COUNT</th>
                  <th class="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/70 font-medium">
                ${this.jobTitles.map(j => `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3 px-3 font-mono font-bold text-blue-400">${j.id}</td>
                    <td class="py-3 px-3">
                      <strong class="text-white font-extrabold text-xs">${j.title}</strong>
                    </td>
                    <td class="py-3 px-3">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        ${j.department}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-slate-400 max-w-xs truncate">${j.desc || '-'}</td>
                    <td class="py-3 px-3 font-mono font-bold text-emerald-400">$${Number(j.baseSalary).toFixed(2)}</td>
                    <td class="py-3 px-3 font-mono text-white">${j.count} staff</td>
                    <td class="py-3 px-3 text-right">
                      <button class="btn-delete-job-title text-slate-400 hover:text-red-400 text-xs p-1" data-id="${j.id}" title="Delete">
                        <i class="fa-solid fa-trash-can"></i>
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
      <!-- 1. Add Staff Modal -->
      <div id="hr-add-staff-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-user-plus text-blue-400"></i> Add New Employee
            </h3>
            <button onclick="document.getElementById('hr-add-staff-modal').classList.add('hidden')" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form id="hr-add-staff-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-300 mb-1">Full Name *</label>
              <input type="text" id="hr-staff-name" required placeholder="e.g. Hassan Cali" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Job Title *</label>
              <select id="hr-staff-title" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500">
                ${this.jobTitles.map(j => `<option value="${j.title}" data-dept="${j.department}" data-sal="${j.baseSalary}">${j.title}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Phone Number *</label>
              <input type="text" id="hr-staff-phone" required placeholder="e.g. 0615112233" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Base Monthly Salary ($ USD) *</label>
              <input type="number" step="10" id="hr-staff-salary" required value="400" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold outline-none focus:border-blue-500" />
            </div>
            <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-3 shadow-md transition-all">
              Save Employee
            </button>
          </form>
        </div>
      </div>

      <!-- 2. Assign Shift Modal -->
      <div id="hr-add-shift-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-calendar-plus text-blue-400"></i> Assign Weekly Shift
            </h3>
            <button onclick="document.getElementById('hr-add-shift-modal').classList.add('hidden')" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form id="hr-add-shift-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-300 mb-1">Day of Week *</label>
              <select id="hr-shift-day" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500">
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Staff Member *</label>
              <select id="hr-shift-staff" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500">
                ${this.staffList.map(s => `<option value="${s.id}" data-name="${s.name}">${s.name} (${s.title})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Shift Timing *</label>
              <select id="hr-shift-timing" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500">
                <option value="Morning Shift (07:00 - 15:00)">Morning Shift (07:00 - 15:00)</option>
                <option value="Evening Shift (15:00 - 23:00)">Evening Shift (15:00 - 23:00)</option>
                <option value="Event Shift (16:00 - 00:00)">Event Shift (16:00 - 00:00)</option>
                <option value="Night Prep Shift (23:00 - 07:00)">Night Prep Shift (23:00 - 07:00)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Assigned Station / Role</label>
              <input type="text" id="hr-shift-role" placeholder="e.g. Main Kitchen, POS 1, Hall 1" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500" />
            </div>
            <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-3 shadow-md transition-all">
              Save Shift Schedule
            </button>
          </form>
        </div>
      </div>

      <!-- 3. Add Job Title Modal -->
      <div id="hr-add-job-title-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-id-badge text-blue-400"></i> Add New Job Title
            </h3>
            <button onclick="document.getElementById('hr-add-job-title-modal').classList.add('hidden')" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form id="hr-add-job-title-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-300 mb-1">Job Title Name *</label>
              <input type="text" id="hr-new-title-name" required placeholder="e.g. Assistant Baker" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Department *</label>
              <select id="hr-new-title-dept" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500">
                <option value="Service/POS">Service/POS</option>
                <option value="Kitchen & Grill">Kitchen & Grill</option>
                <option value="Halls & Events">Halls & Events</option>
                <option value="Cafeteria">Cafeteria</option>
                <option value="Executive Management">Executive Management</option>
                <option value="Hygiene & Logistics">Hygiene & Logistics</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Base Monthly Salary ($ USD)</label>
              <input type="number" step="10" id="hr-new-title-salary" value="350" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block font-bold text-slate-300 mb-1">Description</label>
              <input type="text" id="hr-new-title-desc" placeholder="e.g. Supports pastry chef and inventory" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-blue-500" />
            </div>
            <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-3 shadow-md transition-all">
              Save Job Title
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
      const navBtn = e.target.closest('.hr-nav-btn');
      if (navBtn) {
        this.activeTab = navBtn.dataset.tab;
        this.render();
        return;
      }

      // Open Add Staff Modal
      if (e.target.closest('#btn-open-add-staff')) {
        document.getElementById('hr-add-staff-modal')?.classList.remove('hidden');
        return;
      }

      // Open Add Shift Modal
      if (e.target.closest('#btn-open-add-shift')) {
        document.getElementById('hr-add-shift-modal')?.classList.remove('hidden');
        return;
      }

      // Open Add Job Title Modal
      if (e.target.closest('#btn-open-add-job-title')) {
        document.getElementById('hr-add-job-title-modal')?.classList.remove('hidden');
        return;
      }

      // Delete Shift
      const delShiftBtn = e.target.closest('.btn-delete-shift');
      if (delShiftBtn) {
        const id = delShiftBtn.dataset.id;
        this.schedules = this.schedules.filter(s => s.id !== id);
        this.saveAll();
        this.render();
        return;
      }

      // Delete Job Title
      const delJobBtn = e.target.closest('.btn-delete-job-title');
      if (delJobBtn) {
        const id = delJobBtn.dataset.id;
        this.jobTitles = this.jobTitles.filter(j => j.id !== id);
        this.saveAll();
        this.render();
        return;
      }

      // Print Payslip
      const printSlipBtn = e.target.closest('.btn-print-payslip');
      if (printSlipBtn) {
        const id = printSlipBtn.dataset.id;
        const record = this.salaryRecords.find(r => r.id === id);
        if (record) this.printPayslip(record);
        return;
      }

      // Print Full Salary Report
      if (e.target.closest('#btn-print-salary-report')) {
        this.printSalaryReport();
        return;
      }
    });

    // Handle Employee Selection in Pay Salary Tab
    root.addEventListener('change', (e) => {
      if (e.target.id === 'hr-pay-staff-select') {
        const opt = e.target.selectedOptions[0];
        if (opt) {
          const sal = parseFloat(opt.dataset.salary) || 0;
          const baseInput = document.getElementById('hr-pay-base');
          if (baseInput) baseInput.value = sal.toFixed(2);
          this.recalculateNetPay();
        }
      }
    });

    // Handle Live Calculation in Pay Salary Form
    root.addEventListener('input', (e) => {
      if (['hr-pay-base', 'hr-pay-bonus', 'hr-pay-deduction'].includes(e.target.id)) {
        this.recalculateNetPay();
      }
    });

    // Handle Pay Salary Form Submit
    root.addEventListener('submit', (e) => {
      if (e.target.id === 'hr-pay-salary-form') {
        e.preventDefault();
        this.processSalaryPayment();
      } else if (e.target.id === 'hr-add-staff-form') {
        e.preventDefault();
        this.saveNewStaff();
      } else if (e.target.id === 'hr-add-shift-form') {
        e.preventDefault();
        this.saveNewShift();
      } else if (e.target.id === 'hr-add-job-title-form') {
        e.preventDefault();
        this.saveNewJobTitle();
      }
    });
  }

  recalculateNetPay() {
    const base = parseFloat(document.getElementById('hr-pay-base')?.value) || 0;
    const bonus = parseFloat(document.getElementById('hr-pay-bonus')?.value) || 0;
    const deduction = parseFloat(document.getElementById('hr-pay-deduction')?.value) || 0;
    const net = Math.max(0, base + bonus - deduction);

    const netDisplay = document.getElementById('hr-pay-net-display');
    if (netDisplay) {
      netDisplay.textContent = `$${net.toFixed(2)}`;
    }
  }

  processSalaryPayment() {
    const select = document.getElementById('hr-pay-staff-select');
    const opt = select.selectedOptions[0];
    if (!opt || !select.value) {
      alert('Please select an employee.');
      return;
    }

    const staffId = select.value;
    const staffName = opt.dataset.name;
    const title = opt.dataset.title;
    const department = opt.dataset.dept;
    const month = document.getElementById('hr-pay-month').value;
    const baseSalary = parseFloat(document.getElementById('hr-pay-base').value) || 0;
    const bonus = parseFloat(document.getElementById('hr-pay-bonus').value) || 0;
    const deduction = parseFloat(document.getElementById('hr-pay-deduction').value) || 0;
    const netPay = Math.max(0, baseSalary + bonus - deduction);
    const method = document.getElementById('hr-pay-method').value;
    const refNumber = document.getElementById('hr-pay-ref').value.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)}`;
    const notes = document.getElementById('hr-pay-notes').value.trim() || 'Monthly salary payment';

    const voucherId = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;

    const record = {
      id: voucherId,
      staffId,
      staffName,
      title,
      department,
      month,
      payDate: new Date().toISOString().slice(0, 10),
      baseSalary,
      bonus,
      deduction,
      netPay,
      method,
      refNumber,
      status: 'paid',
      notes
    };

    this.salaryRecords.unshift(record);
    this.saveAll();

    window.showToast?.(`Salary payout of $${netPay.toFixed(2)} recorded for ${staffName}!`, 'success');
    this.activeTab = 'salary-report';
    this.render();
    this.printPayslip(record);
  }

  saveNewStaff() {
    const name = document.getElementById('hr-staff-name').value.trim();
    const titleSelect = document.getElementById('hr-staff-title');
    const title = titleSelect.value;
    const department = titleSelect.selectedOptions[0]?.dataset.dept || 'Operations';
    const phone = document.getElementById('hr-staff-phone').value.trim();
    const salary = parseFloat(document.getElementById('hr-staff-salary').value) || 400;

    const newStaff = {
      id: `ST-${Date.now().toString().slice(-4)}`,
      name,
      title,
      department,
      phone,
      salary,
      status: 'active'
    };

    this.staffList.push(newStaff);
    this.saveAll();
    document.getElementById('hr-add-staff-modal')?.classList.add('hidden');
    window.showToast?.(`Employee ${name} added!`, 'success');
    this.render();
  }

  saveNewShift() {
    const day = document.getElementById('hr-shift-day').value;
    const staffSelect = document.getElementById('hr-shift-staff');
    const staffId = staffSelect.value;
    const staffName = staffSelect.selectedOptions[0]?.dataset.name || 'Staff';
    const shift = document.getElementById('hr-shift-timing').value;
    const role = document.getElementById('hr-shift-role').value.trim() || 'Standard Station';

    const newShift = {
      id: `SCH-${Date.now().toString().slice(-4)}`,
      day,
      staffId,
      staffName,
      shift,
      role
    };

    this.schedules.push(newShift);
    this.saveAll();
    document.getElementById('hr-add-shift-modal')?.classList.add('hidden');
    window.showToast?.(`Shift assigned to ${staffName}!`, 'success');
    this.render();
  }

  saveNewJobTitle() {
    const title = document.getElementById('hr-new-title-name').value.trim();
    const department = document.getElementById('hr-new-title-dept').value;
    const baseSalary = parseFloat(document.getElementById('hr-new-title-salary').value) || 350;
    const desc = document.getElementById('hr-new-title-desc').value.trim();

    const newTitle = {
      id: `JT-${this.jobTitles.length + 1}`,
      title,
      department,
      baseSalary,
      count: 0,
      desc
    };

    this.jobTitles.push(newTitle);
    this.saveAll();
    document.getElementById('hr-add-job-title-modal')?.classList.add('hidden');
    window.showToast?.(`Job Title "${title}" created!`, 'success');
    this.render();
  }

  printPayslip(record) {
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    if (!printWindow) {
      alert(`Salary Payslip for ${record.staffName}\nNet Pay: $${record.netPay.toFixed(2)}\nMethod: ${record.method}`);
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${record.staffName}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: 'Courier New', monospace; font-size: 13.5px; font-weight: 700; color: #000; padding: 10px; line-height: 1.5; }
          .center { text-align: center; }
          .title { font-size: 20px; font-weight: 900; }
          .sub { font-size: 12px; margin-bottom: 12px; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .bold { font-weight: 900; }
          .total { font-size: 18px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="title">HODMAN</div>
          <div class="sub">Restaurant Halls &amp; Cafeteria<br>STAFF SALARY PAYSLIP</div>
        </div>
        <div class="row"><span>Voucher Ref:</span><span class="bold">${record.id}</span></div>
        <div class="row"><span>Pay Date:</span><span>${record.payDate}</span></div>
        <div class="row"><span>Period:</span><span>${record.month}</span></div>
        <div class="row"><span>Employee:</span><span class="bold">${record.staffName}</span></div>
        <div class="row"><span>Job Title:</span><span>${record.title}</span></div>
        <div class="row"><span>Department:</span><span>${record.department}</span></div>
        <br>
        <div class="row"><span>Base Salary:</span><span>$${record.baseSalary.toFixed(2)}</span></div>
        <div class="row"><span>Bonus / OT:</span><span>+$${record.bonus.toFixed(2)}</span></div>
        <div class="row"><span>Deductions:</span><span>-$${record.deduction.toFixed(2)}</span></div>
        <div class="row total bold"><span>NET PAY:</span><span>$${record.netPay.toFixed(2)}</span></div>
        <div class="row"><span>Method:</span><span>${record.method}</span></div>
        <div class="row"><span>Ref:</span><span>${record.refNumber}</span></div>
        <br>
        <div class="center" style="margin-top: 15px;">
          <div>Received By: ___________________</div>
          <p style="font-size: 10px; margin-top: 10px;">DEV: Jookar</p>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  }

  printSalaryReport() {
    const totalPaid = this.salaryRecords.reduce((sum, r) => sum + r.netPay, 0);
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hodman - Salary Report</title>
        <style>
          body { font-family: 'Poppins', Arial, sans-serif; font-size: 13px; font-weight: 600; padding: 25px; color: #000; }
          .center { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f0f0f0; font-weight: 800; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2>HODMAN RESTAURANT HALLS &amp; CAFETERIA</h2>
          <h3>HUMAN RESOURCE - SALARY DISBURSEMENT REPORT</h3>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Voucher</th>
              <th>Employee</th>
              <th>Title</th>
              <th>Period</th>
              <th>Base</th>
              <th>Bonus</th>
              <th>Deduct</th>
              <th>Net Pay</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            ${this.salaryRecords.map(r => `
              <tr>
                <td>${r.id}</td>
                <td><strong>${r.staffName}</strong></td>
                <td>${r.title}</td>
                <td>${r.month}</td>
                <td>$${r.baseSalary.toFixed(2)}</td>
                <td>+$${r.bonus.toFixed(2)}</td>
                <td>-$${r.deduction.toFixed(2)}</td>
                <td><strong>$${r.netPay.toFixed(2)}</strong></td>
                <td>${r.method}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <h3 style="text-align: right; margin-top: 20px;">Total Payouts: $${totalPaid.toFixed(2)}</h3>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

window.initHr = () => {
  window.hrModule = new HumanResourceModule();
};
