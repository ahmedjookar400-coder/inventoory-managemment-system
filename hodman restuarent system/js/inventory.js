/**
 * Hodman Restaurant System - Inventory Management Module
 * Upgraded with 4 Sub-Components:
 * 1) Item List (Directory, Stock Levels, Restock, Valuation)
 * 2) Used Items (Daily Ingredient Consumption & Usage Tracking)
 * 3) Updating Price Items (Fast Unit Cost & Price Adjustments)
 * 4) Inventory Adjustments (Audits, Spoilage, Damage, Expirations)
 */

class InventoryModule {
  constructor() {
    this.activeSubtab = 'items'; // 'items' | 'used' | 'prices' | 'adjustments'
    this.searchQuery = '';
    this.categoryFilter = 'all';
    this.statusFilter = 'all';

    this.initElements();
    this.bindEvents();
    this.populateCategories();
  }

  initElements() {
    this.kpiTotalItems = document.getElementById('inv-kpi-total');
    this.kpiInStock = document.getElementById('inv-kpi-instock');
    this.kpiLowStock = document.getElementById('inv-kpi-lowstock');
    this.kpiTotalValue = document.getElementById('inv-kpi-value');
    this.lowStockBanner = document.getElementById('inv-low-stock-banner');
    this.lowStockList = document.getElementById('inv-low-stock-list');

    this.inventoryTableBody = document.getElementById('inv-table-body');
    this.searchInput = document.getElementById('inv-search');
    this.categorySelect = document.getElementById('inv-category-filter');
    this.statusSelect = document.getElementById('inv-status-filter');

    // Modals
    this.addModal = document.getElementById('inv-add-modal');
    this.addForm = document.getElementById('inv-add-form');
    this.btnOpenAdd = document.getElementById('btn-open-add-inventory');
    this.btnCloseAdd = document.getElementById('btn-close-add-inventory');

    // Category Creator
    this.invItemCategorySelect = document.getElementById('inv-item-category');
    this.btnToggleAddInvCat = document.getElementById('btn-toggle-add-inv-cat');
    this.invCatCreateBox = document.getElementById('inv-cat-create-box');
    this.newInvCatNameInput = document.getElementById('new-inv-cat-name');
    this.btnSaveInvCat = document.getElementById('btn-save-inv-cat');
    this.btnCancelInvCat = document.getElementById('btn-cancel-inv-cat');

    // Standalone Category Creator Modal
    this.btnOpenCreateInvCat = document.getElementById('btn-open-create-inv-cat');
    this.invCreateCatModal = document.getElementById('inv-create-cat-modal');
    this.btnCloseCreateInvCatModal = document.getElementById('btn-close-create-inv-cat-modal');
    this.invStandaloneCatForm = document.getElementById('inv-standalone-cat-form');
    this.standaloneInvCatInput = document.getElementById('standalone-inv-cat-input');

    // Subtab containers
    this.subtabItems = document.getElementById('inv-subtab-items');
    this.subtabUsed = document.getElementById('inv-subtab-used');
    this.subtabPrices = document.getElementById('inv-subtab-prices');
    this.subtabAdjustments = document.getElementById('inv-subtab-adjustments');

    // Used Items & Adjustments bodies
    this.usedTableBody = document.getElementById('inv-used-table-body');
    this.pricesTableBody = document.getElementById('inv-prices-table-body');
    this.adjustmentsTableBody = document.getElementById('inv-adjustments-table-body');
  }

  bindEvents() {
    // Sub-tab Navigation Clicks
    document.querySelectorAll('.inv-subtab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = btn.dataset.tab;
        this.switchSubtab(targetTab);
      });
    });

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderTable();
      });
    }

    if (this.categorySelect) {
      this.categorySelect.addEventListener('change', (e) => {
        this.categoryFilter = e.target.value;
        this.renderTable();
      });
    }

    if (this.statusSelect) {
      this.statusSelect.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.renderTable();
      });
    }

    if (this.btnOpenAdd && this.addModal) {
      this.btnOpenAdd.addEventListener('click', () => {
        this.populateCategories();
        this.addModal.classList.remove('hidden');
      });
    }

    if (this.btnCloseAdd && this.addModal) {
      this.btnCloseAdd.addEventListener('click', () => {
        this.addModal.classList.add('hidden');
      });
    }

    // Toggle Inline Category Box in Add Modal
    if (this.btnToggleAddInvCat && this.invCatCreateBox) {
      this.btnToggleAddInvCat.addEventListener('click', () => {
        this.invCatCreateBox.classList.toggle('hidden');
        if (!this.invCatCreateBox.classList.contains('hidden')) {
          this.newInvCatNameInput?.focus();
        }
      });
    }

    if (this.btnCancelInvCat && this.invCatCreateBox) {
      this.btnCancelInvCat.addEventListener('click', () => {
        this.invCatCreateBox.classList.add('hidden');
        if (this.newInvCatNameInput) this.newInvCatNameInput.value = '';
      });
    }

    if (this.invItemCategorySelect) {
      this.invItemCategorySelect.addEventListener('change', () => {
        if (this.invItemCategorySelect.value === '__new__') {
          this.invCatCreateBox?.classList.remove('hidden');
          this.newInvCatNameInput?.focus();
        }
      });
    }

    // Save New Inventory Category
    if (this.btnSaveInvCat) {
      this.btnSaveInvCat.addEventListener('click', () => {
        const catName = this.newInvCatNameInput?.value.trim();
        if (!catName) {
          alert('Please enter a category name.');
          return;
        }

        const newCat = window.restaurantDB.addInventoryCategory(catName);
        if (newCat) {
          this.populateCategories(newCat);
          if (this.newInvCatNameInput) this.newInvCatNameInput.value = '';
          this.invCatCreateBox?.classList.add('hidden');
          window.showToast?.(`Inventory category "${newCat}" created!`, 'success');
        }
      });
    }

    // Standalone Category Creator Modal
    if (this.btnOpenCreateInvCat && this.invCreateCatModal) {
      this.btnOpenCreateInvCat.addEventListener('click', () => {
        this.invCreateCatModal.classList.remove('hidden');
        this.standaloneInvCatInput?.focus();
      });
    }

    if (this.btnCloseCreateInvCatModal && this.invCreateCatModal) {
      this.btnCloseCreateInvCatModal.addEventListener('click', () => {
        this.invCreateCatModal.classList.add('hidden');
      });
    }

    if (this.invStandaloneCatForm) {
      this.invStandaloneCatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const catName = this.standaloneInvCatInput?.value.trim();
        if (!catName) {
          alert('Please enter a category name.');
          return;
        }

        const newCat = window.restaurantDB.addInventoryCategory(catName);
        if (newCat) {
          this.populateCategories(newCat);
          this.invStandaloneCatForm.reset();
          this.invCreateCatModal?.classList.add('hidden');
          window.showToast?.(`Inventory category "${newCat}" created!`, 'success');
        }
      });
    }

    // Add Stock Item Form
    if (this.addForm) {
      this.addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('inv-item-name')?.value.trim();
        let category = document.getElementById('inv-item-category')?.value;
        const quantity = parseFloat(document.getElementById('inv-item-qty')?.value);
        const unit = document.getElementById('inv-item-unit')?.value.trim() || 'kg';
        const minThreshold = parseFloat(document.getElementById('inv-item-min')?.value) || 5;
        const costPerUnit = parseFloat(document.getElementById('inv-item-cost')?.value) || 1;
        const supplier = document.getElementById('inv-item-supplier')?.value.trim() || 'Local Market';

        if (!name || isNaN(quantity)) {
          alert('Please enter a valid item name and current quantity.');
          return;
        }

        if (category === '__new__') {
          alert('Please select or create a valid inventory category.');
          return;
        }

        window.restaurantDB.addInventoryItem({
          name,
          category: category || 'General Supplies',
          quantity,
          unit,
          minThreshold,
          costPerUnit,
          supplier
        });

        this.addForm.reset();
        this.addModal?.classList.add('hidden');
        this.renderInventoryView();
        window.showToast?.(`Inventory item "${name}" added!`, 'success');
      });
    }

    // Table Actions (Delegated)
    document.addEventListener('click', (e) => {
      // 1. Quick Restock Button
      const restockBtn = e.target.closest('.btn-quick-restock');
      if (restockBtn) {
        const id = restockBtn.dataset.id;
        const delta = parseFloat(restockBtn.dataset.delta) || 10;
        window.restaurantDB.restockInventoryItem(id, delta);
        window.showToast?.(`Restocked +${delta} units!`, 'success');
        return;
      }

      // 2. Custom Adjust Prompt
      const adjustBtn = e.target.closest('.btn-custom-adjust');
      if (adjustBtn) {
        const id = adjustBtn.dataset.id;
        const currentQty = adjustBtn.dataset.qty;
        const unit = adjustBtn.dataset.unit;
        const input = prompt(`Update stock count (current: ${currentQty} ${unit}):`, currentQty);
        if (input !== null) {
          const newQty = parseFloat(input);
          if (!isNaN(newQty) && newQty >= 0) {
            const delta = newQty - parseFloat(currentQty);
            window.restaurantDB.restockInventoryItem(id, delta);
            window.showToast?.(`Stock adjusted to ${newQty} ${unit}`, 'info');
          }
        }
        return;
      }

      // 3. Delete Stock Item
      const deleteBtn = e.target.closest('.btn-delete-inv-item');
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const name = deleteBtn.dataset.name;
        if (confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
          window.restaurantDB.deleteInventoryItem(id);
          window.showToast?.(`Item "${name}" removed.`, 'warning');
        }
        return;
      }

      // 4. Quick Price Update Button
      const priceSaveBtn = e.target.closest('.btn-save-inline-price');
      if (priceSaveBtn) {
        const id = priceSaveBtn.dataset.id;
        const inputEl = document.getElementById(`inv-price-input-${id}`);
        if (inputEl) {
          const newPrice = parseFloat(inputEl.value);
          if (!isNaN(newPrice) && newPrice > 0) {
            window.restaurantDB.updateInventoryPrice(id, newPrice);
            window.showToast?.(`Price updated to $${newPrice.toFixed(2)}`, 'success');
            this.renderPricesTable();
          }
        }
        return;
      }

      // 5. Open Used Item Modal
      if (e.target.closest('#btn-open-record-used')) {
        this.openRecordUsedModal();
        return;
      }

      // 6. Open Adjustment Modal
      if (e.target.closest('#btn-open-record-adjustment')) {
        this.openAdjustmentModal();
        return;
      }
    });

    // Handle Used Item Form Submit
    const usedForm = document.getElementById('inv-record-used-form');
    if (usedForm) {
      usedForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveUsedItemRecord();
      });
    }

    // Handle Adjustment Form Submit
    const adjForm = document.getElementById('inv-record-adj-form');
    if (adjForm) {
      adjForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveAdjustmentRecord();
      });
    }

    // Reactive DB updates
    window.restaurantDB.subscribe('inventory', () => {
      this.renderInventoryView();
    });
    window.restaurantDB.subscribe('inv_categories', () => {
      this.populateCategories();
    });
    window.restaurantDB.subscribe('inv_used', () => {
      this.renderUsedItemsTable();
    });
    window.restaurantDB.subscribe('inv_adjustments', () => {
      this.renderAdjustmentsTable();
    });
  }

  switchSubtab(tabName) {
    this.activeSubtab = tabName;

    // Update Tab Buttons UI
    document.querySelectorAll('.inv-subtab-btn').forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-500/30');
        btn.classList.remove('bg-slate-900', 'text-slate-300');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-500/30');
        btn.classList.add('bg-slate-900', 'text-slate-300');
      }
    });

    // Hide all sub-containers
    document.getElementById('inv-subtab-items')?.classList.add('hidden');
    document.getElementById('inv-subtab-used')?.classList.add('hidden');
    document.getElementById('inv-subtab-prices')?.classList.add('hidden');
    document.getElementById('inv-subtab-adjustments')?.classList.add('hidden');

    // Show target container
    const targetEl = document.getElementById(`inv-subtab-${tabName}`);
    if (targetEl) {
      targetEl.classList.remove('hidden');
    }

    // Render respective table
    if (tabName === 'items') {
      this.renderTable();
    } else if (tabName === 'used') {
      this.renderUsedItemsTable();
    } else if (tabName === 'prices') {
      this.renderPricesTable();
    } else if (tabName === 'adjustments') {
      this.renderAdjustmentsTable();
    }
  }

  populateCategories(selectedCategory = null) {
    const categories = window.restaurantDB.getInventoryCategories();

    if (this.invItemCategorySelect) {
      const currentVal = selectedCategory || this.invItemCategorySelect.value;
      this.invItemCategorySelect.innerHTML = categories.map(cat => `
        <option value="${cat}">${cat}</option>
      `).join('') + `
        <option value="__new__">+ Add New Category...</option>
      `;

      if (currentVal && categories.includes(currentVal)) {
        this.invItemCategorySelect.value = currentVal;
      } else if (categories.length > 0) {
        this.invItemCategorySelect.value = categories[0];
      }
    }

    if (this.categorySelect) {
      const currentFilter = this.categoryFilter;
      this.categorySelect.innerHTML = `
        <option value="all">All Categories</option>
      ` + categories.map(cat => `
        <option value="${cat}">${cat}</option>
      `).join('');

      if (currentFilter && (currentFilter === 'all' || categories.includes(currentFilter))) {
        this.categorySelect.value = currentFilter;
      } else {
        this.categorySelect.value = 'all';
      }
    }
  }

  renderInventoryView() {
    this.populateCategories();
    this.renderKPIs();
    this.renderTable();
    this.renderUsedItemsTable();
    this.renderPricesTable();
    this.renderAdjustmentsTable();
  }

  renderKPIs() {
    const summary = window.restaurantDB.getInventorySummary();

    if (this.kpiTotalItems) this.kpiTotalItems.textContent = summary.totalItems;
    if (this.kpiInStock) this.kpiInStock.textContent = summary.inStockCount;
    if (this.kpiLowStock) this.kpiLowStock.textContent = summary.lowStockCount + summary.outOfStockCount;
    if (this.kpiTotalValue) this.kpiTotalValue.textContent = `$${summary.totalEstimatedValue.toFixed(2)}`;

    // Low stock warning banner
    if (this.lowStockBanner && this.lowStockList) {
      if (summary.lowStockItems.length > 0) {
        this.lowStockBanner.classList.remove('hidden');
        this.lowStockList.innerHTML = summary.lowStockItems.map(item => `
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            item.quantity <= 0 ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }">
            <i class="fa-solid fa-triangle-exclamation"></i>
            ${item.name}: ${item.quantity} ${item.unit} (Min: ${item.minThreshold})
          </span>
        `).join('');
      } else {
        this.lowStockBanner.classList.add('hidden');
      }
    }
  }

  // ================= 1. ITEM LIST TABLE =================
  renderTable() {
    if (!this.inventoryTableBody) return;
    const items = window.restaurantDB.getInventory();

    const filtered = items.filter(item => {
      const matchesSearch = !this.searchQuery || 
        item.name.toLowerCase().includes(this.searchQuery) ||
        (item.supplier && item.supplier.toLowerCase().includes(this.searchQuery));

      const matchesCategory = this.categoryFilter === 'all' || item.category === this.categoryFilter;

      let matchesStatus = true;
      if (this.statusFilter === 'low') {
        matchesStatus = item.quantity <= item.minThreshold && item.quantity > 0;
      } else if (this.statusFilter === 'out') {
        matchesStatus = item.quantity <= 0;
      } else if (this.statusFilter === 'good') {
        matchesStatus = item.quantity > item.minThreshold;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (filtered.length === 0) {
      this.inventoryTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-400 text-xs font-bold">
            No matching stock items found.
          </td>
        </tr>
      `;
      return;
    }

    this.inventoryTableBody.innerHTML = filtered.map(item => {
      const isOut = item.quantity <= 0;
      const isLow = item.quantity <= item.minThreshold && !isOut;
      const statusClass = isOut 
        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
        : isLow 
        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';

      const statusText = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Optimal';
      const totalVal = (item.quantity * item.costPerUnit).toFixed(2);

      return `
        <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors text-xs text-slate-200">
          <td class="py-3 px-4">
            <div class="font-extrabold text-white text-sm">${item.name}</div>
            <div class="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1 font-bold">
              <span class="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-blue-300 border border-slate-700">${item.category}</span>
              <span>• Supplier: ${item.supplier}</span>
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="font-mono text-base font-black ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white'}">
              ${item.quantity} <span class="text-xs font-bold text-slate-400">${item.unit}</span>
            </div>
            <div class="text-[10px] text-slate-400 font-bold">Min Alert: ${item.minThreshold} ${item.unit}</div>
          </td>
          <td class="py-3 px-4">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusClass}">
              <span class="w-1.5 h-1.5 rounded-full ${isOut ? 'bg-red-400' : isLow ? 'bg-amber-400' : 'bg-emerald-400'}"></span>
              ${statusText}
            </span>
          </td>
          <td class="py-3 px-4 font-mono">
            <div class="font-black text-white">$${item.costPerUnit.toFixed(2)}</div>
            <div class="text-[10px] text-slate-400 font-bold">per ${item.unit}</div>
          </td>
          <td class="py-3 px-4 font-mono font-black text-emerald-400 text-sm">
            $${totalVal}
          </td>
          <td class="py-3 px-4 text-slate-300 font-mono text-[11px] font-bold">
            ${item.lastRestocked || 'Recent'}
          </td>
          <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
            <button 
              class="btn-quick-restock bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all"
              data-id="${item.id}"
              data-delta="10"
              title="Add 10 units"
            >
              +10 ${item.unit}
            </button>

            <button 
              class="btn-custom-adjust bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-700"
              data-id="${item.id}"
              data-qty="${item.quantity}"
              data-unit="${item.unit}"
              title="Set custom quantity"
            >
              <i class="fa-solid fa-pen text-[10px]"></i>
            </button>

            <button 
              class="btn-delete-inv-item bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1.5 rounded-lg text-xs transition-colors"
              data-id="${item.id}"
              data-name="${item.name}"
              title="Delete item"
            >
              <i class="fa-solid fa-trash-can text-[10px]"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ================= 2. USED ITEMS TABLE =================
  renderUsedItemsTable() {
    const tableBody = document.getElementById('inv-used-table-body');
    if (!tableBody) return;

    const usedList = window.restaurantDB.getUsedItems ? window.restaurantDB.getUsedItems() : [];

    if (usedList.length === 0) {
      tableBody.innerHTML = `
        <tr><td colspan="6" class="py-8 text-center text-slate-400 font-bold text-xs">No used items logged yet</td></tr>
      `;
      return;
    }

    tableBody.innerHTML = usedList.map(u => `
      <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors text-xs text-slate-200">
        <td class="py-3 px-4 font-mono font-bold text-slate-300">${u.date}</td>
        <td class="py-3 px-4">
          <strong class="text-white font-extrabold text-sm block">${u.itemName}</strong>
          <span class="text-[10px] text-slate-400 font-mono">${u.id}</span>
        </td>
        <td class="py-3 px-4 font-mono text-base font-black text-amber-400">
          ${u.quantity} <span class="text-xs font-bold text-slate-400">${u.unit}</span>
        </td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
            ${u.department}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-300 font-bold">${u.usedBy}</td>
        <td class="py-3 px-4 text-slate-300">${u.reason}</td>
      </tr>
    `).join('');
  }

  // ================= 3. UPDATING THE PRICE ITEM TABLE =================
  renderPricesTable() {
    const tableBody = document.getElementById('inv-prices-table-body');
    if (!tableBody) return;

    const items = window.restaurantDB.getInventory();

    tableBody.innerHTML = items.map(item => `
      <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors text-xs text-slate-200">
        <td class="py-3 px-4">
          <strong class="text-white font-extrabold text-sm block">${item.name}</strong>
          <span class="text-[10px] text-slate-400">${item.category} • Supplier: ${item.supplier}</span>
        </td>
        <td class="py-3 px-4 font-mono font-black text-white">
          ${item.quantity} ${item.unit}
        </td>
        <td class="py-3 px-4 font-mono font-bold text-slate-300">
          $${item.costPerUnit.toFixed(2)} / ${item.unit}
        </td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-bold">$</span>
            <input 
              type="number" 
              step="0.01" 
              id="inv-price-input-${item.id}" 
              value="${item.costPerUnit.toFixed(2)}"
              class="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-400 font-mono font-black outline-none focus:border-blue-500"
            />
            <span class="text-xs text-slate-400 font-bold">/${item.unit}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-right">
          <button 
            class="btn-save-inline-price bg-blue-600 hover:bg-blue-700 text-white font-black px-3.5 py-1.5 rounded-xl text-xs transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5 ml-auto"
            data-id="${item.id}"
          >
            <i class="fa-solid fa-floppy-disk"></i> Update Price
          </button>
        </td>
      </tr>
    `).join('');
  }

  // ================= 4. INVENTORY ADJUSTMENTS TABLE =================
  renderAdjustmentsTable() {
    const tableBody = document.getElementById('inv-adjustments-table-body');
    if (!tableBody) return;

    const adjs = window.restaurantDB.getInventoryAdjustments ? window.restaurantDB.getInventoryAdjustments() : [];

    if (adjs.length === 0) {
      tableBody.innerHTML = `
        <tr><td colspan="7" class="py-8 text-center text-slate-400 font-bold text-xs">No adjustments recorded yet</td></tr>
      `;
      return;
    }

    tableBody.innerHTML = adjs.map(a => {
      const isAdd = a.type === 'Addition (+)';
      return `
        <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors text-xs text-slate-200">
          <td class="py-3 px-4 font-mono font-bold text-slate-300">${a.date}</td>
          <td class="py-3 px-4 font-mono font-bold text-blue-400">${a.id}</td>
          <td class="py-3 px-4">
            <strong class="text-white font-extrabold text-sm block">${a.itemName}</strong>
          </td>
          <td class="py-3 px-4">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black ${isAdd ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}">
              ${a.type}
            </span>
          </td>
          <td class="py-3 px-4 font-mono font-black ${isAdd ? 'text-emerald-400' : 'text-red-400'}">
            ${isAdd ? '+' : '-'}${a.quantity} ${a.unit}
          </td>
          <td class="py-3 px-4 text-slate-300 font-bold">${a.reason}</td>
          <td class="py-3 px-4 text-slate-400 text-[11px]">${a.notes || '-'}</td>
        </tr>
      `;
    }).join('');
  }

  openRecordUsedModal() {
    const modal = document.getElementById('inv-record-used-modal');
    const select = document.getElementById('inv-used-item-select');
    if (!modal || !select) return;

    const items = window.restaurantDB.getInventory();
    select.innerHTML = items.map(i => `
      <option value="${i.id}" data-name="${i.name}" data-unit="${i.unit}" data-qty="${i.quantity}">
        ${i.name} (Stock: ${i.quantity} ${i.unit})
      </option>
    `).join('');

    modal.classList.remove('hidden');
  }

  openAdjustmentModal() {
    const modal = document.getElementById('inv-record-adj-modal');
    const select = document.getElementById('inv-adj-item-select');
    if (!modal || !select) return;

    const items = window.restaurantDB.getInventory();
    select.innerHTML = items.map(i => `
      <option value="${i.id}" data-name="${i.name}" data-unit="${i.unit}" data-cost="${i.costPerUnit}">
        ${i.name} (Current: ${i.quantity} ${i.unit})
      </option>
    `).join('');

    modal.classList.remove('hidden');
  }

  saveUsedItemRecord() {
    const select = document.getElementById('inv-used-item-select');
    const opt = select.selectedOptions[0];
    if (!opt) return;

    const itemId = select.value;
    const itemName = opt.dataset.name;
    const unit = opt.dataset.unit;
    const quantity = parseFloat(document.getElementById('inv-used-quantity').value);
    const department = document.getElementById('inv-used-dept').value;
    const usedBy = document.getElementById('inv-used-by').value.trim() || 'Staff';
    const reason = document.getElementById('inv-used-reason').value.trim() || 'Daily cooking consumption';

    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    window.restaurantDB.recordUsedItem({
      itemId,
      itemName,
      quantity,
      unit,
      department,
      usedBy,
      reason
    });

    document.getElementById('inv-record-used-modal')?.classList.add('hidden');
    document.getElementById('inv-record-used-form')?.reset();
    window.showToast?.(`Used ${quantity} ${unit} of ${itemName} recorded!`, 'success');
  }

  saveAdjustmentRecord() {
    const select = document.getElementById('inv-adj-item-select');
    const opt = select.selectedOptions[0];
    if (!opt) return;

    const itemId = select.value;
    const itemName = opt.dataset.name;
    const unit = opt.dataset.unit;
    const costPerUnit = parseFloat(opt.dataset.cost) || 1;
    const type = document.getElementById('inv-adj-type').value;
    const quantity = parseFloat(document.getElementById('inv-adj-quantity').value);
    const reason = document.getElementById('inv-adj-reason').value;
    const notes = document.getElementById('inv-adj-notes').value.trim();

    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    window.restaurantDB.recordInventoryAdjustment({
      itemId,
      itemName,
      unit,
      costPerUnit,
      type,
      quantity,
      reason,
      notes
    });

    document.getElementById('inv-record-adj-modal')?.classList.add('hidden');
    document.getElementById('inv-record-adj-form')?.reset();
    window.showToast?.(`Adjustment recorded for ${itemName}!`, 'info');
  }
}

window.initInventory = () => {
  window.inventoryModule = new InventoryModule();
};
