'use strict';
const express = require('express');
const app = express();

app.use(express.json());

app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//default handler
const rootHandler = (request, response) => {
    response.send('Requested /');
}
app.get('/', rootHandler);

//button handler
const buttonHandler = (request, response) => {
    console.log('server log: ' + request.path);
    response.send(request.path);
}
app.get('/buttons/*', buttonHandler);


//axes handler
const axesHandler = (request, response) => {
    //console.log('server log: ' + request.path);
    if (request.body !== undefined) {
        //console.log(request.body);
        handleAxesValues(request.body);
    } else console.log('no request body');
    response.send(request.path);
}
app.post('/axes/', axesHandler);

const handleAxesValues = (data) => {
    const L = -(data.leftY);
    const R = -(data.rightY);
    if (L > 0 && R > 0) {
        console.log('FORWARD');
    } else if (L < 0 && R > 0) {
        console.log('LEFT');
    } else if (L > 0 && R < 0) {
        console.log('RIGHT');
    } else if (L < 0 && R < 0) {
        console.log('BACKWARD');
    } else if (L > 0) {
        console.log('slow RIGHT');
    } else if (R > 0) {
        console.log('slow LEFT');
    } else if (L < 0) {
        console.log('slow BACK RIGHT');
    } else if (R < 0) {
        console.log('slow BACK LEFT');
    }
}

app.listen(8080, () => {
    console.log('HTTP Raspberry Pi Server is Up at 8080');
});
