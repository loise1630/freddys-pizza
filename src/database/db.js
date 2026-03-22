import * as SQLite from 'expo-sqlite';

// Buksan ang database
const db = SQLite.openDatabaseSync('freddys_pizza.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId TEXT,
      name TEXT,
      price REAL,
      quantity INTEGER,
      image TEXT
    );
  `);
};

export const addToCartSql = (item) => {
  try {
    db.runSync(
      'INSERT INTO cart (productId, name, price, quantity, image) VALUES (?, ?, ?, ?, ?)',
      [
        item._id || '0', 
        item.name || 'Unknown', 
        item.price || 0, 
        1, 
        item.images && item.images.length > 0 ? item.images[0] : ''
      ]
    );
    console.log("SQLITE: Item saved! 🍕");
  } catch (error) { 
    console.log("SQLITE SAVE ERROR:", error); 
  }
};

export const getCartItemsSql = () => {
  try {
    return db.getAllSync('SELECT * FROM cart');
  } catch (error) {
    console.log("SQLITE GET ERROR:", error);
    return [];
  }
};

// BAGONG DAGDAG: Burahin lahat ng laman ng cart (Para sa requirements)
export const clearCartSql = () => {
  try {
    db.runSync('DELETE FROM cart');
    console.log("SQLITE: Cart cleared successfully! 🧹");
  } catch (error) {
    console.log("SQLITE DELETE ERROR:", error);
  }
};