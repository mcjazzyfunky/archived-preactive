'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/preactive.core.cjs.production.js')
} else {
  module.exports = require('./dist/preactive.core.cjs.development.js')
}
