# 🚀 Deploy to Vercel + Railway - Complete Guide

**Your Stack:**
- ✅ Frontend: Vercel (React App)
- ✅ Backend: Railway (Node.js API)
- ✅ Database: Railway (PostgreSQL)

---

## 📋 Step-by-Step Deployment

### ✅ STEP 1: Prepare Repository

First, let's make sure all code is committed to GitHub.

```bash
cd C:\Booking-app
git status
# Check if there are any uncommitted changes
```

If you see changes, commit them:

```bash
git add .
git commit -m "Add Docker and deployment configs for Vercel+Railway"
git push origin main
```

---

### ✅ STEP 2: Deploy Database to Railway

#### 2.1: Create Railway Account

Go to: **https://railway.app**

1. Click "Start New Project"
2. Choose **Create new Postgres**
3. Click "Deploy"

**Railway will create a PostgreSQL database and give you connection details.**

#### 2.2: Note Your Database Credentials

Once created, go to **Variables** tab and copy:

```
DATABASE_URL=postgresql://user:password@host:port/database
```

**Save this somewhere safe - you'll need it for the backend!**

---

### ✅ STEP 3: Deploy Backend to Railway

#### 3.1: Add Backend to Railway Project

In the Railway project dashboard:

1. Click **"+ New"** button
2. Select **"GitHub Repo"**
3. Choose your repository: `SYNCUP-Booking-App`
4. Select **root** as the directory (NOT `server/`)
5. Click **"Deploy"**

#### 3.2: Configure Backend Service

After it deploys, Railway will auto-detect your `server/` folder.

Go to **Settings** tab and click **"Generate Domain"** to get your API URL.

It will look like: `https://booking-api-xyz.railway.app`

#### 3.3: Set Environment Variables

In Railway backend service, go to **Variables** tab and add:

```env
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=3000
CLIENT_URL=https://your-frontend-url.vercel.app
JWT_SECRET=your-very-long-secret-key-change-this
NO_LOGIN_ADMIN=true
DEFAULT_ADMIN_EMAIL=adminuser123@gmail.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=Default Admin
```

**Replace with:**
- `DATABASE_URL` → From Step 2.2
- `CLIENT_URL` → Will get from Vercel (do this after)
- `JWT_SECRET` → Generate: `openssl rand -base64 32`

Save variables. Railway will auto-redeploy. ✅

#### 3.4: Get Your Backend URL

In Railway, copy the **Domain** URL:

```
https://booking-api-xyz.railway.app
```

**Save this - you'll need it for frontend!**

---

### ✅ STEP 4: Deploy Frontend to Vercel

#### 4.1: Create Vercel Project

Go to: **https://vercel.com/dashboard**

1. Sign in with your email: **namitsharma1308@gmail.com**
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repo: **SYNCUP-Booking-App**
4. Click **"Import"**

#### 4.2: Configure Frontend Settings

Under **Root Directory:**
- Select: **`client`** (important!)

Click **"Continue"** → **"Edit"** environment variables

Add:

```env
VITE_API_URL=https://booking-api-xyz.railway.app
```

**Replace `https://booking-api-xyz.railway.app` with your actual Railway backend URL from Step 3.4**

Click **"Deploy"**

**Vercel will deploy your frontend. Wait 2-3 minutes.** ✅

#### 4.3: Get Your Frontend URL

Once deployed, Vercel shows your URL:

```
https://your-app-xyz.vercel.app
```

**Save this!**

---

### ✅ STEP 5: Update Backend with Frontend URL

Now that you have the frontend URL, update the Railway backend:

1. Go to **Railway** → Your **Backend Service** → **Variables**
2. Update `CLIENT_URL`:

```env
CLIENT_URL=https://your-app-xyz.vercel.app
```

3. Click **"Save"**
4. Railway will auto-redeploy ✅

---

### ✅ STEP 6: Test Everything

#### 6.1: Test Frontend

Open your browser:
```
https://your-app-xyz.vercel.app
```

You should see:
- ✅ Landing page
- ✅ Event types displayed
- ✅ Booking link works

#### 6.2: Test Login

Go to: `https://your-app-xyz.vercel.app/login`

Login with:
```
Email: adminuser123@gmail.com
Password: admin123
```

You should see:
- ✅ Dashboard loads
- ✅ Event types listed
- ✅ Can create/edit/delete events

#### 6.3: Test API

Open terminal and test:

```bash
curl https://booking-api-xyz.railway.app/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-..."}
```

#### 6.4: Test Booking Flow

1. Go to homepage
2. Click an event type
3. Select date and time
4. Fill in details
5. Submit booking
6. Data should appear in Railway database ✅

---

## 🎯 Your Live URLs

After deployment, you have:

| Service | URL |
|---------|-----|
| **Frontend** | `https://your-app-xyz.vercel.app` |
| **Admin Login** | `https://your-app-xyz.vercel.app/login` |
| **API** | `https://booking-api-xyz.railway.app/api` |
| **Health Check** | `https://booking-api-xyz.railway.app/api/health` |
| **Database** | Railway Postgres (internal) |

---

## 🔄 Updating Your App

When you update code:

```bash
cd C:\Booking-app
git add .
git commit -m "Your changes"
git push origin main
```

Both Vercel and Railway automatically detect changes and redeploy! 🚀

---

## 📊 Environment Variables Summary

### Frontend (.env)
```env
VITE_API_URL=https://booking-api-xyz.railway.app
```

### Backend (Railway Variables)
```env
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=3000
CLIENT_URL=https://your-app-xyz.vercel.app
JWT_SECRET=your-secret-key
NO_LOGIN_ADMIN=true
DEFAULT_ADMIN_EMAIL=adminuser123@gmail.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=Default Admin
```

---

## 🔐 Security Notes

1. **JWT_SECRET** - Generate a strong random string:
   ```bash
   openssl rand -base64 32
   ```

2. **Admin Password** - Change from defaults in production:
   - Update `DEFAULT_ADMIN_PASSWORD` in Railway variables
   - Restart service

3. **Database** - Railway handles backups automatically

4. **Logs** - Check Railway deployment logs for errors:
   - Railway Dashboard → Logs tab

---

## ❌ Troubleshooting

### Frontend shows "API Error"

**Problem:** Frontend can't connect to backend

**Solution:**
```bash
# Check if VITE_API_URL is correct in Vercel
# 1. Go to Vercel → Settings → Environment Variables
# 2. Verify VITE_API_URL matches your Railway backend URL
# 3. Redeploy frontend with:
#    - Settings → Deployments → Redeploy
```

### Backend returns 500 errors

**Solution:**
```bash
# Check Railway logs:
# 1. Railway Dashboard → Backend Service → Logs
# 2. Check if DATABASE_URL is correct
# 3. Look for error messages
```

### Database connection fails

**Solution:**
```bash
# 1. Go to Railway → Postgres Service
# 2. Copy fresh DATABASE_URL
# 3. Update in Backend Variables
# 4. Restart backend service
```

### Can't access admin panel

**Solution:**
```
# Login URL: https://your-app-xyz.vercel.app/login
# Default credentials from .env.docker:
Email: adminuser123@gmail.com
Password: admin123
```

---

## 📈 Monitoring

### View Logs

**Vercel:**
- Dashboard → Deployments → Click deployment → Logs

**Railway:**
- Dashboard → Backend/Database → Logs

### Monitor Performance

**Vercel:**
- Dashboard → Analytics

**Railway:**
- Dashboard → Metrics

---

## 🎉 Success Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Database created on Railway
- [ ] Environment variables set correctly
- [ ] Frontend can access backend API
- [ ] Can login with admin credentials
- [ ] Can create event types
- [ ] Can book meetings
- [ ] All tests passing

---

## 💡 Pro Tips

1. **Auto-deploy:** Every `git push` triggers deployment
2. **Rollback:** Revert to previous version in deployment history
3. **Custom Domain:** Add domain in Vercel/Railway settings (not covered here)
4. **Database Backups:** Railway provides automatic backups
5. **Scale:** Railway auto-scales - no manual configuration needed

---

## 📞 Getting Help

If something goes wrong:

1. **Check logs:** Railway or Vercel dashboard
2. **Verify URLs:** Make sure all environment variables match actual URLs
3. **Test API:** `curl https://your-api.railway.app/api/health`
4. **Check connection:** Confirm DATABASE_URL in Railway

---

**Your app is now LIVE! 🎉**

Visit: **`https://your-app-xyz.vercel.app`**

Enjoy! 🚀
