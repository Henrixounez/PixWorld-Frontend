const { i18n } = require('./next-i18next.config');
const withPWA = require('next-pwa')({
  dest: "public",
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  i18n,
  pageExtensions: ["page.tsx"],
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/activity',
        permanent: true
      },
      {
        source: '/user',
        destination: '/user/home',
        permanent: true
      }
    ]
  }
});