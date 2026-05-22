# VeggieMart Vercel Production Fix Checklist

## ✅ Completed Fixes

### 1. Code Quality & Configuration
- [x] Removed hardcoded `localhost` URLs from frontend code
- [x] Verified API routes use relative URLs (`/api/*`)
- [x] Created `.env.example` template file
- [x] Updated `.env` with proper configuration comments
- [x] Added DEPLOYMENT.md guide for future reference

### 2. Environment Configuration
- [x] NEXTAUTH_URL properly configured for development (http://localhost:3000)
- [x] NEXTAUTH_SECRET configured
- [x] MongoDB connection string verified
- [x] Cron secret configured

### 3. Database & Authentication
- [x] MongoDB connection using mongoose with proper pooling
- [x] User model properly configured
- [x] NextAuth properly integrated with Credentials provider
- [x] Password hashing with bcryptjs

### 4. API Routes Verified
- [x] `/api/products` - GET/POST/PUT endpoints
- [x] `/api/categories` - GET/POST endpoints  
- [x] `/api/subscription/*` - All subscription endpoints
- [x] `/api/auth/[...nextauth]` - Authentication handler
- [x] `/api/orders` - Order management

### 5. Dynamic Routes
- [x] `/product/[id]` - Product detail page with proper routing
- [x] `/products?category=*` - Category filtering via query params
- [x] `/admin/*` - Admin panel routes

### 6. Code Committed & Pushed
- [x] Changes committed to Git
- [x] Code pushed to GitHub main branch
- [x] Deployment documentation added

## ⚙️ Required Vercel Configuration

### Step 1: Set Environment Variables in Vercel Dashboard
Go to: **Project Settings → Environment Variables**

Add these variables for **Production**:
```
MONGODB_URI = <your MongoDB connection string>

NEXTAUTH_SECRET = [Generate new random secret with: openssl rand -base64 32]

NEXTAUTH_URL = https://veggiemart.vercel.app
# OR your custom domain if configured

CRON_SECRET = <your cron secret>
```

### Step 2: Trigger Redeploy
1. Go to Vercel Dashboard
2. Select VeggieMart project
3. Click **Redeploy** button
4. Wait for build to complete

### Step 3: Verify Production Deployment

#### Check Core Pages Load:
- [ ] Home page: `https://veggiemart.vercel.app/`
- [ ] Products page: `https://veggiemart.vercel.app/products`
- [ ] Subscriptions page: `https://veggiemart.vercel.app/subscriptions`
- [ ] Admin login: `https://veggiemart.vercel.app/admin`

#### Check API Endpoints:
- [ ] Products API: `https://veggiemart.vercel.app/api/products`
- [ ] Categories API: `https://veggiemart.vercel.app/api/categories`
- [ ] Featured Products: `https://veggiemart.vercel.app/api/featured-products`

#### Check Features:
- [ ] Product categories show correctly
- [ ] Product filtering by category works
- [ ] Subscription creation works
- [ ] Admin login functions properly
- [ ] Authentication with JWT works
- [ ] Database queries return data

#### Check Browser Console:
- [ ] No CORS errors
- [ ] No 401/403 authentication errors
- [ ] No 404 errors for API calls
- [ ] No console errors

## 🐛 Troubleshooting Common Issues

### Issue: "Categories not showing"
**Root Cause**: Database query failing or API not returning data
**Check**:
1. Verify MONGODB_URI is correctly set in Vercel
2. Check Vercel Logs for database connection errors
3. Verify database user has proper permissions

### Issue: "Login fails/Authentication errors"
**Root Cause**: NEXTAUTH_URL or NEXTAUTH_SECRET mismatch
**Check**:
1. Verify NEXTAUTH_URL matches your domain in Vercel
2. Generate new NEXTAUTH_SECRET: `openssl rand -base64 32`
3. Clear browser cookies and try again

### Issue: "Subscription page blank"
**Root Cause**: API not returning subscription data or authentication issue
**Check**:
1. Verify user is logged in
2. Check `/api/subscription/user` endpoint
3. Verify database has subscription records

### Issue: "Admin pages show 401 Unauthorized"
**Root Cause**: Admin role not set or authentication fails
**Check**:
1. Verify user has `role: 'admin'` in database
2. Check NEXTAUTH configuration
3. Verify session is properly created

## 📋 Post-Deployment Verification

After successful deployment:

1. **Test User Signup**
   - Visit `/signup`
   - Create test account
   - Verify email is saved in database

2. **Test Login**
   - Visit `/login`
   - Login with test account
   - Verify JWT token created

3. **Test Product Browse**
   - Visit `/products`
   - Filter by category
   - Click product to view details

4. **Test Subscription (if logged in)**
   - Visit `/subscriptions`
   - Create new subscription
   - Verify subscription saved to database

5. **Test Admin Panel (if admin user)**
   - Visit `/admin`
   - Check dashboard loads
   - Verify analytics data shows
   - Check product management works

## 🚀 Next Steps

1. ✅ Code is committed and pushed
2. ⏳ Update Vercel environment variables
3. ⏳ Trigger redeploy
4. ⏳ Run post-deployment tests
5. ⏳ Monitor logs for errors

---

**Last Updated**: May 22, 2026
**Status**: ✅ Ready for Vercel Deployment
