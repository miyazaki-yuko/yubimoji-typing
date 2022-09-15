const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
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
let data_image;

const max_distance = 30;

let data;
let keyWord;
let label;

let view_area = document.querySelector('#viewArea');
let current_page;

let frames = [];
let explanations;

let tutorial_word;
let tutorial_letters = [];
let tutorial_mode = false;
let game_mode = false;
let letter_num = 0; // 文字数


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

const hands = new Hands({
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

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});
camera.start();


function setup() {
  let mycanvas = createCanvas(640, 360);
  mycanvas.parent("#gameCanvas");
  video = createCapture(VIDEO);
  video.size(640, 360);
  video.hide();


  frames = document.querySelectorAll('body .frame');
  console.log(frames);
  explanations = document.querySelectorAll('.explanation');
  data = data.data;
}

function draw() {
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

window.onload = function () {
  for (let i = 1; i < frames.length; i++) {
    frames[i].remove();
  }
}

function turnNextPage(e) {
  current_page = view_area.firstElementChild;
  const data_index = e.getAttribute('data-index');

  if (data_index == 4) {
    let user_name = document.querySelector('#typeYourName');
    if (user_name.value) {
      tutorial_word = user_name.value;
      current_page.remove();
      view_area.appendChild(frames[data_index]);
      getTutorialLetter();
    } else {
      document.querySelector('.cautionText').innerHTML = "名前を入力してください";
      // alert('名前を入力してください');
    }
  } else if (data_index == 7) {
    current_page.remove();
    view_area.append(frames[data_index]);
    remakeCanvas();
  }
  else if (data_index == 10) {
    current_page.remove();
    view_area.appendChild(frames[data_index]);
    var slider = new KeenSlider("#my-keen-slider", {}, [navigation]);
  } else {
    current_page.remove();
    view_area.appendChild(frames[data_index]);
  }
}

function getTutorialLetter() {
  // 1文字ずつに分割
  tutorial_letters = tutorial_word.split('');
  // document.querySelector('.tutorialWord').textContent = tutorial_letter[0];
  const tutorial_word_area = document.querySelector('#tutorialMode .tutorialWordArea');
  const tutorial_letter_area = document.querySelector('#tutorialMode .letterArea');
  tutorial_letter_area.innerText = tutorial_letters[0];

  for (let i = 0; i < tutorial_letters.length; i++) {
    // spanタグを追加
    let span_tutorial_letter = document.createElement("span");
    span_tutorial_letter.innerText = tutorial_letters[i];
    // 1文字目を太く黒くする
    if (i == 0) {
      span_tutorial_letter.classList.add("current_letter");
    }
    // htmlに文字を追加
    tutorial_word_area.appendChild(span_tutorial_letter);
  }
  const current_letter = document.querySelector('.current_letter').innerText;
  for (let i = 0; i < data.length; i++) {
    if (data[i].word == current_letter) {
      data_image = data[i].html;
    }
  }
  document.querySelector('#tutorialMode .showImageArea').innerHTML = data_image;
  tutorial_mode = true;
  // playTutorial();
}

function changeLetterClass() {
  const tutorial_word_area = document.querySelector('.tutorialWordArea');
  const tutorial_words = tutorial_word_area.children;
  current_page = view_area.firstElementChild;

  if (letter_num == tutorial_letters.length - 1) {
    current_page.remove();
    view_area.appendChild(frames[5]);
    tutorial_mode = false;
  } else {
    tutorial_words[letter_num].classList.remove('current_letter');
    tutorial_words[letter_num + 1].classList.add('current_letter');
    document.querySelector('#tutorialMode .letterArea').textContent = tutorial_letters[letter_num + 1];

    for(let i = 0; i < data.length; i++) {
      if(data[i].word == tutorial_letters[letter_num + 1]) {
        data_image = data[i].html;
      }
    }
    document.querySelector('#tutorialMode .showImageArea').innerHTML = data_image;
    letter_num++;
  }

}

function remakeCanvas() {
  console.log('remake canvas');
  let mycanvas = createCanvas(640, 360);
  mycanvas.parent("#gameCanvas");
  video = createCapture(VIDEO);
  video.size(640, 360);
  video.hide();

  getRandomWord();
}

function getRandomWord() {
  console.log('get word');
  game_mode = true;
}

function showExplanation(e) {
  const data_level = e.getAttribute('data-level');
  explanations[data_level].classList.add('explanation__show');
}

function hiddenExplanation(e) {
  const data_level = e.getAttribute('data-level');
  explanations[data_level].classList.remove('explanation__show');
}

function backPage(e) {
  // const current_page_id = view_area.firstChild.nextElementSibling.id;
  current_page = view_area.firstElementChild;
  let data_index = e.getAttribute('data-index');
  current_page.remove();
  view_area.appendChild(frames[data_index]);

}

function navigation(slider) {
  let wrapper, dots, arrowLeft, arrowRight, backPageArrow;

  function markup(remove) {
    wrapperMarkup(remove);
    backPageArrowMarkup(remove);
    dotMarkup(remove);
    arrowMarkup(remove);
  }

  function removeElement(elment) {
    elment.parentNode.removeChild(elment)
  }
  function createDiv(className) {
    var div = document.createElement("div")
    var classNames = className.split(" ")
    classNames.forEach((name) => div.classList.add(name))
    return div
  }

  function arrowMarkup(remove) {
    if (remove) {
      removeElement(arrowLeft)
      removeElement(arrowRight)
      return
    }
    arrowLeft = createDiv("arrow arrow--left");
    arrowLeft.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    arrowLeft.addEventListener("click", () => slider.prev())
    arrowRight = createDiv("arrow arrow--right")
    arrowRight.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    arrowRight.addEventListener("click", () => slider.next())

    wrapper.appendChild(arrowLeft)
    wrapper.appendChild(arrowRight)
  }

  function wrapperMarkup(remove) {
    if (remove) {
      var parent = wrapper.parentNode
      while (wrapper.firstChild)
        parent.insertBefore(wrapper.firstChild, wrapper)
      removeElement(wrapper)
      return
    }
    wrapper = createDiv("navigation-wrapper")
    slider.container.parentNode.appendChild(wrapper)
    wrapper.appendChild(slider.container)
  }

  function dotMarkup(remove) {
    if (remove) {
      removeElement(dots)
      return
    }
    dots = createDiv("dots")
    slider.track.details.slides.forEach((_e, idx) => {
      var dot = createDiv("dot")
      dot.addEventListener("click", () => slider.moveToIdx(idx))
      dots.appendChild(dot)
    })
    wrapper.appendChild(dots)
  }

  function backPageArrowMarkup(remove) {
    if (remove) {
      removeElement(backPageArrow);
      return
    }
    backPageArrow = createDiv("backPageArrow");
    // backPageArrow.setAttribute('data-index', '9');
    backPageArrow.innerHTML = "<i class='fa-solid fa-arrow-left'></i>";
    backPageArrow.addEventListener("click", () => {
      markup(true);
      current_page = view_area.firstElementChild;
      current_page.remove();
      view_area.appendChild(frames[9]);
      // backPage();
    });

    wrapper.appendChild(backPageArrow);
  }

  function updateClasses() {
    var slide = slider.track.details.rel
    slide === 0
      ? arrowLeft.classList.add("arrow--disabled")
      : arrowLeft.classList.remove("arrow--disabled")
    slide === slider.track.details.slides.length - 1
      ? arrowRight.classList.add("arrow--disabled")
      : arrowRight.classList.remove("arrow--disabled")
    Array.from(dots.children).forEach(function (dot, idx) {
      idx === slide
        ? dot.classList.add("dot--active")
        : dot.classList.remove("dot--active")
    })
  }

  slider.on("created", () => {
    markup()
    updateClasses()
  })
  slider.on("optionsChanged", () => {
    console.log(2)
    markup(true)
    markup()
    updateClasses()
  })
  slider.on("slideChanged", () => {
    updateClasses()
  })
  slider.on("destroyed", () => {
    markup(true)
  })
}


