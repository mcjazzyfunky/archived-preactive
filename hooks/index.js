'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('../dist/preactive.hooks.cjs.production.js')
} else {
  module.exports = require('../dist/preactive.hooks.cjs.development.js')
}