// Expo resolves `app.plugin.js` at the package root when an app lists this package in
// `expo.plugins`, so the entry has to live here rather than under plugin/.
module.exports = require('./plugin/withQliroOne');
