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

let euc_distances = [];
let min_data_angles = [];

const max_distance = 30;
const min_distance = 30;

let data;
let word_data;

let startTime;
let game_start = false;
const oneSec = 1000;
const veriSec = 5000;
let elapsedTime = 0;
let time_count = 30;
let verificationStartTime;
let verificationTime;

let correct_sound;
let incorrect_sound;
let result_sound;

var hands;

function preload() {
    data = loadJSON("./js/lib/static_yubimoji.json");
    word_data = loadJSON("./js/lib/meishi.json");

    correct_sound = loadSound('./sounds/correct.mp3');
    incorrect_sound = loadSound('./sounds/wrong.mp3');
    result_sound = loadSound('./sounds/result2.mp3');
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
                    // console.log(data_angles);
                }
            }
            

            calcAngleZero();
            calcAngle();
            calcEuclideanDistance();
            calcDistance();
            inputs = [];

            if (euc_distances.length > 0) {
                if (min(euc_distances) < min_distance) {
                    // console.log("ok");
                    changeLetterClass();
                }
            }
        }

        // gameMode
        if (game_mode) {
            let time = document.querySelector('#time');
            // console.log(time);
            time.innerText = `${time_count}`;

            // count time
            if (g_landmarks.length > 0 && game_start == false) {
                startTime = millis();
                verificationStartTime = millis();
                g_landmarks = [];
                game_start = true;
            }
            const now = millis();
            elapsedTime = now - startTime;
            
            // console.log(elapsedTime);
            // 1秒経ったら
            if (game_start==true && elapsedTime >= oneSec) {
                time_count--;
                startTime = millis();
            }

            const current_letter = document.querySelector('.current_letter').innerText;
            for (let i = 0; i < data.length; i++) {
                if (data[i].word == current_letter) {
                    data_angles = data[i].angles;
                }
            }


            calcAngleZero();
            calcAngle();
            calcEuclideanDistance();
            calcDistance();
            inputs = [];

            verificationTime = now - verificationStartTime;
            if (euc_distances.length > 0) {
                if (min(euc_distances) < min_distance) {
                    // 認識成功したらscore +5
                    score_count += 5;
                    correct_sound.play();
                    changeLetterClass();
                    if(current_page.id == "gameMode") {
                        deleteSamples();
                    }
                    verificationStartTime = millis();
                } else if (verificationTime >= veriSec) {
                    // 5秒以上認識できなかったらポイント入れずに飛ばす
                    console.log('miss!');
                    if(current_page.id == "gameMode") {
                        showCurrentSamples();
                    }
                    incorrect_sound.play();
                    changeLetterClass();
                    verificationStartTime = millis();
                }
                // setTimeout(() => {console.log("this is the first message")}, 3000);
            }

            if (time_count <= 0) {
                game_mode = false;
                result_sound.play();
                stopMediaPipeHands();
                pageTransitionAnimation(9, '#fff8e5', 'UpAnime');
            }
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

function calcEuclideanDistance() {
    let calc_angle;
    let euc_distance = 0;
    euc_distances = [];
    euc_data = [];


    if(inputs.length > 0) {
        for(let i = 0; i < data_angles.length; i++) {
            //calc euclidean distance
            let squared_val = 0;
            calc_angle = data_angles[i];
            // console.log(data_angles[i]);
            for(let j = 0; j < inputs.length; j++) {
                squared_val += pow(calc_angle[j] - inputs[j], 2);
            }
            euc_distance = sqrt(squared_val);

            // make new array for calcDistance
            euc_data.push({
                angles: calc_angle,
                distance: euc_distance
            });

            // for determine correct or incorrect
            // add euclidean distance per data 
            euc_distances.push(euc_distance);
        }

        // derive the shortest distance
        euc_data.sort(function(a,b) {
            if(a.distance > b.distance) return 1;
            else return -1;
        });
        min_data_angles = euc_data[0].angles;
        // console.log(min_data_angles);
    }
}

// feedback wrong palm
function calcDistance() {
    distances = [];
    draw_distances = [];

    let difference = 0;
    if (inputs.length > 0) {
        for (let i = 0; i < inputs.length; i++) {
            difference = abs(min_data_angles[i] - inputs[i]);
            if (difference > 180) {
                if (min_data_angles[i] < 180) {
                    difference = 360 - inputs[i] + min_data_angles[i];
                } else {
                    difference = 360 - min_data_angles[i] + inputs[i];
                }
            } else {
                difference = min_data_angles[i] - inputs[i];
            }
            distances.push(abs(difference));
            draw_distances.push(abs(difference));
        }
        for (let i = 0; i < finger_tips.length; i++) {
            draw_distances.splice(finger_tips[i], 0, 0);
        }
    }
}

function setup() {
    let mycanvas = createCanvas(640, 360);
    mycanvas.parent("#tutorialCanvas");

    data = data.data;
}

function draw() {
    // console.log(time_count);
    clear(255);

    scale(-1.0, 1.0);
    translate(-width, 0);
    // image(video, 0, 0);

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
            // text(draw_distances[i], x, y);

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

function startMediaPipeHands() {
    console.log('start Mediapipe Hands');
    // videoElement = document.createElement('video');
    videoElement = document.getElementsByClassName('input_video')[0];
    // document.querySelector('body').appendChild(videoElement);
    // videoElement.hidden = true;
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
        // deviceId: _deviceId
    });
    stream = camera.start();
    now_mediapipe = true;
}

function stopMediaPipeHands() {
    console.log('stop mediapipe hands')
    if (document.querySelector('video')) {
        let stream = videoElement.srcObject;
        window.cancelAnimationFrame(id_callback_camera_utils);
        stream.getTracks().forEach(track => track.stop())
        hands.close();
        videoElement.remove();
    }
    g_landmarks = [];
    now_mediapipe = false;
    // draw();

}