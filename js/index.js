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

let data;
let keyWord;
let label;

let current_page;

let frames = [];
let explanations;

let tutorial_word;
let tutorial_letters = [];


function preload() {
  data = loadJSON("./js/lib/yuko.json");
}

function onResults(results) {
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      g_landmarks = landmarks;
    }
    //追記必要
    calcAngleZero();
    calcAngle();
    calcDistance();
    inputs = [];
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
  let data_angle = [];
  let distance = 0;

  if (inputs.length > 0) {
    for (let i = 0; i < data.length; i++) {
      let squared_val = 0;
      data_angle = data[i].angles;
      // console.log(data_angle);
      for (let j = 0; j < inputs.length; j++) {
        squared_val += pow(data_angle[j] - inputs[j], 2);
      }
      distance = sqrt(squared_val);
      data[i].distance = distance;
    }
    data.sort(function (a, b) {
      if (a.distance > b.distance) return 1;
      else return -1;
    });
    // console.log(data);
    if (data[0].distance < 50) {
      console.log(data[0].word);
      label = data[0].word;
    } else {
      label = 'nothing';
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
  mycanvas.parent("#tutorialCanvas");
  video = createCapture(VIDEO);
  video.size(640, 360);
  video.hide();

  frames = document.querySelectorAll('body .frame');
  explanations = document.querySelectorAll('.explanation');
  console.log(explanations);

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
      fill(255, 0, 0);
      stroke(255, 0, 0);
      strokeWeight(1);
      rect(x - 2, y - 2, 4, 4);
      //text(i, x, y);

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

  // if (tutorial_letter[0] == 'ゆ') {
  //   document.querySelector('.showImageArea').innerHTML = '<img src="./images/yu.PNG">';
  // } else if (tutorial_letter[0] == 'う') {
  //   document.querySelector('.showImageArea').innerHTML = '<img src="./images/u_nuri.PNG">';
  // } else if (tutorial_letter[0] == 'こ') {
  //   document.querySelector('.showImageArea').innerHTML = '<img src="./images/ko.PNG">';
  // }

  // if (label == tutorial_letter[0]) {
  //   tutorial_letter.shift();
  //   document.querySelector('.tutorialWord').textContent = tutorial_letter[0];
  //   document.querySelector('.letterArea').textContent = tutorial_letter[0];
  // } else if (tutorial_letter.length == 0) {
  //   const current_page_id = view_area.firstChild.nextElementSibling.id;
  //   current_page = view_area.firstElementChild;
  //   if (current_page_id == "tutorialMode") {
  //     current_page.remove();
  //     view_area.appendChild(frames[5]);
  //   }

  // }
}

let view_area = document.querySelector('#viewArea');
//DOM control
window.onload = function () {
  console.log(frames);
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
  } else if (data_index == 9) {
    current_page.remove();
    view_area.appendChild(frames[data_index]);
    var slider = new KeenSlider("#my-keen-slider", {}, [navigation]);
  } else {
    current_page.remove();
    view_area.appendChild(frames[data_index]);
  }
}

function getTutorialLetter() {
  tutorial_letters = tutorial_word.split('');
  // document.querySelector('.tutorialWord').textContent = tutorial_letter[0];
  const tutorial_word_area = document.querySelector('.tutorialWordArea');
  for(let i=0; i<tutorial_letters.length; i++) {
    let add_tutorial_letter = document.createElement("span");
    add_tutorial_letter.innerText = tutorial_letters[i];
    if(i==0) {
      add_tutorial_letter.classList.add("current_letter");
    }
    tutorial_word_area.appendChild(add_tutorial_letter);
  }
  playTutorial();
}

let letter_num = 0;
function playTutorial() {
  const tutorial_word_area = document.querySelector('.tutorialWordArea');
  const tutorial_words = tutorial_word_area.children;
  current_page = view_area.firstElementChild;
  // console.log(tutorial_letters.length);
  // console.log(tutorial_words);
  if(label) {
    if(letter_num == tutorial_letters.length-1) {
      if(label == tutorial_letters[letter_num]){
        current_page.remove();
        view_area.appendChild(frames[5]);
      }
    }else if(label == tutorial_letters[letter_num]) {
      tutorial_words[letter_num].classList.remove('current_letter');
      tutorial_words[letter_num + 1].classList.add('current_letter');
      document.querySelector('.letterArea').textContent = tutorial_letters[letter_num+1];
      letter_num++;
    }
  }
  setTimeout(playTutorial, 300);
  
  
  // playTutorial();
}

function showExplanation(e) {
  const data_level = e.getAttribute('data-level');
  explanations[data_level].classList.add('explanation__show');
}

function hiddenExplanation(e) {
  const data_level = e.getAttribute('data-level');
  explanations[data_level].classList.remove('explanation__show');
}

function returnSelectMode() {
  // const current_page_id = view_area.firstChild.nextElementSibling.id;
  current_page = view_area.firstElementChild;
  console.log();
  current_page.remove();
  view_area.appendChild(frames[6]);

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
    backPageArrow.innerHTML = "<i class='fa-solid fa-arrow-left'></i>";
    backPageArrow.addEventListener("click", () => {
      markup(true);
    current_page = view_area.firstElementChild;
    current_page.remove();
    view_area.appendChild(frames[8]);
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


