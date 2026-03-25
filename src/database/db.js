import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('freddys_pizza.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId TEXT,
      name TEXT,
      price REAL,
      quantity INTEGER,
      image TEXT,
      stock INTEGER
    );
  `);
};

export const addToCartSql = (item) => {
  try {
    const existing = db.getAllSync('SELECT * FROM cart WHERE productId = ?', [item._id || '']);
    if (existing.length > 0) {
      db.runSync(
        'UPDATE cart SET quantity = quantity + 1 WHERE productId = ?',
        [item._id || '']
      );
    } else {
      db.runSync(
        'INSERT INTO cart (productId, name, price, quantity, image, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [
          item._id || '',
          item.name || 'Unknown',
          item.price || 0,
          1,
          item.images && item.images.length > 0 ? item.images[0] : '',
          item.stock || 0,
        ]
      );
    }
    console.log('SQLITE: Item saved!');
  } catch (error) {
    console.log('SQLITE SAVE ERROR:', error);
  }
};

export const getCartItemsSql = () => {
  try {
    const rows = db.getAllSync('SELECT * FROM cart');
    return rows.map(row => ({
      ...row,
      productId: row.productId,
      images: row.image ? [row.image] : [],
    }));
  } catch (error) {
    console.log('SQLITE GET ERROR:', error);
    return [];
  }
};

export const clearCartSql = () => {
  try {
    db.runSync('DELETE FROM cart');
    console.log('SQLITE: Cart cleared successfully!');
  } catch (error) {
    console.log('SQLITE DELETE ERROR:', error);
  }
};