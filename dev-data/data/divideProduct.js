const fs = require('fs');

const products = JSON.parse(fs.readFileSync(`${__dirname}/product.json`, 
'utf-8'));
let array = [];
let count = 1;
let i = 0;
products.forEach((obj) => {
    obj.product_details = JSON.stringify(obj.product_details);
    obj.quantity = 5;
    obj.actual_price = +obj.actual_price.split(',').join('');
    if(obj.actual_price === 0 || obj.actual_price === null || !obj.actual_price) {
        obj.actual_price = 999;
    }
    obj.discount_price = parseInt(obj.discount, 10) !== NaN ?Math.floor(+obj.actual_price * 0.01 * parseInt(obj.discount, 10)): 0;
    // console.log(parseInt(obj.discount));
    
    obj.selling_price = obj.actual_price - obj.discount_price;
    if(!obj.discount){
        obj.actual_price = obj.selling_price = 999;
        obj.discount_price = 0;
    }
    // console.log(obj);
    // i++;
    // if(i > 4 ) {
    //     return false;
    // }
    array.push(obj);
    i++;
    if(i === 1000) {
        i = 0;
        fs.writeFileSync(`${__dirname}/sample${count}.json`, JSON.stringify(array),(err) => {
            if (err) {  console.error(err);  return; };
            console.log("File has been created");
        });
        count++;
        array = [];
    }
});