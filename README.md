# AI-Powered College Help Desk
## Intelligent Student Information and Support System

A complete full-stack web application providing a secure, AI-assisted help desk for college students. Students can query a smart FAQ chatbot, view official notices, and manage their profile—all from a polished, responsive interface.

---

## Features

- **Public Landing Page** with functional chatbot preview (no login required)
- **Student Registration** — validated against an authorized college ID list
- **Unified Login** — students and admins use the same login page; role is determined server-side
- **Student Dashboard** — personalized welcome, quick ask, recent notices
- **AI Help Desk Chatbot** — token-based FAQ matching with fallback responses
- **FAQ Browser** — searchable list of published FAQs
- **College Notices** — filterable list of official announcements
- **Student Profile** — view and update permitted profile fields
- **Admin Dashboard** — live statistics from the SQLite database
- **Admin CRUD** — manage FAQs, notices, and college information
- **Student Account Management** — activate/deactivate accounts
- **Admin Account Management** — create and deactivate admin accounts
- **Audit Log** — every admin action is recorded
- **Security** — bcrypt passwords, HttpOnly sessions, Helmet headers, rate limiting, CSRF protection, parameterized SQL

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite (sqlite3) |
| Auth | bcryptjs, express-session, connect-sqlite3 |
| Security | Helmet, express-rate-limit |
| Testing | Jest, Supertest |

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v8 or higher

---

## Installation

```bash
# 1. Navigate to the project directory
cd "mini project helpdesk"

# 2. Install dependencies
npm install
```

---

## Environment Configuration

Copy the example environment file and configure it:

```bash
copy .env.example .env
```

Edit `.env` with your values:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_strong_random_secret_here
DATABASE_PATH=./data/helpdesk.sqlite
INITIAL_ADMIN_EMAIL=admin@college.edu
INITIAL_ADMIN_PASSWORD=your_secure_password_here
```

> **Important:** Use a strong, unique `SESSION_SECRET` in production. Never commit `.env` to version control.

---

## Database Initialization

Run these scripts in order (first time only):

```bash
# 1. Initialize database schema
npm run db:init

# 2. Create the initial admin account
npm run admin:seed

# 3. Import demo-eligible college IDs (for testing registration)
node scripts/import-college-ids.js

# 4. Seed demo FAQs, notices, and college information
npm run db:seed
```

---

## Running the Application

### Development (auto-restart on changes)
```bash
npm run dev
```

### Production
```bash
npm start
```

Open **http://localhost:3000** in your browser.

---

## Demo Accounts

### Student Registration
Register using one of these demo-eligible College IDs:
| College ID | Department | Year |
|-----------|-----------|------|
| DEMO2026001 | Computer Science | 1st Year |
| DEMO2026002 | Computer Science | 2nd Year |
| DEMO2026003 | Electrical Engineering | 3rd Year |
| DEMO2026004 | Mechanical Engineering | 4th Year |
| DEMO2026005 | Information Technology | 1st Year |

Go to `/register.html`, enter one of the above IDs and fill the form.

### Admin Login
Use the credentials set in your `.env` file (`INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD`).

---

## Running Tests

```bash
npm test
```

Tests use an isolated `test_helpdesk.sqlite` database and are deleted after the suite completes. Core areas covered:
- Registration (valid, duplicate, unknown ID, password mismatch)
- Authentication (login success/failure, logout, session invalidation)
- Authorization (role enforcement, RBAC)
- Chatbot (FAQ matching, fallback, unpublished FAQs excluded)
- Admin CRUD (create FAQ, create notice, dashboard metrics)

---

## Application Routes

| Route | Description |
|-------|-------------|
| `/` | Public landing page with chatbot preview |
| `/login.html` | Unified login (students + admins) |
| `/register.html` | Student registration |
| `/dashboard.html` | Student dashboard (auth required) |
| `/chat.html` | Full chatbot interface (auth required) |
| `/faqs.html` | Searchable FAQ list (auth required) |
| `/notices.html` | College notices (auth required) |
| `/profile.html` | Student profile (auth required) |
| `/admin.html` | Admin dashboard (admin only) |
| `/admin-faqs.html` | FAQ management (admin only) |
| `/admin-information.html` | College information CRUD (admin only) |
| `/admin-notices.html` | Notice management (admin only) |
| `/admin-users.html` | Student account management (admin only) |
| `/admin-manage-admins.html` | Admin account management (admin only) |

---

## Security Considerations

- Passwords are hashed with bcrypt (cost factor 12)
- Sessions stored in SQLite, HttpOnly and SameSite=Lax cookies
- Session regenerated on login to prevent session fixation
- CSRF tokens required for all state-changing requests
- Helmet sets security headers (XSS, HSTS, etc.)
- Rate limiting on login (10/hour) and public chat (20/15min)
- Parameterized SQL queries throughout
- No sensitive data in client-side storage
- Admin deactivation protects main_admin from removal

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| Port already in use | Change `PORT` in `.env` or kill the existing process |
| Database errors on startup | Run `npm run db:init` to reinitialize schema |
| Login fails for admin | Verify `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` in `.env` match what was seeded |
| Student can't register | Ensure the College ID is in `eligible_college_ids` and `is_eligible = 1` |

---

## Future Enhancements

1. **LLM Integration** — The chatbot service (`src/services/faq-matcher.js`) is designed for easy replacement with a RAG pipeline
2. **PDF Ingestion** — Add document processing to ingest college handbooks
3. **Email Notifications** — Notify students of new notices via email
4. **Multi-department Filtering** — Per-department notice and FAQ visibility
5. **Analytics Dashboard** — Charts for chat patterns and popular queries
