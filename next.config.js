/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig