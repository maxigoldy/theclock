const clockCanvas = document.getElementById('clockCanvas');
const clockContext = clockCanvas.getContext('2d');

let clockCanvasWidth = clockCanvas.width;
let clockCanvasHeight = clockCanvas.height;

const timeDisplay = document.getElementById("timeDisplay")

const secondsCircleRadius = clockCanvasHeight / 2;
const minutesCircleRadius = clockCanvasHeight / 3.25;
const hoursCircleRadius = clockCanvasHeight / 8;
let secondBlobs = [], minuteBlobs = [], hourBlobs = [];

const secondsSound = new Audio('assets/sound/secondsSound.mp3'); //https://pixabay.com/de/sound-effects/slow-cinematic-clock-ticking-tension-2-323078/
const minutesSound = new Audio('assets/sound/minutesSound.mp3'); //https://pixabay.com/de/sound-effects/tibetan-gong-sound-effect-311179/
const hoursSound = new Audio('assets/sound/hoursSound.mp3'); //https://pixabay.com/de/sound-effects/black-gong-28936/

let intervalId = null;

// start of loading from json
let config = { // just for initialization - use config.json
    circleColor: "grey",
    secColor: "grey",
    minColor: "grey",
    hourColor: "grey",
    bgColor: "grey",

};
let circleColor = "grey";


fetch('../../config.json')
    .then(response => response.json())
    .then(data => {
        config = { ...config, ...data };
        //console.log("Geladene Konfiguration:", config);
        circleColor = config.circleColor;
        
    })
    .catch(error => {
        console.error("Fehler beim Laden der Konfiguration:", error);
    });
// end of loading from json


//  Uhr passt sich an Fenstergröße an
function resizeCanvasToFullScreen() {
    const dpr = window.devicePixelRatio || 1; // z. B. 2 bei Retina

    // CSS-Größe in logischen Pixeln
    clockCanvasWidth = window.innerWidth;
    clockCanvasHeight = window.innerHeight;

    // Setze tatsächliche Zeichenfläche auf physische Pixel
    clockCanvas.width = clockCanvasWidth * dpr;
    clockCanvas.height = clockCanvasHeight * dpr;

    // Skaliere den Canvas-Inhalt runter, damit er optisch passt
    clockCanvas.style.width = clockCanvasWidth + "px";
    clockCanvas.style.height = clockCanvasHeight + "px";

    // Skaliere den Zeichenkontext für scharfes Zeichnen
    clockContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvasToFullScreen();



function clearCanvas(bg = "black") {
    clockContext.fillStyle = bg;
    clockContext.fillRect(0, 0, clockCanvas.width, clockCanvas.height);
}

class Blob {
    constructor(startX, startY, blobType) {
        this.x = startX;
        this.y = startY;
        //this.targetX = startX;
        //this.targetY = startY;
        this.blobType = blobType;
    }

    updatePosition(speed = 0.05) {
        const centerX = clockCanvasWidth / 2;
        const centerY = clockCanvasHeight / 2;
    
        const currentDate = new Date();
        let count, radius;
    
        if (this.blobType === "secondBlob") {
            count = Math.max(currentDate.getSeconds(), 1);
            radius = secondsCircleRadius;
        } else if (this.blobType === "minuteBlob") {
            count = Math.max(currentDate.getMinutes(), 1);
            radius = minutesCircleRadius;
        } else {
            count = Math.max(currentDate.getHours(), 1);
            radius = hoursCircleRadius;
        }
    
        const spacing = (2 * Math.PI) / count;
    
        // Aktueller Winkel (aus Position berechnet)
        const dx = this.x - centerX;
        const dy = centerY - this.y; // canvas y ist "nach unten"
        let currentAngle = Math.atan2(dy, dx);
    
        // Zielwinkel (aus targetX/Y berechnet)
        const targetDx = this.targetX - centerX;
        const targetDy = centerY - this.targetY;
        let targetAngle = Math.atan2(targetDy, targetDx);
    
        // Winkel-Differenz berechnen
        let deltaAngle = targetAngle - currentAngle;
    
        // Kürzesten Weg auf dem Kreis nehmen
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
    
        // Interpolation Richtung Zielwinkel
        currentAngle += deltaAngle * speed;
    
        // Neue x/y-Koordinaten auf dem Kreis
        this.x = centerX + radius * Math.cos(currentAngle);
        this.y = centerY - radius * Math.sin(currentAngle);
    }
    

    draw() {
        let color
        switch (this.blobType) {
            case "secondBlob":
                color = config.secColor;
                break;
            case "minuteBlob":
                color = config.minColor;
                break;
            case "hourBlob":
                color = config.hourColor;
                break;
            default:
                color = config.circleColor;
        }
        clockContext.fillStyle = color;
        clockContext.beginPath();
        clockContext.arc(this.x, this.y, 6, 0, 2 * Math.PI);
        clockContext.fill();
        clockContext.closePath();
    }
}

function getTopOfCircle(centerX, centerY, radius) {
    return {
        x: centerX,
        y: centerY - radius
    };
}

function updateBlobs(array, count, radius, blobType) {
    const centerX = clockCanvasWidth / 2;
    const centerY = clockCanvasHeight / 2;
    const spacing = (2 * Math.PI) / Math.max(count, 1);

    while (array.length < count) {
        const top = getTopOfCircle(centerX, centerY, radius);
        array.push(new Blob(top.x, top.y, blobType));
    }

    for (let i = 0; i < count; i++) {
        const angle = Math.PI / 2 + i * spacing;
        const targetX = centerX + radius * Math.cos(angle);
        const targetY = centerY - radius * Math.sin(angle);

        array[i].targetX = targetX;
        array[i].targetY = targetY;
    }
    array.splice(count);
}

function drawCircles() {

    clockContext.strokeStyle = circleColor;

    //Draw Seconds Circle
    clockContext.beginPath();
    clockContext.arc((clockCanvasWidth / 2), (clockCanvasHeight / 2), secondsCircleRadius, 0, 2 * Math.PI, true);
    clockContext.stroke();
    clockContext.closePath();

    //Draw Minutes Circle
    clockContext.beginPath();
    clockContext.arc((clockCanvasWidth / 2), (clockCanvasHeight / 2), minutesCircleRadius, 0, 2 * Math.PI, true);
    clockContext.stroke();
    clockContext.closePath();

    //Draw Hours Circle
    clockContext.beginPath();
    clockContext.arc((clockCanvasWidth / 2), (clockCanvasHeight / 2), hoursCircleRadius, 0, 2 * Math.PI, true);
    clockContext.stroke();
    clockContext.closePath();
}

function clockLoop() {
    const currentDate = new Date;
    if (currentDate.getSeconds() !== 0) {
        secondsSound.currentTime = 0;
        secondsSound.play();
    } else if (currentDate.getMinutes() !== 0) {
        minutesSound.currentTime = 0;
        minutesSound.play();
    } else {
        hoursSound.currentTime = 0;
        hoursSound.play();
    }

    updateBlobs(secondBlobs, currentDate.getSeconds(), secondsCircleRadius, "secondBlob");
    updateBlobs(minuteBlobs, currentDate.getMinutes(), minutesCircleRadius, "minuteBlob");
    updateBlobs(hourBlobs, currentDate.getHours(), hoursCircleRadius, "hourBlob");


    timeDisplay.innerHTML = "Es ist " + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds() + " Uhr.";

}

function animate() {
    clearCanvas();
    drawCircles();
    secondBlobs.forEach(b => { b.updatePosition(); b.draw(); });
    minuteBlobs.forEach(b => { b.updatePosition(); b.draw(); });
    hourBlobs.forEach(b => { b.updatePosition(); b.draw(); });
    requestAnimationFrame(animate);
}

/*  User inputs / Tastenkürzel:
    "Enter" = beginnt das Programm und startet die Uhr
    "w"     = färbt die Kreise weiß ein 
    "g"     = färbt die Kreise grau ein 
    "b"     = färbt die Kreise schwarz ein 
*/
window.addEventListener("resize", resizeCanvasToFullScreen);
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        resizeCanvasToFullScreen();
        clockLoop();
        if (intervalId === null) {
            intervalId = setInterval(clockLoop, 1000);
        }
        animate();
    }
    if (event.key === "w") {
        circleColor = "white";
    }
    if (event.key === "b") {
        circleColor = "black";
    }
    if (event.key === "g") {
        circleColor = "grey";
    }
    if (event.key === "Shift") {
        timeDisplay.style.visibility === 'hidden' ? 'visible' : 'hidden';
    }
}
);