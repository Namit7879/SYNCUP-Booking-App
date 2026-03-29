# ⚡ Vercel + Railway Deployment - Quick Summary

**Time to Deploy:** ~15 minutes

---

## 🎯 What You'll Do

1. **Create Railway account** and set up PostgreSQL database
2. **Deploy backend** to Railway (auto-detects from this repo)
3. **Deploy frontend** to Vercel (auto-detects from `client/` folder)
4. **Configure environment variables** on both platforms
5. **Test and verify** your live app

---

## 👉 Start Here

### 1️⃣ Create Railway Account (5 min)

```
🔗 https://railway.app

1. Sign up with GitHub
2. Create new project
3. Select "Create new Postgres"
4. Click "Deploy"
5. Copy DATABASE_URL from Variables tab
```

**Note:** Save `DATABASE_URL` somewhere safe!

---

### 2️⃣ Deploy Backend to Railway (3 min)

```
In same Railway project:

1. Click "+ New"
2. Select "GitHub Repo"
3. Choose: SYNCUP-Booking-App
4. Continue with defaults
5. Railway detects server/ folder
```

**After deploy, go to Variables tab and add:**

```env
DATABASE_URL=<paste from postgres service>
NODE_ENV=production
PORT=3000
CLIENT_URL=https://your-vercel-url.vercel.app
JWT_SECRET=openssl-rand-base64-32-output
NO_LOGIN_ADMIN=true
DEFAULT_ADMIN_EMAIL=adminuser123@gmail.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=Default Admin
```

**Save → Copy your Railway API URL (e.g., https://booking-api-xyz.railway.app)**

---

### 3️⃣ Deploy Frontend to Vercel (3 min)

```
🔗 https://vercel.com/dashboard

1. Sign in as: namitsharma1308@gmail.com
2. Click "Add New" → "Project"
3. Import: SYNCUP-Booking-App
4. Root Directory: client
5. Add Environment Variable:
   VITE_API_URL=<railway-api-url-from-step-2>
6. Deploy
```

**Copy your Vercel URL (e.g., https://your-app-xyz.vercel.app)**

---

### 4️⃣ Update Backend with Frontend URL (1 min)

```
Back to Railway backend Variables:

1. Update CLIENT_URL: https://your-app-xyz.vercel.app
2. Save
3. Auto-redeploys
```

---

### 5️⃣ Test Your App (3 min)

```
✅ Frontend:
https://your-app-xyz.vercel.app

✅ Admin Login:
https://your-app-xyz.vercel.app/login
Email: adminuser123@gmail.com
Password: admin123

✅ API Health:
https://booking-api-xyz.railway.app/api/health
```

---

## 📍 Your Live URLs

| Service | URL |
|---------|-----|
| Frontend | `https://your-app-xyz.vercel.app` |
| Login | `https://your-app-xyz.vercel.app/login` |
| API | `https://booking-api-xyz.railway.app/api` |

---

## 🔄 Updates

Just push to GitHub - both platforms auto-deploy!

```bash
git add .
git commit -m "Changes"
git push origin main
```

---

## 🆘 If Something's Wrong

1. **"API Error" on frontend:**
   - Check `VITE_API_URL` in Vercel matches Railway URL
   - Redeploy on Vercel

2. **Cannot login:**
   - Check `DATABASE_URL` in Railway
   - Check Railway logs for errors

3. **Booking doesn't save:**
   - Check Railway Postgres is running
   - Check backend logs in Railway

---

**Need detailed help?** See `VERCEL-RAILWAY-DEPLOY.md`

**YOU'RE LIVE!** 🎉
