const { i18n } = require('./next-i18next.config');
const withPWA = require('next-pwa');

module.exports = withPWA({
  i18n,
  pageExtensions: ["page.tsx"],
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
  },
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