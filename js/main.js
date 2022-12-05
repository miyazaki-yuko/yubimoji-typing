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
let score_count = 0;
let result_letter_count = 0;

let data_image;

let now_mediapipe = false;

let animation_page = view_area.firstElementChild;
let end_animation = false;

let page_array = [];
let yubimoji_image_array = [];

window.onload = function () {
  frames = document.querySelectorAll('body .frame');
  // console.log(frames);
  explanations = document.querySelectorAll('.explanation');
  yubimoji_example = document.querySelectorAll('body .yubimojiExample');

  // for (let i = 1; i < frames.length; i++) {
  //     frames[i].remove();
  // }
}

function pageTransitionAnimation(index, color, animation) {
  let bg_colors = ['#ffb344', '#00a19d', '#e05d5d'];
  shuffle(bg_colors, true);
  bg_colors.push(color);
  let transition_divs = animation_page.children;
  for (let i = 0; i < 4; i++) {
    let transition_div = transition_divs[i];
    transition_div.classList.add('appear');
    transition_div.style.background = bg_colors[i];
    transition_div.style.animationName = animation;
  }

  let turn_page_div = animation_page.firstElementChild;
  turn_page_div.addEventListener('animationend', () => {
    // console.log('animation end');
    turnNextPage(index);
  }, { once: true });
}

function removeAnimationClass() {
  let transition_divs = animation_page.children;
  for (let i = 0; i < 4; i++) {
    let transition_div = transition_divs[i];
    transition_div.classList.remove('appear');
  }
}

function setAnimation(e) {
  const animation_status = e.getAttribute('animation');
  const data_index = e.getAttribute('data-index');

  if (animation_status == 'on') {
    if (data_index == 1) {
      pageTransitionAnimation(data_index, '#fff8e5', 'LeftAnime');
    } else if (data_index == 4) {
      pageTransitionAnimation(data_index, '#ffeead', 'LeftAnime');
    } else if (data_index == 6) {
      pageTransitionAnimation(data_index, '#fff8e5', 'LeftAnime');
    }
  } else {
    turnNextPage(data_index);
  }
}

function turnNextPage(index) {
  current_page = view_area.firstElementChild.nextElementSibling;
  const data_index = index;
  // console.log(data_index);
  let last_animation_div = animation_page.lastElementChild;
  last_animation_div.addEventListener('animationend', () => {
    // console.log('remove class')
    removeAnimationClass();
  });

  // Tutorial Name Input 
  // 入力されてなければ注意を出す(要：文字列のみ受け付け・ひらがなのみ受け付け)
  if (data_index == 3) {
    let user_name = document.querySelector('#typeYourName');
    if (user_name.value) {
      if (user_name.value.match(/^[ぁ-んー　]*$/)) {
        tutorial_word = user_name.value;
        current_page.remove();
        view_area.appendChild(frames[data_index]);
        getTutorialLetter();
      } else {
        document.querySelector('.cautionText').innerHTML = "ひらがなで入力してください";
      }

    } else {
      document.querySelector('.cautionText').innerHTML = "名前を入力してください";
      // alert('名前を入力してください');
    }
  } else if (data_index == 4) { // Tutorial Mode
    startMediaPipeHands();
    current_page.remove();
    view_area.appendChild(frames[data_index]);
  } else if (data_index == 6) { // Skip Tutorial Button
    if (document.querySelector('#tutorialMode')) {
      // Tutorial Modeがdocument内にあったら消去する
      document.querySelector('#tutorialMode').remove();
      tutorial_mode = false;
      // console.log(now_mediapipe);
      if (now_mediapipe) {
        stopMediaPipeHands();
      }
    }
    current_page.remove();
    view_area.append(frames[data_index]);
  } else if (data_index == 7 || data_index == 8) { // Game Mode
    current_page.remove();
    view_area.append(frames[data_index]);
    remakeCanvas();
    for (let i = 0; i < explanations.length; i++) {
      explanations[i].classList.remove('explanation__show');
    }
  } else if (data_index == 9) {
    current_page.remove();
    view_area.appendChild(frames[data_index]);
    showResult();
  } else if (data_index == 10) {
    current_page.remove();
    view_area.appendChild(frames[data_index]);
    showYubimojiList();
  } else { // その他ページ遷移
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
  current_page = view_area.firstElementChild.nextElementSibling;

  if (letter_num == letters.length - 1) { // キーワードの最後の文字が認識されたら
    if (tutorial_mode) {
      // Tutorial Mode終了
      turnNextPage(5);
      tutorial_mode = false;
      stopMediaPipeHands();
    } else if (game_mode) {
      changeScore();
      // 前に取ったキーワードを削除
      while (word_area.firstChild) {
        word_area.removeChild(word_area.firstChild);
      }
      // 新しくキーワードを追加
      getRandomWord();
    }
  } else { // キーワードの途中の文字が認識されたら
    // classの変更
    letters[letter_num].classList.remove('current_letter');
    letters[letter_num + 1].classList.add('current_letter');
    if (current_page.id == "gameModeGuide" || tutorial_mode) {
      showNextSamples(letters);
    }
    letter_num++;

    if (game_mode) {
      changeScore();
    }
  }
}

function changeScore() {
  let score = document.querySelector('#score');
  score.innerText = `${score_count}`;
}

function showNextSamples(letters) {
  // console.log('show next samples');
  // example areaの文字追加
  document.querySelector('.letterArea').innerText = letters[letter_num + 1].innerText;


  // 参考画像取得・表示
  for (let i = 0; i < data.length; i++) {
    if (data[i].word == letters[letter_num + 1].innerText) {
      data_image = data[i].html;
    }
  }
  document.querySelector('.showImageArea').innerHTML = data_image;
}

function showCurrentSamples() {
  const current_letter = document.querySelector(".current_letter");
  // console.log(current_letter);

  document.querySelector('.letterArea').innerText = current_letter.innerText;
  for (let i = 0; i < data.length; i++) {
    if (data[i].word == current_letter.innerText) {
      data_image = data[i].html;
    }
  }
  document.querySelector('.showImageArea').innerHTML = data_image;
}

function deleteSamples() {
  document.querySelector('.letterArea').innerText = "";
  document.querySelector('.showImageArea').innerHTML = "";
}

function remakeCanvas() {
  // スコア・タイム・カウント開始フラグのリセット
  score_count = 0;
  result_letter_count = 0;
  time_count = 30;
  g_landmarks = [];
  game_start = false;
  let score = document.querySelector('#score');
  score.innerText = `${score_count}`;
  let time = document.querySelector('#time');
  time.innerText = `${time_count}`;

  // console.log('remake canvas');

  // videoがなければ作成する
  let camera_container = document.querySelector('#viewArea .cameraContainer');
  if (document.querySelector('#viewArea .input_video') == null) {
    // console.log('no video');
    let new_video = document.createElement('video');
    new_video.classList.add('input_video');
    camera_container.prepend(new_video);
  }

  // Mediapipe Hands用のキャンバスを作成する
  let mycanvas = createCanvas(640, 360);
  mycanvas.parent("#gameCanvas");

  startMediaPipeHands();

  getRandomWord();
}

function getRandomWord() {
  current_page = view_area.firstElementChild.nextElementSibling;
  let length = Object.keys(word_data).length;
  let r = int(random(0, length));
  let keyword = word_data[r].kana;

  // add html
  game_letters = keyword.split('');
  const word_area = document.querySelector('.wordArea');

  // 前のゲームで取得したキーワードがあれば消しとく
  while (word_area.firstChild) {
    word_area.removeChild(word_area.firstChild);
  }
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

  // 入門の時だけ参考画像と文字を追加
  if (current_page.id == "gameModeGuide") {
    const game_letters_area = document.querySelector('.letterArea');
    game_letters_area.innerText = game_letters[0];

    // 1文字目の画像を取得・表示
    const current_letter = document.querySelector('.current_letter').innerText;
    for (let i = 0; i < data.length; i++) {
      if (data[i].word == current_letter) {
        data_image = data[i].html;
      }
    }
    document.querySelector('#gameModeGuide .showImageArea').innerHTML = data_image;
  }

  // 文字数カウントリセット
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

function showYubimojiImages(e) {
  const id = e.getAttribute('id');
  current_page = view_area.firstElementChild.nextElementSibling;
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
      turnNextPage(10);
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
  if (score_count >= 50 && score_count < 80) {
    comment = "いいスピードですね";
    rank = "中級者";
  } else if (score_count >= 80) {
    comment = "すごい！達人級です";
    rank = "上級者";
  }
  result_rank.innerText = rank;
  result_comment.innerText = comment;

}

function showYubimojiList() {
  let yubimoji_list = document.querySelector('#yubimojiImageContainer');

  let no_image = [36, 38, 46, 48];

  for (let i = 0; i < data.length; i++) {
    let yubimoji_div = document.createElement('div');
    let letter_div = document.createElement('div');
    letter_div.classList.add('letter');
    // やゆよ　わをん　の列を間に開ける
    if (no_image.indexOf(i) == -1) { // no_imageの中に値がなければ
      letter_div.innerText = data[i].word;
      yubimoji_div.innerHTML = data[i].html;
    }
    // letter_div を先頭に追加
    yubimoji_div.prepend(letter_div);
    yubimoji_list.appendChild(yubimoji_div);

    // モーダル用の配列
    yubimoji_image_array.push(yubimoji_div);
  }

  console.log(yubimoji_image_array);
  let modal_area = document.querySelector('#modal_area');
  let modal_container = document.querySelector('.modal_container');
  for (let i = 0; i < yubimoji_image_array.length; i++) {
    yubimoji_image_array[i].addEventListener('click', function () {
      // console.log(i + 'clicked');
      // console.log(yubimoji_image_array[i].innerHTML);
      modal_container.innerHTML = yubimoji_image_array[i].innerHTML;
      modal_area.classList.add('show');
    });
  }
  modal_area.addEventListener('click', function () {
    modal_area.classList.remove('show');
  });
}

function reStart() {
  // console.log(current_page);
  if (current_page.id == "gameModeGuide") {
    turnNextPage(7);
  } else if (current_page.id == "gameMode") {
    turnNextPage(8);
  }
}

