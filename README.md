# Réservation de tables

Application web pour réserver une table dans un restaurant : choix de la date, du créneau et du nombre de personnes, attribution automatique de la plus petite table libre, liste des réservations du jour et annulation.

## Technologies
- **Front-end** : HTML, CSS, JavaScript
- **Back-end** : Node.js, Express.js (API REST)
- **Base de données** : SQL (SQLite intégré à Node.js)

## Fonctionnalités
- Réservation avec validation (nom, téléphone, 1 à 8 personnes, date non passée)
- Une table ne peut pas être réservée deux fois pour le même créneau (contrainte `UNIQUE` en SQL)
- Consultation des réservations par jour
- Annulation d'une réservation

## Lancer le projet
Prérequis : Node.js 22.5 ou plus récent.

```bash
npm install
npm start
```
Puis ouvrir http://localhost:3000. Les tests de la logique de réservation se lancent avec `npm test`.

## API
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/slots` | Liste des créneaux |
| GET | `/api/reservations?date=AAAA-MM-JJ` | Réservations d'un jour |
| POST | `/api/reservations` | Créer une réservation |
| DELETE | `/api/reservations/:id` | Annuler une réservation |

## Structure
- `server.js` : routes Express
- `db.js` : schéma SQL, validation et logique de réservation
- `public/index.html` : interface
- `test.js` : tests
