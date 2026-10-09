/**
 * Hodman Restaurant System - Strict Authentication & Role-Based Access Control
 * Enforces PIN / Password verification before granting access to the system.
 */

class AuthModule {
  constructor() {
    this.selectedUser = null;
    this.pinBuffer = '';
    this.initElements();
    this.bindEvents();
    this.checkSession();
  }

  initElements() {
    // Lock / Login Modal
    this.loginModal = document.getElementById('login-modal');
    this.staffCardsContainer = document.getElementById('login-staff-cards');
    this.pinSection = document.getElementById('login-pin-section');
    this.selectedStaffAvatar = document.getElementById('login-selected-avatar');
    this.selectedStaffName = document.getElementById('login-selected-name');
    this.selectedStaffRole = document.getElementById('login-selected-role');
    this.pinInput = document.getElementById('login-pin-input');
    this.passwordInput = document.getElementById('login-password-input');
    this.btnUnlock = document.getElementById('btn-unlock-system');
    this.btnBackToStaffList = document.getElementById('btn-back-to-staff');
    this.btnBackToUsersTop = document.getElementById('btn-back-to-users-top');
    this.btnBackToUsersBottom = document.getElementById('btn-back-to-users-bottom');
    this.loginErrorEl = document.getElementById('login-error-msg');
    this.togglePasswordModeBtn = document.getElementById('btn-toggle-password-mode');

    // Switch User Modal
    this.switchUserModal = document.getElementById('switch-user-modal');
    this.switchStaffCardsContainer = document.getElementById('switch-staff-cards');

    // Navbar Elements
    this.navCenterContainer = document.getElementById('nav-center-tabs');
    this.userAvatarEl = document.getElementById('nav-user-avatar');
    this.userNameEl = document.getElementById('nav-user-name');
    this.userRoleBadgeEl = document.getElementById('nav-user-role-badge');
    this.btnSwitchUser = document.getElementById('btn-switch-user');
    this.btnLockTerminal = document.getElementById('btn-lock-terminal');
    this.btnLogout = document.getElementById('btn-logout');
  }

  bindEvents() {
    // Keypad numbers (0-9)
    document.querySelectorAll('.keypad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (this.pinInput && this.pinBuffer.length < 6) {
          this.pinBuffer += val;
          this.pinInput.value = this.pinBuffer;
        }
      });
    });

    // Keypad Backspace
    const btnBackspace = document.getElementById('keypad-btn-backspace');
    if (btnBackspace) {
      btnBackspace.addEventListener('click', () => {
        this.pinBuffer = this.pinBuffer.slice(0, -1);
        if (this.pinInput) this.pinInput.value = this.pinBuffer;
      });
    }

    // Keypad Clear
    const btnClear = document.getElementById('keypad-btn-clear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.clearPin();
      });
    }

    // Physical Keyboard input inside PIN field
    if (this.pinInput) {
      this.pinInput.addEventListener('input', (e) => {
        this.pinBuffer = e.target.value;
      });
      this.pinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.verifyAndLogin();
        }
      });
    }

    if (this.passwordInput) {
      this.passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.verifyAndLogin();
        }
      });
    }

    // Unlock Button
    if (this.btnUnlock) {
      this.btnUnlock.addEventListener('click', () => {
        this.verifyAndLogin();
      });
    }

    // Back buttons between users in PIN section
    [this.btnBackToStaffList, this.btnBackToUsersTop, this.btnBackToUsersBottom].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.showStaffSelectionScreen();
        });
      }
    });

    // Toggle between PIN and Password fields
    if (this.togglePasswordModeBtn) {
      this.togglePasswordModeBtn.addEventListener('click', () => {
        const pinWrapper = document.getElementById('pin-keypad-wrapper');
        const passWrapper = document.getElementById('password-input-wrapper');
        if (pinWrapper && passWrapper) {
          const isPin = !pinWrapper.classList.contains('hidden');
          pinWrapper.classList.toggle('hidden', isPin);
          passWrapper.classList.toggle('hidden', !isPin);
          this.togglePasswordModeBtn.textContent = isPin ? 'Use Numeric PIN Pad Instead' : 'Use Alphanumeric Password Instead';
        }
      });
    }

    // Navbar Switch User
    if (this.btnSwitchUser) {
      this.btnSwitchUser.addEventListener('click', () => {
        this.openSwitchUserModal();
      });
    }

    // Navbar Lock Terminal
    if (this.btnLockTerminal) {
      this.btnLockTerminal.addEventListener('click', () => {
        this.lockTerminal();
      });
    }

    // Navbar Logout
    if (this.btnLogout) {
      this.btnLogout.addEventListener('click', () => {
        this.logout();
      });
    }

    // Reactive DB updates on users
    window.restaurantDB.subscribe('users', () => {
      this.renderStaffCards();
    });
  }

  checkSession() {
    const isUnlocked = window.restaurantDB.isSessionUnlocked();
    const currentUser = window.restaurantDB.getCurrentUser();

    if (isUnlocked && currentUser) {
      this.hideLoginModal();
      this.renderNavbarForRole(currentUser);
      this.updateUserProfileDisplay(currentUser);
    } else {
      this.showLoginModal();
    }
  }

  showLoginModal() {
    if (!this.loginModal) return;
    this.loginModal.classList.remove('hidden');
    this.renderStaffCards();
    this.showStaffSelectionScreen();
  }

  hideLoginModal() {
    if (this.loginModal) {
      this.loginModal.classList.add('hidden');
    }
  }

  showStaffSelectionScreen() {
    this.selectedUser = null;
    this.clearPin();
    this.renderStaffCards();
    if (this.staffCardsContainer) this.staffCardsContainer.classList.remove('hidden');
    if (this.pinSection) this.pinSection.classList.add('hidden');
    if (this.loginErrorEl) this.loginErrorEl.classList.add('hidden');
  }

  selectStaffForPin(user) {
    this.selectedUser = user;
    this.clearPin();

    if (this.selectedStaffAvatar) this.selectedStaffAvatar.src = user.avatar;
    if (this.selectedStaffName) this.selectedStaffName.textContent = user.name;
    if (this.selectedStaffRole) {
      this.selectedStaffRole.textContent = `${user.title || user.role} (Default PIN: ${user.pin})`;
    }

    if (this.staffCardsContainer) this.staffCardsContainer.classList.add('hidden');
    if (this.pinSection) this.pinSection.classList.remove('hidden');
    if (this.loginErrorEl) this.loginErrorEl.classList.add('hidden');

    // Auto-focus PIN
    setTimeout(() => {
      this.pinInput?.focus();
    }, 100);
  }

  clearPin() {
    this.pinBuffer = '';
    if (this.pinInput) this.pinInput.value = '';
    if (this.passwordInput) this.passwordInput.value = '';
  }

  verifyAndLogin() {
    if (!this.selectedUser) return;

    const enteredPin = this.pinBuffer.trim();
    const enteredPass = this.passwordInput?.value.trim();

    const isPinCorrect = enteredPin && (enteredPin === this.selectedUser.pin);
    const isPassCorrect = enteredPass && (enteredPass === this.selectedUser.password);

    if (isPinCorrect || isPassCorrect) {
      window.restaurantDB.unlockSession(this.selectedUser);
      this.hideLoginModal();
      this.closeSwitchUserModal();
      this.renderNavbarForRole(this.selectedUser);
      this.updateUserProfileDisplay(this.selectedUser);
      window.showToast?.(`Authenticated as ${this.selectedUser.name} (${this.selectedUser.role.toUpperCase()})`, 'success');
      this.activateDefaultTab();
    } else {
      if (this.loginErrorEl) {
        this.loginErrorEl.textContent = `Incorrect PIN or Password for ${this.selectedUser.name}! Access denied.`;
        this.loginErrorEl.classList.remove('hidden');
      }
      this.clearPin();

      const box = document.getElementById('login-box');
      box?.classList.add('animate-shake');
      setTimeout(() => box?.classList.remove('animate-shake'), 500);
    }
  }

  lockTerminal() {
    window.restaurantDB.lockSession();
    window.showToast?.('Terminal locked.', 'info');
    const currentUser = window.restaurantDB.getCurrentUser();
    this.showLoginModal();
    if (currentUser) {
      this.selectStaffForPin(currentUser);
    }
  }

  logout() {
    window.restaurantDB.setCurrentUser(null);
    window.restaurantDB.lockSession();
    window.showToast?.('Logged out from system.', 'info');
    this.showLoginModal();
  }

  openSwitchUserModal() {
    if (!this.switchUserModal) return;
    this.renderSwitchCards();
    this.switchUserModal.classList.remove('hidden');
  }

  closeSwitchUserModal() {
    if (this.switchUserModal) {
      this.switchUserModal.classList.add('hidden');
    }
  }

  renderStaffCards() {
    if (!this.staffCardsContainer) return;
    const users = window.restaurantDB.getUsers();

    this.staffCardsContainer.innerHTML = users.map(u => `
      <div 
        class="staff-login-card p-4 rounded-2xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800/80 hover:border-blue-500/50 cursor-pointer transition-all flex items-center justify-between group"
        data-id="${u.id}"
      >
        <div class="flex items-center gap-3.5">
          <img src="${u.avatar}" class="w-12 h-12 rounded-xl object-cover border border-slate-700 group-hover:scale-105 transition-transform" />
          <div>
            <h4 class="font-extrabold text-sm text-white group-hover:text-blue-400 transition-colors">${u.name}</h4>
            <span class="text-xs text-slate-400">${u.title || u.role}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
            u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
            u.role === 'cashier' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
            'bg-blue-500/20 text-blue-300 border border-blue-500/40'
          }">
            ${u.role}
          </span>
          <i class="fa-solid fa-lock text-slate-500 text-xs group-hover:text-blue-400"></i>
        </div>
      </div>
    `).join('');

    this.staffCardsContainer.querySelectorAll('.staff-login-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const user = window.restaurantDB.getUserById(id);
        if (user) {
          this.selectStaffForPin(user);
        }
      });
    });
  }

  renderSwitchCards() {
    if (!this.switchStaffCardsContainer) return;
    const users = window.restaurantDB.getUsers();

    this.switchStaffCardsContainer.innerHTML = users.map(u => `
      <div 
        class="switch-staff-card p-3 rounded-2xl border border-slate-800 bg-slate-950 hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between group"
        data-id="${u.id}"
      >
        <div class="flex items-center gap-3">
          <img src="${u.avatar}" class="w-10 h-10 rounded-xl object-cover border border-slate-700" />
          <div>
            <h4 class="font-bold text-xs text-white group-hover:text-blue-400 transition-colors">${u.name}</h4>
            <span class="text-[11px] text-slate-400">${u.title || u.role}</span>
          </div>
        </div>
        <span class="text-xs text-slate-400 group-hover:text-blue-400 flex items-center gap-1 font-mono">
          <i class="fa-solid fa-key text-[10px]"></i> Require PIN
        </span>
      </div>
    `).join('');

    this.switchStaffCardsContainer.querySelectorAll('.switch-staff-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const user = window.restaurantDB.getUserById(id);
        if (user) {
          this.closeSwitchUserModal();
          this.showLoginModal();
          this.selectStaffForPin(user);
        }
      });
    });
  }

  updateUserProfileDisplay(user) {
    if (this.userNameEl) this.userNameEl.textContent = user.name;
    if (this.userAvatarEl) this.userAvatarEl.src = user.avatar;

    if (this.userRoleBadgeEl) {
      let badgeHtml = '';
      switch (user.role) {
        case 'admin':
          badgeHtml = `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <i class="fa-solid fa-shield-halved text-amber-400 text-[9px]"></i> Admin
            </span>
          `;
          break;
        case 'cashier':
          badgeHtml = `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <i class="fa-solid fa-cash-register text-emerald-400 text-[9px]"></i> Cashier
            </span>
          `;
          break;
        case 'waiter':
          badgeHtml = `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              <i class="fa-solid fa-bell-concierge text-blue-400 text-[9px]"></i> Waiter
            </span>
          `;
          break;
      }
      this.userRoleBadgeEl.innerHTML = badgeHtml;
    }
  }

  renderNavbarForRole(user) {
    if (!this.navCenterContainer) return;

    // No Kitchen Queue tab! The restaurant uses physical receipt printers.
    let tabs = [];
    if (user.role === 'admin') {
      tabs = [
        { id: 'dashboard', name: 'Dashboard', icon: 'fa-gauge-high' },
        { id: 'pos', name: 'POS Terminal', icon: 'fa-cash-register', badgeId: 'pos-cart-badge' },
        { id: 'unpaid', name: 'Unpaid / Furan', icon: 'fa-file-invoice-dollar', badgeClass: 'unpaid-orders-badge' },
        { id: 'purchase', name: 'Purchase', icon: 'fa-truck-field' },
        { id: 'inventory', name: 'Inventory Management', icon: 'fa-boxes-stacked' },
        { id: 'crm', name: 'Customers (CRM)', icon: 'fa-users-rectangle' },
        { id: 'hr', name: 'Human Resource', icon: 'fa-user-tie' },
        { id: 'halls', name: 'Halls Management', icon: 'fa-building' },
        { id: 'reports', name: 'Sales & Register Reports', icon: 'fa-chart-pie' },
        { id: 'admin', name: 'Admin & Users', icon: 'fa-user-gear' }
      ];
    } else if (user.role === 'cashier') {
      tabs = [
        { id: 'dashboard', name: 'Dashboard', icon: 'fa-gauge-high' },
        { id: 'pos', name: 'POS Cashier', icon: 'fa-cash-register', badgeId: 'pos-cart-badge' },
        { id: 'unpaid', name: 'Unpaid / Furan', icon: 'fa-file-invoice-dollar', badgeClass: 'unpaid-orders-badge' },
        { id: 'purchase', name: 'Purchase', icon: 'fa-truck-field' },
        { id: 'halls', name: 'Halls Management', icon: 'fa-building' },
        { id: 'crm', name: 'Customers (CRM)', icon: 'fa-users-rectangle' },
        { id: 'reports', name: 'Daily Register', icon: 'fa-receipt' },
        { id: 'inventory', name: 'Stock Levels', icon: 'fa-boxes-stacked' }
      ];
    } else if (user.role === 'waiter') {
      tabs = [
        { id: 'pos', name: 'Table Ordering (POS)', icon: 'fa-utensils', badgeId: 'pos-cart-badge' }
      ];
    }

    this.navCenterContainer.innerHTML = tabs.map((tab, idx) => `
      <button 
        class="nav-tab ${idx === 0 ? 'active bg-blue-600/20 text-blue-400 border-l-2 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-l-2 border-transparent'} w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all"
        data-view="${tab.id}"
      >
        <i class="fa-solid ${tab.icon} w-5 text-center"></i>
        <span>${tab.name}</span>
        ${tab.badgeId ? `<span id="${tab.badgeId}" class="hidden ml-auto px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-black">0</span>` : ''}
        ${tab.badgeClass ? `<span class="${tab.badgeClass} hidden ml-auto px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-black">0</span>` : ''}
      </button>
    `).join('');

    this.bindTabClickEvents();
  }

  bindTabClickEvents() {
    const navTabs = this.navCenterContainer.querySelectorAll('.nav-tab');
    const viewSections = {
      dashboard: document.getElementById('view-dashboard'),
      pos: document.getElementById('view-pos'),
      reports: document.getElementById('view-reports'),
      inventory: document.getElementById('view-inventory'),
      admin: document.getElementById('view-admin'),
      unpaid: document.getElementById('view-unpaid'),
      halls: document.getElementById('view-halls'),
      crm: document.getElementById('view-crm'),
      hr: document.getElementById('view-hr'),
      purchase: document.getElementById('view-purchase')
    };

    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.dataset.view;

        navTabs.forEach(t => {
          t.classList.remove('active', 'bg-blue-600/20', 'text-blue-400', 'border-blue-500');
          t.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/60', 'border-transparent');
        });

        tab.classList.add('active', 'bg-blue-600/20', 'text-blue-400', 'border-blue-500');
        tab.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/60', 'border-transparent');

        Object.entries(viewSections).forEach(([key, section]) => {
          if (section) {
            if (key === targetView) {
              section.classList.remove('hidden');
            } else {
              section.classList.add('hidden');
            }
          }
        });

        if (targetView === 'dashboard' && window.dashboardModule) {
          window.dashboardModule.render();
        } else if (targetView === 'reports' && window.reportsModule) {
          window.reportsModule.renderReports();
        } else if (targetView === 'inventory' && window.inventoryModule) {
          window.inventoryModule.renderInventoryView();
        } else if (targetView === 'admin' && window.adminModule) {
          window.adminModule.renderAdminView();
        } else if (targetView === 'unpaid' && window.unpaidModule) {
          window.unpaidModule.render();
        } else if (targetView === 'halls' && window.hallsModule) {
          window.hallsModule.renderHallsView();
        } else if (targetView === 'crm' && window.crmModule) {
          window.crmModule.render();
        } else if (targetView === 'hr' && window.hrModule) {
          window.hrModule.render();
        } else if (targetView === 'purchase' && window.purchaseModule) {
          window.purchaseModule.render();
        }
      });
    });
  }

  switchToView(viewId) {
    const tab = this.navCenterContainer?.querySelector(`[data-view="${viewId}"]`);
    if (tab) {
      tab.click();
    }
  }

  activateDefaultTab() {
    const firstTab = this.navCenterContainer?.querySelector('.nav-tab');
    if (firstTab) {
      firstTab.click();
    }
  }
}

window.initAuth = () => {
  window.authModule = new AuthModule();
};
