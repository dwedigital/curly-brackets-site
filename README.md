This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Image Optimization

This project includes automated image optimization that converts images to WebP format for better performance and smaller file sizes.

### GitHub Action (Automated)

A GitHub Action workflow handles both image optimization and Netlify deployment in sequence:

- **Triggers**: Automatically runs on push to `main` branch or can be manually triggered
- **Image Optimization**: 
  - Converts PNG, JPG, JPEG, or GIF files to WebP format (max width: 1920px, quality: 85%)
  - Auto-commits optimized images back to the repository
  - Skips if no image files are present or if triggered by its own auto-commit
- **Netlify Deployment**: 
  - Runs after image optimization completes
  - Builds the Next.js application
  - Deploys to Netlify production
  - Always runs (even if image optimization was skipped)

The workflow file is located at `.github/workflows/build-and-deploy.yml`.

### Manual Commands

You can also run image optimization manually using npm scripts:

#### Optimize Images (Convert to WebP)
```bash
npm run optimize-images
```

This command will:
- Scan the `public/` directory for images (PNG, JPG, JPEG, GIF)
- Convert them to WebP format
- Resize images wider than 1920px
- **Automatically delete the original files** after successful conversion

#### Cleanup Duplicate Images
```bash
npm run optimize-images -- --cleanup
# or
npm run optimize-images -- -c
```

This command will:
- Find all non-WebP images that have a corresponding WebP version
- Delete the duplicate original files
- Free up disk space

**Note**: The cleanup command is useful for one-time cleanup when you already have both WebP and original versions of images.

## Netlify Deployment

This project uses GitHub Actions to deploy to Netlify, ensuring deployments only happen after image optimization completes.

### Setup Instructions

1. **Create a Netlify Site**:
   - Go to [Netlify](https://app.netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - **Important**: Do NOT enable automatic deployments in Netlify (we'll handle deployments via GitHub Actions)

2. **Disable Automatic Deployments in Netlify**:
   - In your Netlify site dashboard, go to **Deploys** tab
   - Click the **"Stop auto publishing"** button (this locks deploys)
   - This prevents Netlify from automatically publishing new builds
   - Builds will still occur, but they won't be published until you manually release them or GitHub Actions deploys
   - This allows GitHub Actions to control when deployments happen
   
   **Alternative method** (if you want to stop builds entirely):
   - Go to **Site settings** → **Build & deploy** → **Continuous deployment**
   - Under **Build settings**, toggle **Build status** to **Stopped builds**
   - This prevents Netlify from building at all (GitHub Actions will handle everything)

3. **Get Netlify Credentials**:
   - Go to [Netlify User Settings](https://app.netlify.com/user/applications) → **Applications** → **New access token**
   - Create a new access token and copy it
   - In your Netlify site dashboard, go to **Site settings** → **General**
   - Copy your **Site ID** (found under "Site details")

4. **Add GitHub Secrets**:
   - Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
   - Add the following secrets:
     - `NETLIFY_AUTH_TOKEN`: Your Netlify access token
     - `NETLIFY_SITE_ID`: Your Netlify site ID

### How Deployment Works

The deployment process follows this sequence:

1. **Push to main branch**:
   - Triggers the "Build and Deploy" workflow

2. **Image Optimization** (first job):
   - If image files (PNG, JPG, etc.) were pushed, they are converted to WebP format
   - Optimized images are automatically committed back to the repository
   - If no images were pushed, this job is skipped

3. **Netlify Deployment** (second job):
   - Runs after image optimization completes (or is skipped)
   - Pulls the latest changes (including any optimized images)
   - Builds your Next.js application using `npm run build`
   - Deploys the `out` directory to Netlify production
   - This ensures your production site always includes optimized WebP images

### Configuration

The project includes a `netlify.toml` file that configures:
- Build command: `npm run build`
- Publish directory: `out` (Next.js static export)
- Redirects for client-side routing
- Security headers
- Cache headers for static assets

### Benefits of This Approach

- ✅ **Optimized images**: Production always includes WebP images
- ✅ **Controlled deployments**: Deployments happen only after optimization completes
- ✅ **Sequential workflow**: Image optimization always completes before deployment
- ✅ **No race conditions**: Single workflow ensures proper ordering

## Sitemap Generation

This project includes automatic sitemap generation that keeps your sitemap up-to-date with all your blog posts.

### How It Works

The sitemap is automatically generated using Next.js's built-in sitemap feature:

- **Location**: `src/app/sitemap.ts`
- **Auto-regeneration**: The sitemap is regenerated on every build
- **URL**: Available at `https://yourdomain.com/sitemap.xml`

### What's Included

The sitemap automatically includes:

1. **Home page** (`/`) - Priority: 1.0, Change frequency: daily
2. **Blog index** (`/blog`) - Priority: 0.9, Change frequency: daily
3. **All blog posts** (`/blog/[slug]`) - Priority: 0.8, Change frequency: weekly
   - Each post includes its publication date as `lastModified`
   - Posts are automatically discovered from the `posts/` directory

### Configuration

The sitemap uses the base URL from:
1. `NEXT_PUBLIC_SITE_URL` environment variable (if set)
2. Default: `https://curlybrackets.tech`

To customize the base URL, set the `NEXT_PUBLIC_SITE_URL` environment variable in your deployment platform.

### robots.txt Integration

The `robots.txt` file (located in `public/robots.txt`) references the sitemap:

```
Sitemap: https://curlybrackets.tech/sitemap.xml
```

**Important**: Update the domain in `robots.txt` if your site uses a different base URL.

### Keeping It Up-to-Date

The sitemap stays current automatically:

- ✅ **New blog posts**: Add a `.md` file to `posts/` and it's automatically included
- ✅ **Updated posts**: Modify post dates and the sitemap reflects the changes
- ✅ **Build-time generation**: Regenerates on every deployment

No manual steps required! The sitemap is always in sync with your content.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

