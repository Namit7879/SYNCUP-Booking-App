# 🚀 VERCEL + RAILWAY DEPLOYMENT - START HERE

**Your App:** Booking App (React Frontend + Node.js Backend + PostgreSQL)  
**Cost:** FREE (with Railway $5/month credit)  
**Time:** ~15 minutes

---

## 📍 What Gets Deployed

| Component | Platform | Free | Status |
|-----------|----------|------|--------|
| **Frontend** | Vercel | ✅ Yes | React SPA |
| **Backend API** | Railway | ✅ Yes ($5 credit included) | Express.js |
| **Database** | Railway | ✅ Yes ($5 credit included) | PostgreSQL |

---

## 🎯 Your GitHub Repos

- **Frontend + Backend Code:** https://github.com/Namit7879/SYNCUP-Booking-App
- **Branch:** `main`

---

## ⚡ QUICK START (15 Minutes)

### 1️⃣ Create Railway Account & Database (3 min)

**URL:** https://railway.app

```
1. Sign up with GitHub (recommended)
2. Create "New Project"
3. Select "Provision PostgreSQL"
4. Click "Deploy"
5. Wait for database to start (green checkmark)
```

Once created, go to **Variables tab** and copy your:

```
DATABASE_URL=postgresql://user:password@host:5432/railway
```

**⚠️ Save this somewhere safe!**

---

### 2️⃣ Deploy Backend to Railway (3 min)

Still in Railway:

```
1. Click "+ New" button
2. Select "GitHub Repo"
3. Choose repository: SYNCUP-Booking-App
4. Railway auto-detects the server folder
5. Click "Deploy"
```

After deployment:

**Go to backend service → Variables tab**

Add these environment variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/railway
NODE_ENV=production
PORT=3000
JWT_SECRET=generate-with-openssl-rand-base64-32
CLIENT_URL=https://your-frontend-will-go-here.vercel.app
NO_LOGIN_ADMIN=true
DEFAULT_ADMIN_EMAIL=adminuser123@gmail.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=Default Admin
```

**Generate JWT Secret (open terminal):**
```bash
openssl rand -base64 32
# Copy the output and paste as JWT_SECRET value
```

**Save variables** → Railway auto-redeploys

**Copy your Railway backend URL from the "Domain" field:**
```
https://booking-api-xyz.railway.app
```

⚠️ Save this!

---

### 3️⃣ Deploy Frontend to Vercel (3 min)

**URL:** https://vercel.com/dashboard

```
1. Sign in as: namitsharma1308@gmail.com
2. Click "Add New" → "Project"
3. Select repository: SYNCUP-Booking-App from GitHub
4. Import and Configure:
   - Root Directory: client
   - Framework: Vite (auto-detected)
   - Continue
```

**Add Environment Variable:**

```
VITE_API_URL=https://booking-api-xyz.railway.app
```

Replace with your actual Railway backend URL from Step 2

```
5. Click "Deploy"
6. Wait 2-3 minutes for deployment
```

Once done, Vercel gives you your frontend URL:

```
https://your-app-xyz.vercel.app
```

⚠️ Copy this!

---

### 4️⃣ Update Backend with Frontend URL (1 min)

Go back to Railway backend service → Variables tab

Update:
```env
CLIENT_URL=https://your-app-xyz.vercel.app
```

**Save** → Railway auto-redeploys ✅

---

### 5️⃣ Test Your Live App (3 min)

#### Test Frontend:
```
https://your-app-xyz.vercel.app
```

You should see:
- ✅ Landing page with your app name
- ✅ Event types displayed
- ✅ "Public booking" links visible

#### Test Admin Login:
```
https://your-app-xyz.vercel.app/login
```

Login with:
```
Email: adminuser123@gmail.com
Password: admin123
```

You should see:
- ✅ Dashboard
- ✅ Event types list
- ✅ Can create new events

#### Test API Health:
Open terminal:
```bash
curl https://booking-api-xyz.railway.app/api/health
```

Should return:
```
{"status":"ok","timestamp":"2024-03-29T..."}
```

#### Test Booking Flow:
1. Go to frontend homepage
2. Click any event type
3. Select a date and time
4. Fill in name, email, details
5. Click "Schedule Event"
6. Should see success message ✅

---

## 🎉 SUCCESS!

Your app is now **LIVE** on:

| URL | Purpose |
|-----|---------|
| `https://your-app-xyz.vercel.app` | 👥 Public booking page |
| `https://your-app-xyz.vercel.app/login` | 🔐 Admin dashboard |
| `https://booking-api-xyz.railway.app/api/health` | 🏥 API health check |

---

## 📊 Your Live URLs

After deployment, you have:

**Frontend:**
```
https://your-app-xyz.vercel.app
```

**Admin Login:**
```
https://your-app-xyz.vercel.app/login
Email: adminuser123@gmail.com
Password: admin123
```

**API Base:**
```
https://booking-api-xyz.railway.app/api
```

---

## 🔄 Making Changes

Whenever you update code:

```bash
cd C:\Booking-app
git add .
git commit -m "Your changes"
git push origin main
```

**Both Vercel and Railway automatically detect changes and redeploy!** 🚀

---

## 🔐 Environment Variables Reference

### In Vercel (Frontend)

**Project Settings** → **Environment Variables**

```env
VITE_API_URL=https://booking-api-xyz.railway.app
```

### In Railway (Backend)

**Backend Service** → **Variables**

```env
DATABASE_URL=postgresql://user:password@host:5432/railway
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
CLIENT_URL=https://your-app-xyz.vercel.app
NO_LOGIN_ADMIN=true
DEFAULT_ADMIN_EMAIL=adminuser123@gmail.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=Default Admin
```

---

## 🆘 Troubleshooting

### ❌ "Frontend shows 'API Error' or can't connect"

**Solution:**
1. Check `VITE_API_URL` in Vercel matches your Railway backend URL
2. Go to Vercel → Settings → Environment Variables
3. Verify it's exactly: `https://booking-api-xyz.railway.app` (no trailing slash)
4. Redeploy: Settings → Deployments → Click any deployment → Redeploy

### ❌ "Cannot login / 500 server error"

**Solution:**
1. Check Railway backend logs: Backend Service → Logs
2. Verify `DATABASE_URL` is correct in Railway Variables
3. Check all variables are set
4. Restart backend: Kill and redeploy

### ❌ "Database connection failed"

**Solution:**
1. Go to Railway → PostgreSQL Service
2. Check it's running (should see green "Up")
3. Copy fresh `DATABASE_URL` from Variables
4. Update in Backend Variables
5. Restart backend

### ❌ "Booking data not saving"

**Solution:**
1. Check Railway PostgreSQL logs
2. Verify `DATABASE_URL` in backend variables
3. Test API: `curl https://booking-api-xyz.railway.app/api/health`
4. Check Vercel frontend logs for errors

---

## 📈 Monitor Your App

### Vercel Dashboard

- **Deployments:** See all builds and rollback if needed
- **Logs:** Real-time errors from frontend
- **Analytics:** Page performance metrics

### Railway Dashboard

- **Logs:** Real-time backend API logs
- **Metrics:** CPU/Memory/Network usage
- **Database:** View PostgreSQL status

---

## 💰 Pricing

**Free with credits:**
- Vercel: Always free for static/SPA
- Railway: $5/month included, more if needed

**Cost:** $0/month for the first month

---

## 🔗 Quick Links

| Service | Link |
|---------|------|
| Vercel Dashboard | https://vercel.com/dashboard |
| Railway Dashboard | https://railway.app |
| GitHub Repo | https://github.com/Namit7879/SYNCUP-Booking-App |
| Your App Frontend | https://your-app-xyz.vercel.app |
| Your App API | https://booking-api-xyz.railway.app |

---

## 📞 Need Detailed Help?

Check these files in your repo:

- **`VERCEL-RAILWAY-QUICK.md`** - Quick reference (this page)
- **`VERCEL-RAILWAY-DEPLOY.md`** - Complete step-by-step guide
- **`DOCKER-SETUP.md`** - If you want Docker alternative

---

## ✅ Deployment Checklist

- [ ] Railway account created
- [ ] PostgreSQL database created on Railway
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] All environment variables set correctly
- [ ] Frontend loads on Vercel
- [ ] Can login with admin credentials
- [ ] Can view event types
- [ ] Can create new event type
- [ ] Can book a meeting
- [ ] API health check passes
- [ ] Database has booking records

---

## 🎓 What Happens Next

1. **Your app is live!** Access at `https://your-app-xyz.vercel.app`
2. **Auto-deploy enabled:** Every `git push` triggers deployment
3. **Monitoring:** Check logs on Vercel/Railway if issues
4. **Scaling:** Railway auto-scales as you grow
5. **Updates:** Just push to GitHub, both platforms auto-redeploy

---

## 🎁 Pro Tips

- **Free tier is generous:** Vercel + Railway $5 credit = free deployment
- **Auto-scaling:** No configuration needed, Railways scales automatically
- **One-click rollback:** Revert to previous version instantly
- **Database backups:** Railway handles automatically
- **Custom domain:** Can add later in Vercel/Railway settings

---

**You're all set! Your app is LIVE! 🚀**

**Next:** Visit your deployed app:
```
https://your-app-xyz.vercel.app
```

Enjoy! 🎉

---

**Questions?** Check the detailed guide: `VERCEL-RAILWAY-DEPLOY.md`
