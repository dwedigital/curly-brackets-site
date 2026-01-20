# CLAUDE.md - Curly Brackets Project Guide

## Project Overview

Curly Brackets is a modern tech blog built with **Next.js 16**, **React 19**, and **TypeScript 5**. It uses static site generation (SSG) with Netlify deployment and serverless functions for API endpoints.

**Live Site:** https://curlybrackets.tech

**Content Management:** 100% automated via external **n8n workflow** - posts and images are created and committed programmatically.

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.0.8 |
| UI Library | React | 19.2.1 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Hosting | Netlify | Static + Functions |
| Content | Markdown | gray-matter + unified |
| Automation | n8n | External workflow |
| CI/CD | GitHub Actions | Image optimization + deploy |

## Project Structure

```
curly_brackets/
├── src/
│   ├── app/
│   │   ├── api/                    # Dev-only API routes (removed at build)
│   │   │   ├── articles/route.ts   # GET /api/articles
│   │   │   └── tags/route.ts       # GET /api/tags
│   │   ├── blog/
│   │   │   ├── page.tsx            # Blog archive page
│   │   │   └── [slug]/page.tsx     # Individual blog posts
│   │   ├── components/             # React components
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Homepage
│   │   ├── sitemap.ts              # Sitemap generation
│   │   └── globals.css             # Global styles + Tailwind
│   └── lib/
│       ├── markdown.ts             # Markdown parsing utilities
│       ├── tags.ts                 # Canonical tags system
│       └── structured-data.ts      # JSON-LD schema generation
├── netlify/
│   └── functions/
│       ├── articles.ts             # Production API for articles
│       └── tags.ts                 # Production API for tags
├── scripts/
│   ├── optimize-images.js          # WebP conversion (Sharp)
│   ├── pre-build.js                # Removes /api for static export
│   └── post-build.js               # Restores /api after build
├── posts/                          # Markdown blog posts
├── public/images/                  # Static images (WebP preferred)
└── out/                            # Static export output
```

## Quick Start

```bash
# Install dependencies
npm install

# Development (Next.js only - API routes work)
npm run dev

# Development with Netlify Functions (recommended)
npm run dev:netlify

# Production build (creates static export in /out)
npm run build

# Lint code
npm run lint

# Optimize images to WebP
npm run optimize-images
```

## Automated Content Pipeline (n8n + GitHub Actions)

### Overview

Content creation is fully automated through an external **n8n workflow**. No manual content creation is required - the n8n workflow handles:
- Generating blog post content (markdown)
- Creating hero images
- Committing files to the repository
- Triggering deployments

### n8n Workflow Pattern

The n8n workflow creates content in a **two-commit sequence**:

```
1. First Commit: "Image creation for [Post Title]"
   - Adds hero image to public/images/posts/
   - No [deploy] tag = no deployment triggered

2. Second Commit: "commit for [Post Title] [deploy]"
   - Adds markdown file to posts/
   - Contains [deploy] tag = triggers full deployment
```

**Example from git history:**
```
fcf3545 Image creation for Build an Offline CLI Assistant...
7b8c4fd commit for Build an Offline CLI Assistant... [deploy]
83b34e5 🖼️ Auto-optimize images to WebP  (automated by GitHub Actions)
```

### Commit Message Flags

| Flag | Effect | Used By |
|------|--------|---------|
| `[deploy]` | Triggers image optimization + Netlify deployment | n8n workflow |
| `[publish]` | Same as `[deploy]` (alternative) | Manual commits |
| No flag | No deployment (safe for WIP commits) | Image commits, manual edits |

### GitHub Actions Workflow

**File:** `.github/workflows/build-and-deploy.yml`

The workflow has two jobs that run in sequence:

#### Job 1: Optimize Images

**Triggers when:**
- Push to `main` branch AND
- Commit message contains `[deploy]` or `[publish]` AND
- NOT an auto-commit from previous image optimization

**Actions:**
1. Checks out repository
2. Finds all PNG/JPG/JPEG/GIF images in `public/`
3. Converts to WebP format (1920px max, 85% quality)
4. Deletes original images
5. Auto-commits with message: `🖼️ Auto-optimize images to WebP`

**Skip condition:** If commit message contains `🖼️ Auto-optimize images to WebP`, the job skips to prevent infinite loops.

#### Job 2: Deploy to Netlify

**Triggers when:**
- `optimize-images` job completes (success or skip) AND
- Commit message contains `[deploy]` or `[publish]` OR
- Manual `workflow_dispatch` trigger

**Actions:**
1. Waits 5 seconds for image optimization commit
2. Pulls latest changes (including WebP files)
3. Runs `npm ci` to install dependencies
4. Runs `npm run build` (pre-build → build → post-build)
5. Deploys `out/` directory to Netlify

### Manual Deployment

To manually trigger deployment without n8n:

```bash
# Option 1: Commit with deploy flag
git add .
git commit -m "Manual update [deploy]"
git push origin main

# Option 2: GitHub Actions manual trigger
# Go to Actions → Build and Deploy → Run workflow
```

### Path-Based Triggers

The workflow only runs on changes to these paths:
- `public/**/*.png`, `*.jpg`, `*.jpeg`, `*.gif` (images)
- `posts/**/*.md` (blog content)
- `src/**` (source code)
- `package.json`, `package-lock.json`
- `next.config.ts`
- `.github/workflows/**`

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `GITHUB_TOKEN` | Auto-provided, used for auto-commits |
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token |
| `NETLIFY_SITE_ID` | Netlify site identifier |

### Workflow Diagram

```
n8n Workflow
    │
    ├── Commit 1: Image (no [deploy])
    │   └── GitHub Actions: No trigger (path matches but no flag)
    │
    └── Commit 2: Post + [deploy]
        └── GitHub Actions triggers
            │
            ├── Job 1: optimize-images
            │   ├── Convert images to WebP
            │   ├── Delete originals
            │   └── Auto-commit WebP files
            │
            └── Job 2: deploy (depends on Job 1)
                ├── Pull latest (includes WebP)
                ├── npm run build
                └── Deploy to Netlify
```

## Development Workflow

### Local Development

**Option 1: Next.js Dev Server**
```bash
npm run dev
```
- API routes available at `http://localhost:3000/api/*`
- Hot reload enabled
- Faster startup

**Option 2: Netlify Dev (Recommended)**
```bash
npm run dev:netlify
```
- Tests actual Netlify Functions
- API routes at `http://localhost:8888/api/*`
- Mirrors production environment
- Requires Netlify CLI: `npm install -g netlify-cli`

### Build Process

The build has three phases:

1. **Pre-build** (`scripts/pre-build.js`): Removes `/src/app/api` directory because API routes are incompatible with static export
2. **Build** (`next build`): Creates static HTML in `/out` directory
3. **Post-build** (`scripts/post-build.js`): Restores API routes via git checkout

### Deployment

Deployment is controlled via commit message flags:

```bash
# Deploy to production
git commit -m "Your message [deploy]"
git push origin main

# Alternative flag
git commit -m "Your message [publish]"
```

GitHub Actions will:
1. Optimize any new images to WebP
2. Auto-commit optimized images
3. Build and deploy to Netlify

## API Endpoints

### Articles API

**Endpoint:** `/api/articles`

**Response:**
```json
{
  "count": 5,
  "articles": [
    {
      "id": "my-post-slug",
      "slug": "my-post-slug",
      "title": "Post Title",
      "date": "2025-01-20",
      "tags": ["AI", "Next.js"],
      "content": "Raw markdown content...",
      "image": "/images/posts/my-post-slug.webp"
    }
  ]
}
```

### Tags API

**Endpoint:** `/api/tags`

**Response:**
```json
{
  "count": 50,
  "tags": ["JavaScript", "Python", "AI", ...],
  "tagDefinitions": [
    {
      "name": "JavaScript",
      "category": "language",
      "description": "JavaScript programming language"
    }
  ]
}
```

### Testing APIs Locally

```bash
# With Netlify Dev running
curl http://localhost:8888/api/articles
curl http://localhost:8888/api/tags

# With Next.js Dev running
curl http://localhost:3000/api/articles
curl http://localhost:3000/api/tags
```

## Netlify Functions

### Architecture

In production, API routes are served by Netlify Functions (not Next.js):

```
/api/articles → /.netlify/functions/articles
/api/tags     → /.netlify/functions/tags
```

Redirects are configured in `netlify.toml`.

### Function Structure

```typescript
// netlify/functions/articles.ts
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // ... function logic

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(data),
  };
};
```

### Path Resolution Quirk

The articles function tries multiple paths to find the posts directory because Netlify's runtime environment varies:

```typescript
const possiblePaths = [
  path.join(process.cwd(), 'posts'),
  path.join(__dirname, '../../posts'),
  path.join(__dirname, '../../../posts'),
  '/var/task/posts',
  './posts',
];
```

This defensive approach ensures the function works across different Netlify deployment scenarios.

## Content Management

### Creating a Blog Post

1. Create a markdown file in `/posts/`:
   ```bash
   touch posts/my-new-post.md
   ```

2. Add frontmatter:
   ```yaml
   ---
   title: "My New Post Title"
   date: "2025-01-20"
   tags:
     - JavaScript
     - Tutorial
   ---

   Your markdown content here...
   ```

3. Add a hero image (optional):
   ```bash
   # Place image at:
   public/images/posts/my-new-post.webp
   ```

4. Commit with deploy flag:
   ```bash
   git add .
   git commit -m "Add my new post [deploy]"
   git push
   ```

### Valid Tags

Query the canonical tags system before using tags:

```bash
curl http://localhost:8888/api/tags | jq '.tags'
```

**Tag Categories:**
- **Languages:** Python, JavaScript, TypeScript, Go, Bash, Ruby, SQL
- **Frameworks:** React, Node.js, Next.js
- **Domains:** Web Development, DevOps, Data Engineering, ML, AI, CLI, Backend
- **Databases:** Databases, Vector Databases
- **Concepts:** API, Automation, Performance, Serverless, Edge Computing, Architecture, Testing, Security
- **Tools:** GitHub Actions, Docker
- **Meta:** Beginner Guide, Best Practices, Tutorial

### Image Optimization

Images are automatically optimized to WebP format:

```bash
# Manual optimization
npm run optimize-images

# Or let CI/CD handle it on deploy
```

**Settings:**
- Max width: 1920px
- Quality: 85%
- Format: WebP
- Original files are deleted after conversion

## Coding Standards

### TypeScript

- **Strict mode enabled** - All strict checks active
- **Path aliases** - Use `@/` for imports from `src/`:
  ```typescript
  import { getSortedPostsData } from '@/lib/markdown';
  ```

### Components

- **Server Components** by default (no 'use client' directive)
- **Client Components** only when needed (state, effects, browser APIs)
- Components live in `src/app/components/`

```typescript
// Server Component (default)
export default function MyComponent() {
  return <div>Server rendered</div>;
}

// Client Component
'use client';
import { useState } from 'react';

export default function InteractiveComponent() {
  const [state, setState] = useState(false);
  return <button onClick={() => setState(!state)}>Toggle</button>;
}
```

### Styling

- **Tailwind CSS v4** with `@tailwindcss/typography` plugin
- **Prose class** for markdown content: `<div className="prose">`
- **Grayscale images** with hover effects for consistent design
- **Mobile-first** responsive design

### File Naming

- Components: `PascalCase.tsx` (e.g., `PostGrid.tsx`)
- Utilities: `kebab-case.ts` (e.g., `structured-data.ts`)
- Posts: `kebab-case.md` (e.g., `my-blog-post.md`)
- Images: Match post slug (e.g., `my-blog-post.webp`)

### Git Commits

**Automated commits (n8n workflow):**
```bash
# Step 1: Image commit (no deployment)
"Image creation for [Post Title]"

# Step 2: Content commit (triggers deployment)
"commit for [Post Title] [deploy]"
```

**Automated commits (GitHub Actions):**
```bash
# After image optimization
"🖼️ Auto-optimize images to WebP"
```

**Manual commits:**
```bash
# No deployment (safe for WIP)
git commit -m "Fix typo in header"

# With deployment
git commit -m "Update component styling [deploy]"
```

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration (conditional static export) |
| `tsconfig.json` | TypeScript settings (strict mode, path aliases) |
| `eslint.config.mjs` | ESLint rules (Next.js + TypeScript) |
| `postcss.config.mjs` | PostCSS with Tailwind CSS v4 |
| `netlify.toml` | Netlify build, functions, redirects, headers |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Auto | Set to 'production' during build |
| `NEXT_PUBLIC_SITE_URL` | Optional | Base URL (defaults to https://curlybrackets.tech) |
| `NETLIFY_AUTH_TOKEN` | CI/CD | Netlify deployment token (GitHub secret) |
| `NETLIFY_SITE_ID` | CI/CD | Netlify site identifier (GitHub secret) |

## Troubleshooting

### API Routes Return 404 in Production

This is expected. Production uses Netlify Functions, not Next.js API routes. The redirects in `netlify.toml` handle the mapping.

### Posts Not Appearing

1. Check frontmatter format (YAML with title, date, tags)
2. Ensure file is in `/posts/` directory
3. Rebuild: `npm run build`

### Netlify Function Errors

Check the function logs:
```bash
netlify functions:invoke articles --no-identity
```

Or view logs in Netlify dashboard under Functions.

### Image Not Displaying

1. Ensure image is WebP format
2. Check path: `public/images/posts/{slug}.webp`
3. Run `npm run optimize-images` if using PNG/JPG

### Build Fails on Static Export

If you see "API routes not supported" errors:
1. Ensure `scripts/pre-build.js` runs before build
2. Check that `npm run build` includes the prebuild script
3. Verify `NODE_ENV=production` is set

## Common Tasks

### Add a New Component

```bash
# Create component file
touch src/app/components/MyComponent.tsx
```

### Update Canonical Tags

Edit `src/lib/tags.ts` to add new tags to `CANONICAL_TAGS` array.

### Modify API Response

1. Update `netlify/functions/{endpoint}.ts` for production
2. Update `src/app/api/{endpoint}/route.ts` for development
3. Keep both in sync

### Change Site Metadata

Edit `src/app/layout.tsx` for global metadata or individual page files for page-specific metadata.

## Architecture Decisions

### Why Static Export + Serverless Functions?

- **Performance:** Static HTML loads instantly from CDN
- **Cost:** No server runtime costs for page serving
- **SEO:** Full HTML available for crawlers
- **Flexibility:** Serverless functions for dynamic needs (article search, tag lookup)

### Why Separate Dev/Prod API Routes?

Next.js API routes don't work with static export. The dual setup allows:
- Full-featured development with Next.js
- Production compatibility with Netlify Functions
- Same endpoint URLs in both environments

### Why Deployment Flags?

The `[deploy]` / `[publish]` flag system serves multiple purposes:
- **n8n integration:** Allows the two-commit pattern (image first, then content with deploy)
- **Prevents waste:** Image commits don't trigger full rebuilds
- **Manual control:** Developers can commit WIP changes without deployments
- **Atomic deploys:** Content + images are optimized before deployment starts

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [gray-matter](https://github.com/jonschlinkert/gray-matter)
- [n8n Documentation](https://docs.n8n.io/)
- [GitHub Actions](https://docs.github.com/en/actions)
