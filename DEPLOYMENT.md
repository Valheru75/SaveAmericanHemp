# Deployment Guide: Don't Ban Hemp Campaign Website

## Overview
This guide covers deploying the Don't Ban Hemp campaign website to production.

## Prerequisites Checklist

Before deploying, ensure you have completed:

- [x] All 16 implementation tasks completed
- [ ] Resend account created and API key obtained
- [ ] Supabase project created and configured
- [ ] Google Civic Information API key obtained
- [ ] GitHub repository created
- [ ] Vercel account created (free tier is fine)

## Deployment Steps

### 1. Environment Variables Summary

You'll need these environment variables. Make sure you have them ready:

| Variable | Source | Example |
|----------|--------|---------|
| `VITE_SUPABASE_URL` | Supabase Project Settings | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Project API Settings | `eyJhbGc...` |
| `VITE_GOOGLE_CIVIC_API_KEY` | Google Cloud Console | `AIzaSy...` |
| `RESEND_API_KEY` | Resend Dashboard (for Edge Functions) | `re_...` |

### 2. Push Code to GitHub

```bash
# Verify all changes are committed
git status

# Push to GitHub
git push origin main
```

### 3. Deploy Frontend to Vercel

1. **Sign in to Vercel**: https://vercel.com
2. **Import Project**: Click "Add New Project" → Import your GitHub repository
3. **Configure Build Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**:
   Go to "Environment Variables" tab and add:
   ```
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   VITE_GOOGLE_CIVIC_API_KEY=<your-google-civic-key>
   ```

5. **Deploy**: Click "Deploy" button

### 4. Deploy Supabase Edge Functions

After frontend deployment, deploy your Edge Functions:

```bash
# Set the Resend API key secret
supabase secrets set RESEND_API_KEY=<your-resend-api-key>

# Deploy Edge Functions
supabase functions deploy lookup-lawmakers
supabase functions deploy send-email-to-lawmaker
```

Expected output:
```
Deploying function lookup-lawmakers...
Function deployed successfully
URL: https://xxxxx.supabase.co/functions/v1/lookup-lawmakers
```

### 5. Verify Deployment

Visit your Vercel URL and test the complete user flow:

1. **Homepage loads**: Countdown timer, campaign stats, and action form visible
2. **Form submission**: Enter email, zip code, and role → Click "Find My Representatives"
3. **Results display**: Your senators and representative appear
4. **Email modal**: Click "Send Email" on a lawmaker → Modal opens with template
5. **Email sending**: Review email → Click "Send Email" → Success message

### 6. Custom Domain (Optional)

If you have a custom domain:

1. In Vercel project settings, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `dontbanhemp.org`)
4. Follow DNS configuration instructions:
   - Add A record or CNAME record as instructed
   - Wait for DNS propagation (5-30 minutes)
5. Verify domain is active

For Resend email sending, also configure:
1. In Resend dashboard, go to **Domains**
2. Add your domain
3. Configure DNS records for SPF, DKIM, and DMARC
4. Update Edge Function code to use your domain in "from" address

## Troubleshooting

### Build Fails on Vercel

**Issue**: Build command fails with TypeScript errors
**Solution**:
```bash
# Test build locally first
npm run build

# Fix any TypeScript errors
# Then push and redeploy
```

### Edge Functions Not Working

**Issue**: 500 error when calling Edge Functions
**Solution**:
- Check Supabase logs: https://app.supabase.com/project/_/logs
- Verify environment variables are set: `supabase secrets list`
- Ensure functions are deployed: `supabase functions list`

### Email Not Sending

**Issue**: Email modal shows error
**Solution**:
- Verify Resend API key is set in Supabase secrets
- Check Resend dashboard for error logs
- Ensure "from" email address is verified in Resend

### Lawmaker Lookup Fails

**Issue**: No lawmakers found for valid zip code
**Solution**:
- Verify Google Civic API key is valid
- Check API quota in Google Cloud Console
- Test API directly: https://developers.google.com/civic-information/docs/v2

## Post-Deployment Tasks

After successful deployment:

1. **Test thoroughly**: Go through entire user flow multiple times
2. **Monitor errors**: Check Vercel Analytics and Supabase logs
3. **Seed database**: Add featured lawmakers with alcohol funding data
4. **Social media**: Share deployment URL
5. **Analytics**: Add Google Analytics or similar (optional)

## Continuous Deployment

Vercel automatically redeploys when you push to main branch:

```bash
# Make changes locally
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel automatically rebuilds and deploys
```

## Rollback

If deployment has issues:

1. In Vercel dashboard, go to **Deployments**
2. Find the last working deployment
3. Click "⋯" → **Promote to Production**

## Support

If you encounter issues:

- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **Resend**: https://resend.com/docs

---

**Deployment checklist:**
- [ ] Code pushed to GitHub
- [ ] Vercel project created and configured
- [ ] Environment variables added to Vercel
- [ ] Frontend deployed successfully
- [ ] Edge Functions deployed to Supabase
- [ ] Resend API key set in Supabase secrets
- [ ] Complete user flow tested
- [ ] Custom domain configured (if applicable)

🎉 **Your campaign website is live!**
