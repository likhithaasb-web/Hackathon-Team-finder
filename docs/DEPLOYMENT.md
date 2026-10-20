# Deploying HackMate to Render

This guide walks you through deploying **HackMate** (Backend Web Service + Real-time Socket.IO + React Frontend) to **[Render](https://render.com/)**.

---

## 📋 Prerequisites

1. A **[GitHub](https://github.com)** account with your repository:  
   👉 `https://github.com/likhithaasb-web/Hackathon-Team-finder`
2. A **[Render](https://render.com/)** free account.
3. A **[MongoDB Atlas](https://www.mongodb.com/atlas)** free cluster connection URI:
   - Since Render runs in the cloud, it cannot connect to your local `127.0.0.1:27017`.
   - Free Atlas cluster gives you 512MB free MongoDB with 0 maintenance.

---

## Step 1: Set Up Free Cloud MongoDB (MongoDB Atlas)

1. Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)** and sign in.
2. Click **Create a Deployment** $\rightarrow$ select the **M0 Free** shared cluster tier.
3. Under **Security Quickstart**:
   - Create a database user (e.g. `hackmate_admin` and a strong password).
   - Under **Network Access** / **IP Access List**: Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Render servers can reach your database.
4. Click **Connect** $\rightarrow$ **Drivers** (Node.js) and copy the connection string:
   ```text
   mongodb+srv://hackmate_admin:<password>@cluster0.abcde.mongodb.net/hackmate?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your database user password).*

---

## Step 2: Deploy to Render

You can deploy using either **Blueprint (Recommended)** or **Manual Setup**.

### Method A: Render Blueprint (1-Click Automated Setup)

1. Go to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your repository: **`likhithaasb-web/Hackathon-Team-finder`**.
4. Render will automatically detect the [`render.yaml`](../render.yaml) file in your repository!
5. Provide the required environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string from Step 1.
   - `CLIENT_URL`: The URL Render assigns to your frontend (e.g. `https://hackmate-frontend.onrender.com`).
6. Click **Apply**. Render will automatically build and deploy both services!

---

### Method B: Manual Setup (Two Services)

#### 1. Deploy the Backend Web Service (`hackmate-api`)
1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Select your repository: **`Hackathon-Team-finder`**.
3. Configure:
   - **Name**: `hackmate-api`
   - **Region**: Choose closest (e.g. `Oregon (US West)` or `Frankfurt (EU)`)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: `Free`
4. Add **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGODB_URI` | `mongodb+srv://hackmate_admin:<password>@cluster0.abcde.mongodb.net/hackmate?retryWrites=true&w=majority` |
   | `JWT_SECRET` | *(Generate a 32+ character random string)* |
   | `JWT_EXPIRES_IN` | `7d` |
   | `COOKIE_SECRET` | *(Generate a random string)* |
   | `CLIENT_URL` | *(Your frontend Render URL from below, e.g. `https://hackmate-client.onrender.com`)* |
5. Click **Create Web Service**. Wait for the build to finish. Once live, copy your backend URL (e.g., `https://hackmate-api.onrender.com`).

---

#### 2. Deploy the Frontend Static Site (`hackmate-client`)
1. In Render Dashboard, click **New +** $\rightarrow$ **Static Site**.
2. Select your repository: **`Hackathon-Team-finder`**.
3. Configure:
   - **Name**: `hackmate-client`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://hackmate-api.onrender.com/api/v1` |
   | `VITE_SOCKET_URL` | `https://hackmate-api.onrender.com` |
   *(Use your actual backend URL from step 1)*
5. Add **Rewrite / Redirect Rule** (for Single Page App routing):
   - Under Settings $\rightarrow$ **Redirects/Rewrites**:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

## Step 3: Populate Cloud Database with Demo Data (Optional)

To seed your cloud MongoDB with 15 users, hackathons, teams, and sample tasks:

### Option 1: Via Render Web Shell
1. Go to your `hackmate-api` service in Render.
2. Click **Shell** in the left menu.
3. Run:
   ```bash
   node scripts/seed.js
   ```

### Option 2: From your local terminal
Point your local seed script directly to your cloud MongoDB:
```powershell
$env:MONGODB_URI="mongodb+srv://hackmate_admin:<password>@cluster0.abcde.mongodb.net/hackmate?retryWrites=true&w=majority"
cd server
node scripts/seed.js
```

---

## ✅ Post-Deployment Health Check

1. Test API Health:
   ```text
   GET https://your-backend.onrender.com/api/v1/health
   ```
   Should return:
   ```json
   { "status": "healthy", "service": "HackMate API" }
   ```
2. Open your frontend URL:
   ```text
   https://your-frontend.onrender.com
   ```
3. Log in with demo accounts (e.g., `sophia@hackmate.dev` / `Password@123` or `admin@hackmate.dev` / `Password@123`).
