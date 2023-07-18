const fs = require('fs');

const value = [];
const products =JSON.parse(fs.readFileSync(`${__dirname}/product.json`, 'utf-8'));

let i = 0;
let a = 0

products.forEach((obj) => {
    if(obj._id === "b398eafe-118c-52bd-a491-e7e9d38438bc")
        a = 1;
    if(a === 0)
    {
        
        var temp = obj;
        const val1 = +obj.actual_price.split(',').join('');
        const val2 = +obj.average_rating;
        const val3 = +obj.selling_price;
        delete temp._id;
        temp.actual_price = val1;
        temp.average_rating = val2;
        temp.selling_price = val3;
        temp.product_details = JSON.stringify(obj.product_details);
        temp.quantity = 5;
        if(temp.selling_price === null)
            temp.selling_price = 0;
        value.push(temp);
    }
});
fs.writeFileSync(`${__dirname}/def.json`, JSON.stringify(value),(err) => {
    if (err) {  console.error(err);  return; };
    console.log("File has been created");
});
