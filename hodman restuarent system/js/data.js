/**
 * Hodman Restaurant System - Initial Seed Data & Defaults
 */

const DEFAULT_USERS = [
  {
    id: 'usr-admin',
    username: 'admin',
    password: 'admin123',
    pin: '9999',
    name: 'Mohamed Omar',
    role: 'admin',
    title: 'General Manager',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    permissions: ['pos', 'kds', 'reports', 'inventory', 'admin', 'settings']
  },
  {
    id: 'usr-cashier',
    username: 'cashier',
    password: 'cash123',
    pin: '1234',
    name: 'Maryam Yusuf',
    role: 'cashier',
    title: 'Senior Cashier',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    permissions: ['pos', 'kds', 'reports', 'inventory']
  },
  {
    id: 'usr-waiter',
    username: 'waiter',
    password: 'wait123',
    pin: '5678',
    name: 'Farhan Ali',
    role: 'waiter',
    title: 'Floor Waiter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    permissions: ['pos', 'kds']
  }
];

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Dishes', icon: 'fa-utensils' },
  { id: 'somali_specials', name: 'Hodman Specials', icon: 'fa-star' },
  { id: 'appetizers', name: 'Appetizers', icon: 'fa-bread-slice' },
  { id: 'mains', name: 'Mains & Grills', icon: 'fa-fire' },
  { id: 'fast_food', name: 'Burgers & Wraps', icon: 'fa-burger' },
  { id: 'drinks', name: 'Beverages', icon: 'fa-glass-water' },
  { id: 'desserts', name: 'Desserts', icon: 'fa-cake-candles' }
];

const DEFAULT_MENU_ITEMS = [
  // Somali Specials
  {
    id: 1,
    categoryId: 'somali_specials',
    name: 'Bariis Iskukaris & Goat (Hilib Ari)',
    description: 'Fragrant spiced basmati rice served with tender braised goat meat, caramelized onions, raisins, and fresh banana.',
    price: 16.50,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 2,
    categoryId: 'somali_specials',
    name: 'Baasto Salbuko (Beef Pasta)',
    description: 'Traditional Somali-style spiced pasta tossed in rich tomato, garlic, and slow-simmered minced steak sauce.',
    price: 13.00,
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281724?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 3,
    categoryId: 'somali_specials',
    name: 'Chicken Suqaar with Sabaayad',
    description: 'Diced chicken breast sautéed with bell peppers, onions, cumin, and cilantro served with warm flaky flatbread.',
    price: 14.50,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 4,
    categoryId: 'somali_specials',
    name: 'Roasted Lamb Shank (Karis Hilib)',
    description: 'Fall-off-the-bone lamb shank seasoned with xawaash spices, served over seasoned fragrant yellow rice.',
    price: 19.00,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    available: true
  },

  // Appetizers
  {
    id: 5,
    categoryId: 'appetizers',
    name: 'Crispy Beef Sambusa (3 pcs)',
    description: 'Golden fried triangular pastries stuffed with spiced minced beef, spring onions, and green chilies. Served with bisbas dip.',
    price: 6.00,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 6,
    categoryId: 'appetizers',
    name: 'Vegetable & Lentil Sambusa (3 pcs)',
    description: 'Crisp pastry triangles packed with seasoned lentils, carrots, peas, and fragrant herbs.',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 7,
    categoryId: 'appetizers',
    name: 'Crispy Bajiyo (Black-eyed Pea Fritters)',
    description: 'Savory fried spiced fritters made from ground black-eyed peas, cilantro, garlic, served with tamarind bisbas.',
    price: 5.00,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    available: true
  },

  // Mains & Grills
  {
    id: 8,
    categoryId: 'mains',
    name: 'Hodman Mixed Grill Platter',
    description: 'Generous platter of grilled chicken tikka, beef kebab skewers, and lamb ribs served with grilled vegetables and saffron rice.',
    price: 24.50,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 9,
    categoryId: 'mains',
    name: 'Charbroiled Salmon Fillet',
    description: 'Fresh Atlantic salmon glazed with lemon garlic butter, served with sautéed greens and roasted potato wedges.',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 10,
    categoryId: 'mains',
    name: 'Grilled T-Bone Steak (12 oz)',
    description: 'Prime marinated T-bone grilled to perfection with rosemary garlic butter and mashed potatoes.',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80',
    available: true
  },

  // Burgers & Wraps
  {
    id: 11,
    categoryId: 'fast_food',
    name: 'Hodman Deluxe Beef Burger',
    description: '100% Angus beef patty, melted cheddar, caramelized onions, beef bacon, crisp lettuce, and signature sauce with fries.',
    price: 11.50,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 12,
    categoryId: 'fast_food',
    name: 'Crispy Buffalo Chicken Wrap',
    description: 'Crispy fried chicken tenders tossed in mild buffalo glaze, wrapped in toasted tortilla with ranch dressing.',
    price: 10.00,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 13,
    categoryId: 'fast_food',
    name: 'Spiced Steak Shawarma Roll',
    description: 'Thinly sliced seasoned beef steak wrapped in saj flatbread with sumac onions, pickles, and tahini drizzle.',
    price: 10.50,
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&auto=format&fit=crop&q=80',
    available: true
  },

  // Beverages
  {
    id: 14,
    categoryId: 'drinks',
    name: 'Authentic Somali Spiced Chai (Shaah)',
    description: 'Brewed black tea infused with cardamom, cloves, cinnamon, ginger, and steamed whole milk.',
    price: 3.50,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 15,
    categoryId: 'drinks',
    name: 'Fresh Mango & Passionfruit Smoothie',
    description: 'Freshly blended Alfonso mango and tangy passionfruit with a hint of mint.',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 16,
    categoryId: 'drinks',
    name: 'Iced Karkadeh (Hibiscus Tea)',
    description: 'Chilled steeped hibiscus tea with wild berries and natural organic honey.',
    price: 4.00,
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
    available: true
  },

  // Desserts
  {
    id: 17,
    categoryId: 'desserts',
    name: 'Warm Malawax Crepes with Honey',
    description: 'Sweet, cardamom-scented delicate Somali crepes rolled with warm butter and blossom honey.',
    price: 6.50,
    image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 18,
    categoryId: 'desserts',
    name: 'Pistachio Baklava (4 pcs)',
    description: 'Crisp layers of phyllo pastry filled with chopped roasted pistachios and sweetened with fragrant syrup.',
    price: 7.00,
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600&auto=format&fit=crop&q=80',
    available: true
  }
];

const DEFAULT_INVENTORY = [
  {
    id: 'inv-1',
    name: 'Basmati Long-Grain Rice',
    category: 'Grains & Pasta',
    quantity: 48,
    unit: 'kg',
    minThreshold: 20,
    costPerUnit: 2.20,
    supplier: 'Mogadishu Grain Wholesalers',
    lastRestocked: '2026-09-25'
  },
  {
    id: 'inv-2',
    name: 'Fresh Goat Meat (Hilib Ari)',
    category: 'Meat & Poultry',
    quantity: 26,
    unit: 'kg',
    minThreshold: 15,
    costPerUnit: 9.50,
    supplier: 'Banadir Fresh Meats',
    lastRestocked: '2026-09-26'
  },
  {
    id: 'inv-3',
    name: 'Prime Beef Steaks & Mince',
    category: 'Meat & Poultry',
    quantity: 19,
    unit: 'kg',
    minThreshold: 10,
    costPerUnit: 11.00,
    supplier: 'Banadir Fresh Meats',
    lastRestocked: '2026-09-25'
  },
  {
    id: 'inv-4',
    name: 'Fresh Chicken Breasts',
    category: 'Meat & Poultry',
    quantity: 22,
    unit: 'kg',
    minThreshold: 12,
    costPerUnit: 6.50,
    supplier: 'Al-Baraka Poultry',
    lastRestocked: '2026-09-26'
  },
  {
    id: 'inv-5',
    name: 'Somali Chai Spices (Xawaash & Cardamom)',
    category: 'Spices & Dry Goods',
    quantity: 4.5,
    unit: 'kg',
    minThreshold: 3.0,
    costPerUnit: 18.00,
    supplier: 'Spice Souk Traders',
    lastRestocked: '2026-09-20'
  },
  {
    id: 'inv-6',
    name: 'Alfonso Mangoes (Fresh)',
    category: 'Produce',
    quantity: 6,
    unit: 'kg',
    minThreshold: 12, // LOW STOCK ALERT!
    costPerUnit: 3.00,
    supplier: 'Shabelle Valley Farms',
    lastRestocked: '2026-09-22'
  },
  {
    id: 'inv-7',
    name: 'Whole Milk & Cream',
    category: 'Dairy',
    quantity: 8,
    unit: 'Liters',
    minThreshold: 15, // LOW STOCK ALERT!
    costPerUnit: 1.50,
    supplier: 'Camel Dairy & Creamery',
    lastRestocked: '2026-09-24'
  },
  {
    id: 'inv-8',
    name: 'Sambusa Pastry Wrappers',
    category: 'Bakery & Pastry',
    quantity: 160,
    unit: 'pcs',
    minThreshold: 50,
    costPerUnit: 0.15,
    supplier: 'Hodman Bakery Kitchen',
    lastRestocked: '2026-09-26'
  },
  {
    id: 'inv-9',
    name: 'Brioche Burger Buns',
    category: 'Bakery & Pastry',
    quantity: 35,
    unit: 'pcs',
    minThreshold: 20,
    costPerUnit: 0.60,
    supplier: 'Hodman Bakery Kitchen',
    lastRestocked: '2026-09-26'
  },
  {
    id: 'inv-10',
    name: 'Pure Blossom Honey',
    category: 'Spices & Dry Goods',
    quantity: 3,
    unit: 'kg',
    minThreshold: 5, // LOW STOCK ALERT!
    costPerUnit: 12.00,
    supplier: 'Organic Bee Harvesters',
    lastRestocked: '2026-09-18'
  },
  {
    id: 'inv-11',
    name: 'Cooking Sunflower Oil',
    category: 'Oils & Essentials',
    quantity: 40,
    unit: 'Liters',
    minThreshold: 15,
    costPerUnit: 2.80,
    supplier: 'Mogadishu Grain Wholesalers',
    lastRestocked: '2026-09-25'
  }
];

const DEFAULT_SETTINGS = {
  restaurantName: 'Hodman restaurant',
  subtitle: 'Restaurant Halls & Cafeteria',
  address: 'Mogadishu, Somalia',
  phone: '+252 61 500 1234',
  currency: '$',
  taxRate: 0.05, // 5%
  receiptFooter: 'Thank you for visiting\nHodman restaurant!\nPlease come again.',
  poweredBy: 'DEV: Jookar',
  // Somali Mobile Money Merchant Codes
  evcMerchantCode: '709275',    // EVC Plus / Merchant *789*CODE*AMOUNT#
  edahabCode: '099859',         // Edahab *113*CODE*AMOUNT#
  premierWalletCode: '673836',  // Premier Wallet
  ebesaCode: '940396'           // Ebesa
};

const DEFAULT_TABLES = [
  'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6',
  'Table 7', 'Table 8', 'Table 9', 'Table 10', 'VIP Lounge', 'Patio 1', 'Patio 2', 'Takeaway', 'Delivery'
];

window.HODMAN_DATA = {
  DEFAULT_USERS,
  DEFAULT_CATEGORIES,
  DEFAULT_MENU_ITEMS,
  DEFAULT_INVENTORY,
  DEFAULT_SETTINGS,
  DEFAULT_TABLES
};
