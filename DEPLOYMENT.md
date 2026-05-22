# VeggieMart Vercel Deployment Guide

## Overview
This guide explains how to fix production deployment issues on Vercel for the VeggieMart project.

## Issues Fixed

### 1. NEXTAUTH_URL Environment Variable
**Problem**: NEXTAUTH_URL was hardcoded to `http://localhost:3000`, which breaks authentication in production.

**Solution**: 
- Keep `NEXTAUTH_URL=http://localhost:3000` for local development
- In Vercel, set `NEXTAUTH_URL` to your production domain (e.g., `https://yourdomain.vercel.app`)

### 2. Environment Variables Setup in Vercel
Required environment variables to set in Vercel:
```
MONGODB_URI=<your-mongodb-connection-string>
NEXTAUTH_SECRET=<your-secure-nextauth-secret>
NEXTAUTH_URL=https://yourdomain.vercel.app (or your custom domain)
CRON_SECRET=<your-cron-secret>
```

### 3. No Hardcoded Localhost URLs
✅ **Verified**: The application uses relative API URLs (`/api/products`, `/api/categories`, etc.), which work correctly in both development and production.

## Deployment Steps

### Local Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update environment variables with your local/development values
3. Run development server:
   ```bash
   npm run dev
   ```

### Production Deployment to Vercel

#### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "fix: production deployment configuration"
git push origin main
```

#### Step 2: Configure Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update the following variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NEXTAUTH_SECRET`: A strong random string (generate with: `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://veggiemart.vercel.app`)
   - `CRON_SECRET`: Your cron job secret

#### Step 3: Redeploy on Vercel
1. Go to Vercel Dashboard
2. Click "Redeploy" on your project
3. Wait for the build to complete
4. Test the production URL

## Verifying the Deployment

### Check API Endpoints
- Products: `https://yourdomain.vercel.app/api/products`
- Categories: `https://yourdomain.vercel.app/api/categories`
- Subscribe: `https://yourdomain.vercel.app/api/subscription/create`

### Check Pages
- Home: `https://yourdomain.vercel.app/`
- Products: `https://yourdomain.vercel.app/products`
- Subscriptions: `https://yourdomain.vercel.app/subscriptions`
- Admin: `https://yourdomain.vercel.app/admin`

## Common Issues and Solutions

### Issue 1: Categories/Products Not Loading
- **Cause**: `NEXTAUTH_URL` not properly configured
- **Solution**: Update `NEXTAUTH_URL` in Vercel to match your domain

### Issue 2: Authentication Fails
- **Cause**: `NEXTAUTH_SECRET` is missing or different between environments
- **Solution**: Generate a new secret and set it consistently in Vercel

### Issue 3: Database Connection Failed
- **Cause**: `MONGODB_URI` is missing or incorrect
- **Solution**: Verify MongoDB connection string in Vercel environment variables

### Issue 4: Cron Jobs Not Running
- **Cause**: `CRON_SECRET` not configured
- **Solution**: Set `CRON_SECRET` in Vercel to match your application

## Production Build Testing Locally
```bash
# Build the project
npm run build

# Start the production server
npm start
```

## Monitoring Production
- Check Vercel Logs: Vercel Dashboard → Your Project → Logs
- Monitor Database: MongoDB Atlas dashboard
- Test all core features after deployment

## Next Steps
- Configure custom domain if needed
- Set up monitoring/alerting
- Enable automatic deployments on main branch
- Test all features (products, categories, subscriptions, admin)
