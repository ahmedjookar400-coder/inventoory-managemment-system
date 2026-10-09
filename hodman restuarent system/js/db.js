/**
 * Hodman Restaurant System - Storage & State Engine
 * Handles persistence with LocalStorage, real-time events, user sessions, inventory management, and analytics.
 */

const STORAGE_KEYS = {
  MENU: 'hodman_menu',
  ORDERS: 'hodman_orders',
  SETTINGS: 'hodman_settings',
  CATEGORIES: 'hodman_categories',
  USERS: 'hodman_users',
  CURRENT_USER: 'hodman_current_user',
  INVENTORY: 'hodman_inventory',
  INV_CATEGORIES: 'hodman_inv_categories',
  INV_USED: 'hodman_inventory_used',
  INV_ADJUSTMENTS: 'hodman_inventory_adjustments',
  SUPPLIERS: 'hodman_suppliers',
  PURCHASE_INVOICES: 'hodman_purchase_invoices',
  PURCHASE_PAYMENTS: 'hodman_purchase_payments'
};

const SESSION_KEY = 'hodman_session_unlocked';

class RestaurantDB {
  constructor() {
    this.listeners = {};
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.MENU) || 
        !localStorage.getItem(STORAGE_KEYS.USERS) || 
        !localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    const { DEFAULT_CATEGORIES, DEFAULT_MENU_ITEMS, DEFAULT_SETTINGS, DEFAULT_USERS, DEFAULT_INVENTORY } = window.HODMAN_DATA;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(DEFAULT_INVENTORY));

    // Clear session lock on reset to require login
    sessionStorage.removeItem(SESSION_KEY);

    // Seed realistic sample orders across various statuses
    const now = Date.now();
    const sampleOrders = [
      {
        id: 'ord-101',
        orderNumber: 'HD-101',
        orderType: 'dine-in',
        tableNumber: 'Table 3',
        customerName: 'Ahmed Noor',
        serverName: 'Farhan Ali (Waiter)',
        cashierName: 'Maryam Yusuf (Cashier)',
        status: 'completed',
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        items: [
          { id: 1, name: 'Bariis Iskukaris & Goat (Hilib Ari)', price: 16.50, quantity: 2, notes: 'Extra banana please' },
          { id: 14, name: 'Authentic Somali Spiced Chai (Shaah)', price: 3.50, quantity: 2, notes: '' },
          { id: 5, name: 'Crispy Beef Sambusa (3 pcs)', price: 6.00, quantity: 1, notes: 'Hot bisbas' }
        ],
        subtotal: 46.00,
        tax: 2.30,
        discount: 0,
        total: 48.30,
        cashReceived: 50.00,
        change: 1.70,
        createdAt: new Date(now - 1000 * 60 * 65).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'ord-102',
        orderNumber: 'HD-102',
        orderType: 'takeout',
        tableNumber: 'Takeaway',
        customerName: 'Fatima Jama',
        serverName: 'Maryam Yusuf (Cashier)',
        cashierName: 'Maryam Yusuf (Cashier)',
        status: 'completed',
        paymentMethod: 'mobile',
        paymentStatus: 'paid',
        items: [
          { id: 8, name: 'Hodman Mixed Grill Platter', price: 24.50, quantity: 1, notes: 'Well done' },
          { id: 15, name: 'Fresh Mango & Passionfruit Smoothie', price: 5.50, quantity: 1, notes: 'No ice' },
          { id: 18, name: 'Pistachio Baklava (4 pcs)', price: 7.00, quantity: 1, notes: '' }
        ],
        subtotal: 37.00,
        tax: 1.85,
        discount: 0,
        total: 38.85,
        cashReceived: 38.85,
        change: 0,
        createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 15).toISOString()
      },
      {
        id: 'ord-103',
        orderNumber: 'HD-103',
        orderType: 'dine-in',
        tableNumber: 'Table 7',
        customerName: 'Khaled Hassan',
        serverName: 'Farhan Ali (Waiter)',
        cashierName: 'Maryam Yusuf (Cashier)',
        status: 'ready',
        paymentMethod: 'card',
        paymentStatus: 'paid',
        items: [
          { id: 10, name: 'Grilled T-Bone Steak (12 oz)', price: 22.00, quantity: 1, notes: 'Medium-rare' },
          { id: 3, name: 'Chicken Suqaar with Sabaayad', price: 14.50, quantity: 1, notes: '' },
          { id: 16, name: 'Iced Karkadeh (Hibiscus Tea)', price: 4.00, quantity: 2, notes: '' }
        ],
        subtotal: 44.50,
        tax: 2.23,
        discount: 0,
        total: 46.73,
        cashReceived: 46.73,
        change: 0,
        createdAt: new Date(now - 1000 * 60 * 22).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 5).toISOString()
      },
      {
        id: 'ord-104',
        orderNumber: 'HD-104',
        orderType: 'dine-in',
        tableNumber: 'VIP Lounge',
        customerName: 'Dr. Marian',
        serverName: 'Farhan Ali (Waiter)',
        cashierName: 'Maryam Yusuf (Cashier)',
        status: 'preparing',
        paymentMethod: 'mobile',
        paymentStatus: 'paid',
        items: [
          { id: 4, name: 'Roasted Lamb Shank (Karis Hilib)', price: 19.00, quantity: 2, notes: 'Extra sauce on side' },
          { id: 5, name: 'Crispy Beef Sambusa (3 pcs)', price: 6.00, quantity: 2, notes: '' },
          { id: 15, name: 'Fresh Mango & Passionfruit Smoothie', price: 5.50, quantity: 2, notes: '' }
        ],
        subtotal: 61.00,
        tax: 3.05,
        discount: 0,
        total: 64.05,
        cashReceived: 64.05,
        change: 0,
        createdAt: new Date(now - 1000 * 60 * 12).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 10).toISOString()
      },
      {
        id: 'ord-105',
        orderNumber: 'HD-105',
        orderType: 'dine-in',
        tableNumber: 'Table 2',
        customerName: 'Yusuf Ali',
        serverName: 'Farhan Ali (Waiter)',
        cashierName: 'Maryam Yusuf (Cashier)',
        status: 'pending',
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        items: [
          { id: 11, name: 'Hodman Deluxe Beef Burger', price: 11.50, quantity: 2, notes: 'No onions on one' },
          { id: 12, name: 'Crispy Buffalo Chicken Wrap', price: 10.00, quantity: 1, notes: 'Extra dip' },
          { id: 14, name: 'Authentic Somali Spiced Chai (Shaah)', price: 3.50, quantity: 3, notes: 'Sweet' }
        ],
        subtotal: 43.50,
        tax: 2.18,
        discount: 0,
        total: 45.68,
        cashReceived: 50.00,
        change: 4.32,
        createdAt: new Date(now - 1000 * 60 * 3).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 3).toISOString()
      },
      {
        id: 'ord-106',
        orderNumber: 'HD-106',
        orderType: 'dine-in',
        tableNumber: 'Table 4',
        customerName: 'Abdi Warsame',
        serverName: 'Farhan Ali (Waiter)',
        cashierName: '',
        status: 'open',
        paymentMethod: 'pending',
        paymentStatus: 'unpaid',
        items: [
          { id: 1, name: 'Bariis Iskukaris & Goat (Hilib Ari)', price: 16.50, quantity: 3, notes: '' },
          { id: 14, name: 'Authentic Somali Spiced Chai (Shaah)', price: 3.50, quantity: 3, notes: 'Sweet' }
        ],
        subtotal: 60.00,
        tax: 3.00,
        discount: 0,
        total: 63.00,
        cashReceived: 0,
        change: 0,
        createdAt: new Date(now - 1000 * 60 * 18).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 18).toISOString()
      },
      {
        id: 'ord-107',
        orderNumber: 'HD-107',
        orderType: 'dine-in',
        tableNumber: 'Table 6',
        customerName: 'Hassan Idle',
        serverName: 'Farhan Ali (Waiter)',
        cashierName: '',
        status: 'open',
        paymentMethod: 'pending',
        paymentStatus: 'unpaid',
        items: [
          { id: 8, name: 'Hodman Mixed Grill Platter', price: 24.50, quantity: 2, notes: 'Extra salad' },
          { id: 15, name: 'Fresh Mango & Passionfruit Smoothie', price: 5.50, quantity: 2, notes: '' },
          { id: 18, name: 'Pistachio Baklava (4 pcs)', price: 7.00, quantity: 2, notes: '' }
        ],
        subtotal: 74.00,
        tax: 3.70,
        discount: 0,
        total: 77.70,
        cashReceived: 0,
        change: 0,
        createdAt: new Date(now - 1000 * 60 * 28).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 28).toISOString()
      },
      {
        id: 'ord-108',
        orderNumber: 'HD-108',
        orderType: 'dine-in',
        tableNumber: 'Table 9',
        customerName: 'Maryan Dahir',
        serverName: 'Farhan Ali (Waiter)',
        cashierName: '',
        status: 'open',
        paymentMethod: 'pending',
        paymentStatus: 'unpaid',
        items: [
          { id: 11, name: 'Hodman Deluxe Beef Burger', price: 11.50, quantity: 2, notes: 'Extra fries' },
          { id: 16, name: 'Iced Karkadeh (Hibiscus Tea)', price: 4.00, quantity: 2, notes: '' }
        ],
        subtotal: 31.00,
        tax: 1.55,
        discount: 0,
        total: 32.55,
        cashReceived: 0,
        change: 0,
        createdAt: new Date(now - 1000 * 60 * 8).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 8).toISOString()
      }
    ];

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(sampleOrders));
    this.notify('all');
  }

  // ================= USERS & AUTHENTICATION =================
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  getUserById(id) {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  }

  getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      sessionStorage.setItem(SESSION_KEY, 'true');
    }
    this.notify('userChanged', user);
    return user;
  }

  isSessionUnlocked() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  lockSession() {
    sessionStorage.removeItem(SESSION_KEY);
    this.notify('sessionLocked');
  }

  unlockSession(user) {
    this.setCurrentUser(user);
    sessionStorage.setItem(SESSION_KEY, 'true');
  }

  addUser(userData) {
    const users = this.getUsers();
    const id = `usr-${Date.now()}`;
    const newUser = {
      id,
      name: userData.name,
      username: userData.username.toLowerCase().trim(),
      password: userData.password || '123456',
      pin: String(userData.pin || '1111').trim(),
      role: userData.role || 'waiter',
      title: userData.title || (userData.role === 'admin' ? 'Manager' : userData.role === 'cashier' ? 'Cashier' : 'Floor Staff'),
      avatar: userData.avatar || (
        userData.role === 'admin' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : userData.role === 'cashier'
          ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      ),
      permissions: userData.role === 'admin' ? ['pos', 'kds', 'reports', 'inventory', 'admin', 'settings']
                   : userData.role === 'cashier' ? ['pos', 'kds', 'reports', 'inventory']
                   : ['pos', 'kds']
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify('users', users);
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    if (updates.role) {
      users[index].permissions = updates.role === 'admin' ? ['pos', 'kds', 'reports', 'inventory', 'admin', 'settings']
                               : updates.role === 'cashier' ? ['pos', 'kds', 'reports', 'inventory']
                               : ['pos', 'kds'];
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update current user if edited
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      this.setCurrentUser(users[index]);
    }

    this.notify('users', users);
    return users[index];
  }

  deleteUser(id) {
    let users = this.getUsers();
    const target = users.find(u => u.id === id);
    if (!target) return { success: false, message: 'User not found' };

    // Prevent deleting the last admin
    if (target.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, message: 'Cannot delete the only administrator account.' };
      }
    }

    users = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify('users', users);
    return { success: true };
  }

  authenticate(username, password) {
    const users = this.getUsers();
    return users.find(u => 
      u.username.toLowerCase() === username.toLowerCase().trim() && 
      u.password === password
    ) || null;
  }

  authenticateByPin(pin, targetUserId = null) {
    const users = this.getUsers();
    const cleanPin = String(pin).trim();
    if (targetUserId) {
      const u = users.find(usr => usr.id === targetUserId);
      return (u && u.pin === cleanPin) ? u : null;
    }
    return users.find(u => u.pin === cleanPin) || null;
  }

  authenticateUserPinOrPassword(user, input) {
    if (!user || !input) return false;
    const clean = String(input).trim();
    return user.pin === clean || user.password === clean;
  }

  // ================= INVENTORY MANAGEMENT =================
  getInventory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY) || '[]');
  }

  getInventoryItemById(id) {
    const items = this.getInventory();
    return items.find(i => i.id === id);
  }

  addInventoryItem(itemData) {
    const items = this.getInventory();
    const newItem = {
      id: `inv-${Date.now()}`,
      name: itemData.name,
      category: itemData.category || 'Kitchen Supplies',
      quantity: Number(parseFloat(itemData.quantity || 0).toFixed(1)),
      unit: itemData.unit || 'kg',
      minThreshold: Number(parseFloat(itemData.minThreshold || 5).toFixed(1)),
      costPerUnit: Number(parseFloat(itemData.costPerUnit || 1).toFixed(2)),
      supplier: itemData.supplier || 'Local Supplier',
      lastRestocked: new Date().toISOString().split('T')[0]
    };
    items.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    this.notify('inventory', items);
    return newItem;
  }

  updateInventoryItem(id, updates) {
    const items = this.getInventory();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    if (updates.quantity !== undefined) {
      items[index].quantity = Number(parseFloat(updates.quantity).toFixed(1));
    }
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    this.notify('inventory', items);
    return items[index];
  }

  adjustStock(id, deltaAmount) {
    const items = this.getInventory();
    const item = items.find(i => i.id === id);
    if (!item) return null;

    item.quantity = Math.max(0, Number((item.quantity + Number(deltaAmount)).toFixed(1)));
    if (deltaAmount > 0) {
      item.lastRestocked = new Date().toISOString().split('T')[0];
    }
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    this.notify('inventory', items);
    return item;
  }

  deleteInventoryItem(id) {
    let items = this.getInventory();
    items = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    this.notify('inventory', items);
  }

  updateInventoryPrice(id, newCost) {
    const items = this.getInventory();
    const item = items.find(i => i.id === id);
    if (!item) return null;
    item.costPerUnit = Math.max(0.01, Number(parseFloat(newCost).toFixed(2)));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    this.notify('inventory', items);
    return item;
  }

  getUsedItems() {
    const stored = localStorage.getItem(STORAGE_KEYS.INV_USED);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    const defaults = [
      { id: 'USED-101', date: '2026-09-28', itemId: 'inv_1', itemName: 'Basmati Rice (Super Kernel)', quantity: 15, unit: 'kg', department: 'Main Kitchen', usedBy: 'Sahra Hassan', reason: 'Daily Lunch Biryani & Pilau' },
      { id: 'USED-102', date: '2026-09-28', itemId: 'inv_2', itemName: 'Fresh Halal Camel Meat', quantity: 20, unit: 'kg', department: 'Kitchen & Grill', usedBy: 'Ilyas Guled', reason: 'Somali Hilib Geel Grills' },
      { id: 'USED-103', date: '2026-09-27', itemId: 'inv_4', itemName: 'Pure Vegetable Cooking Oil', quantity: 8, unit: 'L', department: 'Kitchen & Grill', usedBy: 'Sahra Hassan', reason: 'Samboosa & Deep Frying' },
      { id: 'USED-104', date: '2026-09-27', itemId: 'inv_7', itemName: 'Somali Spices Mix (Xawaash)', quantity: 2.5, unit: 'kg', department: 'Main Kitchen', usedBy: 'Sahra Hassan', reason: 'Maraq Soup & Sauces' },
      { id: 'USED-105', date: '2026-09-26', itemId: 'inv_6', itemName: 'Whole Milk', quantity: 12, unit: 'L', department: 'Cafeteria', usedBy: 'Khadra Nuur', reason: 'Somali Spiced Tea & Lattes' }
    ];
    localStorage.setItem(STORAGE_KEYS.INV_USED, JSON.stringify(defaults));
    return defaults;
  }

  recordUsedItem(data) {
    const list = this.getUsedItems();
    const newRecord = {
      id: `USED-${Math.floor(1000 + Math.random() * 9000)}`,
      date: data.date || new Date().toISOString().slice(0, 10),
      itemId: data.itemId,
      itemName: data.itemName,
      quantity: Number(data.quantity),
      unit: data.unit || 'unit',
      department: data.department || 'Main Kitchen',
      usedBy: data.usedBy || 'Kitchen Staff',
      reason: data.reason || 'Daily restaurant food prep'
    };

    list.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.INV_USED, JSON.stringify(list));

    // Deduct stock quantity in inventory
    if (data.itemId) {
      this.restockInventoryItem(data.itemId, -Math.abs(Number(data.quantity)));
    }

    this.notify('inv_used', list);
    return newRecord;
  }

  getInventoryAdjustments() {
    const stored = localStorage.getItem(STORAGE_KEYS.INV_ADJUSTMENTS);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    const defaults = [
      { id: 'ADJ-201', date: '2026-09-26', itemId: 'inv_3', itemName: 'Fresh Tomatoes & Onions', type: 'Deduction (-)', quantity: 4, unit: 'kg', reason: 'Spoilage / Over-ripe', costImpact: -7.20, notes: 'Damaged during delivery shipment' },
      { id: 'ADJ-202', date: '2026-09-25', itemId: 'inv_5', itemName: 'Somali Flatbread (Canjeero / Muufo)', type: 'Addition (+)', quantity: 15, unit: 'pcs', reason: 'Physical Count Audit', costImpact: 4.50, notes: 'Found extra morning batch in warmer' },
      { id: 'ADJ-203', date: '2026-09-24', itemId: 'inv_6', itemName: 'Whole Milk', type: 'Deduction (-)', quantity: 2, unit: 'L', reason: 'Expired / Sour', costImpact: -2.80, notes: 'Discarded expired carton' }
    ];
    localStorage.setItem(STORAGE_KEYS.INV_ADJUSTMENTS, JSON.stringify(defaults));
    return defaults;
  }

  recordInventoryAdjustment(data) {
    const list = this.getInventoryAdjustments();
    const qtyNumber = Number(data.quantity);
    const isAddition = data.type === 'Addition (+)';
    const delta = isAddition ? Math.abs(qtyNumber) : -Math.abs(qtyNumber);

    const newRecord = {
      id: `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
      date: data.date || new Date().toISOString().slice(0, 10),
      itemId: data.itemId,
      itemName: data.itemName,
      type: data.type || 'Deduction (-)',
      quantity: Math.abs(qtyNumber),
      unit: data.unit || 'unit',
      reason: data.reason || 'Audit Adjustment',
      costImpact: Number((delta * (data.costPerUnit || 1)).toFixed(2)),
      notes: data.notes || ''
    };

    list.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.INV_ADJUSTMENTS, JSON.stringify(list));

    if (data.itemId) {
      this.restockInventoryItem(data.itemId, delta);
    }

    this.notify('inv_adjustments', list);
    return newRecord;
  }

  getInventorySummary() {
    const items = this.getInventory();
    let totalItems = items.length;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalEstimatedValue = 0;
    const lowStockItems = [];

    items.forEach(item => {
      totalEstimatedValue += item.quantity * item.costPerUnit;
      if (item.quantity <= 0) {
        outOfStockCount++;
        lowStockItems.push(item);
      } else if (item.quantity <= item.minThreshold) {
        lowStockCount++;
        lowStockItems.push(item);
      } else {
        inStockCount++;
      }
    });

    return {
      totalItems,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      totalEstimatedValue: Number(totalEstimatedValue.toFixed(2)),
      lowStockItems
    };
  }

  getInventoryCategories() {
    const stored = localStorage.getItem(STORAGE_KEYS.INV_CATEGORIES);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }

    const defaults = [
      'Grains & Pasta',
      'Meat & Poultry',
      'Produce',
      'Dairy',
      'Bakery & Pastry',
      'Spices & Dry Goods',
      'Oils & Essentials',
      'Beverages & Syrups',
      'Packaging & Supplies'
    ];
    const items = this.getInventory();
    items.forEach(i => {
      if (i.category && !defaults.includes(i.category)) {
        defaults.push(i.category);
      }
    });
    localStorage.setItem(STORAGE_KEYS.INV_CATEGORIES, JSON.stringify(defaults));
    return defaults;
  }

  addInventoryCategory(name) {
    const cleanName = String(name || '').trim();
    if (!cleanName) return null;
    const categories = this.getInventoryCategories();
    const existing = categories.find(c => c.toLowerCase() === cleanName.toLowerCase());
    if (existing) return existing;

    categories.push(cleanName);
    localStorage.setItem(STORAGE_KEYS.INV_CATEGORIES, JSON.stringify(categories));
    this.notify('inv_categories', categories);
    return cleanName;
  }

  // ================= CATEGORIES & MENU =================
  getCategories() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  }

  addCategory(categoryData) {
    if (!categoryData || !categoryData.name) return null;
    const name = String(categoryData.name).trim();
    if (!name) return null;

    const categories = this.getCategories();
    const id = categoryData.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    const existing = categories.find(c => c.id === id || c.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newCategory = {
      id,
      name,
      icon: categoryData.icon || 'fa-utensils'
    };

    categories.push(newCategory);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notify('categories', categories);
    return newCategory;
  }

  getMenu() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU) || '[]');
  }

  getMenuItemById(id) {
    const menu = this.getMenu();
    return menu.find(item => item.id === Number(id));
  }

  addMenuItem(itemData) {
    const menu = this.getMenu();
    const newId = menu.length > 0 ? Math.max(...menu.map(m => m.id)) + 1 : 1;
    const newItem = {
      id: newId,
      categoryId: itemData.categoryId || 'mains',
      name: itemData.name,
      description: itemData.description || '',
      price: Number(parseFloat(itemData.price).toFixed(2)),
      image: itemData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      available: itemData.available !== undefined ? itemData.available : true
    };
    menu.push(newItem);
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
    this.notify('menu', menu);
    return newItem;
  }

  updateMenuItem(id, updates) {
    const menu = this.getMenu();
    const index = menu.findIndex(m => m.id === Number(id));
    if (index === -1) return null;

    menu[index] = { ...menu[index], ...updates };
    if (updates.price !== undefined) {
      menu[index].price = Number(parseFloat(updates.price).toFixed(2));
    }
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
    this.notify('menu', menu);
    return menu[index];
  }

  toggleItemAvailability(id) {
    const menu = this.getMenu();
    const item = menu.find(m => m.id === Number(id));
    if (!item) return null;
    item.available = !item.available;
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
    this.notify('menu', menu);
    return item;
  }

  deleteMenuItem(id) {
    let menu = this.getMenu();
    menu = menu.filter(m => m.id !== Number(id));
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
    this.notify('menu', menu);
  }

  // ================= SETTINGS =================
  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  }

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.notify('settings', updated);
    return updated;
  }

  // ================= ORDERS =================
  getOrders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  }

  getBusinessDate() {
    const saved = localStorage.getItem('hodman_business_date');
    const now = new Date();
    const actualDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (saved && saved >= actualDate) return saved;
    if (saved !== actualDate) localStorage.setItem('hodman_business_date', actualDate);
    return actualDate;
  }

  completeBusinessDay() {
    const closedDate = this.getBusinessDate();
    const [year, month, day] = closedDate.split('-').map(Number);
    const next = new Date(year, month - 1, day + 1);
    const nextDate = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
    const orders = this.getOrders();
    const paidOrders = orders.filter(order => order.paymentStatus === 'paid' && order.status !== 'cancelled' && (order.paidBusinessDate || order.businessDate || String(order.createdAt || '').slice(0, 10)) === closedDate);
    const unpaidOrders = orders.filter(order => order.paymentStatus === 'unpaid' && order.status !== 'cancelled' && (order.businessDate || String(order.createdAt || '').slice(0, 10)) === closedDate);
    const closures = JSON.parse(localStorage.getItem('hodman_business_day_closures') || '[]');
    const closure = {
      date: closedDate,
      completedAt: new Date().toISOString(),
      paidTotal: Number(paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0).toFixed(2)),
      unpaidTotal: Number(unpaidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0).toFixed(2)),
      paidCount: paidOrders.length,
      unpaidCount: unpaidOrders.length
    };
    closures.unshift(closure);
    localStorage.setItem('hodman_business_day_closures', JSON.stringify(closures));
    localStorage.setItem('hodman_business_date', nextDate);
    this.notify('businessDayStarted', { closedDate, nextDate, closure });
    return { closedDate, nextDate, closure };
  }

  getActiveOrders() {
    const orders = this.getOrders();
    return orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
  }

  getOrderById(id) {
    const orders = this.getOrders();
    return orders.find(o => o.id === id || o.orderNumber === id);
  }

  createOrder(orderData) {
    const orders = this.getOrders();
    const currentUser = this.getCurrentUser();
    const savedSeq = Number(localStorage.getItem('hodman_order_sequence') || 0);
    const lastOrderSeq = orders.reduce((max, order) => {
      const match = String(order.orderNumber || '').match(/(\d+)$/);
      return Math.max(max, match ? Number(match[1]) : 0);
    }, 100);
    const nextSeq = Math.max(savedSeq, lastOrderSeq) + 1;
    localStorage.setItem('hodman_order_sequence', String(nextSeq));
    const orderNumber = `HD-${nextSeq}`;
    const id = `ord-${Date.now()}`;

    const serverName = orderData.serverName || (currentUser ? `${currentUser.name} (${currentUser.title || currentUser.role})` : 'Staff');
    const cashierName = orderData.cashierName || (currentUser?.role === 'cashier' ? currentUser.name : (orderData.paymentMethod ? 'Cashier Maryam' : 'Pending'));
    const paymentStatus = orderData.paymentStatus || (orderData.isUnpaid ? 'unpaid' : 'paid');

    const newOrder = {
      id,
      orderNumber,
      orderType: orderData.orderType || 'dine-in',
      tableNumber: orderData.tableNumber || 'Table 1',
      customerName: orderData.customerName || 'Walk-in Guest',
      serverName,
      cashierName,
      status: orderData.isUnpaid ? 'open' : (orderData.status || 'completed'),
      paymentMethod: orderData.paymentMethod || (orderData.isUnpaid ? 'pending' : 'cash'),
      paymentStatus,
      businessDate: this.getBusinessDate(),
      paidAt: paymentStatus === 'paid' ? new Date().toISOString() : null,
      paidBusinessDate: paymentStatus === 'paid' ? this.getBusinessDate() : null,
      items: orderData.items || [],
      subtotal: Number(orderData.subtotal.toFixed(2)),
      tax: Number(orderData.tax.toFixed(2)),
      discount: Number((orderData.discount || 0).toFixed(2)),
      total: Number(orderData.total.toFixed(2)),
      cashReceived: Number((orderData.cashReceived || (paymentStatus === 'paid' ? orderData.total : 0)).toFixed(2)),
      change: Number((orderData.change || 0).toFixed(2)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.unshift(newOrder); // newest first
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify('orderCreated', newOrder);
    this.notify('orders', orders);
    return newOrder;
  }

  getUnpaidOrders() {
    const seededBillIds = new Set(['ord-106', 'ord-107', 'ord-108', 'ord-3276', 'ord-3277', 'ord-3278', 'ord-3279', 'ord-3280', 'ord-3281']);
    const orders = this.getOrders();
    const realOrders = orders.filter(o => !seededBillIds.has(o.id));
    if (realOrders.length !== orders.length) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(realOrders));
    }
    return realOrders.filter(o => o.paymentStatus === 'unpaid' && o.status !== 'cancelled');
  }

  settleOrderPayment(orderId, paymentData) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    const currentUser = this.getCurrentUser();
    order.paymentStatus = 'paid';
    order.status = 'completed';
    order.paymentMethod = paymentData.paymentMethod || 'cash';
    order.cashReceived = Number((paymentData.cashReceived || order.total).toFixed(2));
    order.change = Number((paymentData.change || 0).toFixed(2));
    order.cashierName = currentUser ? `${currentUser.name} (${currentUser.title || currentUser.role})` : 'Cashier Maryam';
    order.paidAt = new Date().toISOString();
    order.paidBusinessDate = this.getBusinessDate();
    order.updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify('orderSettled', order);
    this.notify('orders', orders);
    return order;
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify('orderUpdated', order);
    return order;
  }

  updateOrder(orderId, updates) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;
    Object.assign(order, updates, { updatedAt: new Date().toISOString() });
    if (updates.items) {
      order.subtotal = Number(updates.subtotal || 0);
      order.tax = Number(updates.tax || 0);
      order.total = Number(updates.total || order.subtotal + order.tax);
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify('orderUpdated', order);
    this.notify('orders', orders);
    return order;
  }

  deleteOrder(orderId) {
    const orders = this.getOrders();
    const latestNumber = orders.reduce((max, order) => Math.max(max, Number(String(order.orderNumber || '').match(/(\d+)$/)?.[1] || 0)), 0);
    localStorage.setItem('hodman_order_sequence', String(Math.max(Number(localStorage.getItem('hodman_order_sequence') || 0), latestNumber)));
    const remaining = orders.filter(order => order.id !== orderId && order.orderNumber !== orderId);
    if (remaining.length === orders.length) return false;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(remaining));
    this.notify('orders', remaining);
    return true;
  }

  clearOrdersForDate(dateString) {
    if (!dateString) return 0;
    const orders = this.getOrders();
    const latestNumber = orders.reduce((max, order) => Math.max(max, Number(String(order.orderNumber || '').match(/(\d+)$/)?.[1] || 0)), 0);
    localStorage.setItem('hodman_order_sequence', String(Math.max(Number(localStorage.getItem('hodman_order_sequence') || 0), latestNumber)));
    const remaining = orders.filter(order => {
      const date = new Date(order.createdAt);
      const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return localDate !== dateString;
    });
    const removedCount = orders.length - remaining.length;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(remaining));
    this.notify('orders', remaining);
    return removedCount;
  }

  // ================= PURCHASE, SUPPLIERS & VENDOR PAYMENTS =================
  getSuppliers() {
    const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    const defaults = [
      {
        id: 'SUP-101',
        name: 'Somali Meat & Livestock Co.',
        category: 'Meat & Poultry',
        contactPerson: 'Hassan Mire',
        phone: '+252 61 555 1122',
        address: 'Kaaraan Livestock Market, Mogadishu',
        balance: 480.00,
        creditLimit: 2500.00,
        status: 'active'
      },
      {
        id: 'SUP-102',
        name: 'Mogadishu Fresh Vegetables & Produce',
        category: 'Fresh Produce & Herbs',
        contactPerson: 'Deeqa Nuur',
        phone: '+252 61 777 3344',
        address: 'Suuq Bacaad, Yaqshid',
        balance: 165.00,
        creditLimit: 1200.00,
        status: 'active'
      },
      {
        id: 'SUP-103',
        name: 'Baraka Spices & Rice Trading',
        category: 'Grains & Spices',
        contactPerson: 'Cumar Cabdi',
        phone: '+252 61 888 5566',
        address: 'Bakaara Market, Hodan',
        balance: 750.00,
        creditLimit: 4000.00,
        status: 'active'
      },
      {
        id: 'SUP-104',
        name: 'Hodman Beverage & Dairy Supply',
        category: 'Dairy & Beverages',
        contactPerson: 'Khadar Cilmi',
        phone: '+252 61 222 7788',
        address: 'KM4 Business Zone, Mogadishu',
        balance: 0.00,
        creditLimit: 2000.00,
        status: 'active'
      },
      {
        id: 'SUP-105',
        name: 'Hage Food Packaging & Disposables',
        category: 'Packaging & Supplies',
        contactPerson: 'Cabdiraxmaan Cali',
        phone: '+252 61 999 4400',
        address: 'Wadajir District, Mogadishu',
        balance: 220.00,
        creditLimit: 1500.00,
        status: 'active'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(defaults));
    return defaults;
  }

  addSupplier(data) {
    const list = this.getSuppliers();
    const newSupplier = {
      id: `SUP-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      category: data.category || 'General Supplies',
      contactPerson: data.contactPerson || '',
      phone: data.phone || '',
      address: data.address || 'Mogadishu',
      balance: Number(parseFloat(data.openingBalance || 0).toFixed(2)),
      creditLimit: Number(parseFloat(data.creditLimit || 2000).toFixed(2)),
      status: 'active',
      createdAt: new Date().toISOString()
    };
    list.unshift(newSupplier);
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(list));
    this.notify('suppliers', list);
    return newSupplier;
  }

  deleteSupplier(supplierId) {
    const list = this.getSuppliers();
    const supplier = list.find(s => s.id === supplierId);
    if (!supplier) return false;
    const updated = list.filter(s => s.id !== supplierId);
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(updated));
    this.notify('suppliers', updated);
    return true;
  }

  getPurchaseInvoices() {
    const stored = localStorage.getItem(STORAGE_KEYS.PURCHASE_INVOICES);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    const defaults = [
      {
        id: 'PINV-8821',
        supplierId: 'SUP-101',
        supplierName: 'Somali Meat & Livestock Co.',
        date: '2026-09-27',
        itemsSummary: 'Fresh Halal Camel Meat (50kg), Goat Meat (40kg)',
        total: 720.00,
        paid: 240.00,
        balance: 480.00,
        status: 'partial',
        paymentMethod: 'EVC Plus',
        receivedBy: 'Sahra Hassan (Chef)'
      },
      {
        id: 'PINV-8820',
        supplierId: 'SUP-103',
        supplierName: 'Baraka Spices & Rice Trading',
        date: '2026-09-26',
        itemsSummary: 'Basmati Rice (10 bags), Somali Xawaash (15kg), Cardamom',
        total: 1250.00,
        paid: 500.00,
        balance: 750.00,
        status: 'partial',
        paymentMethod: 'Premier Bank',
        receivedBy: 'Mohamed Admin'
      },
      {
        id: 'PINV-8819',
        supplierId: 'SUP-102',
        supplierName: 'Mogadishu Fresh Vegetables & Produce',
        date: '2026-09-25',
        itemsSummary: 'Tomatoes (40kg), Red Onions (50kg), Potatoes (30kg)',
        total: 315.00,
        paid: 150.00,
        balance: 165.00,
        status: 'partial',
        paymentMethod: 'Cash',
        receivedBy: 'Sahra Hassan'
      },
      {
        id: 'PINV-8818',
        supplierId: 'SUP-104',
        supplierName: 'Hodman Beverage & Dairy Supply',
        date: '2026-09-24',
        itemsSummary: 'Fresh Whole Milk (80L), Somali Spiced Tea Leaves (20kg)',
        total: 430.00,
        paid: 430.00,
        balance: 0.00,
        status: 'paid',
        paymentMethod: 'e-Dahab',
        receivedBy: 'Khadra Nuur'
      },
      {
        id: 'PINV-8817',
        supplierId: 'SUP-105',
        supplierName: 'Hage Food Packaging & Disposables',
        date: '2026-09-22',
        itemsSummary: 'Takeaway Meal Boxes (500pcs), Coffee Cups (1000pcs), Napkins',
        total: 380.00,
        paid: 160.00,
        balance: 220.00,
        status: 'partial',
        paymentMethod: 'EVC Plus',
        receivedBy: 'Maryam Yusuf'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PURCHASE_INVOICES, JSON.stringify(defaults));
    return defaults;
  }

  addPurchaseInvoice(data) {
    const list = this.getPurchaseInvoices();
    const newInvoice = {
      id: `PINV-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      date: data.date || new Date().toISOString().slice(0, 10),
      itemsSummary: data.itemsSummary || 'General Stock & Ingredients',
      total: Number(parseFloat(data.total).toFixed(2)),
      paid: Number(parseFloat(data.paid || 0).toFixed(2)),
      balance: Number((parseFloat(data.total) - parseFloat(data.paid || 0)).toFixed(2)),
      status: (parseFloat(data.paid || 0) >= parseFloat(data.total)) ? 'paid' : (parseFloat(data.paid || 0) > 0 ? 'partial' : 'unpaid'),
      paymentMethod: data.paymentMethod || 'Credit',
      receivedBy: data.receivedBy || 'Storekeeper'
    };
    list.unshift(newInvoice);
    localStorage.setItem(STORAGE_KEYS.PURCHASE_INVOICES, JSON.stringify(list));

    // Update supplier balance
    if (newInvoice.supplierId) {
      const suppliers = this.getSuppliers();
      const sup = suppliers.find(s => s.id === newInvoice.supplierId);
      if (sup) {
        sup.balance = Number((sup.balance + newInvoice.balance).toFixed(2));
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
        this.notify('suppliers', suppliers);
      }
    }

    this.notify('purchaseInvoices', list);
    return newInvoice;
  }

  deletePurchaseInvoice(invoiceId) {
    const invoices = this.getPurchaseInvoices();
    const invoice = invoices.find(item => item.id === invoiceId && item.status !== 'void');
    if (!invoice) return false;

    invoice.status = 'void';
    invoice.voidedAt = new Date().toISOString();
    const outstanding = Number(invoice.balance || 0);
    if (invoice.supplierId && outstanding > 0) {
      const suppliers = this.getSuppliers();
      const supplier = suppliers.find(item => item.id === invoice.supplierId);
      if (supplier) {
        supplier.balance = Math.max(0, Number((Number(supplier.balance || 0) - outstanding).toFixed(2)));
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
        this.notify('suppliers', suppliers);
      }
    }

    localStorage.setItem(STORAGE_KEYS.PURCHASE_INVOICES, JSON.stringify(invoices));
    this.notify('purchaseInvoices', invoices);
    return true;
  }

  getPurchasePayments() {
    const stored = localStorage.getItem(STORAGE_KEYS.PURCHASE_PAYMENTS);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    const defaults = [
      {
        id: 'VPAY-401',
        supplierId: 'SUP-101',
        supplierName: 'Somali Meat & Livestock Co.',
        date: '2026-09-27',
        amount: 240.00,
        paymentMethod: 'EVC Plus (709275)',
        reference: 'EVC-837492',
        notes: 'Meat supply payment for PINV-8821'
      },
      {
        id: 'VPAY-402',
        supplierId: 'SUP-103',
        supplierName: 'Baraka Spices & Rice Trading',
        date: '2026-09-26',
        amount: 500.00,
        paymentMethod: 'Premier Bank (673836)',
        reference: 'PB-994021',
        notes: 'Bulk rice payment for PINV-8820'
      },
      {
        id: 'VPAY-403',
        supplierId: 'SUP-102',
        supplierName: 'Mogadishu Fresh Vegetables & Produce',
        date: '2026-09-25',
        amount: 150.00,
        paymentMethod: 'Cash',
        reference: 'CSH-028',
        notes: 'Daily produce delivery payment'
      },
      {
        id: 'VPAY-404',
        supplierId: 'SUP-104',
        supplierName: 'Hodman Beverage & Dairy Supply',
        date: '2026-09-24',
        amount: 430.00,
        paymentMethod: 'e-Dahab (099859)',
        reference: 'ED-554109',
        notes: 'Full settlement of PINV-8818 milk'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PURCHASE_PAYMENTS, JSON.stringify(defaults));
    return defaults;
  }

  recordVendorPayment(data) {
    const payments = this.getPurchasePayments();
    const amount = Number(parseFloat(data.amount).toFixed(2));
    let invoice = null;
    let invoices = null;
    if (data.invoiceId) {
      invoices = this.getPurchaseInvoices();
      invoice = invoices.find(item => item.id === data.invoiceId && item.supplierId === data.supplierId);
      if (!invoice || amount <= 0 || amount > Number(invoice.balance || 0)) return null;
    }
    const newPayment = {
      id: `VPAY-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      invoiceId: data.invoiceId || null,
      date: data.date || new Date().toISOString().slice(0, 10),
      amount,
      paymentMethod: data.paymentMethod || 'EVC Plus',
      reference: data.reference || `REF-${Date.now().toString().slice(-6)}`,
      notes: data.notes || (data.invoiceId ? `Payment for invoice ${data.invoiceId}` : 'Vendor debt settlement')
    };
    payments.unshift(newPayment);
    localStorage.setItem(STORAGE_KEYS.PURCHASE_PAYMENTS, JSON.stringify(payments));

    if (invoice) {
      invoice.paid = Number((Number(invoice.paid || 0) + amount).toFixed(2));
      invoice.balance = Number(Math.max(0, Number(invoice.total || 0) - invoice.paid).toFixed(2));
      invoice.status = invoice.balance === 0 ? 'paid' : 'partial';
      localStorage.setItem(STORAGE_KEYS.PURCHASE_INVOICES, JSON.stringify(invoices));
      this.notify('purchaseInvoices', invoices);
    }

    // Deduct from supplier balance
    if (data.supplierId) {
      const suppliers = this.getSuppliers();
      const sup = suppliers.find(s => s.id === data.supplierId);
      if (sup) {
        sup.balance = Math.max(0, Number((sup.balance - amount).toFixed(2)));
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
        this.notify('suppliers', suppliers);
      }
    }

    this.notify('purchasePayments', payments);
    return newPayment;
  }

  // ================= EVENT BUS =================
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  notify(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
    if (this.listeners['*']) {
      this.listeners['*'].forEach(cb => cb({ event, data }));
    }
  }

  // ================= REPORTS & ANALYTICS =================
  getReportsSummary() {
    const orders = this.getOrders();
    const settings = this.getSettings();

    let totalRevenue = 0;
    let completedOrders = 0;
    let activeOrders = 0;
    const paymentMethodStats = { cash: 0, card: 0, mobile: 0 };
    const itemSalesMap = {};

    orders.forEach(order => {
      if (order.status !== 'cancelled') {
        totalRevenue += order.total;
        paymentMethodStats[order.paymentMethod] = (paymentMethodStats[order.paymentMethod] || 0) + order.total;
      }

      if (order.status === 'completed') {
        completedOrders++;
      } else if (['pending', 'preparing', 'ready'].includes(order.status)) {
        activeOrders++;
      }

      order.items.forEach(item => {
        if (!itemSalesMap[item.name]) {
          itemSalesMap[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            price: item.price
          };
        }
        itemSalesMap[item.name].quantity += item.quantity;
        itemSalesMap[item.name].revenue += item.price * item.quantity;
      });
    });

    const topItems = Object.values(itemSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);

    const averageOrderValue = orders.length > 0 ? (totalRevenue / orders.length) : 0;

    return {
      currency: settings.currency || '$',
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders: orders.length,
      completedOrders,
      activeOrders,
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      paymentMethodStats,
      topItems,
      recentOrders: orders.slice(0, 20)
    };
  }
}

window.restaurantDB = new RestaurantDB();
