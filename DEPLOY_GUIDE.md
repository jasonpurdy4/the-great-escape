# Railway Deployment Guide 🚀

Follow these steps to deploy The Great Escape to Railway!

---

## 📋 Prerequisites

1. Railway account - Sign up at https://railway.app (use GitHub login)
2. Your GitHub repo is up to date (already done! ✅)

---

## 🚂 Part 1: Deploy Backend to Railway

### Step 1: Create New Project
1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **"the-great-escape"** repository
5. Railway will detect it as a Node.js app ✅

### Step 2: Configure Backend
1. Once deployed, click on your service
2. Go to **"Variables"** tab
3. Add these environment variables:
   ```
   FOOTBALL_API_TOKEN=5a09c0f3cece4cab8d1dda6c1b07582b
   ```
   (PORT is automatically provided by Railway)

4. Go to **"Settings"** tab
5. Under **"Root Directory"**, set it to: `backend`
6. Under **"Start Command"**, it should show: `npm start` (already configured!)

### Step 3: Get Your Backend URL
1. Go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Copy the URL (it will look like: `https://the-great-escape-production.up.railway.app`)
5. **SAVE THIS URL** - you'll need it for the frontend!

### Step 4: Test Backend
1. Open your backend URL in browser: `https://your-url.railway.app/api/health`
2. You should see: `{"status":"ok","message":"The Great Escape API is running!"}`
3. Test matches: `https://your-url.railway.app/api/matches?matchday=9`
4. You should see Premier League match data! 🎉

---

## 🌐 Part 2: Deploy Frontend to Railway

### Step 1: Create Another Service
1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"** again
3. Choose **"the-great-escape"** again (yes, same repo!)
4. Railway will create a second service

### Step 2: Configure Frontend
1. Click on the new service
2. Go to **"Settings"** tab
3. Under **"Root Directory"**, set it to: `frontend`
4. Under **"Build Command"**, set it to: `npm run build`
5. Under **"Start Command"**, set it to: `npx serve -s build -l $PORT`

### Step 3: Add Environment Variable
1. Go to **"Variables"** tab
2. Add this variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
   (Use the backend URL from Part 1, Step 3!)

### Step 4: Install Serve (needed for React)
1. Go to **"Settings"** tab
2. Scroll to **"Custom Start Command"**
3. Make sure it says: `npx serve -s build -l $PORT`

### Step 5: Generate Frontend Domain
1. Go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Copy your frontend URL!

### Step 6: Redeploy
1. Go to **"Deployments"** tab
2. Click the **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete (~2-3 minutes)

---

## ✅ Part 3: Test Your Live Site!

1. Open your frontend URL: `https://your-frontend-url.railway.app`
2. You should see **The Great Escape** landing page! 🎉
3. Click the **"Team Selection"** button (top right nav)
4. You should see **real Premier League matches** with team crests!
5. Try selecting a team - it should work!

---

## 🔧 Troubleshooting

### Backend not working?
- Check environment variable is set: `FOOTBALL_API_TOKEN`
- Check logs in Railway dashboard (Deployments tab → View Logs)
- Test health endpoint: `/api/health`

### Frontend not loading teams?
- Check `REACT_APP_API_URL` is set correctly
- Check CORS is enabled in backend (it is!)
- Check browser console for errors (F12 → Console tab)

### Both deployed but frontend can't reach backend?
1. Make sure backend URL in frontend env var starts with `https://`
2. Make sure backend URL doesn't have trailing slash
3. Redeploy frontend after changing env vars

---

## 📝 Your URLs (Fill These In!)

**Backend URL:**
```
https://________________________.railway.app
```

**Frontend URL:**
```
https://________________________.railway.app
```

**Test URLs:**
- Health check: `[backend]/api/health`
- Matches: `[backend]/api/matches?matchday=9`
- Live site: `[frontend]`

---

## 🎉 You're Live!

Once both are deployed and working, you can:
- Share the frontend URL with friends
- Show off the team selection page
- Collect emails on the landing page
- Start planning Phase 2 features!

---

**Need help?** Check Railway docs: https://docs.railway.app/
