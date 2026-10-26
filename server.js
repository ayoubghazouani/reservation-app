const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const conn = db.open();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/slots', (req, res) => res.json(db.SLOTS));

app.get('/api/reservations', (req, res) => {
  res.json(db.listByDate(conn, req.query.date || new Date().toISOString().slice(0, 10)));
});

app.post('/api/reservations', (req, res) => {
  const { client_name, phone, guests, date, slot } = req.body;
  const result = db.book(conn, { client_name, phone, guests: Number(guests), date, slot });
  if (result.error) return res.status(result.status || 400).json({ error: result.error });
  res.status(201).json(result.reservation);
});

app.delete('/api/reservations/:id', (req, res) => {
  db.cancel(conn, Number(req.params.id)) ? res.status(204).end() : res.status(404).json({ error: 'Réservation introuvable.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Application disponible sur http://localhost:${PORT}`));
