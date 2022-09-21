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

window.onload = function () {
    frames = document.querySelectorAll('body .frame');
    console.log(frames);
    explanations = document.querySelectorAll('.explanation');
    yubimoji_example = document.querySelectorAll('body .yubimojiExample');
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
    } else {
        current_page.remove();
        view_area.appendChild(frames[data_index]);
    }
}

function getTutorialLetter() {

    let mycanvas = createCanvas(640, 320);
    mycanvas.parent("#tutorialCanvas");
    mycanvas.style("visibility", "visible");

    // 1文字ずつに分割
    tutorial_letters = tutorial_word.split('');
    // document.querySelector('.tutorialWord').textContent = tutorial_letter[0];
    const tutorial_word_area = document.querySelector('#tutorialMode .tutorialWordArea');
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
    console.log(data);
    for (let i = 0; i < data.length; i++) {
        
        if (data[i].word == current_letter) {
            data_image = data[i].html;
        }
    }
    document.querySelector('#tutorialMode .showImageArea').innerHTML = data_image;
    tutorial_mode = true;
    startCamera();
}

function changeLetterClass() {
    const tutorial_word_area = document.querySelector('.tutorialWordArea');
    const tutorial_words = tutorial_word_area.children;
    current_page = view_area.firstElementChild;

    if (letter_num == tutorial_letters.length - 1) {
        current_page.remove();
        view_area.appendChild(frames[5]);
        tutorial_mode = false;
        stopMediaPipeHands();
    } else {
        tutorial_words[letter_num].classList.remove('current_letter');
        tutorial_words[letter_num + 1].classList.add('current_letter');
        document.querySelector('#tutorialMode .letterArea').textContent = tutorial_letters[letter_num + 1];

        // 参考画像取得・表示
        for (let i = 0; i < data.length; i++) {
            if (data[i].word == tutorial_letters[letter_num + 1]) {
                data_image = data[i].html;
            }
        }
        document.querySelector('#tutorialMode .showImageArea').innerHTML = data_image;
        letter_num++;
    }

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
