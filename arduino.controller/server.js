'use strict';

//////////////////////////////////////////////////////////////////////
// arduino serial port related stuff
//////////////////////////////////////////////////////////////////////
const serial = require('serialport');
const readline = require('@serialport/parser-readline');
const port = new serial('/dev/ttyACM0', { baudRate: 115200 });
const parser = port.pipe(new readline({ delimiter: '\n'}));

port.on('open', () => {
    console.log('serial port open');
});


parser.on('data', data => {
    //console.log(data);
    try {
        const result = JSON.parse(data);
        //console.log(result);
        if (result.v !== undefined) {
            console.log('voltage:',result.v);
        }
        if (result.a1 !== undefined) {
            console.log('amps1:',result.a1);
        }
        if (result.a2 !== undefined) {
            console.log('amps2:',result.a2);
        }
        if (result.t !== undefined) {
            console.log('temp:',result.t);
        }
        if (result.s1 !== undefined) {
            console.log('speed1:',result.s1);
        }
        if (result.s2 !== undefined) {
            console.log('speed2:',result.s2);
        }
        if (result.msg !== undefined) {
            console.log('msg:',result.msg);
        }
        if (result.error !== undefined) {
            console.log('error:',result.error);
        }
    } catch (error) {
            console.log(data);
    }

});
//////////////////////////////////////////////////////////////////////


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


const MOVEMENT_TIMEOUT = 100;
let timeLastMovementCommand = new Date().getTime();




///////arduino command handler/////////////////////////////////////////////////////
const commandHandler = (request, response) => {

    console.log('server log: ' + request.path);

    const tokens = request.path.split('/',10);
    console.log(tokens);
    let cmd = '';
    let gotCmd = false;
    let gotParm1 = false;
    let parm1 =  '';
    let gotParm2 = false;
    let parm2 =  '';
    let gotParm3 = false;
    let parm3 =  '';
    for (let i=0;i<tokens.length;i++) {
        if (!gotCmd && tokens[i] != '' && tokens[i] != 'arduino' && tokens[i] != 'api') {
            cmd = tokens[i]; gotCmd = true; continue;
        }
        if (!gotParm1 && tokens[i] != '' && tokens[i] != 'arduino' && tokens[i] != 'api') {
            parm1 = tokens[i]; gotParm1 = true; continue;
        }
        if (!gotParm2 && tokens[i] != '' && tokens[i] != 'arduino' && tokens[i] != 'api') {
            parm2 = tokens[i]; gotParm2 = true; continue;
        }
        if (!gotParm3 && tokens[i] != '' && tokens[i] != 'arduino' && tokens[i] != 'api') {
            parm3 = tokens[i]; gotParm3 = true; continue;
        }
    }
    console.log(cmd,' ',parm1,' ',parm2,' ',parm3);
    let command = '';
    const now = new Date().getTime();
    switch (cmd) {
        case 'help':
                command = '0'
                break;
        case 'numcmds':
                command = '1';
                break;
        case 'status':
                switch (parm1) {
                    case '':
                        command = '24';
                        break;
                    case 'stop':
                        command = '2';
                        break;
                    case 'start':
                        command = '3' + ' ' + parm2;
                        break;
                }
                break;
        case 'version':
                command = '20';
                break;
        case 'volts':
                command = '21';
                break;
        case 'amps':
                command = '22';
                break;
        case 'temp':
                command = '23';
                break;
        case 'speeds':
                command = '25';
                break;
        case 'stop':
                command = '28';
                break;
        case 'forward':
                if (now - timeLastMovementCommand < MOVEMENT_TIMEOUT) break;
                command = '29' + ' ' + parm1 + ' ' + parm2;
                timeLastMovementCommand = new Date().getTime();
                break;
        case 'backward':
                if (now - timeLastMovementCommand < MOVEMENT_TIMEOUT) break;
                command = '32' + ' ' + parm1 + ' ' + parm2;
                timeLastMovementCommand = new Date().getTime();
                break;
        case 'left':
                if (now - timeLastMovementCommand < MOVEMENT_TIMEOUT) break;
                command = '33' + ' ' + parm1 + ' ' + parm2;
                timeLastMovementCommand = new Date().getTime();
                break;
        case 'right':
                if (now - timeLastMovementCommand < MOVEMENT_TIMEOUT) break;
                command = '34' + ' ' + parm1 + ' ' + parm2;
                timeLastMovementCommand = new Date().getTime();
                break;
        default:
                command = '28';
                break;
    }

    console.log(command);
    //return;
    port.write(command + '\n', error => {
        if (error) {
            console.log('Error sending data to arduino: ', error.message);
        } else {
            console.log('command sent to arduino');
        }
    });

    response.status(200).send('You requested ' + request.path);
}
app.get('/arduino/api/*', commandHandler);




///////arduino command HELP handler///////////////////////////////////////////////////
const commandHelpHandler = (request, response) => {
    console.log('server log: ' + request.path);
    response.send(request.path);

    port.write('0\n', error => {
        if (error) {
            console.log('Error sending data to arduino: ', error.message);
        } else {
            console.log('command sent to arduino');
        }
    });

}
app.get('/arduino/api', commandHelpHandler);


///////arduino serial connection test handler///////////////////////////////////////////////////
const commandTestSerialHandler = (request, response) => {
    console.log('server log: ' + request.path);
    response.send(request.path);

    port.write('\n', error => {
        if (error) {
            console.log('Error sending data to arduino: ', error.message);
        } else {
            console.log('test \\n sent to arduino');
        }
    });

}
app.get('/arduino', commandTestSerialHandler);



app.listen(8080, () => {
    console.log('HTTP Raspberry Pi Server is Up at 8080');
});
