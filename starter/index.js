//Type in terminal:
// node > to open "the node's dev console"
// .exit or ctrl+d > to exit node terminal

//Press:
//tab > to see the global variable
//cmd+k > to clear the terminal

// const hello = 'Hello world';
// console.log(hello); //type node index.js this console will apear in terminal

const fs = require('fs');

/////////////////////////////
//Files
// //Blocking, synchronous way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8'); // read from a file
// console.log(textIn);

// const textOutput = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOutput); //write to a file (if not created it will create it)
// console.log('File written!');


// //Non-blocking, asynchronous way
// //node will start to read start.txt file from below and once done it will start executing the callback function, that's why is called asyncronous
// //in "start.txt" there is the text: "read-this"
//     //"read-this" is also a file, so when the first fs.readFile is done, it passes as data1 to the second fs.readFile which in turn accesses "read-this.txt"
//     //third fs.readFile is reading "append.txt"
//         //finally the fs.writeFile will write in "final.txt" the text
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     console.log(data1);
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2);
//         fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//             console.log(data3);
//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//             console.log('Your file has been written');
//             })
//         });
//     });
// });
// console.log("Will read file!"); //this will print first, then the above

/////////////////////////////
//Server
const http = require('http');
const url = require('url');

//readFileSync = sync, and you can do it bcs you are in top level. If the bellow readFile's would have been in the createServer callback fn it could not be done as in createServer the callback function gets executed each time there is a request
const replaceTemplate = (temp, product) => {
    let output = temp.replace(/%PRODUCTNAME%/, product.productName);
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    output = output.replace(/{%ID%}/g, product.id);

    if(!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
    return output
}

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObject = JSON.parse(data);

const server = http.createServer((req, res) => {
    // //For the below console.logs if you go to: http://127.0.0.1:8000/product?id=0
    // console.log(req.url); // /product?id=0
    // console.log(url.parse(req.url, true)) //the below obj will be printed
    // // Url {
    // //     protocol: null,
    // //     slashes: null,
    // //     auth: null,
    // //     host: null,
    // //     port: null,
    // //     hostname: null,
    // //     hash: null,
    // //     search: '?id=0',
    // //     query: [Object: null prototype] { id: '0' },
    // //     pathname: '/product',
    // //     path: '/product?id=0',
    // //     href: '/product?id=0'
    // //   }
    const {query, pathname } = url.parse(req.url, true);
    // const pathname = req.url
    // Overview page
    if (pathname === '/' || pathname === '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html' });

        const cardsHtml = dataObject.map(el => replaceTemplate(tempCard, el)).join('')
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml)
        res.end(output);

        // Product page
    } else if (pathname === '/product') {
        res.writeHead(200, { 'Content-type': 'text/html' });
        console.log(query);
        const product = dataObject[query.id]
        console.log(product);
        const output = replaceTemplate(tempProduct, product)
        res.end(output);

        // API
    } else if (pathname === '/api') {
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(data);

        // Not found 
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world'
        });
        res.end('<h1>Page not found!</h1>');
    }
});

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to requests on port 8000');
});