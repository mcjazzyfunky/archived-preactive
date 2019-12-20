'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('../dist/preactive.utils.cjs.production.js')
} else {
  module.exports = require('../dist/preactive.utils.cjs.development.js')
}
