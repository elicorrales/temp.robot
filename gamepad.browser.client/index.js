'use strict';


const sendGamepadAxesToServer = (leftY, rightY) => {
    fetch('http://10.0.0.58:8080/gamepad/axes/', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({'leftY' : leftY, 'rightY' : rightY})
        }
    )
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.log(error);
    });

}

const fixYvals = (leftY, rightY) => {
    let validLeftY = 0;
    let validRightY = 0;
    if (Math.abs(leftY) > 0.4) { validLeftY = leftY; }
    if (Math.abs(rightY) > 0.4) { validRightY = rightY; }
    return [validLeftY, validRightY];
}

const isTooMuchX = (leftX, rightX) => {
    if (Math.abs(leftX) > 0.4 || Math.abs(rightX) > 0.4) {
        return true;
    }
    return false;
}

const gamePadHandler = () => {
    setInterval(()=> {
        const gamePad = navigator.getGamepads()[0];
        const axes = gamePad.axes;

        const leftX = axes[0];
        const rightX = axes[2];
        const tooMuchX = isTooMuchX(leftX, rightX);
        if (!tooMuchX) {
            const leftY = axes[1];
            const rightY = axes[3];
            const [validLeftY, validRightY] = fixYvals(leftY, rightY);
            if (Math.abs(validLeftY) > 0.4 || Math.abs(validRightY) > 0.4) {
                console.log(validLeftY + ' : ' + validRightY);
                sendGamepadAxesToServer(validLeftY, validRightY);
            }
        }
    }, 20);
}

//occurs once at start
const onGamePadConnected = (gamePadEvent) => {
    console.log(gamePadEvent);

    gamePadHandler();
}

window.addEventListener('gamepadconnected', onGamePadConnected);
