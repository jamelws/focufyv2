/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    localPatterns: [
      {
        pathname: '/api/song-image/**',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
