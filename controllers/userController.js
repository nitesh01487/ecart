const multer = require('multer');
const sharp = require('sharp'); // easy to use node js image processing library

const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const { search } = require('../routes/userRoutes');
const ObjectId = require('mongodb').ObjectId;

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         // user-3453g4rhre43fd-324533545.jpeg
//         const ext = file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
}

// const upload = multer({ dest: 'public/img/users'});
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/users/${req.file.filename}`);
    // console.log('photo resized');

    next();
});

const filterObj = (obj, ...allowedFields) => {
    // obj is array of req.body
    // and the rest are the parameters that needed to be checked
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError(
            'This route is not for password updates. Please use /updateMyPassword'
            , 404)
        );
    }

    // 2) Update user document
    // const user = await User.findById(req.user.id);
    // user.name = 'Nkcoder';
    // but this will throw error as some of the fields are not not provided and validators will throw error
    // await user.save();

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email', 'product');
    if(req.file) filteredBody.photo = req.file.filename;
    // 
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
})

exports.addCartProduct = catchAsync(async (req, res, next) => {
    // 1) update the product cart details
    const cartItems = req.body.product;
    
    const user = await User.findById(req.user.id);
    let isPresent = false;
    user.product.map((el) => {
        if(JSON.stringify(el.pro_id) === JSON.stringify(cartItems.pro_id) && el.size === cartItems.size) {
            isPresent = true;
        }
    });
    
    if(isPresent){
        return next(new AppError(
            'The item of this id and this size is already in the cart. Please go and check cart',
            400
        ))
    }



    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        $push: {
            product: cartItems
        }
    }, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
})
exports.updateCartProduct = catchAsync(async (req, res, next) => {
    // 1) update the product cart details
    const cartItems = req.body.product;
    const searchId = new ObjectId(req.body.searchId);
    const userid = new ObjectId(req.user.id);
    // console.log(cartItems, searchId);

    if(cartItems.quantity > 5) {
        return next(new AppError(
            'You can only add maximum of 5 item of a single product',
            400
        ));
    }
    
    // db.test_invoice.update({user_id : 123456 , "items.item_name":"my_item_one"} , {$inc: {"items.$.price": 10}})
    const updatedUser = await User.findOneAndUpdate({"_id": userid, "product._id": searchId},{
        $set: {"product.$.quantity": cartItems.quantity}
    }, {
        new: true,
        runValidators: true
    });
    // _id is not a string it needed to convert into object

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
})

// To delete product from the cart
exports.deleteCartProduct = catchAsync(async (req, res, next) => {
    // 1) update the product cart details
    const cartItems = req.body.product;
    const searchId = new ObjectId(req.body.searchId);
    const userid = new ObjectId(req.user.id);
    // console.log(cartItems, searchId);
    
    // { $pull: { items: { id: 23 } } },
    const updatedUser = await User.findOneAndUpdate({"_id": userid}, {$pull: {product: {_id: searchId}}});
    // _id is not a string it needed to convert into object

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
})

// exports.deleteAllCartProduct = catchAsync(async (req, res, next) => {
//     // 1) update the product cart details
//     const cartItems = req.body.product;
//     const searchId = new ObjectId(req.body.searchId);
//     const userid = new ObjectId(req.user.id);
//     // console.log(cartItems, searchId);
    
//     // { $pull: { items: { id: 23 } } },
//     const updatedUser = await User.findOneAndUpdate({"_id": userid}, {$pull: {product}});
//     // _id is not a string it needed to convert into object

//     res.status(200).json({
//         status: 'success',
//         data: {
//             user: updatedUser
//         }
//     });
// })

// exports.updateQuantity = catchAsync(async(req, res, next) =>{
//     const user = User.findByIdAndUpdate(req.body.id)
//     res.status(200).json({
//         status: 'success',
//         data: {
//             user: updatedUser
//         }
//     })
// })


exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active:false});
    res.status(204).json({
        status: 'success',
        data: null
    });
})


exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined! Please use signUp instead'
    });
};


exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// Do NOT update passwords with this! 
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);



////////////////////////////////////////////////////////////////////////////
///////////          GET ALL USERS                     /////////////////////
////////////////////////////////////////////////////////////////////////////
// exports.getAllUsers = catchAsync( async(req, res) => {
//     const users = await User.find();

//         // SEND RESPONSE
//         res.status(200).json({
//             status: 'success',
//             results: users.length,
//             data: {
//                 users
//             }
//         })
// });

////////////////////////////////////////////////////////////////////////////
///////////          GET ONE USER                      /////////////////////
////////////////////////////////////////////////////////////////////////////

// exports.getUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };

////////////////////////////////////////////////////////////////////////////
///////////          UPDATE USER                       /////////////////////
////////////////////////////////////////////////////////////////////////////

// exports.updateUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };

////////////////////////////////////////////////////////////////////////////
///////////          DELETE USER                       /////////////////////
////////////////////////////////////////////////////////////////////////////

// exports.deleteUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };
