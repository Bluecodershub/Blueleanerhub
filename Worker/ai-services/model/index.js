'use strict';
// Ported from ai_model/ (airllm_model.py + model_loader.py)
// Local LLM loading is optional. Predictions use the inbuilt provider chain.
const path   = require('path');
const fs     = require('fs');
const aiProvider = require('../services/aiProvider.service');
const logger = require('../utils/logger');

let _modelMeta = null;

/**
 * Attempt to load model metadata from the local models directory.
 * Actual inference is handled via the inbuilt provider chain.
 */
function loadModel(modelPath) {
  const resolvedPath = modelPath || process.env.AIRLLM_MODEL_PATH;
  if (resolvedPath && fs.existsSync(resolvedPath)) {
    logger.info('model.load: found local model', { path: resolvedPath });
    _modelMeta = { path: resolvedPath, loaded: true, type: 'local' };
    return _modelMeta;
  }
  logger.info('model.load: no local model metadata found, using configured inbuilt provider');
  _modelMeta = { path: null, loaded: false, type: 'provider' };
  return _modelMeta;
}

/**
 * Generate a prediction / completion for the given prompt.
 * @param {string} prompt
 * @param {object} [opts]
 * @returns {Promise<{prediction: string, model: string, source: string}>}
 */
async function predict(prompt, opts = {}) {
  if (!_modelMeta) loadModel();

  logger.info('model.predict', { source: _modelMeta.type, prompt: prompt.slice(0, 60) });

  // If we have a local Ollama instance configured, try it first
  const ollamaUrl = process.env.OLLAMA_URL;
  if (ollamaUrl && _modelMeta.type === 'local') {
    try {
      const axios = require('axios');
      const model = process.env.LOCAL_LLM_MODEL || 'llama3';
      const res = await axios.post(`${ollamaUrl}/api/generate`, {
        model,
        prompt,
        stream: false,
      }, { timeout: 30_000 });
      return { prediction: res.data.response, model, source: 'ollama' };
    } catch (err) {
      logger.warn('Ollama unavailable, falling back to inbuilt provider chain', { error: err.message });
    }
  }

  const prediction = await aiProvider.generate(prompt, opts);
  const provider = await aiProvider.getProvider();
  return { prediction, model: process.env.LOCAL_LLM_MODEL || provider.type, source: provider.type };
}

function getModelInfo() {
  if (!_modelMeta) loadModel();
  return {
    type:        _modelMeta.type,
    loaded:      _modelMeta.loaded,
    path:        _modelMeta.path,
    ollamaModel: process.env.LOCAL_LLM_MODEL || null,
  };
}

// Initialise on module load
loadModel();

module.exports = { loadModel, predict, getModelInfo };
