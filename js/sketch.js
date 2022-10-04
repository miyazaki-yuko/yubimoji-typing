// const videoElement = document.getElementsByClassName("input_video")[0];
// const canvasElement = document.getElementsByClassName('output_canvas')[0];
// const canvasCtx = canvasElement.getContext('2d');

let video;
let cam;

let g_landmarks = [];
let palms = [0, 1, 5, 9, 13, 17]; //landmark indices that represent the palm
let isPalm;
let finger_tips = [4, 8, 12, 16, 20];
let isTip;

let inputs = [];
let data_angles = [];
let distances = [];
let draw_distances = [];
let draw_angles = [];

const max_distance = 30;

let data;
let keyWord;
let label;

var hands;

function preload() {
    data = loadJSON("./js/lib/static_yubimoji.json");
}

function onResults(results) {
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            g_landmarks = landmarks;
        }
        //追記必要


        // Tutorial Mode
        if (tutorial_mode) {
            const current_letter = document.querySelector('.current_letter').innerText;
            for (let i = 0; i < data.length; i++) {
                if (data[i].word == current_letter) {
                    data_angles = data[i].angles;
                }
            }

            calcAngleZero();
            calcAngle();
            calcDistance();
            inputs = [];

            if (distances.length > 0) {
                if (max(distances) < max_distance) {
                    console.log(distances);
                    changeLetterClass();
                }
            }
        }

        // gameMode
        if (game_mode) {


            calcAngleZero();
            calcAngle();
            calcDistance();
            inputs = [];
        }

        // calcAngleZero();
        // calcAngle();
        // calcDistance();
        // inputs = [];
    }
}

function calcAngleZero() {
    //calculate angle of landmarks[0]
    if (g_landmarks.length > 0) {
        let x_zero = g_landmarks[0].x;
        let y_zero = g_landmarks[0].y;
        let z_zero = g_landmarks[0].z;
        let vec2 = createVector(
            g_landmarks[17].x - x_zero,
            g_landmarks[17].y - y_zero,
            g_landmarks[17].z - z_zero
        );
        let vec3 = createVector(
            g_landmarks[1].x - x_zero,
            g_landmarks[1].y - y_zero,
            g_landmarks[1].z - z_zero
        );
        let angle_zero = vec2.angleBetween(vec3);
        angle_zero = round(degrees(angle_zero), 0);
        if (angle_zero < 0) {
            angle_zero = -1 * angle_zero;
        } else if (angle_zero >= 0) {
            angle_zero = 360 - angle_zero;
        }
        inputs.push(angle_zero);
    }
}

function calcAngle() {
    if (g_landmarks.length > 0) {
        let next;
        let behind;
        let stores = [];
        for (let i = 1; i < g_landmarks.length - 1; i++) {
            // Get Coordinate
            let x = g_landmarks[i].x;
            let y = g_landmarks[i].y;
            let z = g_landmarks[i].z;

            // Calculate angle
            next = g_landmarks[i - 1];
            behind = g_landmarks[i + 1];
            isTip = finger_tips.indexOf(i);
            isPalm = palms.indexOf(i);
            if (isTip == -1) {
                next = g_landmarks[i - 1];
                behind = g_landmarks[i + 1];
                if (isPalm !== -1) {
                    next = g_landmarks[0];
                }
                let vec0 = createVector(next.x - x, next.y - y, next.z - z);
                let vec1 = createVector(behind.x - x, behind.y - y, behind.z - z);
                let angle_between = vec0.angleBetween(vec1);
                angle_between = round(degrees(angle_between), 0);
                if (angle_between < 0) {
                    angle_between = -1 * angle_between;
                } else if (angle_between >= 0) {
                    angle_between = 360 - angle_between;
                }
                inputs.push(angle_between);
            }
        }
        // console.log(inputs);
    }
}

function calcDistance() {
    distances = [];
    draw_distances = [];

    let difference = 0;
    if (inputs.length > 0) {
        for (let i = 0; i < inputs.length; i++) {
            difference = abs(data_angles[i] - inputs[i]);
            if (difference > 180) {
                if (data_angles[i] < 180) {
                    difference = 360 - inputs[i] + data_angles[i];
                } else {
                    difference = 360 - data_angles[i] + inputs[i];
                }
            } else {
                difference = data_angles[i] - inputs[i];
            }
            distances.push(abs(difference));
            draw_distances.push(abs(difference));
        }
        for (let i = 0; i < finger_tips.length; i++) {
            draw_distances.splice(finger_tips[i], 0, 0);
        }
    }
}

// const hands = new Hands({
//     locateFile: (file) => {
//         return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
//     }
// });
// hands.setOptions({
//     maxNumHands: 1,
//     modelComplexity: 1,
//     minDetextionConfidence: 0.5,
//     minTrackingConfidence: 0.5
// });
// hands.onResults(onResults);

// const camera = new Camera(videoElement, {
//     onFrame: async () => {
//         await hands.send({ image: videoElement });
//     },
//     width: 1280,
//     height: 720
// });
// camera.start();


function startCamera() {
    console.log("start camera");
    startMediaPipeHands('8ce8e876fe1196ef2fdff50084325a364d50628dc4f98bd938e163efed58a6cf');
}


function setup() {
    noCanvas();
    console.log('load setup');

    data = data.data;
    console.log('get data');


    // mycanvas.parent("#gameCanvas");
    video = createCapture(VIDEO);
    video.size(640, 360);
    video.hide();

}

function draw() {
    // console.log('draw');
    // clear();
    background(127);

    scale(-1.0, 1.0);
    translate(-width, 0);
    image(video, 0, 0);

    if (g_landmarks.length > 0) {
        for (let i = 0; i < g_landmarks.length; i++) {
            let x = g_landmarks[i].x * 640;
            let y = g_landmarks[i].y * 360;
            let line_next;
            if (draw_distances[i] < max_distance) {
                fill(150);
                stroke(150);
            } else {
                fill(255, 0, 0);
                stroke(255, 0, 0);
            }
            strokeWeight(1);
            textSize(12);
            rect(x - 2, y - 2, 4, 4);

            // text(data_angles[i], x, y);
            text(draw_distances[i], x, y);

            // draw the skeleton
            isPalm = palms.indexOf(i); // is it a palm landmark or finger landmark?
            if (isPalm == -1) {
                // connect with previous finger landmark if it's a finger landmark
                line_next = g_landmarks[i - 1];
            } else {
                // connect with next palm landmark if it's a palm landmark
                line_next = g_landmarks[palms[(isPalm + 1) % palms.length]];
            }

            line(x, y, line_next.x * 640, line_next.y * 360);
        }
    }
}

function remakeCanvas() {
    startCamera();
    console.log('remake canvas');
    let mycanvas = createCanvas(640, 360);
    mycanvas.parent("#gameCanvas");
    mycanvas.style("visibility", "visible");

    getRandomWord();
}

function getRandomWord() {
    console.log('get word');
    game_mode = true;
}

function startMediaPipeHands(_deviceId) {
    console.log('start Mediapipe Hands');
    videoElement = document.createElement('video');// document.getElementsByClassName('input_video')[0];
    document.querySelector('body').appendChild(videoElement);
    videoElement.hidden = true;
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });
    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetextionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    hands.onResults(onResults);

    camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        audio: false,
        width: 1280,
        height: 720,
        deviceId: _deviceId
    });
    stream = camera.start();

}

function stopMediaPipeHands() {
    if (document.querySelector('video')) {
        let stream = videoElement.srcObject;
        window.cancelAnimationFrame(id_callback_camera_utils);
        stream.getTracks().forEach(track => track.stop())
        hands.close();
        videoElement.remove();
    }
    g_landmarks = [];
    draw();

}