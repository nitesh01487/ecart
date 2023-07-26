const viewsController = require('./../controllers/viewsController');
const express = require('express');
const authController = require('./../controllers/authController');
const orderController = require('../controllers/orderController');
const Product = require('../models/productModel');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/AboutUs', viewsController.getAboutUs);
router.get('/ContactUs', viewsController.getContact);
router.get('/cart', authController.protect,  viewsController.getCart);
router.get('/order', authController.protect,  viewsController.getOrder);
router.get('/login', authController.isLoggedIn,  viewsController.getLoginForm);
router.get('/signup',  viewsController.getSigninForm);
router.get('/me', authController.protect, viewsController.getAccount);
  
router.get(
    '/',  
    // orderController.createOrderCheckout,
    authController.isLoggedIn,  
    viewsController.getOverview(Product)
);

router.get(
    '/:id', 
    authController.isLoggedIn,  
    authController.protect,
    viewsController.getProduct
);

router.post(
    '/submit-user-data', 
    authController.protect, 
    viewsController.updateUserData
);

module.exports = router;