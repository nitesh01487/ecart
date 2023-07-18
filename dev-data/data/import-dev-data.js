const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./../../models/productModel')
const Review = require('./../../models/reviewModel')
const User = require('./../../models/userModel')
const Tour = require('./../../models/tourModel');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);


// for connecting database
mongoose
    // for database running locally
    // .connect(process.env.DATABASE_LOCAL, {
    // for database running at remotly
    .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
    }).then(() => console.log('DB connection successful!'));

// READ JSON FILE
// const products = JSON.parse(fs.readFileSync(`${__dirname}/sample1.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
    try{
        // for products or storing a large chuncks of data
        let products;
        for(let i = 0; i < 30; i++) {
            products = JSON.parse(fs.readFileSync(`${__dirname}/sample${i + 1}.json`, 'utf-8'));
            await Product.create(products, {validateBeforeSave: false});
            console.log(`Sample${i + 1} is loaded`);
        }
        // await User.create(users, {validateBeforeSave: false});
        // await Tour.create(tours, {validateBeforeSave: false});
        // await Review.create(reviews, {validateBeforeSave: false});
        console.log('Data successfully loaded!');
    } catch(err) {
        console.log(err);
    }
    process.exit();
}




// DELETE ALL FORM DB
const deleteData = async () => {
    try{
        // await Product.deleteMany(); // for products
        await User.deleteMany(); // for users
        // await Review.deleteMany(); // for reviews
        console.log('Data successfully deleted!');
    } catch(err) {
        console.log(err)
    }
    process.exit();
}

if(process.argv[2] === '--import') {
    importData();
}else if (process.argv[2] === '--delete') {
    deleteData();
}

// run import node dev-data/data/import-dev-data.js --import
// and then node dev-data/data/import-dev-data.js --import for importing
// and then node dev-data/data/import-dev-data.js --delete for deleting