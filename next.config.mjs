/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: '.',
  },
  // Ensure Next.js looks into src directory if it exists
  distDir: '.next',
}

export default nextConfig
