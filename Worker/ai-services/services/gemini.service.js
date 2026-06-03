'use strict';
/**
 * Backward-compatible shim.
 *
 * Cloud Gemini calls are disabled for this deployment. Older modules that still
 * import gemini.service are routed to the inbuilt local provider chain instead.
 */

const aiProvider = require('./aiProvider.service');

module.exports = {
  generate: (prompt, opts = {}) => aiProvider.generate(prompt, { ...opts, provider: 'auto' }),
  generateJSON: (prompt, opts = {}) => aiProvider.generateJSON(prompt, { ...opts, provider: 'auto' }),
};
