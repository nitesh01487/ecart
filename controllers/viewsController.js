const Product = require('../models/productModel')
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const { model } = require('mongoose');
const Order = require('../models/orderModel');
const ObjectId = require('mongodb').ObjectId;

exports.getOverview = (Model, queryObj) => catchAsync(async (req, res, next) => {
    // 0) Query
    const cat = req.query.sub_category ? `${req.query.sub_category}`: 'All Products';
    const currPage = req.query.page ? req.query.page: 1;
    let filter = {};
    if(req.params.productId) filter = {product: req.params.productId};
    // console.log(filter)
    const features = new APIFeatures(Model.find(filter), req.query)
                        .filter()
                        .limitFields()
                        .sort()
                        .paginate();
      // 1) Get product data from the collection
      const products = await features.query;

    // for page length
    const feature = new APIFeatures(Model.find(filter), req.query)
                    .limitFields()
                    .count();
    const len = await feature.query;
    const totalPage = Math.floor(len / 25);

    // 3) Render the template using tour data from 1)

    res.status(200).render('overview', {
      title: 'All Products',
      products,
      currPage,
      totalPage,
      cat
    });
});

exports.getProduct = catchAsync(async(req, res, next) => {
    const product = await Product.findOne({_id: req.params.id});

    if(!product)
      return next(new AppError('There is no product with that id', 404));
    
    res.status(200).render('product', {
      title: `${product.title} Product`,
      product
    })
});

exports.getCart = catchAsync(async (req, res, next) => {
  // console.log(req.user)
  const cartItems = await User
                      .findOne({_id: req.user._id})
                      .populate({
                        path: 'product.pro_id',
                      });
                      // console.log(cartItems)
  const items = cartItems.product;
        
  res.status(200).render('cart',{
    title: `Cart`,
    items
  })
});

exports.getOrder = catchAsync(async (req, res, next) => {
  // console.log(req.user)
  const orderedItems = await Order
                      .find({user: req.user._id});
                      // console.log(orderedItems);
        
  res.status(200).render('orders',{
    title: `Order`,
    orderedItems
  })
});


exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: ` Log into your account`
  });
}

exports.getSigninForm = (req, res) => {
  res.status(200).render('signup', {
    title: `Sign in form`
  });
}

exports.getAboutUs = (req, res) => {
  res.status(200).render('AboutUs', {
    title: `About Us`
  })
}

exports.getContact = (req, res) => {
  res.status(200).render('ContactUs', {
    title: `Contact Us`
  })
}

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: `Your account`
  });
}

exports.updateUserData = catchAsync(async (req, res) => {
  // console.log('UPDATING USER', req.body);
  // req.body is not shwoing the data, so, we have to add another middleware in the app.js called urlencoded
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id, 
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: `Your account`,
    user: updatedUser
  });
});