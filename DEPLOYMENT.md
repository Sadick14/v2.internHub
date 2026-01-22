# Deployment Configuration Guide

## Firebase Setup

### 1. Authorized Domains for OAuth

To fix the Firebase OAuth error, add your deployment domain to Firebase's authorized domains:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains** tab
4. Click **Add domain**
5. Add your domain:
   - `v2-intern-hub.vercel.app`
   - Any other custom domains you're using

### 2. Firestore Security Rules

Ensure your Firestore rules are properly configured in `firestore.rules`

### 3. Environment Variables

Make sure all environment variables are set in your deployment platform (Vercel):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Vercel Deployment

### Build Configuration

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x or higher

### Headers Configuration

The app includes custom headers for the service worker in `next.config.ts`. These are automatically applied during deployment.

## Service Worker

The PWA service worker is configured to:
- Only cache GET requests (POST/PUT/DELETE go directly to network)
- Skip Firebase and Next.js internal requests
- Provide offline fallback for static pages
- Handle updates gracefully

### Testing Service Worker Locally

The service worker only runs in production mode. To test:

```bash
npm run build
npm start
```

Then visit `http://localhost:3000`

## Troubleshooting

### Service Worker 404 Error

If you see "404 when fetching service-worker.js":
1. Ensure the file exists in `/public/service-worker.js`
2. Check Vercel deployment logs
3. Verify the file is included in the build output
4. Try clearing browser cache and re-registering

### POST Request Cache Errors

Fixed in the latest version - the service worker now skips all non-GET requests.

### Firebase OAuth Errors

This is expected if:
- The domain is not in Firebase's authorized domains list
- You're testing on a non-HTTPS domain (except localhost)

### MetaMask Extension Errors

If you see MetaMask errors but your app doesn't use MetaMask:
- These may come from browser extensions trying to inject themselves
- They can be safely ignored
- Consider adding error boundaries to catch and suppress these

## Production Checklist

- [ ] Firebase authorized domains configured
- [ ] All environment variables set in Vercel
- [ ] Service worker file exists in `/public/`
- [ ] Build completes successfully
- [ ] OAuth login works on production domain
- [ ] PWA install prompt appears (on supported devices)
- [ ] Offline mode works for cached pages
- [ ] No console errors related to app functionality

## Known Issues

1. **MetaMask Connection Error**: This is not from our app - likely a browser extension conflict. Can be ignored.

2. **Service Worker Cache Errors**: Fixed by filtering out non-GET requests.

3. **Firebase Timestamp Conversion**: Handled properly in all services with proper type checking.

## Support

For deployment issues, check:
- Vercel deployment logs
- Browser console (F12)
- Firebase Console for auth/database errors
- Network tab for failed API calls
