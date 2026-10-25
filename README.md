# CampusKart

CampusKart is a campus-first marketplace prototype where students can discover, buy, and sell useful items within their college community. It includes a React/Vite frontend and an Express API, with JSON-file storage by default and optional MongoDB support.

## Features

### Marketplace
- Browse, search, and filter product listings.
- View product details and images.
- Create listings while signed in, with up to five item photos (5 MB each).
- Track listing quantity and availability; sold-out listings remain marked as sold.
- Save favorites in the current browser.

### Accounts and shopping
- Register and sign in using an email and password.
- Passwords are hashed; authenticated API requests use JWT bearer tokens.
- Add listings to your cart, purchase an item, or buy eligible cart items in bulk.
- View your profile, listings, cart, orders, and notifications.
- Delete your account from the profile page. Account deletion also removes listings published by that account and clears references to removed listings from other users' carts.

### Storage
- Use the local JSON database at `backend/data/db.json` by default.
- Use MongoDB when a valid `MONGODB_URI` is configured and the database is reachable.
- Fall back to JSON storage if MongoDB is not configured or cannot connect.

> **Prototype limitations:** This is a learning/demo project, not production-ready marketplace infrastructure. It does not provide real payment processing, seller messaging, email verification, password reset, or a full moderation system. Listing images are stored on the backend filesystem. Favorites currently persist in the browser only. Use HTTPS and a strong `JWT_SECRET` before deploying.

## Tech stack

- **Frontend:** React 18, Vite, JavaScript, CSS
- **Backend:** Node.js, Express
- **Authentication:** bcrypt password hashing and signed JWTs
- **Database:** JSON file by default; optional MongoDB with Mongoose

## Prerequisites

Install a current Node.js LTS release (npm is included).

## Run locally

Open two terminals in the repository root.

### 1. Start the backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and set a unique `JWT_SECRET`. Leave `MONGODB_URI` empty to use JSON storage.

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`. Visit `http://localhost:5000/api/health` to check the active storage mode.

### 2. Start the frontend

In a second terminal, from the repository root:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

The frontend defaults to `http://localhost:5000/api`. To use a different API URL, create a root `.env` based on `.env.example` and set `VITE_API_URL`.

## Optional MongoDB setup

1. Create a MongoDB database (local or Atlas) and obtain its connection string.
2. Put the connection string in `backend/.env` as `MONGODB_URI=...`.
3. Restart the backend.
4. Visit `/api/health`; the response should report `"storage":"mongo"` when connected.

If MongoDB is missing or unreachable at startup, the API logs a warning and uses `backend/data/db.json` instead. **The JSON file and MongoDB are separate stores; data is not automatically migrated or synchronized between them.** Accounts and listings created in one store will not automatically appear in the other.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API status and active storage mode |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Get one product |
| POST | `/api/products` | Create a listing (authentication required) |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get the current signed-in user |
| DELETE | `/api/account` | Delete the signed-in account and its listings |
| `/api/cart` and `/api/orders` | See `backend/server.js` for supported cart and order operations |

Authenticated endpoints require a valid JWT bearer token. The account-deletion action is permanent and removes the user's listings as well.

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

- Never commit real `.env` files, credentials, or secrets.
- Use a long, random `JWT_SECRET` outside local development.
- The JSON store is suitable for local development and demos only; it is not designed for concurrent production writes or multi-instance hosting.
- The JSON database file must be on persistent storage. Some hosting platforms use ephemeral filesystems.
- Configure `CLIENT_ORIGIN` to your deployed frontend origin when hosting the API separately.
- Back up your data before testing destructive actions such as account deletion.

## License

No license has been specified yet.
