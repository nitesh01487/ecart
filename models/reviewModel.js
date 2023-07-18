const mongoose = require('mongoose');
const Product = require('./productModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Review must belong to a product.']  
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// child know the id parent i.e; product and user
// parent child referencing
reviewSchema.pre(/^find/, function(next) {
    this
        // .populate({
        //     path: 'product',
        //     select: 'name'
        // })
        .populate({
            path: 'user',
            select: 'name photo'
        })

    next();
});

reviewSchema.index({product: 1, user: 1}, {unique: true});

reviewSchema.statics.calcAverageRatings = async function(productId) {
    const stats = await this.aggregate([
        {
            $match: {product: productId}
        },
        {
            $group: {
                _id: '$product', 
                nRating: {
                    $sum: 1
                },
                avgRating: {$avg: '$rating'}
            }
        }
    ]);

    if(stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: stats[0].nRating, 
            average_rating: stats[0].avgRating
        })
    } else {
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: 0, 
            average_rating: 4.5
        })
    }
}

// for calculating the rating and average of rating of reviews
reviewSchema.post('save', function(){
    // this points to current review
    // here we don't have the access of the variable Review so, with the help of the constructor we can access that Review
    this.constructor.calcAverageRatings(this.product);
});

// findByIdAndUpdate
// findByIdAndDelete
// pre and 
reviewSchema.pre(/^findOneAnd/, async function(next) {
    // /^findOneAnd/ this will also work for findOne and deleteOne because they are the shorthand for findOneAndUpdate and findOneAndDelete
    this.r = await this.findOne();
    // save the variable in r and send it to post
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    // this.findOne() dose NOT work here, query has already executed
   await this.r.constructor.calcAverageRatings(this.r.product); 
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;