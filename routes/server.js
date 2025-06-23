const express = require('express');
const router = express.Router();


const stripeController = require('../controllers/stripeController');
// const userController = require('../controllers/userController');
// const reportController = require('../controllers/reportController');

router.post('/create-checkout-session', stripeController.createPaymentSession);
// router.post('/loginUser', userController.loginUser);
// router.get('/getReportData', reportController.getReportData);

module.exports = router;
