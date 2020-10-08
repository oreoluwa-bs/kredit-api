const express = require('express');
const ussdControl = require('../controllers/ussd');

const router = express.Router();

router.route('/')
    .post(ussdControl.runUSSD);

module.exports = router;
