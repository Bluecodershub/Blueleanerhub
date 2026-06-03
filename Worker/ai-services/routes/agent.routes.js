'use strict';
const { Router } = require('express');
const ctrl = require('../controllers/agent.controller');

const router = Router();

router.post('/run', ctrl.run);
router.post('/ask', ctrl.ask);

module.exports = router;
