'use strict';
const { Router } = require('express');
const ctrl = require('../controllers/model.controller');

const router = Router();

router.post('/predict', ctrl.predict);
router.get('/info',     ctrl.info);

module.exports = router;
