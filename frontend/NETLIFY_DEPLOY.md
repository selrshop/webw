# WAConnect Frontend - Netlify Deployment Guide

## Quick Deploy

### Option 1: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the project
cd frontend
yarn build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

### Option 2: Deploy via Netlify Dashboard (Drag & Drop)

1. Run `yarn build` in the frontend directory
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Drag and drop the `build` folder to deploy

### Option 3: Connect Git Repository

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to Netlify Dashboard → "Add new site" → "Import an existing project"
3. Connect your repository
4. Set build settings:
   - **Base directory:** `frontend`
   - **Build command:** `yarn build`
   - **Publish directory:** `frontend/build`

## Environment Variables

Set these in Netlify Dashboard → Site settings → Environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Your backend API URL | `https://api.yoursite.com` |

**Important:** The `REACT_APP_` prefix is required for Create React App to include the variable in the build.

## Build Settings

The `netlify.toml` file in the frontend directory configures:
- Build command and publish directory
- SPA redirects for React Router
- Security headers
- Cache settings for static assets

## After Deployment

1. **Set Environment Variables:**
   - Go to Site settings → Environment variables
   - Add `REACT_APP_BACKEND_URL` with your backend URL
   - Trigger a new deploy for changes to take effect

2. **Custom Domain (Optional):**
   - Go to Domain settings → Add custom domain
   - Update DNS records as instructed

3. **HTTPS:**
   - Netlify provides free SSL certificates automatically

## Troubleshooting

### Page not found on refresh
The `_redirects` file handles this. If issues persist, check:
- `_redirects` exists in `public/` folder
- `netlify.toml` has the redirect rule

### API calls failing
- Ensure `REACT_APP_BACKEND_URL` is set correctly
- Check CORS settings on your backend allow your Netlify domain
- Backend should allow: `https://your-site.netlify.app`

### Build failing
```bash
# Clear cache and rebuild
rm -rf node_modules build
yarn install
yarn build
```

## File Structure

```
frontend/
├── netlify.toml          # Netlify configuration
├── public/
│   ├── _redirects        # SPA routing redirects
│   └── index.html        # HTML template
├── src/                  # React source code
└── build/                # Production build (generated)
```

## Backend CORS Configuration

Update your backend to allow requests from your Netlify domain:

```python
# In your FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-site.netlify.app",
        "https://your-custom-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
