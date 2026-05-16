# iONArena - Deployment Guide

## Google Cloud Deployment

iONArena is optimized for deployment on Google Cloud using **Firebase Hosting** as the primary platform.

### Prerequisites

1. **Google Cloud Account** - https://cloud.google.com
2. **Firebase Project** - Create one in Google Cloud Console
3. **Firebase CLI** - `npm install -g firebase-tools`
4. **Node.js 18+** - Already installed
5. **Git** - For version control

### Setup Steps

#### 1. Create Firebase Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project
gcloud projects create ionarena-prod --set-as-default

# Create Firebase project
firebase projects:create ionarena-prod
```

#### 2. Initialize Firebase

```bash
# Login to Firebase
firebase login

# Initialize Firebase in the project directory
firebase init hosting

# When prompted:
# - Select your Firebase project
# - Public directory: out
# - Single-page app: Yes (rewrite all URLs to index.html)
# - Automatic builds: Yes (if using GitHub)
```

#### 3. Configure Environment Variables

Create `.env.production.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ionarena-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ionarena-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ionarena-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini API (Optional for AI Commentary)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://ionarena-prod.web.app
NODE_ENV=production
```

Get these values from Firebase Console > Project Settings > General

#### 4. Build for Production

```bash
# Remove previous build
rm -rf out .next

# Build Next.js app
npm run build

# This creates the `out` directory for static hosting
```

#### 5. Deploy to Firebase Hosting

```bash
# Deploy to Firebase
firebase deploy --only hosting

# Deploy everything (hosting + functions if added later)
firebase deploy
```

#### 6. Enable Google Cloud CDN (Optional but Recommended)

```bash
# Set up Cloud CDN for better performance
gcloud compute backend-services update firebase-hosting-backend \
  --enable-cdn \
  --cache-mode=CACHE_ALL_STATIC \
  --project=ionarena-prod

# Set cache policy
gcloud compute backend-services update firebase-hosting-backend \
  --default-ttl=3600 \
  --max-ttl=31536000 \
  --project=ionarena-prod
```

### Continuous Deployment (GitHub Integration)

#### Setup GitHub Actions

1. Connect your GitHub repository to Firebase Console
2. Firebase will create GitHub Actions workflows
3. Every push to `main` branch automatically deploys

### Monitoring & Logging

#### Cloud Monitoring

```bash
# View Firebase Hosting metrics
gcloud monitoring time-series list \
  --project=ionarena-prod \
  --filter='resource.type=global'
```

#### Cloud Logging

```bash
# View hosting logs
gcloud logging read \
  "resource.type=global AND resource.labels.service_name=firebase-hosting" \
  --project=ionarena-prod \
  --limit=50 \
  --format=json
```

#### Firebase Console

- Visit: https://console.firebase.google.com/u/0/project/ionarena-prod/hosting/dashboard
- View real-time metrics, traffic, errors, and performance

### Performance Optimization

#### Image Optimization

The app uses Unsplash URLs for player images. To optimize:

1. Download images and store in `public/assets/players/`
2. Update image URLs in `src/constants/ipl-players.ts`
3. Firebase Hosting CDN will serve optimized versions

#### Code Splitting

Next.js automatically code-splits by route. Custom optimization in `next.config.ts`:

- **Three.js** → Separate bundle
- **Framer Motion** → Separate bundle
- **Firebase** → Separate bundle

#### Caching Strategy

```
- Static assets (JS, CSS): 1 year cache
- Images: 1 year cache
- HTML: No cache (always fresh)
```

### Troubleshooting

#### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules .next out
npm install
npm run build
```

#### Deployment Fails

```bash
# Check Firebase auth
firebase login:list

# Verify project
firebase projects:list

# Check Firebase config
firebase projects:describe ionarena-prod
```

#### App Loading Slowly

1. Check Cloud CDN status in GCP Console
2. Verify bundle sizes: `npm run analyze` (requires @next/bundle-analyzer)
3. Check Firebase Hosting metrics dashboard

### Rollback

```bash
# View deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase deploy --only hosting --release-notes="Rollback to stable"
```

### Environment Variables in Production

```bash
# Update environment variables
firebase functions:config:set \
  gemini.api_key="your_key"

# View all config
firebase functions:config:get
```

### Domain Configuration

1. Go to Firebase Console > Hosting > Domain
2. Add custom domain (e.g., ionarena.com)
3. Firebase provides DNS setup instructions

### SSL/TLS

Firebase Hosting automatically provides SSL/TLS certificates via Google-managed SSL.

### Scaling

Firebase Hosting automatically scales to handle traffic. For high-volume:

- Enable Cloud CDN (recommended above)
- Monitor data usage in Firestore
- Implement Firestore backup strategies
- Consider Cloud Run for dynamic APIs

### Cost Estimation

**Firebase Hosting**: Free tier includes 10GB/month storage, 360MB/day bandwidth

**Google Cloud**: Pay-as-you-go for:
- Cloud CDN: $0.12/GB (first 1TB/month)
- Firestore: Free tier includes read/write operations
- Cloud Run: Free tier included

---

## Quick Deployment Checklist

- [ ] Firebase project created
- [ ] `.env.production.local` configured
- [ ] `npm run build` succeeds
- [ ] `firebase deploy` completes
- [ ] App loads at Firebase hosting URL
- [ ] Live match works with mock data
- [ ] Momentum engine animates smoothly
- [ ] Predictions update in real-time
- [ ] Mobile responsiveness tested
- [ ] Performance metrics < 2s LCP
- [ ] Custom domain configured
- [ ] Monitoring/logging setup
- [ ] Team access configured

---

For issues: https://firebase.google.com/support
