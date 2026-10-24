# CampusKart

CampusKart is a **frontend prototype for a campus-first marketplace** where students can discover, buy, and sell useful items within their college community.

The current version is built with React and Vite. It uses sample product data and is intended to demonstrate the user interface and frontend interactions; it does not yet include a production backend.

## Features

- **Marketplace browsing** — view product cards and sample listings.
- **Search and category filtering** — find listings by keyword or category.
- **Product details** — open a modal to view more information about a listing.
- **Favorites** — mark products as favorites in the prototype.
- **Sell-item flow** — explore the demo listing form.
- **Demo sign-in** — open the sign-in interface.
- **Responsive layout** — browse the interface on different screen sizes.
- **Campus trust and guidance** — learn how the marketplace is intended to work.

> **Prototype note:** Listings use mock data and remote demo images. Sign-in, selling, and other interactions are frontend demonstrations only. User accounts, persistent listings, messaging, payments, and backend/API integration are not implemented.

## Tech stack

- [React](https://react.dev/) 18
- [Vite](https://vite.dev/)
- JavaScript (ES modules)
- CSS

## Getting started

### Prerequisites

Install [Node.js](https://nodejs.org/) (which includes npm). A current Node.js LTS release is recommended.

### 1. Clone the repository

```bash
git clone https://github.com/Sambhav782/campusKart.git
cd campusKart
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed in your terminal (Vite commonly uses `http://localhost:5173`).

### Build for production

```bash
npm run build
```

The production-ready files are generated in the `dist/` directory.

To preview that build locally:

```bash
npm run preview
```

## Project structure

```text
campusKart/
├── index.html
├── package.json
├── package-lock.json
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── components/
    │   ├── Categories.jsx
    │   ├── Footer.jsx
    │   ├── Hero.jsx
    │   ├── Marketplace.jsx
    │   ├── Modals.jsx
    │   ├── Navbar.jsx
    │   ├── ProductCard.jsx
    │   └── TrustSection.jsx
    └── data/
        └── products.js
```

## Dependency management

This is a **Node.js frontend project**, so dependencies are declared in `package.json` and pinned by `package-lock.json`. Use `npm install` to install them. A Python `requirements.txt` file is not applicable to this project unless Python components are added later.

## Current status and next steps

CampusKart is currently a frontend prototype. Possible next steps include:

- Connect the UI to a backend and database.
- Implement real authentication and user profiles.
- Persist product listings and favorites.
- Add listing image uploads and product management.
- Add seller-buyer contact or messaging.
- Validate and test the production build and deployment.

## Contributing

For local development, create a branch for your changes and open a pull request with a clear description of what changed.

## License

No license has been specified yet. Unless a license is added to this repository, standard copyright restrictions apply.
