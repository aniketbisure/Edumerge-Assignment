# Admission Management & CRM System

**Live Status:** [Deployment Dashboard](https://edumerge-assignment.vercel.app)

A full-stack Admission Management System built for the Edumerge assignment. This application manages the student admission lifecycle, from master configuration to final seat allocation and admission confirmation, ensuring quota compliance and real-time monitoring.

## 🚀 Fast Track Setup (Docker)

The easiest way to run the entire stack (Frontend, Backend, MongoDB, Redis) is using Docker Compose:

```bash
docker-compose up -d
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Default Login**: 
  - Admin: `admin@edumerge.com` / `admin123`
  - Admission Officer: `officer@edumerge.com` / `officer123`

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, TanStack Query, Lucide React, React-Hook-Form.
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), Redis.
- **Infrastructure**: Docker, Nginx, GitHub Actions (CI/CD).

## ✨ Key Features

- **Master Setup**: Configure Institutions, Campuses, Departments, and Programs with ease.
*   **Seat Matrix & Quota Control**: Define seats for KCET, COMEDK, and Management quotas.
*   **Atomic Seat Allocation**: Uses **Redis Distributed Locking** to prevent overbooking, even under high concurrent load.
*   **Sequential Admission Numbers**: Automatically generates unique IDs in the format: `INST/2026/UG/CSE/KCET/0001`.
*   **Real-time Dashboard**: Live monitoring of intake vs. admitted students, pending fees, and document verification status.
*   **Role-Based Access Control (RBAC)**: Distinct permissions for Admins, Admission Officers, and Management.

## 📦 Manual Installation

### 1. Backend
```bash
cd backend
npm install
# Create .env file with DATABASE_URL and REDIS_URL
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📜 Assessment Requirements Checklist

- [x] Configure programs and quotas.
- [x] Manage applicants (limited to 15 fields).
- [x] Allocate seats (Government & Management flows).
- [x] No seat overbooking (handled via Redis locks).
- [x] Generate unique, immutable admission numbers.
- [x] Fee tracking (Seat confirmed only when Fee = Paid).
- [x] Document verification (Pending / Submitted / Verified).
- [x] Real-time dashboards.

---

Built with ❤️ by Aniket Bisure for Edumerge.
