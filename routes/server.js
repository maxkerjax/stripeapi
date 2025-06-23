const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const stripeController = require('../controllers/stripeController');

router.post('/create-checkout-session', stripeController.createPaymentSession);
router.post('/create-user', userController.createUser);

module.exports = router;
