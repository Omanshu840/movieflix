# MovieFlix - Deployment Guide

## GitHub Pages Deployment

Your application is configured to deploy to GitHub Pages at:
```
https://omanshu840.github.io/movieflix/
```

### Public Directory Files

The public directory includes optimized configuration files for your GitHub Pages deployment:

- **manifest.json** - PWA configuration with app shortcuts and icons
- **robots.txt** - SEO configuration for search engine crawlers
- **sitemap.xml** - Sitemap for search engine indexing
- **movieflix-icon.svg** - Application icon with gradient
- **404.html** - Custom 404 handler for SPA routing
- **favicon.png** - Favicon for browser tabs (add your own image)
- **apple-touch-icon.png** - Icon for iOS home screen (add your own image)

### Deployment Methods

#### Option 1: Automatic Deployment (Recommended)
The application has a GitHub Actions workflow configured that automatically builds and deploys to GitHub Pages whenever you push to the `main` branch.

**Setup:**
1. Ensure your repository is public (required for free GitHub Pages)
2. Go to your repository settings on GitHub
3. Under "Pages" section, verify that the source is set to "Deploy from a branch"
4. Select the `gh-pages` branch as the source
5. Just push to the `main` branch and the workflow will handle deployment

#### Option 2: Manual Deployment
If you prefer to deploy manually:

```bash
# Install dependencies (if not done yet)
npm install

# Deploy the app
npm run deploy
```

This will:
1. Build your application (`npm run build`)
2. Upload the `dist` folder to the `gh-pages` branch
3. GitHub Pages will serve it from https://omanshu840.github.io/movieflix/

### Important Notes

**Base Path Configuration:**
- ✅ Vite base path: `/movieflix/`
- ✅ React Router basename: `/movieflix`
- All routes and assets are correctly configured for this path

**Favicon & Icon Files:**
To complete the setup, add the following image files to the `public/` directory:
- `favicon.png` (192x192 or 512x512 PNG)
- `apple-touch-icon.png` (180x180 PNG for iOS)
- `movieflix-og-image.png` (1200x630 PNG for social media preview)

**Environment Variables:**
Before deploying, ensure you have these set up:
- `VITE_TMDB_API_KEY` - TMDB API key
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

These should be configured in your `.env` file locally.

**GitHub Pages Settings:**
1. Repository must be public or GitHub Pages must be enabled
2. Automatically uses the gh-pages branch created during first deployment
3. Custom domain support: Edit `.cname` file in repo if using custom domain

### Troubleshooting

If the app isn't loading:
1. Check that the deployment action completed successfully in the "Actions" tab
2. Verify GitHub Pages is enabled in repository Settings > Pages
3. Clear browser cache and try accessing the URL again
4. Check browser console for any routing or resource loading errors

### Local Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm npm run preview
```

---

**Last Updated:** January 13, 2026
