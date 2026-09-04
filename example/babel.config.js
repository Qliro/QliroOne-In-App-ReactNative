const path = require('node:path');
const { getConfig } = require('react-native-builder-bob/babel-config');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');

module.exports = getConfig(
  {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      // Inlines values from example/.env at build time so the staging merchant secret and the
      // synthetic test identity stay out of source. `.env` is gitignored; see `.env.example`.
      // `allowUndefined` keeps the bundle building without the file — src/qliro.ts reports the
      // missing keys at runtime instead of failing the build.
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          allowUndefined: true,
        },
      ],
    ],
  },
  { root, pkg }
);
