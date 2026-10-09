const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initSchema();
  }
});

function initSchema() {
  db.serialize(() => {
    // Categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT
      )
    `);

    // Menu items table
    db.run(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        available INTEGER DEFAULT 1,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number TEXT UNIQUE NOT NULL,
        order_type TEXT NOT NULL,
        table_number TEXT,
        customer_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'paid',
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        cash_received REAL,
        change REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order line items table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        menu_item_id INTEGER,
        name TEXT NOT NULL,
        unit_price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        notes TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // Seed initial categories if empty
    db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare('INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)');
        const defaultCats = [
          ['all', 'All Dishes', 'fa-utensils'],
          ['somali_specials', 'Hodman Specials', 'fa-star'],
          ['appetizers', 'Appetizers', 'fa-bread-slice'],
          ['mains', 'Mains & Grills', 'fa-fire'],
          ['fast_food', 'Burgers & Wraps', 'fa-burger'],
          ['drinks', 'Beverages', 'fa-glass-water'],
          ['desserts', 'Desserts', 'fa-cake-candles']
        ];
        defaultCats.forEach(c => stmt.run(c));
        stmt.finalize();
        console.log('Seeded default categories.');
      }
    });

    // Seed menu items if empty
    db.get('SELECT COUNT(*) as count FROM menu_items', (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare(`
          INSERT INTO menu_items (category_id, name, description, price, image, available)
          VALUES (?, ?, ?, ?, ?, 1)
        `);

        const items = [
          ['somali_specials', 'Bariis Iskukaris & Goat (Hilib Ari)', 'Fragrant spiced basmati rice served with tender braised goat meat, caramelized onions, raisins, and fresh banana.', 16.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'],
          ['somali_specials', 'Baasto Salbuko (Beef Pasta)', 'Traditional Somali-style spiced pasta tossed in rich tomato, garlic, and slow-simmered minced steak sauce.', 13.00, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281724?w=600&auto=format&fit=crop&q=80'],
          ['somali_specials', 'Chicken Suqaar with Sabaayad', 'Diced chicken breast sautéed with bell peppers, onions, cumin, and cilantro served with warm flaky flatbread.', 14.50, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80'],
          ['somali_specials', 'Roasted Lamb Shank (Karis Hilib)', 'Fall-off-the-bone lamb shank seasoned with xawaash spices, served over seasoned fragrant yellow rice.', 19.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'],
          ['appetizers', 'Crispy Beef Sambusa (3 pcs)', 'Golden fried triangular pastries stuffed with spiced minced beef, spring onions, and green chilies.', 6.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'],
          ['mains', 'Hodman Mixed Grill Platter', 'Generous platter of grilled chicken tikka, beef kebab skewers, and lamb ribs served with grilled vegetables and saffron rice.', 24.50, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80'],
          ['fast_food', 'Hodman Deluxe Beef Burger', '100% Angus beef patty, melted cheddar, caramelized onions, beef bacon, crisp lettuce, and signature sauce with fries.', 11.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'],
          ['drinks', 'Authentic Somali Spiced Chai (Shaah)', 'Brewed black tea infused with cardamom, cloves, cinnamon, ginger, and steamed whole milk.', 3.50, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80'],
          ['drinks', 'Fresh Mango & Passionfruit Smoothie', 'Freshly blended Alfonso mango and tangy passionfruit with a hint of mint.', 5.50, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80']
        ];

        items.forEach(it => stmt.run(it));
        stmt.finalize();
        console.log('Seeded default menu items.');
      }
    });
  });
}

module.exports = db;
