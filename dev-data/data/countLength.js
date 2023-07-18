const fs = require('fs');


for(i = 1; i <= 30; i++) {
    const products = JSON.parse(fs.readFileSync(`${__dirname}/sample${i}.json`, 'utf-8'));
    products.forEach(element => {
        if(!arr.includes(element.brand)){
            arr.push(element.brand);
            a++;
        }
        else{
            y = arr.findIndex(el => el === element.brand);
            value[y] += 1;
        }
    });
}
console.log(a);

let count = 0;
for(i = 0; i < 325; i++) {
    console.log(arr[i] + " " + value[i]);
    count += value[i];
}
console.log(count);