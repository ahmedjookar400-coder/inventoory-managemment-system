/**
 * Hodman Restaurant System - Admin, User Management & Menu Control
 * Manages staff users (CRUD: Add, Edit, Delete, Reset PIN), menu dishes, pricing, and restaurant settings.
 */

class AdminModule {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.populateDishCategories();
  }

  initElements() {
    // Menu
    this.menuTableBody = document.getElementById('admin-menu-table-body');
    this.addDishForm = document.getElementById('admin-add-dish-form');
    this.dishCategorySelect = document.getElementById('dish-category');
    this.btnToggleAddDishCat = document.getElementById('btn-toggle-add-dish-cat');
    this.dishCatCreateBox = document.getElementById('dish-cat-create-box');
    this.newDishCatNameInput = document.getElementById('new-dish-cat-name');
    this.btnSaveDishCat = document.getElementById('btn-save-dish-cat');
    this.btnCancelDishCat = document.getElementById('btn-cancel-dish-cat');

    // Users
    this.staffTableBody = document.getElementById('admin-staff-table-body');
    this.addUserModal = document.getElementById('admin-add-user-modal');
    this.addUserForm = document.getElementById('admin-add-user-form');
    this.btnOpenAddUser = document.getElementById('btn-open-add-user');
    this.btnCloseAddUser = document.getElementById('btn-close-add-user');

    // Edit User Modal
    this.editUserModal = document.getElementById('admin-edit-user-modal');
    this.editUserForm = document.getElementById('admin-edit-user-form');
    this.btnCloseEditUser = document.getElementById('btn-close-edit-user');

    // Settings
    this.settingsForm = document.getElementById('admin-settings-form');
    this.settingName = document.getElementById('setting-restaurant-name');
    this.settingAddress = document.getElementById('setting-restaurant-address');
    this.settingPhone = document.getElementById('setting-restaurant-phone');
    this.settingTax = document.getElementById('setting-tax-rate');
  }

  bindEvents() {
    // Add Dish Form
    if (this.addDishForm) {
      this.addDishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('dish-name')?.value.trim();
        let categoryId = document.getElementById('dish-category')?.value;
        const price = parseFloat(document.getElementById('dish-price')?.value);
        const image = document.getElementById('dish-image')?.value.trim();
        const description = document.getElementById('dish-desc')?.value.trim();

        if (!name || isNaN(price)) {
          alert('Please enter a valid dish name and price.');
          return;
        }

        if (categoryId === '__new__') {
          alert('Please select or create a valid category.');
          return;
        }

        const newItem = window.restaurantDB.addMenuItem({
          name,
          categoryId: categoryId || 'mains',
          price,
          image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
          description
        });

        this.addDishForm.reset();
        this.renderMenuItemsTable();
        window.showToast?.(`Dish "${newItem.name}" added to menu!`, 'success');
      });
    }

    // Toggle Category Creator Box
    if (this.btnToggleAddDishCat && this.dishCatCreateBox) {
      this.btnToggleAddDishCat.addEventListener('click', () => {
        this.dishCatCreateBox.classList.toggle('hidden');
        if (!this.dishCatCreateBox.classList.contains('hidden')) {
          this.newDishCatNameInput?.focus();
        }
      });
    }

    if (this.btnCancelDishCat && this.dishCatCreateBox) {
      this.btnCancelDishCat.addEventListener('click', () => {
        this.dishCatCreateBox.classList.add('hidden');
        if (this.newDishCatNameInput) this.newDishCatNameInput.value = '';
      });
    }

    // Dropdown change to __new__
    if (this.dishCategorySelect) {
      this.dishCategorySelect.addEventListener('change', () => {
        if (this.dishCategorySelect.value === '__new__') {
          this.dishCatCreateBox?.classList.remove('hidden');
          this.newDishCatNameInput?.focus();
        }
      });
    }

    // Save New Dish Category Button
    if (this.btnSaveDishCat) {
      this.btnSaveDishCat.addEventListener('click', () => {
        const catName = this.newDishCatNameInput?.value.trim();
        if (!catName) {
          alert('Please enter a category name.');
          return;
        }

        const newCat = window.restaurantDB.addCategory({ name: catName });
        if (newCat) {
          this.populateDishCategories(newCat.id);
          if (this.newDishCatNameInput) this.newDishCatNameInput.value = '';
          this.dishCatCreateBox?.classList.add('hidden');
          window.showToast?.(`New category "${newCat.name}" created!`, 'success');
        }
      });
    }

    // User Management: Open / Close Add User Modal
    if (this.btnOpenAddUser && this.addUserModal) {
      this.btnOpenAddUser.addEventListener('click', () => {
        this.addUserModal.classList.remove('hidden');
      });
    }
    if (this.btnCloseAddUser && this.addUserModal) {
      this.btnCloseAddUser.addEventListener('click', () => {
        this.addUserModal.classList.add('hidden');
      });
    }
    if (this.btnCloseEditUser && this.editUserModal) {
      this.btnCloseEditUser.addEventListener('click', () => {
        this.editUserModal.classList.add('hidden');
      });
    }

    // Add User Form Submit
    if (this.addUserForm) {
      this.addUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-user-name')?.value.trim();
        const username = document.getElementById('new-user-username')?.value.trim();
        const role = document.getElementById('new-user-role')?.value;
        const pin = document.getElementById('new-user-pin')?.value.trim();
        const password = document.getElementById('new-user-password')?.value.trim();
        const title = document.getElementById('new-user-title')?.value.trim();

        if (!name || !username || !pin) {
          alert('Please provide name, username, and a 4-digit PIN.');
          return;
        }

        const existingUsers = window.restaurantDB.getUsers();
        if (existingUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
          alert('Username already exists. Please choose another.');
          return;
        }

        window.restaurantDB.addUser({
          name,
          username,
          role,
          pin,
          password: password || '123456',
          title: title || `${role.toUpperCase()} Staff`
        });

        this.addUserForm.reset();
        this.addUserModal?.classList.add('hidden');
        this.renderStaffTable();
        window.showToast?.(`Staff account "${name}" created!`, 'success');
      });
    }

    // Edit User Form Submit
    if (this.editUserForm) {
      this.editUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-user-id')?.value;
        const name = document.getElementById('edit-user-name')?.value.trim();
        const role = document.getElementById('edit-user-role')?.value;
        const pin = document.getElementById('edit-user-pin')?.value.trim();
        const password = document.getElementById('edit-user-password')?.value.trim();
        const title = document.getElementById('edit-user-title')?.value.trim();

        if (!id || !name || !pin) {
          alert('Please fill out all required fields.');
          return;
        }

        window.restaurantDB.updateUser(id, {
          name,
          role,
          pin,
          password: password || '123456',
          title
        });

        this.editUserModal?.classList.add('hidden');
        this.renderStaffTable();
        window.showToast?.(`User profile "${name}" updated!`, 'success');
      });
    }

    // Settings Form
    if (this.settingsForm) {
      this.settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = this.settingName?.value.trim();
        const address = this.settingAddress?.value.trim();
        const phone = this.settingPhone?.value.trim();
        const taxRate = parseFloat(this.settingTax?.value) / 100;
        const evcMerchantCode = document.getElementById('setting-evc-code')?.value.trim();
        const edahabCode = document.getElementById('setting-edahab-code')?.value.trim();
        const premierWalletCode = document.getElementById('setting-premier-code')?.value.trim();
        const ebesaCode = document.getElementById('setting-ebesa-code')?.value.trim();

        window.restaurantDB.updateSettings({
          restaurantName: name,
          address,
          phone,
          taxRate: isNaN(taxRate) ? 0.05 : taxRate,
          ...(evcMerchantCode && { evcMerchantCode }),
          ...(edahabCode && { edahabCode }),
          ...(premierWalletCode && { premierWalletCode }),
          ...(ebesaCode && { ebesaCode })
        });

        window.showToast?.('Restaurant profile settings saved!', 'success');
      });
    }

    // Reactive DB updates
    window.restaurantDB.subscribe('menu', () => this.renderMenuItemsTable());
    window.restaurantDB.subscribe('users', () => this.renderStaffTable());
    window.restaurantDB.subscribe('categories', () => this.populateDishCategories());
  }

  renderAdminView() {
    this.populateDishCategories();
    this.renderMenuItemsTable();
    this.renderStaffTable();
    this.loadSettings();
  }

  populateDishCategories(selectedId = null) {
    if (!this.dishCategorySelect) return;
    const categories = window.restaurantDB.getCategories();
    const dishCats = categories.filter(c => c.id !== 'all');

    const currentVal = selectedId || this.dishCategorySelect.value;
    this.dishCategorySelect.innerHTML = dishCats.map(c => `
      <option value="${c.id}">${c.name}</option>
    `).join('') + `
      <option value="__new__">+ Create New Category...</option>
    `;

    if (currentVal && dishCats.some(c => c.id === currentVal)) {
      this.dishCategorySelect.value = currentVal;
    } else if (dishCats.length > 0) {
      this.dishCategorySelect.value = dishCats[0].id;
    }
  }

  renderMenuItemsTable() {
    if (!this.menuTableBody) return;
    const menu = window.restaurantDB.getMenu();

    this.menuTableBody.innerHTML = menu.map(item => `
      <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 text-xs">
        <td class="py-2.5 px-3">
          <div class="flex items-center gap-3">
            <img src="${item.image}" alt="${item.name}" class="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-700/60" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'">
            <div>
              <div class="font-bold text-white">${item.name}</div>
              <div class="text-[10px] text-slate-400 capitalize">${item.categoryId.replace('_', ' ')}</div>
            </div>
          </div>
        </td>
        <td class="py-2.5 px-3 font-mono font-bold text-orange-400">
          $${item.price.toFixed(2)}
        </td>
        <td class="py-2.5 px-3">
          <button 
            class="btn-toggle-availability px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
              item.available 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400' 
                : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-emerald-500/20 hover:text-emerald-400'
            }"
            data-id="${item.id}"
          >
            ${item.available ? 'In Stock' : 'Out of Stock'}
          </button>
        </td>
        <td class="py-2.5 px-3 text-right space-x-2">
          <button 
            class="btn-edit-price text-slate-400 hover:text-orange-400 text-xs transition-colors"
            data-id="${item.id}"
            data-price="${item.price}"
            title="Edit price"
          >
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button 
            class="btn-delete-dish text-slate-500 hover:text-red-400 text-xs transition-colors"
            data-id="${item.id}"
            title="Delete dish"
          >
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // Wire buttons
    this.menuTableBody.querySelectorAll('.btn-toggle-availability').forEach(btn => {
      btn.addEventListener('click', () => {
        window.restaurantDB.toggleItemAvailability(btn.dataset.id);
      });
    });

    this.menuTableBody.querySelectorAll('.btn-edit-price').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const currentPrice = btn.dataset.price;
        const newPrice = prompt('Enter new price ($):', currentPrice);
        if (newPrice !== null && !isNaN(parseFloat(newPrice)) && parseFloat(newPrice) >= 0) {
          window.restaurantDB.updateMenuItem(id, { price: parseFloat(newPrice) });
          window.showToast?.('Dish price updated!', 'success');
        }
      });
    });

    this.menuTableBody.querySelectorAll('.btn-delete-dish').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Are you sure you want to remove this dish from the menu?')) {
          window.restaurantDB.deleteMenuItem(btn.dataset.id);
          window.showToast?.('Dish removed from menu.', 'info');
        }
      });
    });
  }

  renderStaffTable() {
    if (!this.staffTableBody) return;
    const users = window.restaurantDB.getUsers();

    this.staffTableBody.innerHTML = users.map(u => `
      <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 text-xs">
        <td class="py-3 px-3">
          <div class="flex items-center gap-3">
            <img src="${u.avatar}" class="w-9 h-9 rounded-xl object-cover border border-slate-700">
            <div>
              <span class="font-bold text-white text-sm">${u.name}</span>
              <div class="text-[11px] text-slate-400">${u.title || u.role}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-3 font-mono text-slate-300 font-semibold">${u.username}</td>
        <td class="py-3 px-3">
          <span class="font-mono font-bold text-orange-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 tracking-wider">
            ${u.pin}
          </span>
        </td>
        <td class="py-3 px-3">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
            u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
            u.role === 'cashier' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
            'bg-blue-500/20 text-blue-300 border border-blue-500/40'
          }">
            <i class="fa-solid ${
              u.role === 'admin' ? 'fa-shield-halved' :
              u.role === 'cashier' ? 'fa-cash-register' : 'fa-bell-concierge'
            } text-[9px]"></i>
            ${u.role}
          </span>
        </td>
        <td class="py-3 px-3 text-right space-x-1.5">
          <!-- Edit User -->
          <button 
            class="btn-edit-user bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs transition-colors border border-slate-700"
            data-id="${u.id}"
            title="Edit User Profile"
          >
            <i class="fa-solid fa-user-pen"></i> Edit
          </button>

          <!-- Delete User -->
          <button 
            class="btn-delete-user text-slate-500 hover:text-red-400 p-1 text-xs transition-colors"
            data-id="${u.id}"
            data-name="${u.name}"
            title="Delete User"
          >
            <i class="fa-solid fa-trash-can text-sm"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // Wire edit user buttons
    this.staffTableBody.querySelectorAll('.btn-edit-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const user = window.restaurantDB.getUserById(btn.dataset.id);
        if (user && this.editUserModal) {
          document.getElementById('edit-user-id').value = user.id;
          document.getElementById('edit-user-name').value = user.name;
          document.getElementById('edit-user-role').value = user.role;
          document.getElementById('edit-user-pin').value = user.pin;
          document.getElementById('edit-user-password').value = user.password;
          document.getElementById('edit-user-title').value = user.title || '';
          this.editUserModal.classList.remove('hidden');
        }
      });
    });

    // Wire delete user buttons
    this.staffTableBody.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        if (confirm(`Are you sure you want to delete staff user "${name}"?`)) {
          const res = window.restaurantDB.deleteUser(id);
          if (res.success) {
            window.showToast?.(`User "${name}" deleted.`, 'info');
          } else {
            alert(res.message || 'Could not delete user.');
          }
        }
      });
    });
  }

  loadSettings() {
    const settings = window.restaurantDB.getSettings();
    if (this.settingName) this.settingName.value = settings.restaurantName || '';
    if (this.settingAddress) this.settingAddress.value = settings.address || '';
    if (this.settingPhone) this.settingPhone.value = settings.phone || '';
    if (this.settingTax) this.settingTax.value = ((settings.taxRate || 0.05) * 100).toFixed(0);
    // Mobile money merchant codes
    const evcEl = document.getElementById('setting-evc-code');
    const edahabEl = document.getElementById('setting-edahab-code');
    const premierEl = document.getElementById('setting-premier-code');
    const ebesaEl = document.getElementById('setting-ebesa-code');
    if (evcEl) evcEl.value = settings.evcMerchantCode || '709275';
    if (edahabEl) edahabEl.value = settings.edahabCode || '099859';
    if (premierEl) premierEl.value = settings.premierWalletCode || '673836';
    if (ebesaEl) ebesaEl.value = settings.ebesaCode || '940396';
  }
}

window.initAdmin = () => {
  window.adminModule = new AdminModule();
};
