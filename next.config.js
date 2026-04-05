/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages configuration
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig