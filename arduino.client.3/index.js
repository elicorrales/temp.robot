'use strict';

const doArduinoCommand = (command) => {
    //console.log('http://10.0.0.58:8080/arduino/api/' + command);
    fetch('http://10.0.0.58:8080/arduino/api/' + command, { method: 'GET' })
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.log(error);
    });
}

// this fires as long as slider is moving
// (speed changing)
let mouseSliderPressed = false
const doArduinoStartMovement = (slider, event) => {
    if (!mouseSliderPressed) {
        mouseSliderPressed = true;
        const command = slider.id;
        const speed = slider.value;
        console.log(command,' ',speed,' ',event);
        sendArduinoMovementCommand(command);
    }
}

// this fires when slider button goes up 
// we need to keep sending movement even if slider does not move,
// as long as it's held down - (same speed)
const doArduinoEndMovement = (slider, event) => {
    mouseSliderPressed = false;
    slider.value = 0;
}

const sendArduinoMovementCommand = (command) => {

    if (!mouseSliderPressed) return;

    setTimeout(() => {
        const speed = document.getElementById(command).value;
        fetch('http://10.0.0.58:8080/arduino/api/' + command + '/' + speed + '/' + speed, { method: 'GET' })
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.log(error);
            mouseSliderPressed = false;
        });
        sendArduinoMovementCommand(command);
    }, 10);
}

const sendGamepadAxesToServer = (X, Y) => {
    fetch('http://10.0.0.58:8080/gamepad/axes/', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({X,Y})
        }
    )
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.log(error);
    });

}

let timeSentLastXandY = new Date().getTime();
const gamePadHandler = () => {
    setInterval(()=> {
        const gamePad = navigator.getGamepads()[0];
        const axes = gamePad.axes;
        //console.log(axes);
        const X = axes[0];
        const Y = axes[1];
        const absX = Math.abs(X);
        const absY = Math.abs(Y);
        const now = new Date().getTime();

        // not sure if we need this one
        //if (now - timeSentLastXandY < 50) { return; }

        // since joystick not guaranteed to be centered..
        if (absX < 0.15 && absY < 0.15) { return; }

        // make sure the joystick movement is clearly vertical, or clearly horizontal
        if ((absX + 0.05 > absY) || (absY + 0.05 > absY)) {
        //if ((absX > 0.2 && absY < 0.2) || (absX < 0.2 && absY > 0.2)) {
            const x = X>=0 ? map(X,0.2,1,0,100,true) : map(X,-0.2,-1,0,-100,true);
            const y = Y>=0 ? map(Y,0.2,1,0,100,true) : map(Y,-0.2,-1,0,-100,true);
            //console.log(Math.floor(x),' ',Math.floor(y));
            sendGamepadAxesToServer(Math.floor(x),Math.floor(y));
            timeSentLastXandY = new Date().getTime();
        }
    }, 80);
}

//occurs once at start
const onGamePadConnected = (gamePadEvent) => {
    console.log(gamePadEvent);

    gamePadHandler();
}

window.addEventListener('gamepadconnected', onGamePadConnected);

//p5.js functions - i believe required to be able to use the
//map() function - not sure - haven't double-checked in some time.
function setup() {}
//function draw() {}



let gotGoodResponseFromServerCollectedDataRequest = true;

setInterval(() => {

    if (gotGoodResponseFromServerCollectedDataRequest) {

        gotGoodResponseFromServerCollectedDataRequest = false;
    
        fetch('http://10.0.0.58:8080/arduino/data', { method: 'GET' })
        .then(response => {
            if (response.status !== 200) {
                console.log('Bad data retrieval response from server:',response.status);
                return;
            }
            response.json().then(data => {
                console.log(data);
                arduinodata.innerHTML = ''
                        + 'Volts:' + data.volts + '&nbsp;&nbsp;'
                        + 'Amps1:' + data.amps1 + '&nbsp;&nbsp;'
                        + 'Amps2:' + data.amps2  + '&nbsp;&nbsp;'+ '<br/>'
                        + 'M1 Spd:' + data.speed1 + '&nbsp;&nbsp;'
                        + 'M2 Spd:' + data.speed2 + '&nbsp;&nbsp;'
                        + 'Temp: ' + data.temp + '<br/>'
                        + 'Cmds: ' + data.cmds + '&nbsp;&nbsp;'
                        + 'Msg:  ' + data.msg + '<br/>'
                        + 'Error:' + data.error;

                gotGoodResponseFromServerCollectedDataRequest = true;
            });
        })
        .catch(error => {
            console.log(error);
        });
    }
}, 500);
