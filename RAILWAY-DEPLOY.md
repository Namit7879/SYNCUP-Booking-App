# 🚀 Railway Backend Deployment - Complete Guide

**Status:** ✅ Fixed and ready to deploy

---

## 📋 What Railway Hosts

- **Node.js Backend (Express.js API)**
- **PostgreSQL Database**
- Everything runs on Railway infrastructure

---

## ⚡ RAILWAY DEPLOYMENT (5 Steps)

### ✅ STEP 1: Create Railway Account

Go to: **https://railway.app**

```
1. Click "Start New Project"
2. Choose "Create new Postgres"
3. Click "Deploy"
4. Wait 30 seconds for database to initialize
```

Once created, you'll see a project dashboard with a **PostgreSQL service**.

---

### ✅ STEP 2: Add PostgreSQL Service Variables

In your Railway project, click on the **Postgres** service → **Variables** tab

Look for or create:

```
DATABASE_URL=postgresql://user:password@host:5432/railway
```

(This is automatically created - just copy it for later)

**Copy and save this value!** ⚠️ You'll need it soon.

---

### ✅ STEP 3: Deploy Backend to Railway

Still in the same Railway project:

```
1. Click "+ New" button (top right)
2. Select "GitHub Repo"
3. Search for and select: SYNCUP-Booking-App
4. Click "Deploy"
```

Railway will detect your `server` folder automatically since it contains `package.json`.

**Wait for the build to complete.** You should see a green ✅ checkmark.

---

### ✅ STEP 4: Configure Backend Environment Variables

After backend deploys, it will appear as a new service in your project.

Click on the **Backend** service (or the one that says "Node.js"):

Go to **Variables** tab and add these values:

```env
DATABASE_URL=postgresql://user:password@host:5432/railway
NODE_ENV=production
PORT=3000
JWT_SECRET=generate-strong-secret-here
CLIENT_URL=https://your-vercel-url.vercel.app
NO_LOGIN_ADMIN=true
DEFAULT_ADMIN_EMAIL=adminuser123@gmail.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=Default Admin
```

**Values to adjust:**

- `DATABASE_URL` → Copy from your PostgreSQL service
- `JWT_SECRET` → Generate with: `openssl rand -base64 32`
- `CLIENT_URL` → You'll get this from Vercel (do later)

**Save variables** → Railway auto-redeploys ✅

---

### ✅ STEP 5: Get Your Railway Backend URL

Click on the **Backend service** in Railway.

Look for the **Domain** section or **Public URL**.

It will show something like:

```
https://booking-api-xyz.railway.app
```

**Copy this URL!** ⚠️ You need it for Vercel frontend.

---

## ✅ Your Railway Services

After deployment, your Railway project should have:

```
📦 My Project
├─ 🗄️ Postgres (Database)
│  └─ Status: Up ✅
└─ 🖥️ Backend (Node.js API)
   └─ Status: Up ✅
   └─ Domain: https://booking-api-xyz.railway.app
```

---

## 🧪 Test Your Backend

Open your terminal and test:

```bash
curl https://booking-api-xyz.railway.app/api/health
```

Expected response:

```json
{"status":"ok","timestamp":"2024-03-29T..."}
```

If this works, your backend is **LIVE!** ✅

---

## 🔄 Update CODE → Auto-Deploy

When you update code in the `server` folder:

```bash
cd C:\Booking-app
git add server/
git commit -m "Backend updates"
git push origin main
```

Railway automatically detects the change and redeploys! 🚀

---

## 📊 Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Token signing key | `random-32-chars` |
| `CLIENT_URL` | Frontend URL (CORS) | `https://vercel-app.vercel.app` |
| `NO_LOGIN_ADMIN` | Skip login flow | `true` |
| `DEFAULT_ADMIN_EMAIL` | Default admin account | `adminuser123@gmail.com` |
| `DEFAULT_ADMIN_PASSWORD` | Default admin password | `admin123` |
| `DEFAULT_ADMIN_NAME` | Admin display name | `Default Admin` |

---

## 🆘 Troubleshooting Railway

### ❌ Build Failed

**Solution:**
1. Check Railway **Logs** tab
2. Look for error messages
3. Common issues:
   - Missing `NODE_ENV` variable
   - Bad `DATABASE_URL` format
   - Port conflict

### ❌ "Cannot connect to database"

**Solution:**
1. Verify PostgreSQL service is running (green status)
2. Copy fresh `DATABASE_URL` from PostgreSQL Variables
3. Update in Backend Variables
4. Trigger redeploy (change a variable, save, it redeploys)

### ❌ API returns 500 error

**Solution:**
1. Check **Logs** in Backend service
2. Look for the error message
3. Common causes:
   - Wrong DATABASE_URL
   - Missing environment variables
   - Prisma migration issues

### ❌ Getting timeout errors

**Solution:**
1. Railway might be initializing
2. Wait 2-3 minutes and try again
3. Check if backend service shows "Up" status
4. Restart service: Click **Restart** button

---

## 📈 Monitor Your Backend

### View Logs (Real-time debugging)

1. Click **Backend** service
2. Go to **Logs** tab
3. See all API requests and errors in real-time

### Check Status

1. Click **Backend** service
2. See green ✅ if running
3. Red ❌ if crashed

### Restart Service

1. Click **Backend** service
2. Click **Restart** button
3. Service restarts instantly

---

## 🔒 Security Notes

1. **Change JWT_SECRET:** Generate with `openssl rand -base64 32`
2. **Change admin password:** Update `DEFAULT_ADMIN_PASSWORD`
3. **DATABASE_URL:** Keep private, don't commit to git
4. **Environment variables:** All sensitive - never share

---

## 📞 Support Resources

- **Railway Docs:** https://docs.railway.app
- **Your Project:** https://railway.app
- **GitHub Repo:** https://github.com/Namit7879/SYNCUP-Booking-App

---

## ✅ Railway Deployment Checklist

- [ ] Railway account created
- [ ] PostgreSQL database deployed
- [ ] Backend deployed from GitHub
- [ ] All environment variables set
- [ ] Backend shows "Up" status
- [ ] Health check works: `/api/health`
- [ ] DATABASE_URL is correct
- [ ] JWT_SECRET is strong (32+ chars)
- [ ] CLIENT_URL ready (from Vercel)

---

## 🎯 Next Steps

1. ✅ Deploy Frontend to **Vercel** (see VERCEL-RAILWAY-QUICK.md)
2. ✅ Get Vercel URL
3. ✅ Update `CLIENT_URL` in Railway backend variables
4. ✅ Test full integration

---

**Your backend is LIVE!** 🎉

**Backend API:** `https://booking-api-xyz.railway.app`

**Next:** Deploy frontend to Vercel and update `CLIENT_URL` 🚀
