module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }]
    ],
    plugins: [
      // React 19 compiler support
      ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
      'react-native-reanimated/plugin',
    ],
  };
};