# Deployment Guide

This guide covers deploying the Merchant Fraud Dashboard with the new Role-Based Access Control (RBAC) features to various hosting platforms.

## 🚀 Quick Deployment

### Prerequisites
- Node.js 16+ installed
- Project built successfully (`npm run build`)
- `dist/` folder contains the production build

### Build for Production

```bash
# Install dependencies
npm install

# Run tests to ensure everything works
npm test

# Build for production
npm run build

# Test production build locally (optional)
npm run preview
```

## 🌐 Hosting Platform Deployment

### 1. Netlify Deployment

#### Option A: Drag & Drop
1. Build the project: `npm run build`
2. Go to [Netlify](https://netlify.com)
3. Drag the `dist` folder to the deployment area

#### Option B: Git Integration
1. Create `netlify.toml` in project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Connect your Git repository to Netlify
3. Deploy automatically on push

### 2. Vercel Deployment

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Git Integration
1. Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

2. Connect repository to Vercel dashboard

### 3. GitHub Pages

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

2. Enable GitHub Pages in repository settings
3. Set source to "GitHub Actions"

### 4. Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
firebase init hosting
```

3. Configure `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

4. Deploy:
```bash
npm run build
firebase deploy
```

### 5. AWS S3 + CloudFront

1. Create S3 bucket for static website hosting
2. Build and upload:

```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
```

3. Create CloudFront distribution pointing to S3 bucket
4. Configure custom error pages to redirect to `/index.html`

### 6. Docker Deployment

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

Build and run:
```bash
docker build -t merchant-fraud-dashboard .
docker run -p 8080:80 merchant-fraud-dashboard
```

## 🔧 Environment Configuration

### Environment Variables

For production deployment, you may need to configure environment variables:

Create `.env.production`:
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_TITLE=Merchant Fraud Dashboard
VITE_ENABLE_MOCK_API=false
```

Update `vite.config.ts` for environment-specific builds:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    sourcemap: mode === 'development',
    minify: mode === 'production',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
}))
```

## 🔒 RBAC Deployment Considerations

### User Data Migration

When deploying with RBAC, ensure your backend supports the new user schema:

```typescript
// Old user schema
interface OldUser {
  id: string;
  email: string;
  merchantName: string;
  role: 'admin' | 'viewer';
}

// New user schema with RBAC
interface NewUser {
  id: string;
  email: string;
  merchantName: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  permissions: Permission[];
  preferences: UserPreferences;
}
```

### Migration Script Example

```sql
-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN permissions JSON DEFAULT '[]',
ADD COLUMN preferences JSON DEFAULT '{"theme": "light", "defaultTimeRange": "30d", "notifications": true}';

-- Update existing admin users
UPDATE users 
SET role = 'admin', 
    permissions = '["dashboard:view", "dashboard:export", "transactions:view", "transactions:export", "transactions:manage", "analytics:view", "analytics:advanced", "settings:view", "settings:manage", "users:view", "users:manage"]'
WHERE role = 'admin';

-- Update existing viewer users  
UPDATE users 
SET role = 'viewer',
    permissions = '["dashboard:view", "transactions:view"]'
WHERE role = 'viewer';
```

## 📊 Performance Optimization

### Build Optimization

Update `vite.config.ts` for production optimization:

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
```

### CDN Configuration

For better performance, configure your CDN to cache static assets:

```
# Cache static assets for 1 year
/assets/*.js    Cache-Control: public, max-age=31536000, immutable
/assets/*.css   Cache-Control: public, max-age=31536000, immutable
/assets/*.png   Cache-Control: public, max-age=31536000, immutable

# Cache HTML for 1 hour
/*.html         Cache-Control: public, max-age=3600
```

## 🔍 Health Checks

Add health check endpoints for monitoring:

Create `public/health.json`:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "features": {
    "rbac": true,
    "dashboard": true,
    "analytics": true
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Blank page after deployment**
   - Check browser console for errors
   - Ensure all assets are loading correctly
   - Verify routing configuration for SPA

2. **RBAC not working**
   - Verify user data includes new `permissions` field
   - Check that role configurations are properly loaded
   - Ensure AuthContext provides updated user schema

3. **Build failures**
   - Run `npm run lint` to check for code issues
   - Verify all imports are correct
   - Check TypeScript compilation with `npx tsc --noEmit`

### Debug Commands

```bash
# Check build output
npm run build && ls -la dist/

# Test production build locally
npm run preview

# Run all tests
npm test

# Check for TypeScript errors
npx tsc --noEmit

# Lint code
npm run lint
```

## 📈 Monitoring

After deployment, monitor:
- Application performance
- User authentication flows
- RBAC permission checks
- Error rates and logs
- User adoption of new features

Consider integrating with monitoring services like:
- Sentry for error tracking
- Google Analytics for usage metrics
- LogRocket for user session recording

## 🔄 Rollback Plan

If issues occur after deployment:

1. **Immediate rollback**: Deploy previous version
2. **Database rollback**: Revert user schema changes if needed
3. **Feature flags**: Disable RBAC features temporarily
4. **Gradual rollout**: Deploy to subset of users first

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Test locally with production build
4. Verify environment configuration
5. Check network and CDN settings