const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const stripeController = require('../controllers/stripeController');
const apidata = require('../controllers/apidata');

router.post('/create-checkout-session', stripeController.createPaymentSession);
router.post('/loginUser', userController.loginUser);
router.get('/dashboard', apidata.dashboard);

module.exports = router;
