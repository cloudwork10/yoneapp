const { withGradleProperties } = require('expo/config-plugins');

// Expo SDK 53 ships AGP 8.8.2, whose highest tested compileSdk is 35. We build
// against 36 (see expo-build-properties in app.json) to meet Google Play's
// target API requirement, so silence the resulting unsupported-compileSdk
// warning on every Gradle run.
const KEY = 'android.suppressUnsupportedCompileSdk';
const VALUE = '36';

module.exports = function withSuppressUnsupportedCompileSdk(config) {
  return withGradleProperties(config, (cfg) => {
    cfg.modResults = cfg.modResults.filter(
      (item) => !(item.type === 'property' && item.key === KEY)
    );
    cfg.modResults.push({ type: 'property', key: KEY, value: VALUE });
    return cfg;
  });
};
