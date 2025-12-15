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

1. **Retrieve Vercel Credentials**:
   - Get your [Vercel Access Token](https://vercel.com/account/tokens)
   - Install Vercel CLI: `npm install --global vercel@latest`
   - Run `vercel login` in your terminal
   - Navigate to your project directory and run `vercel link` to create/connect a Vercel project
   - In the generated `.vercel` folder, find `project.json` and note the `projectId` and `orgId`

2. **Add GitHub Secrets**:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `VERCEL_TOKEN`: Your Vercel access token
     - `VERCEL_ORG_ID`: The `orgId` from `.vercel/project.json`
     - `VERCEL_PROJECT_ID`: The `projectId` from `.vercel/project.json`

3. **How It Works**:
   - When you push image files to `main`, the "Optimize Images" workflow runs first
   - After optimization completes successfully, the "Vercel Deployment" workflow automatically triggers
   - The deployment workflow builds your app and deploys to Vercel production
   - This ensures your deployment always includes optimized WebP images

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

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
