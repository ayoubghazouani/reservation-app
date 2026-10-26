// Tests simples de la logique de réservation : node test.js
const assert = require('assert');
const db = require('./db');
const conn = db.open(':memory:');
const d = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const base = { client_name: 'Test', phone: '27762005', guests: 2, date: d, slot: '20:00' };

let r = db.book(conn, base);
assert.ok(r.reservation, 'une réservation valide doit réussir');
assert.strictEqual(r.reservation.table, 'Table 1', 'la plus petite table libre est choisie');

for (let i = 0; i < 5; i++) assert.ok(db.book(conn, base).reservation);   // tables 2 à 6
assert.strictEqual(db.book(conn, base).status, 409, 'plus aucune table libre');

assert.ok(db.book(conn, { ...base, slot: '21:00' }).reservation, 'autre créneau = libre');
assert.ok(db.book(conn, { ...base, guests: 9 }).error, 'trop de personnes refusé');
assert.ok(db.book(conn, { ...base, date: '2020-01-01' }).error, 'date passée refusée');
assert.ok(db.cancel(conn, 1), 'annulation');
assert.ok(db.book(conn, base).reservation, 'table libérée réservable à nouveau');
console.log('Tous les tests passent.');
