/** @type {import('next').NextConfig} */
const nextConfig = {
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
