module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false,         // If set to true, ensures all env variables are defined in `.env.example`
          allowUndefined: true, // Allows usage of undefined env variables
        },
      ],
    ],
  };
};
