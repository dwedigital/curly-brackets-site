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

A GitHub Action workflow automatically optimizes images when you push changes to the `main` branch:

- **Triggers**: Automatically runs when PNG, JPG, JPEG, or GIF files are pushed to `public/`
- **Process**: Converts images to WebP format (max width: 1920px, quality: 85%)
- **Auto-commit**: Commits the optimized WebP images back to the repository
- **Manual trigger**: Can also be manually triggered from the GitHub Actions tab
- **Skip condition**: Skips if triggered by its own auto-commit (prevents infinite loops)

The workflow file is located at `.github/workflows/optimize-images.yml`.

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

