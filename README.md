# FINNEST
### Smart Personal & Shared Expense Management Platform

> *"Manage your money. Share expenses. Stay in control."*

![FINNEST Platform](https://img.shields.io/badge/Platform-Fintech%20SaaS-indigo)
![License](https://img.shields.io/badge/License-MIT-blue)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![Django](https://img.shields.io/badge/Django-5.1-green)
![React](https://img.shields.io/badge/React-19-cyan)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-teal)

FINNEST is a complete, enterprise-ready full-stack fintech SaaS web application uniting **Personal Finance Management** and **Shared Household / Mess / Family Expense Management** into one unified, elegant experience.

---

## Key Capabilities

### 1. Dual-Engine Architecture
* **Personal Finance**: Income and expense tracking, custom categories, monthly category budgets with alert thresholds, savings goal tracking with dynamic monthly contribution calculators, unified ledger history, and CSV export.
* **Shared Living & Bachelor Mess**: Multi-household management, member permissions (Owner, Admin, Member), invite codes, recurring utility bills, collaborative grocery checklists with 1-click shared expense conversion, and settlement tracking.

### 2. Advanced Expense Splitting
Supports four mathematical splitting methods with backend Decimal validation:
1. **Equal Split**: Automatically divided among selected members down to the cent.
2. **Exact Amount Split**: Custom currency amounts per member with exact sum verification.
3. **Percentage Split**: Custom member percentages strictly validating to 100%.
4. **Share-Based Split**: Proportional ratio allocation (e.g. 2 shares for master bedroom, 1 share for single room).

### 3. Smart Debt Simplification Engine
Eliminates transitive and cyclic debts across roommates. Instead of $N \times (N - 1)$ cross-transfers, a greedy bipartite matching algorithm calculates net positions and generates an optimal payment plan requiring at most $N - 1$ direct transactions.

### 4. Zero-Float Monetary Accuracy
All financial computations use Python's `Decimal` module and Django `DecimalField` to prevent floating-point drift and rounding inaccuracies.

### 5. Real Database OTP Verification System (Real Accounts)
Provides production-grade authentication with database-backed 6-digit One-Time Passwords (`EmailOTP` model):
- **Real Database Records**: Stored with strict 10-minute UTC expiration timestamps, UUID keys, and target purposes (`register`, `login`, `reset_password`).
- **Brute-Force Shield**: Limits attempts to a maximum of 5 tries per code before automatic invalidation.
- **Immediate Single-Use Invalidation**: OTPs are marked `is_used = True` upon successful verification and cannot be replayed.
- **Dual Login Modes**: Users can sign in via traditional password or passwordless **Instant OTP Login**.
- **Dev-Friendly Preview**: In `DEBUG=True` mode, codes are returned in API responses and console output for seamless testing without third-party email delays.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router v7, Axios |
| **Backend** | Python 3.12, Django 5.1, Django REST Framework, SimpleJWT, dj-database-url |
| **Database** | PostgreSQL (production) with dynamic SQLite fallback for local zero-config dev |
| **Storage** | Cloudinary (cloud media/receipts) with local filesystem media fallback |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend), Supabase / Neon (Database) |

---

## System Architecture

```
FINNEST/
├── backend/                  # Django REST Framework backend
│   ├── config/               # Settings, URLs, WSGI/ASGI configuration
│   ├── apps/                 # Modular Django domain apps
│   │   ├── core/             # Base models, utils, seed commands, tests
│   │   ├── users/            # Custom User, UserProfile, JWT auth, personas
│   │   ├── personal/         # Incomes, Expenses, Categories, Unified ledger
│   │   ├── budgets/          # Category spending limits & alert thresholds
│   │   ├── savings/          # Savings goals & contribution history
│   │   ├── households/       # Household, Members, Roles, Shared expenses, Splits
│   │   ├── settlements/      # Settlement tracking & Debt Simplification algorithm
│   │   ├── bills/            # Recurring household & personal utilities
│   │   ├── groceries/        # Market checklists with 1-click shared expense convert
│   │   ├── notifications/    # Real-time user alert inbox
│   │   └── analytics/        # Dashboard summaries, insights engine, CSV export
│   ├── requirements.txt      # Python dependencies
│   ├── manage.py             # Django CLI
│   └── .env.example          # Backend environment template
│
└── frontend/                 # React + Vite frontend
    ├── src/
    │   ├── api/              # Axios client with JWT refresh interceptors
    │   ├── context/          # AuthContext (state + 1-click login) & ThemeContext
    │   ├── components/       # Design system (Buttons, Modals, StatCards, Badges)
    │   │   ├── ui/           # Reusable UI elements
    │   │   └── modals/       # Quick action modals (Income, Expense, Split, Bill)
    │   ├── layouts/          # PublicLayout (Navbar/Footer) & AppLayout (Sidebar/Header)
    │   ├── pages/            # Public marketing pages & Authenticated app pages
    │   │   ├── public/       # Landing, Features, How It Works, Pricing, Auth
    │   │   └── app/          # Dashboard, Ledger, Budgets, Savings, Mess, Bills, Groceries
    │   ├── App.jsx           # Application routing and route guards
    │   ├── main.jsx          # React DOM entrypoint
    │   └── index.css         # Tailwind styles, dark mode, glassmorphism
    ├── package.json          # Node dependencies
    ├── vite.config.js        # Vite dev server with backend API proxy
    └── tailwind.config.js    # Fintech color palette & theme extensions
```

---

## Quick Start & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup

```bash
# Navigate to workspace root
cd py

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate      # Windows (or source venv/bin/activate on Linux/Mac)

# Install Python requirements
pip install -r backend/requirements.txt

# Run migrations (defaults to local SQLite if DATABASE_URL is not set)
python backend/manage.py migrate

# Seed rich demo data (Rafi, Rahim, Karim, Hasan & Green View Mess)
python backend/manage.py seed_demo_data

# Run unit tests
python backend/manage.py test apps.core

# Start backend server
python backend/manage.py runserver 127.0.0.1:8000
```

### 2. Frontend Setup

In a second terminal:

```bash
cd py/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Platform Admin & Authentication Portals

### 1. Platform Admin Portal (System Control Center)
- **Admin Portal URL**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Admin Email**: `thefinnest22@gmail.com`
- **Admin Password**: `734422`
- **Privileges**: View all registered users, toggle verification/suspension, delete accounts, view all shared messes and expenses, add/delete global system categories, and monitor platform health.

### 2. User Authentication Portal (Real Accounts)
- **User Login URL**: [http://localhost:5173/login](http://localhost:5173/login)
- **User Register URL**: [http://localhost:5173/register](http://localhost:5173/register)
- Supports traditional password authentication and database-backed **6-digit instant OTP verification** delivered directly to the user's Gmail inbox.

---

## REST API Overview

All API endpoints are versioned under `/api/v1/`:

### Authentication & Profiles
- `POST /api/v1/auth/register/` - Register account (triggers OTP generation in DB)
- `POST /api/v1/auth/send-otp/` - Generate & dispatch 6-digit OTP to user email
- `POST /api/v1/auth/verify-otp/` - Verify 6-digit OTP code against database record & return JWT tokens
- `POST /api/v1/auth/login/` - Authenticate & obtain JWT tokens
- `POST /api/v1/auth/refresh/` - Refresh JWT access token
- `GET /api/v1/auth/me/` - Retrieve profile
- `PATCH /api/v1/auth/me/` - Update profile & currency preference
- `POST /api/v1/auth/change-password/` - Update password
- `GET /api/v1/auth/demo-users/` - Public demo user list

### Personal Finance & Ledger
- `GET/POST /api/v1/personal/incomes/` - Manage personal incomes
- `GET/POST /api/v1/personal/expenses/` - Manage personal expenses
- `GET /api/v1/personal/transactions/` - Unified sorted stream of incomes & expenses
- `GET/POST /api/v1/personal/categories/` - System and custom categories

### Budgets & Savings
- `GET/POST /api/v1/budgets/` - Monthly category budgets with alert thresholds
- `GET/POST /api/v1/savings/goals/` - Savings goals
- `POST /api/v1/savings/goals/:id/add-funds/` - Record contribution to a goal

### Households & Shared Mess
- `GET/POST /api/v1/households/` - List/create households
- `POST /api/v1/households/join/` - Join household using 8-character invite code
- `POST /api/v1/households/:id/invite/` - Send email invitation
- `GET /api/v1/households/:id/balances/` - Calculate member balances (Paid vs Owed)
- `GET/POST /api/v1/households/expenses/` - Shared expenses with multi-method splitting

### Settlements & Debt Simplification
- `GET/POST /api/v1/settlements/` - Settlement history
- `POST /api/v1/settlements/:id/mark-settled/` - Confirm settlement payment
- `GET /api/v1/settlements/simplified/?household=<id>` - Optimal minimal debt payment plan

### Bills & Groceries
- `GET/POST /api/v1/bills/` - Recurring bills (Upcoming, Due Soon, Paid, Overdue)
- `POST /api/v1/bills/:id/mark-paid/` - Mark bill paid
- `GET/POST /api/v1/groceries/` - Collaborative grocery lists
- `POST /api/v1/groceries/items/:id/toggle-purchased/` - Toggle purchased status & actual cost
- `POST /api/v1/groceries/:id/convert-to-expense/` - Convert grocery list into shared expense

### Analytics, Insights & Exports
- `GET /api/v1/analytics/dashboard/` - High-level metrics, cashflow trends, breakdowns
- `GET /api/v1/analytics/insights/` - Dynamic AI-like behavioral insights
- `GET /api/v1/analytics/export/transactions/` - Download personal transactions CSV
- `GET /api/v1/analytics/export/household/?household=<id>` - Download household ledger CSV
- `GET /api/v1/notifications/` - User notifications inbox

---

## Production Deployment

### Backend (Render / Railway / Heroku)
1. Push codebase to GitHub.
2. Create a Python Web Service pointing to `backend/`.
3. Set environment variables:
   ```env
   SECRET_KEY=your-production-secret-key
   DEBUG=False
   ALLOWED_HOSTS=your-backend-domain.com
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
4. Build command: `pip install -r backend/requirements.txt && python backend/manage.py migrate`
5. Start command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`

### Frontend (Vercel)
1. Import repository on Vercel and set root directory to `frontend/`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable `VITE_API_BASE_URL` pointing to your hosted Django backend.

---

## License
MIT License. Built for full-stack excellence, portfolio showcase, and real-world financial empowerment.
