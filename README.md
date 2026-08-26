# Players Club Relationship

The "Global Football (Soccer) Teammate & Transfer Network"

This project connects football players, clubs, and shared histories through a graph-based relationship explorer. The app helps users trace short connection paths between players, find indirect teammate links, and review clubs with the largest connected squads.

## Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Tailwind CSS
- ESLint

### Backend

- Python 3
- Flask
- CognoDB graph database
- CSV-based football data import

## Project structure

```bash
players-club-relationship/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── db/
│   ├── seed/
│   └── README.md
├── frontend/
│   ├── package.json
│   ├── src/
│   ├── public/
│   └── README.md
├── README.md
└── DOCS.md
```

## How it works

- The backend exposes graph queries through a Flask API.
- The frontend consumes those routes and presents the results in a user-friendly interface.
- The data model focuses on player-to-club relationships and connection paths across shared club history.

## More information

- Frontend docs: [frontend/README.md](frontend/README.md)
- Backend docs: [backend/README.md](backend/README.md)

## Local setup

1. Set up the backend:
   - follow the instructions in [backend/README.md](backend/README.md)
2. Set up the frontend:
   - follow the instructions in [frontend/README.md](frontend/README.md)
3. Start both services and open the frontend in the browser.

## Typical workflow

- start the Flask API on localhost:5000
- start the Vite frontend on localhost:5173
- use the explorer page to query player relationships and squad data

For implementation details, and system architecture, see the [dedicated docs](DOCS.md).
