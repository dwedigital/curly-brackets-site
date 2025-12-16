import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export when building for production
  // In development (next dev), API routes will work normally
  // Check if we're building (not in dev mode)
  ...(process.env.NODE_ENV === 'production' && process.env.SKIP_STATIC_EXPORT !== 'true' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
