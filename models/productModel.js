const mongoose = require('mongoose');
const slugify = require('slugify');
// {
//         "_id": "9fdfdd22-487b-599b-8be6-5dd00eb987c5", 
//         //"actual_price": "3,125", 
//         //"average_rating": "3.8", 
//         //"brand": "Oka", 
//         //"category": "Clothing and Accessories", 
//         //"crawled_at": "02/11/2021, 01:31:55", 
//         //"description": "", 
//         //"discount": "40% off", 
//         //"images":, 
//         //"out_of_stock": false, 
//         //"pid": "JCKFWZZM6V7RS5EA", 
//         //"product_details": [
//         ], 
//         //"seller": "OKANE", 
//         //"selling_price": "1,875", 
//         //"sub_category": "Winter Wear", 
//         //"title": "Full Sleeve Solid Men Casual Jacket", 
//         //"url": "https://www.flipkart.com/okane-full-sleeve-solid-men-jacket/p/itmba2bc35631052?pid=JCKFWZZM6V7RS5EA&lid=LSTJCKFWZZM6V7RS5EARRKEMR&marketplace=FLIPKART&srno=b_11_418&otracker=browse&fm=organic&iid=f8b72712-5185-4f5b-bcb6-ad7d5747ecc4.JCKFWZZM6V7RS5EA.SEARCH&ssid=pek3xh2yxc0000001612116667314"
//     }

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        // required: true,
    },
    slug: String,
    url: {
        type: String
    },
    actual_price: {
        type: Number,
        // required: true
    },
    discount: {
        type: String,
        default: "0% off"
    },
    discount_price: {
        type: Number,
        default: 0
    },
    selling_price: { // test
        type: Number,
        // validate: {
        //     validator: function(val) {
        //         return val < this.actual_price;
        //     }
        // }
    },
    brand: {
        type: String,
        default: "ecart assured"
    },
    category: {
        type: String,
        // required: true
    },
    sub_category: {
        type: String,
        // required: true
    },
    crawled_at: {
        type: Date,
    },
    description: {
        type: String,
        // required: true,
    },
    average_rating: { // Test
        type: Number,
        default: 4.0
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    images: [String],
    seller: {
        type: String,
        // required: true // modify while importing data
    },
    out_of_stock: {
        type: Boolean,
        default: false
    },
    product_details: {
        type: String // implement while implementing sellers section
    },
    pid: { // pending
        type: String,
        // required: true
    },
    quantity: {
        type: String
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// productSchema.pre('save', function(next) {
//     this.slug = slugify(this.title, {lower: true});
//     next();
// });

const Product = mongoose.model('Product', productSchema);

productSchema.pre('save', function(next){
    this.slug = slugify(this.title, {lower: true});
    this.discount_price = this.discount * .01 * this.actual_price;
    this.selling_price = this.actual_price - this.discount * .01 * this.actual_price;
    next();
});

productSchema.pre('create', function(next){    
    this.product_details = JSON.stringify(this.product_details_temp);
    next();
})

module.exports = Product;