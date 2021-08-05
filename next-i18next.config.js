const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'ptbr'],
  },
  localePath: path.resolve('./public/locales'),
};