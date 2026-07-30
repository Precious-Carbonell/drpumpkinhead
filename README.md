# DrPumpkinHead - Art Commission Management Website

A full-stack art commission management website for digital artist "DrPumpkinHead" featuring a public client portal with a cherry blossom/sakura theme and a secured admin portal for managing commissions, clients, and pricing.

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool + dev server)
- React Router DOM (client-side routing)
- Recharts (dashboard charts)
- Lucide React (icon library)
- CSS Modules (custom, no framework)

### Backend
- Node.js + Express
- sql.js (pure JS SQLite - no native dependencies)
- JSON Web Tokens (JWT) for authentication
- bcryptjs for password hashing

### Database
- SQLite (file-based, persisted as data.db)
- Tables: clients, commissions, price_list, admin_users, audit_log

---

## Project Structure

```
drpumpkinhead/
- client/              React frontend
  - public/            Static assets (images, portfolio)
  - src/
    - components/      Shared components (Navbar, Parallax, Petals)
    - pages/           Client pages (Home, PriceList, Queue, Socials)
    - pages/admin/     Admin pages (Dashboard, Commissions, Clients, etc.)
    - styles/          CSS variables and theme
- server/              Node.js backend
  - src/
    - db/              Database init, helpers, seed
    - middleware/      JWT auth middleware
    - routes/          API route handlers
  - data.db            SQLite database file
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install server dependencies
cd server
npm install

# Seed the database
npm run seed

# Install client dependencies
cd ../client
npm install
```

### Running Locally

Terminal 1 - backend:
```bash
cd server
npm run dev
```
Server runs on http://localhost:3001

Terminal 2 - frontend:
```bash
cd client
npm run dev
```
Frontend runs on http://localhost:5173

### Default Admin Credentials
- Username: admin
- Password: admin123

---

## API Endpoints

### Public (no auth)
- GET /api/commissions/public - commission queue with masked client names
- GET /api/prices/public - full price list for client-facing page
- GET /api/dashboard/stats - commission statistics
- GET /api/audit-log - recent audit trail entries

### Auth
- POST /api/auth/login - authenticate admin user, returns JWT

### Protected (requires Bearer token)
- GET/POST /api/commissions - list/create commissions
- GET/PUT/DELETE /api/commissions/:id - read/update/delete commission
- GET/POST /api/clients - list/create clients
- GET/PUT/DELETE /api/clients/:id - read/update/delete client
- GET/POST /api/prices - list/create price entries
- GET/PUT/DELETE /api/prices/:id - read/update/delete price
- GET/POST /api/users - list/create admin users
- PUT/DELETE /api/users/:id - update/delete admin user

---

## Security

- JWT-based authentication with 24-hour token expiry
- Passwords hashed with bcryptjs (10 salt rounds)
- Admin routes protected by auth middleware - all requests require valid Bearer token
- Public endpoints expose only non-sensitive data (masked names, no emails/contacts/payment info)
- Name masking follows GCash-style: first and last character visible, middle replaced with asterisks
- CORS enabled for cross-origin dev requests
- No secrets stored in client-side code

---

## User Types

### Public (Client Portal)
- No login required
- Can view commission queue (masked names only)
- Can view pricing information
- Can view socials/contact links
- Cannot access admin features

### Admin (Admin Portal)
- Login required at /admin/login
- Full CRUD on commissions, clients, and price list
- Dashboard with charts and statistics
- User management (create/edit/delete admin accounts)
- Audit log viewing
- Peso-to-Dollar converter with live exchange rates
- Cannot delete own account (safety check)

---

## Features

### Client Portal
- Parallax cherry blossom hero with video background
- Interactive flower petal carousel (6 portfolio artworks)
- Bento grid pricing page (art + animation commissions)
- Public commission queue with privacy-preserving masked names
- Socials page with heart-shaped hover overlays
- Responsive design (mobile, tablet, desktop)
- Falling petal particle animation
- Custom decorative image headings throughout

### Admin Portal
- Dashboard with stat cards, pie chart, line chart, bar chart
- Daily/weekly/monthly filterable revenue and request charts
- Commission management with pre-filled types from price list
- Client management with contact details
- Price list management (6 art + 9 animation categories)
- Admin user management
- Full audit trail with pagination
- PHP/USD currency converter (live exchange rate)
- Pastel pink/green branding consistent with client portal

---

## Accessibility

- Semantic HTML throughout (nav, main, section, table, form, button)
- ARIA labels on interactive elements (carousel petals, lightbox, modals)
- Keyboard-focusable carousel petals (Tab + Enter/Space to open lightbox)
- Visible focus states on all interactive elements
- prefers-reduced-motion respected (carousel animation slowed/disabled)
- Color contrast maintained for text readability over pastel backgrounds
- Form labels associated with inputs via htmlFor/id
- Modal dialogs with aria-modal and role="dialog"
- Alt text on all images
- Responsive layouts - no horizontal scroll on any viewport

---

## Data Models

### Clients
- id, full_name, contact_number, email, social_media, status, date_created

### Commissions
- id, client_id (FK), queue_number, commission_type, price, mode_of_payment
- payment_type, payment_status, commission_status, progress_percentage
- date_created, due_date, remarks

### Price List
- id, category, commission_type, description, price_php, price_usd, turnaround_days

### Admin Users
- id, username, password_hash

### Audit Log
- id, action, entity, entity_id, details, created_at

---

## Deployment Notes

- Frontend builds to static files (client/dist) - deploy to Vercel/Netlify
- Backend is a Node.js server - deploy to Vercel serverless or a VPS
- SQLite file (data.db) is ephemeral on Vercel's serverless filesystem
- For production persistence, consider swapping to Turso/LibSQL or a hosted DB
- Set VITE_API_URL environment variable in production to point frontend to the API
- Set JWT_SECRET environment variable for production token signing
