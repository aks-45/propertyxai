# 🚀 Production Deployment Guide for Render.com

This guide provides full instructions for deploying **Property X AI** to **[Render.com](https://render.com)**.

---

## 🌟 Method 1: 1-Click Render Blueprint (Recommended)

The repository includes a ready-to-use [`render.yaml`](file:///Users/arunakshat/Documents/hacklko/property-x/render.yaml) file that automatically provisions:
1. **Managed PostgreSQL Database** (`property-x-db`)
2. **Backend Web Service** (`property-x-backend` — Node.js / Express / Prisma)
3. **Frontend Web Service** (`property-x-frontend` — Next.js 16)

### Steps:
1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Connect your GitHub/GitLab repository.
5. Render will automatically detect `render.yaml` and configure:
   - Database: `property-x-db`
   - Backend: `property-x-backend`
   - Frontend: `property-x-frontend`
6. Fill in the secret environment variables when prompted:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps JavaScript & Places API Key
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Same Google Maps Key for client-side maps
7. Click **Apply**. Render will build and deploy all services automatically!

---

## 🛠️ Method 2: Manual Service-by-Service Deployment

If you prefer to configure services manually on the Render dashboard:

### 1. Create Managed PostgreSQL Database
- Click **New +** → **PostgreSQL**.
- **Name:** `property-x-db`
- **Database:** `property_x`
- **User:** `property_x_user`
- **Plan:** Free
- Copy the **Internal Database URL** once created.

---

### 2. Deploy Backend Web Service
- Click **New +** → **Web Service**.
- Connect your repository.
- **Settings:**
  - **Name:** `property-x-backend`
  - **Root Directory:** `backend`
  - **Environment:** `Node`
  - **Region:** Same as Database (e.g. Oregon / Frankfurt)
  - **Branch:** `main`
  - **Build Command:** `npm install && npx prisma generate && npm run build`
  - **Start Command:** `npx prisma migrate deploy && npm start`
  - **Health Check Path:** `/health`
- **Environment Variables:**
  | Key | Value |
  | :--- | :--- |
  | `NODE_ENV` | `production` |
  | `PORT` | `10000` |
  | `DATABASE_URL` | *Paste your Render PostgreSQL Internal Connection String* |
  | `JWT_SECRET` | *Generate a secure random string (e.g., 32+ characters)* |
  | `GEMINI_API_KEY` | *Your Gemini API Key* |
  | `GOOGLE_MAPS_API_KEY` | *Your Google Maps API Key* |

---

### 3. Deploy Frontend Web Service
- Click **New +** → **Web Service**.
- Connect your repository.
- **Settings:**
  - **Name:** `property-x-frontend`
  - **Root Directory:** `.` (Leave default)
  - **Environment:** `Node`
  - **Region:** Same as Backend
  - **Branch:** `main`
  - **Build Command:** `npm install && npm run build`
  - **Start Command:** `npm start`
  - **Health Check Path:** `/`
- **Environment Variables:**
  | Key | Value |
  | :--- | :--- |
  | `NODE_ENV` | `production` |
  | `NEXT_PUBLIC_API_URL` | `https://property-x-backend.onrender.com` *(Replace with your actual backend Render URL)* |
  | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | *Your Google Maps API Key* |

---

## 🔒 Security & SSL

- **Database SSL:** The backend database pool is pre-configured with SSL handling (`ssl: { rejectUnauthorized: false }`) for Render Postgres connections.
- **CORS:** The backend dynamically allows requests from `*.onrender.com`, `*.vercel.app`, and local environments.
- **HTTPS:** Both frontend and backend automatically run behind Render's free SSL/TLS certificates.

---

## ✅ Verifying the Deployment

1. **Backend Health Check:** Visit `https://your-backend.onrender.com/health` (should return `{ success: true, message: "Property X AI Backend is operational" }`).
2. **Frontend:** Visit `https://your-frontend.onrender.com`.
3. Test running a property evaluation or registration flow to verify database connectivity.
