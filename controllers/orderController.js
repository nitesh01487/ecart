const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const AppError = require('../utils/appError');
const Order = require('../models/orderModel');
const User = require('./../models/userModel')
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const ObjectId = require('mongodb').ObjectId;


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the cart Items
    const cartItems = await User
                      .find({_id: req.user._id})
                      .populate({
                        path: 'product.pro_id',
                      });

    const product = cartItems[0].product;
    let item = {};
    let arrayItem = [];
    let metadata = {};
    let prop;
    let i = 1;
    product.map((pro) => {
        item.quantity = pro.quantity;
        item.price_data = {
            currency: 'inr',
            unit_amount: pro.pro_id.selling_price * 100,
            product_data: {
                name: pro.pro_id.title,
                images: [pro.pro_id.images[0]]
            }
        }
        prop = `order_id${i}`;
        metadata[`id${i}`] = pro.pro_id.id;
        i++;
        arrayItem.push(item);
        item = {};
    })



    // 2) Create checkout session
    const id = req.user._id;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?alert=order`,
        cancel_url: `${req.protocol}://${req.get('host')}?canceled=true`,
        customer_email: req.user.email,
        mode: "payment",
        line_items: [...arrayItem],
        metadata: metadata
    })

//     stripe.checkout.sessions.listLineItems(
//   'cs_test_a1RppVg40WcJtv5Br57khqHnNIV4UTkzgRzytXP2XJzYPxL4OzoI3XNZul',
//   { limit: 5 },
//   function(err, lineItems) {
//     // asynchronously called
//   }
// );

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    })
});

// exports.createOrderCheckout = catchAsync(async (req, res, next) => {
//     // This only temporary, because it is UNSECURE: because everyone can make bookings without paying
//     const {orderId} = req.query; 

//     if(!orderId) return next(); // for normal user
//     const user = await User
//                         .findById({_id: orderId})
//                         .populate({
//                         path: 'product.pro_id',
//                         });
//     // console.log(user)
//     await Promise.all(user.product.map((el) => {
//         return Order.create({
//             product: el.pro_id,
//             user: orderId,
//             title: el.pro_id.title,
//             orderPrice: el.pro_id.selling_price,
//             image: el.pro_id.images[0],
//             quantity: el.quantity,
//             size: el.size
//         });
//     }))

//     // Delete all the elements from the user product
//     const body = await User.findById({_id: orderId});
//     delete body.product;
//     const updatedUser = await User.findOneAndUpdate({"_id": orderId}, {$unset: {"product": ""}});
    
//     res.redirect(req.originalUrl.split('?')[0])
// });

const createOrderCheckout = async session => {
     // This only temporary, because it is UNSECURE: because everyone can make bookings without paying
    const orderId = session.id; 

    if(!orderId) return next(); // for normal user
    const user = await User
                        .findOne({email: session.customer_details.email})
                        .populate({
                        path: 'product.pro_id',
                        });
    // console.log(user)
    let i = 0;
    await Promise.all(user.product.map((el) => {
        i++;
        return Order.create({
            product: session.metadata[`id${i}`],
            user: new ObjectId(user._id),
            title: el.pro_id.title,
            orderPrice: session.line_items.data[i - 1].amount_subtotal / 100,
            image: el.pro_id.images[0],
            quantity: el.quantity,
            size: el.size
        });
    }));

    // Delete all the elements from the user product
    const body = await User.findById({_id: new ObjectId(user._id)});
    delete body.product;
    const updatedUser = await User.findOneAndUpdate({"_id": new ObjectId(user._id)}, {$unset: {"product": ""}});
    
    res.redirect(req.originalUrl.split('?')[0])
}

exports.webhookCheckout = async (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    // console.log(signature, req.body);
    let event;
    try{
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch(err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            // const checkoutSessionCompleted = event.data.object;
            const session = await stripe.checkout.sessions.retrieve(
                `${event.data.object.id}`, {
                expand: ['line_items']
              });

            // Then define and call a function to handle the event checkout.session.completed
            createOrderCheckout(session);
        break;
            // ... handle other event types
        default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({received: true});
}

exports.createOrder = factory.createOne(Order);
exports.getOrder = factory.getOne(Order);
exports.getAllOrder = factory.getAll(Order);
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);

