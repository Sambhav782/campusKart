# CampusKart

CampusKart is a campus-first marketplace prototype where students can discover and list useful items within their college community. The project now includes a React/Vite frontend and an Express API, with a JSON-file database by default and optional MongoDB support.

## Features

- Browse and search product listings; filter by category.
- View product details and save favorites in the current browser.
- Register and sign in using an email and password.
- Create listings when signed in.
- Store listings and user accounts in a local JSON file by default.
- Use MongoDB when a valid `MONGODB_URI` is configured and the database is reachable.
- Fall back to JSON storage if MongoDB is not configured or cannot connect.

**Prototype limitations:** This is a learning/demo project, not production-ready marketplace infrastructure. Seller messaging, payments, email verification, password reset, image uploads, moderation, and account-management screens are not implemented. Favorites currently persist in the browser only. Use HTTPS and a strong `JWT_SECRET` before deploying.

## Tech stack

- Frontend: React 18, Vite, JavaScript, CSS
- Backend: Node.js, Express
- Authentication: bcrypt password hashing and signed JWTs
- Storage: JSON file by default; optional MongoDB with Mongoose

## Prerequisites

Install a current Node.js LTS release (npm is included).

## Run locally

Open two terminals in the repository root.

### 1. Start the backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`, then set a unique `JWT_SECRET`. Leave `MONGODB_URI` empty to use the JSON database.

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health` to see which storage mode is active.

### 2. Start the frontend

In a second terminal, from the repository root:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

The frontend defaults to `http://localhost:5000/api`. To use a different API URL, create `.env` in the project root based on `src/.env.example` and set `VITE_API_URL`.

## Optional MongoDB setup

1. Create a MongoDB database (local or Atlas) and obtain its connection string.
2. Put the connection string in `backend/.env` as `MONGODB_URI=...`.
3. Restart the backend.
4. Visit `/api/health`; the response should report `"storage":"mongo"` when connected.

If MongoDB is missing or unreachable at startup, the API logs a warning and uses `backend/data/db.json` instead. **The JSON file and MongoDB are separate stores; data is not automatically migrated or synchronized between them.** When you switch stores, seed listings may differ and accounts created in one store won't exist in the other.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API status and active storage |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Get one product |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Read the current signed-in user |
| POST | `/api/products` | Create a listing (Bearer token required) |

## Project structure

```text
campusKart/
├── backend/
│   ├── data/db.json
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── src/
│   ├── components/
│   ├── data/products.js
│   ├── lib/api.js
│   ├── App.jsx
│   └── index.css
├── package.json
└── README.md
```

## Security and data notes

- Never commit real `.env` files or secrets.
- Use a long, random `JWT_SECRET` outside local development.
- The JSON store is suitable for local development and demos only; it is not designed for concurrent production writes or multi-instance hosting.
- The JSON database file must be on persistent storage. Some hosting platforms use ephemeral filesystems.
- Configure `CLIENT_ORIGIN` to your deployed frontend origin when hosting the API elsewhere.

## License

No license has been specified yet.
