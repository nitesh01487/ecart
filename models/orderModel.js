const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Booking must belong to a Product!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a User!']
    },
    title: {
        type: String,
    },
    orderPrice: {
        type: String
    },
    image: {
        type: String
    },
    orderDate: {
        type: Date,
        default: Date.now()
    },
    quantity: {
        type: Number
    },
    size: {
        type: String
    }
});

orderSchema.pre(/^find/, function(next) {
    this.populate('user').populate({
        path: 'product',
        select: 'name'
    })
    next();
})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;