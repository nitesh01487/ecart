const factory = require('./handlerFactory');
const Product = require('./../models/productModel');

// CRUD operations
exports.getAllProducts = factory.getAll(Product); // for all products
exports.getProduct = factory.getOne(Product, {path: ''});
exports.createProduct = factory.createOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);