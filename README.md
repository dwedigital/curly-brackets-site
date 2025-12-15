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

A GitHub Action workflow automatically optimizes images when you push changes to the `main` branch. The workflow:

- **Triggers**: Automatically runs when PNG, JPG, JPEG, or GIF files are pushed to `public/`
- **Process**: Converts images to WebP format (max width: 1920px, quality: 85%)
- **Auto-commit**: Commits the optimized WebP images back to the repository
- **Manual trigger**: Can also be manually triggered from the GitHub Actions tab
- **Vercel Integration**: Vercel deployment waits for image optimization to complete before deploying

The workflow file is located at `.github/workflows/optimize-images.yml`.

#### Vercel Deployment Setup

This project uses GitHub Actions to deploy to Vercel, ensuring deployments only happen after image optimization completes. Follow these steps to set up:

1. **Disable Automatic Deployments in Vercel** (Required):
   
   **Option A: Using `vercel.json` (Recommended)**:
   - This project includes a `vercel.json` file that disables automatic deployments
   - The configuration sets `deploymentEnabled.production: false` and `deploymentEnabled.preview: false`
   - This prevents Vercel from deploying automatically and allows GitHub Actions to control deployments
   - No additional action needed if using this file
   
   **Option B: Using Vercel Dashboard**:
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Git**
   - Under **Production Branch**, disable **"Automatically deploy every push to the Production Branch"**
   - Save the settings

2. **Retrieve Vercel Credentials**:
   - Get your [Vercel Access Token](https://vercel.com/account/tokens)
   - Install Vercel CLI: `npm install --global vercel@latest`
   - Run `vercel login` in your terminal
   - Navigate to your project directory and run `vercel link` to create/connect a Vercel project
   - In the generated `.vercel` folder, find `project.json` and note the `projectId` and `orgId`

3. **Add GitHub Secrets**:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `VERCEL_TOKEN`: Your Vercel access token
     - `VERCEL_ORG_ID`: The `orgId` from `.vercel/project.json`
     - `VERCEL_PROJECT_ID`: The `projectId` from `.vercel/project.json`

**Note**: The Vercel deployment workflow uses `vercel deploy --prebuilt` which builds locally and uploads only the build artifacts to Vercel, following the [Vercel GitHub Actions guide](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel).

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

This project uses GitHub Actions to deploy to Vercel, ensuring that deployments only happen after image optimization completes. This approach gives you full control over your CI/CD pipeline.

### Important: Disable Automatic Deployments

**Before setting up**, you must disable Vercel's automatic production deployments. This project includes a `vercel.json` configuration file that handles this automatically:

```json
{
  "git": {
    "deploymentEnabled": {
      "production": false,
      "preview": false
    }
  }
}
```

This configuration prevents Vercel from deploying automatically and allows GitHub Actions to control when deployments happen.

**Alternative**: You can also disable automatic deployments via the Vercel dashboard:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Git**
3. Under **Production Branch**, disable **"Automatically deploy every push to the Production Branch"**
4. Save the settings

### How Deployment Works

The deployment process follows this sequence:

1. **Push to main branch**:
   - If you push image files (PNG, JPG, etc.), the "Optimize Images" workflow runs first
   - If you push non-image files, deployment happens immediately

2. **Image Optimization** (if images were pushed):
   - Images are converted to WebP format
   - Optimized images are committed back to the repository
   - The "Optimize Images" workflow completes

3. **Vercel Deployment**:
   - The "Vercel Deployment" workflow automatically triggers after optimization completes
   - The workflow builds your application using `vercel build`
   - Build artifacts are deployed to Vercel production using `vercel deploy --prebuilt`
   - This ensures your production site always includes optimized WebP images

### Deployment Workflow Files

- **Image Optimization**: `.github/workflows/optimize-images.yml`
- **Vercel Deployment**: `.github/workflows/deploy-vercel.yml`

### Benefits of This Approach

- ✅ **Optimized images**: Production always includes WebP images
- ✅ **Controlled deployments**: Deployments happen only after optimization completes
- ✅ **Build artifacts**: Only build outputs are uploaded to Vercel (not source code)
- ✅ **Consistent pipeline**: Same build process locally and in CI/CD

For more details, see the [Vercel GitHub Actions guide](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel).
