// TODO - fix that uglify vs terser issue
const
  CleanupPlugin = require('webpack-cleanup-plugin'),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
  TerserPlugin = require('terser-webpack-plugin'),
  CompressionPlugin = require('compression-webpack-plugin'),
  ZipPlugin = require('zip-webpack-plugin'),
  path = require('path'),

  libraryTargetMap = {
    cjs: 'commonjs2',
    umd: 'umd',
    esm: 'commonjs-module'
  }

const configs = []

for (const pkg of ['core', 'utils', 'hooks']) {
  for (const moduleType of ['cjs', 'umd', 'esm']) {
    for (const environment of ['development', 'production']) {
      // TODO - this is aweful - fix it
      configs.push(createConfig(pkg, moduleType, environment, !configs, !configs))
    }
  }
}

module.exports = configs

function createConfig(pkg, moduleType, environment, cleanup = false, zip = false) {
  const isProd = environment === 'production'

  return {
    entry: pkg === 'core'
      ? './src/public/preactive.js'
      : `./src/public/preactive-${pkg}.js`,
    mode: environment,

    output: {
      library: pkg === 'core'
        ? 'preactive'
        : `preactive.${pkg}`,
      libraryTarget:  libraryTargetMap[moduleType],
      path: path.resolve(__dirname, 'dist'),
      filename: `preactive.${pkg}.${moduleType}.${environment}.js`
    },

    externals: ['preact', 'preact/hooks'],

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',

          options: {
            presets: [
              ['@babel/preset-env']
            ]
          }
        }
      ]
    },

    plugins: [
      ...(!cleanup ? [] : [new CleanupPlugin()]),
      ...(!isProd ? [] : [new CompressionPlugin()]),

      ...(!zip ? [] : [
        new ZipPlugin({
          filename: 'source.zip',
          exclude: ['node_modules', '.git', 'dist'],
        })
      ])
    ],

    optimization: {
      minimize: true,
      
      minimizer: [
        new TerserPlugin({
          extractComments: false,

          terserOptions: {
            output: {
              comments: false
            }
          }
        })
      ]
      
      //new UglifyJsPlugin()
    },


  }
}
