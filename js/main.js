let view_area = document.querySelector('#viewArea');
let current_page;

let frames = [];
let explanations;
let yubimoji_example = [];

let tutorial_word;
let tutorial_letters = [];
let tutorial_mode = false;
let game_mode = false;
let letter_num = 0; // 文字数

let data_image;

let score_count = 0;
let result_letter_count = 0;

window.onload = function () {
    frames = document.querySelectorAll('body .frame');
    console.log(frames);
    explanations = document.querySelectorAll('.explanation');
    yubimoji_example = document.querySelectorAll('body .yubimojiExample');
    // for (let i = 1; i < frames.length; i++) {
    //     frames[i].remove();
    // }
}

function turnNextPage(e) {
    current_page = view_area.firstElementChild;
    const data_index = e.getAttribute('data-index');
  
    if (data_index == 3) {
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
    } else if (data_index == 4) {
        
      startMediaPipeHands();
      current_page.remove();
      view_area.append(frames[data_index]);
    } else if (data_index == 6) {
      if(document.querySelector('#tutorialMode')) {
        document.querySelector('#tutorialMode').remove();
        tutorial_mode = false;
      }
      current_page.remove();
      view_area.append(frames[data_index]);
    } else if (data_index == 7) {
      current_page.remove();
      view_area.append(frames[data_index]);
      remakeCanvas();
    } else {
      current_page.remove();
      view_area.appendChild(frames[data_index]);
    }
  }

  function getTutorialLetter() {
    // 1文字ずつに分割
    tutorial_letters = tutorial_word.split('');
    // document.querySelector('.tutorialWord').textContent = tutorial_letter[0];
    const tutorial_word_area = document.querySelector('#tutorialMode .wordArea');
    const tutorial_letter_area = document.querySelector('#tutorialMode .letterArea');
    // 1文字目をhtmlに追加
    tutorial_letter_area.innerText = tutorial_letters[0];
  
    for (let i = 0; i < tutorial_letters.length; i++) {
      // spanタグを追加
      let span_tutorial_letter = document.createElement("span");
      span_tutorial_letter.innerText = tutorial_letters[i];
      // 1文字目を太く黒くする
      if (i == 0) {
        span_tutorial_letter.classList.add("current_letter");
      }
      // htmlにチュートリアルの文字全部を追加
      tutorial_word_area.appendChild(span_tutorial_letter);
    }
  
    // 1文字目の画像を取得・表示
    const current_letter = document.querySelector('.current_letter').innerText;
    for (let i = 0; i < data.length; i++) {
      if (data[i].word == current_letter) {
        data_image = data[i].html;
      }
    }
    document.querySelector('#tutorialMode .showImageArea').innerHTML = data_image;
    tutorial_mode = true;
    // startMediaPipeHands();
  }

function changeLetterClass() {
    const word_area = document.querySelector('.wordArea');
    const letters = word_area.children;
    current_page = view_area.firstElementChild;
  
    if (letter_num == letters.length - 1) {
      if (tutorial_mode) {
        current_page.remove();
        view_area.appendChild(frames[5]);
        tutorial_mode = false;
        stopMediaPipeHands();
      } else if (game_mode) {
        score_count += 5;
        result_letter_count++;
        let score = document.querySelector('#score');
        score.innerText = `${score_count}`;
        while(word_area.firstChild) {
          word_area.removeChild(word_area.firstChild);
        }
        getRandomWord();
      }
  
      
    } else {
      letters[letter_num].classList.remove('current_letter');
      letters[letter_num + 1].classList.add('current_letter');
      document.querySelector('.letterArea').textContent = letters[letter_num + 1].innerText;
  
      // 参考画像取得・表示
      for (let i = 0; i < data.length; i++) {
        if (data[i].word == letters[letter_num + 1].innerText) {
          data_image = data[i].html;
        }
      }
      document.querySelector('.showImageArea').innerHTML = data_image;
      letter_num++;
  
      if(game_mode) {
        score_count += 5;
        result_letter_count++;
        console.log(score_count);
        let score = document.querySelector('#score');
        score.innerText = `${score_count}`;
      }
    }
}

function remakeCanvas() {
    score_count = 0;
    time_count = 0;
    game_start = false;
    g_landmarks = [];
    let score = document.querySelector('#score');
    score.innerText = `${score_count}`;
    let time = document.querySelector('#time');
    time.innerText = `${time_count}`;
  
    let camera_container = document.querySelector('.cameraContainer');
    console.log(document.querySelector('.cameraContainer .input_video'));
    if(document.querySelector('.input_video')  == null) {
      console.log('no video');
      let new_video = document.createElement('video');
      new_video.classList.add('input_video');
      camera_container.prepend(new_video);
    }
    startMediaPipeHands();
    console.log('remake canvas');
    let mycanvas = createCanvas(640, 360);
    mycanvas.parent("#gameCanvas");
  
    getRandomWord();
  }

function getRandomWord() {
    // console.log(word_data);
    let length = Object.keys(word_data).length;
    let r = int(random(0, length));
    let keyword = word_data[r].kana;
    // console.log(word_data[r].kana);
  
    // add html
    game_letters = keyword.split('');
    console.log(game_letters);
    const word_area = document.querySelector('#gameMode .wordArea');
    const game_letters_area = document.querySelector('#gameMode .letterArea');
  
    while(word_area.firstChild) {
      word_area.removeChild(word_area.firstChild);
    }
  
    game_letters_area.innerText = game_letters[0];
  
    for (let i = 0; i < game_letters.length; i++) {
      // spanタグを追加
      let span_game_letters = document.createElement("span");
      span_game_letters.innerText = game_letters[i];
      // 1文字目を太く黒くする
      if (i == 0) {
        span_game_letters.classList.add("current_letter");
      }
      // htmlにチュートリアルの文字全部を追加
      word_area.appendChild(span_game_letters);
    }
  
    // 1文字目の画像を取得・表示
    const current_letter = document.querySelector('.current_letter').innerText;
    for (let i = 0; i < data.length; i++) {
      if (data[i].word == current_letter) {
        data_image = data[i].html;
      }
    }
    document.querySelector('#gameMode .showImageArea').innerHTML = data_image;
    letter_num = 0;
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

function showYubimojiImages(e) {
    const id = e.getAttribute('id');
    current_page = view_area.firstElementChild;
    if (id == 'aGyou') {
        current_page.remove();
        view_area.appendChild(yubimoji_example[0]);
        var slider = new KeenSlider("#my-keen-slider", {}, [navigation]);
    } else if (id == 'kaGyou') {
        current_page.remove();
        view_area.appendChild(yubimoji_example[1]);
        var slider = new KeenSlider("#my-keen-slider", {}, [navigation]);
    } else if (id == 'saGyou') {
        current_page.remove();
        view_area.appendChild(yubimoji_example[2]);
        var slider = new KeenSlider("#my-keen-slider", {}, [navigation]);
    } else if (id == 'taGyou') {
        current_page.remove();
        view_area.appendChild(yubimoji_example[3]);
        var slider = new KeenSlider("#my-keen-slider", {}, [navigation]);
    } else if (id == 'naGyou') {
        current_page.remove();
        view_area.appendChild(yubimoji_example[4]);
        var slider = new KeenSlider("#my-keen-slider", {}, [navigation]);
    } else if (id == 'haGyou') {
        current_page.remove();
        view_area.appendChild(yubimoji_example[5]);
        var slider = new KeenSlider("#my-keen-slider", {}, [navigation]);
    } else if (id == 'maGyou') {
        current_page.remove();
        view_area.appendChild(yubimoji_example[6]);
        var slider = new KeenSlider("#my-keen-slider", {}, [navigation]);
    } else if (id == 'yaGyou') {
        current_page.remove();
        view_area.appendChild(yubimoji_example[7]);
        var slider = new KeenSlider("#my-keen-slider", {}, [navigation]);
    } else if (id == 'raGyou') {
        current_page.remove();
        view_area.appendChild(yubimoji_example[8]);
        var slider = new KeenSlider("#my-keen-slider", {}, [navigation]);
    } else if (id == 'waGyou') {
        current_page.remove();
        view_area.appendChild(yubimoji_example[9]);
        var slider = new KeenSlider("#my-keen-slider", {}, [navigation]);
    }
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

function showResult() {
    stopMediaPipeHands();
    game_mode = false;
    current_page = view_area.firstElementChild;
    current_page.remove();
    view_area.appendChild(frames[8]);
  
    // show score
    let result_score = document.querySelector('.resultScore');
    result_score.innerText = `${score_count}`;
    // show letter num
    let result_letter_num = document.querySelector('.resultLetterNum');
    result_letter_num.innerText = `${result_letter_count}`;
    // change rank
    let rank = "初級者";
    let comment = "慣れていきましょう";
    let result_rank = document.querySelector('.resultRank');
    let result_comment = document.querySelector('.comment .innerText');
    if(score_count >= 15 && score_count < 25) {
      comment = "いいスピードですね";
      rank = "中級者";
    } else if (score_count >= 25) {
      comment = "すごい！達人級です";
      rank = "上級者";
    }
    result_rank.innerText = rank;
    result_comment.innerText = comment;
  
  }
