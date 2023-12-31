const express = require('express');
const orderController = require('../controllers/orderController')
const authController = require('../controllers/authController');
const userController = require('../controllers/userController')

const router = express.Router();

router.use(authController.protect);

router.get(
    '/checkout-session',
    orderController.getCheckoutSession
);
// router.get(
//     '/checkout-session/:id',
//     orderController.createOrderCheckout
// );

router.use(authController.restrictTo('admin', 'lead-guide'));

router
    .route('/')
    .get(orderController.getAllOrder)
    .post(orderController.createOrder);

router
    .route('/:id')
    .get(orderController.getOrder)
    .patch(orderController.updateOrder)
    .delete(orderController.deleteOrder);

module.exports = router;