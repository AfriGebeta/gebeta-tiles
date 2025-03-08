const path = require('path');

module.exports = {
  entry: './src/index', // Entry point of your component
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'gebetaMap.bundle.js',
    library: 'GebetaMap',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'typeof self !== "undefined" ? self : this',
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'maplibre-gl': 'maplibregl'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
      // Add support for CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // Add support for images and other assets
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  mode: 'production', // Add production mode for optimization
};
