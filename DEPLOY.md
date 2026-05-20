# Deployment Guide — Sentinel Tracker

This guide covers deploying the backend to **Render** (free tier) and the frontend  
to **Netlify** (free tier). Other platforms (Railway, Heroku, Vercel) work similarly.

---

## 1. Backend — Render (Free Web Service)

### Prerequisites
- GitHub account with this repo pushed
- [Render](https://render.com) account (free)

### Steps

1. Go to <https://dashboard.render.com> → **New → Web Service**.
2. Connect your GitHub repository.
3. Configure the service:

   | Setting | Value |
   |---|---|
   | **Runtime** | Python 3 |
   | **Build command** | `pip install -r requirements.txt` |
   | **Start command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
   | **Root directory** | `backend` |

4. Under **Environment → Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `ALLOWED_ORIGIN` | Your Netlify frontend URL, e.g. `https://sentinel-tracker.netlify.app` |

5. Click **Create Web Service**. Render builds and deploys automatically.
6. Note the service URL (e.g. `https://sentinel-tracker-api.onrender.com`) — you need it for the frontend.

> **Free tier note:** Render free services spin down after 15 minutes of inactivity.  
> The first request after spin-down may take ~30 seconds to respond.  
> Upgrade to a paid plan for always-on behaviour.

---

## 2. Frontend — Netlify (Free Static Hosting)

### Prerequisites
- [Netlify](https://netlify.com) account (free)
- Backend URL from step 1

### Steps

1. Go to <https://app.netlify.com> → **Add new site → Import an existing project**.
2. Connect your GitHub repository.
3. Configure the build:

   | Setting | Value |
   |---|---|
   | **Base directory** | `frontend` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `frontend/dist` |

4. Under **Site configuration → Environment variables**, add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | Your Render backend URL (no trailing slash) |
   | `VITE_CESIUM_ION_TOKEN` | Your Cesium Ion access token |

5. Click **Deploy site**. Netlify builds and publishes the static bundle.
6. Optionally set a custom subdomain under **Domain management**.

---

## 3. Local Production Preview

To test the production build locally before deploying:

```bash
# Build
cd frontend
npm run build

# Serve the bundle
npm run preview
# → http://localhost:4173

# Backend (separate terminal)
cd backend
uvicorn main:app --port 8000
```

Verify everything works at <http://localhost:4173>.

---

## 4. Environment Variable Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `ALLOWED_ORIGIN` | No | `http://localhost:5173` | Frontend URL for CORS |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | **Yes** | Backend base URL |
| `VITE_CESIUM_ION_TOKEN` | **Yes** | Cesium Ion token |

---

## 5. Security Checklist

- [ ] `frontend/.env` is in `.gitignore` (Cesium token is not committed)
- [ ] `backend/.env` is in `.gitignore`
- [ ] `ALLOWED_ORIGIN` matches the exact frontend URL (no trailing slash)
- [ ] Cesium Ion token is not logged or exposed in API responses

---

## 6. Updating TLE Data

The backend caches TLE data for 6 hours. To force a refresh:

- **Render**: Redeploy the service (clears in-memory cache).
- **Local**: Restart the uvicorn process.

CelesTrak publishes updated TLEs daily. The stale-TLE banner in the frontend  
(shown when newest TLE epoch > 24 h old) will alert users when data is outdated.
