// Accès à la base de données SQL (SQLite intégré à Node.js, aucune installation en plus)
const { DatabaseSync } = require('node:sqlite');

const SLOTS = ['12:00','13:00','14:00','19:00','20:00','21:00','22:00'];

function open(file = 'reservations.db') {
  const db = new DatabaseSync(file);
  db.exec(`
    CREATE TABLE IF NOT EXISTS tables_resto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER NOT NULL REFERENCES tables_resto(id),
      client_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      guests INTEGER NOT NULL,
      date TEXT NOT NULL,
      slot TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (table_id, date, slot)  -- une table ne peut être réservée qu'une fois par créneau
    );
  `);
  if (db.prepare('SELECT COUNT(*) AS n FROM tables_resto').get().n === 0) {
    const ins = db.prepare('INSERT INTO tables_resto (name, capacity) VALUES (?, ?)');
    [['Table 1',2],['Table 2',2],['Table 3',4],['Table 4',4],['Table 5',6],['Table 6',8]].forEach(t => ins.run(...t));
  }
  return db;
}

function validate({ client_name, phone, guests, date, slot }) {
  const today = new Date().toISOString().slice(0, 10);
  if (!client_name || client_name.trim().length < 2) return 'Nom invalide.';
  if (!/^[0-9+ ]{8,15}$/.test(phone || '')) return 'Numéro de téléphone invalide.';
  if (!Number.isInteger(guests) || guests < 1 || guests > 8) return 'Nombre de personnes : entre 1 et 8.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || date < today) return 'Date invalide ou déjà passée.';
  if (!SLOTS.includes(slot)) return 'Créneau invalide.';
  return null;
}

// Tables libres pour une date + un créneau, assez grandes pour le groupe
function available(db, date, slot, guests) {
  return db.prepare(`
    SELECT id, name, capacity FROM tables_resto
    WHERE capacity >= ? AND id NOT IN (SELECT table_id FROM reservations WHERE date = ? AND slot = ?)
    ORDER BY capacity, id`).all(guests, date, slot);
}

// Réserve automatiquement la plus petite table libre convenable
function book(db, data) {
  const error = validate(data);
  if (error) return { error };
  const free = available(db, data.date, data.slot, data.guests);
  if (free.length === 0) return { error: 'Aucune table disponible pour ce créneau.', status: 409 };
  const t = free[0];
  const r = db.prepare(`INSERT INTO reservations (table_id, client_name, phone, guests, date, slot)
                        VALUES (?, ?, ?, ?, ?, ?)`)
    .run(t.id, data.client_name.trim(), data.phone, data.guests, data.date, data.slot);
  return { reservation: { id: Number(r.lastInsertRowid), table: t.name, ...data } };
}

function listByDate(db, date) {
  return db.prepare(`
    SELECT r.id, r.client_name, r.guests, r.date, r.slot, t.name AS table_name
    FROM reservations r JOIN tables_resto t ON t.id = r.table_id
    WHERE r.date = ? ORDER BY r.slot, t.name`).all(date);
}

function cancel(db, id) {
  return db.prepare('DELETE FROM reservations WHERE id = ?').run(id).changes > 0;
}

module.exports = { open, book, available, listByDate, cancel, SLOTS };
