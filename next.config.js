/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'microphone=*, camera=*, display-capture=*'
          },
          {
            key: 'Feature-Policy',
            value: 'microphone *; camera *; display-capture *'
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig
