# DocBook — Doctor Appointment Booking System

A full-stack MERN application for booking doctor appointments with 3-level authentication (Patient, Doctor, Admin).

---

## 🚀 Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React JS, Tailwind CSS, Framer Motion, Axios    |
| Backend    | Node JS, Express JS, MongoDB, Mongoose          |
| Auth       | JWT, bcryptjs                                   |
| Payment    | Stripe (demo mode included)                     |
| Upload     | Multer + Cloudinary                             |
| Charts     | Recharts                                        |

---

## 📁 Project Structure

```
Doctor Appointment Booking System/
├── backend/
│   ├── config/          # DB & Cloudinary config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, error, upload
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── uploads/         # Temp file uploads
│   ├── seed.js          # Sample data seeder
│   ├── server.js        # Entry point
│   ├── .env             # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, Footer, etc.
    │   ├── context/     # AppContext (state)
    │   ├── pages/
    │   │   ├── admin/   # Admin dashboard pages
    │   │   └── doctor/  # Doctor dashboard pages
    │   ├── services/    # Axios API instance
    │   ├── App.jsx      # Routes
    │   └── main.jsx
    ├── .env
    └── package.json
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Git

---

### Step 1 — Clone & Setup Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Minimum required `.env` values to run locally:
```
MONGODB_URI=mongodb://localhost:27017/doctor-appointment
JWT_SECRET=any_random_secret_string
ADMIN_EMAIL=admin@docbook.com
ADMIN_PASSWORD=Admin@123
FRONTEND_URL=http://localhost:5173
```

### Step 2 — Seed Sample Data

```bash
npm run seed
```

This creates 8 sample doctors. Output will show their login credentials.

### Step 3 — Start Backend

```bash
npm run server
```

Backend runs on: `http://localhost:5000`

---

### Step 4 — Setup Frontend

```bash
cd frontend
npm install
```

Create `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### Step 5 — Start Frontend

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔑 Demo Login Credentials

| Role    | Email                        | Password     |
|---------|------------------------------|--------------|
| Admin   | admin@docbook.com            | Admin@123    |
| Doctor  | sarah.johnson@docbook.com    | password123  |
| Doctor  | michael.chen@docbook.com     | password123  |
| Patient | Register a new account       | —            |

---

## 📡 API Endpoints

### Users
| Method | Endpoint              | Access  | Description        |
|--------|-----------------------|---------|--------------------|
| POST   | /api/users/register   | Public  | Register patient    |
| POST   | /api/users/login      | Public  | Patient login       |
| GET    | /api/users/profile    | Patient | Get profile         |
| PUT    | /api/users/profile    | Patient | Update profile      |
| GET    | /api/users            | Admin   | Get all users       |
| DELETE | /api/users/:id        | Admin   | Delete user         |

### Doctors
| Method | Endpoint                  | Access  | Description         |
|--------|---------------------------|---------|---------------------|
| GET    | /api/doctors              | Public  | List all doctors    |
| GET    | /api/doctors/:id          | Public  | Get doctor details  |
| POST   | /api/doctors/login        | Public  | Doctor login        |
| GET    | /api/doctors/profile/me   | Doctor  | Get own profile     |
| PUT    | /api/doctors/profile/me   | Doctor  | Update own profile  |
| POST   | /api/doctors              | Admin   | Add doctor          |
| PUT    | /api/doctors/:id          | Admin   | Update doctor       |
| DELETE | /api/doctors/:id          | Admin   | Delete doctor       |
| POST   | /api/doctors/:id/reviews  | Patient | Add review          |

### Appointments
| Method | Endpoint                              | Access        | Description              |
|--------|---------------------------------------|---------------|--------------------------|
| POST   | /api/appointments                     | Patient       | Book appointment         |
| GET    | /api/appointments/my-appointments     | Patient       | Get own appointments     |
| PUT    | /api/appointments/:id/cancel          | Patient/Admin | Cancel appointment       |
| GET    | /api/appointments/doctor-appointments | Doctor        | Get doctor appointments  |
| PUT    | /api/appointments/:id/complete        | Doctor        | Mark as completed        |
| GET    | /api/appointments                     | Admin         | Get all appointments     |
| PUT    | /api/appointments/:id/status          | Admin/Doctor  | Update status            |

### Admin
| Method | Endpoint              | Access | Description       |
|--------|-----------------------|--------|-------------------|
| POST   | /api/admin/login      | Public | Admin login       |
| GET    | /api/admin/dashboard  | Admin  | Dashboard stats   |

### Payments
| Method | Endpoint                              | Access  | Description           |
|--------|---------------------------------------|---------|-----------------------|
| POST   | /api/payments/create-payment-intent   | Patient | Create Stripe intent  |
| POST   | /api/payments/confirm                 | Patient | Confirm payment       |
| GET    | /api/payments/history                 | Patient | Payment history       |
| GET    | /api/payments                         | Admin   | All payments          |

---

## 🌐 Deployment

### Backend → Render

1. Push backend folder to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add all environment variables from `.env`

### Frontend → Vercel

1. Push frontend folder to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set Framework: Vite
4. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`
5. Deploy

### MongoDB → Atlas

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free M0 cluster
3. Add database user and whitelist IP `0.0.0.0/0`
4. Copy connection string to `MONGODB_URI` in backend `.env`

---

## 🔧 Cloudinary Setup (for image uploads)

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret from dashboard
3. Add to backend `.env`

---

## 💳 Stripe Setup (for real payments)

1. Create account at [stripe.com](https://stripe.com)
2. Get test keys from Dashboard → Developers → API Keys
3. Add `STRIPE_SECRET_KEY` to backend `.env`
4. Add `VITE_STRIPE_PUBLISHABLE_KEY` to frontend `.env`

> The app currently runs in **demo payment mode** — no real card is charged.

---

## ✨ Features Summary

- ✅ 3-level JWT authentication (Patient / Doctor / Admin)
- ✅ Doctor listing with search & specialty filters
- ✅ Slot-based appointment booking
- ✅ Payment integration (Stripe demo)
- ✅ Admin dashboard with charts & stats
- ✅ Doctor dashboard with earnings graph
- ✅ Patient profile & appointment management
- ✅ Doctor reviews & ratings
- ✅ Image upload via Cloudinary
- ✅ Fully responsive mobile-friendly UI
- ✅ Framer Motion animations
- ✅ Toast notifications
