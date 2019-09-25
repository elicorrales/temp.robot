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
