const titleEl = document.getElementById("quiz-title");
const progressEl = document.getElementById("progress");
const timerEl = document.getElementById("timer");

const questionTextEl = document.getElementById("question-text");
const optionsForm = document.getElementById("options-form");

const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnFinish = document.getElementById("btn-finish");

const resultSection = document.getElementById("result-section");
const resultSummary = document.getElementById("result-summary");
const btnReview = document.getElementById("btn-review");
const btnRestart = document.getElementById("btn-restart");

btnRestart.onclick = () => {
  location.reload();
};


btnReview.onclick = () => {
  showAnswers();
};

let quizData;
let currentIndex = 0;
let answers = {};
let remainingTime;
let timer;

async function init() {
  const res = await fetch("./data/questions.json");
  quizData = await res.json();

  titleEl.textContent = quizData.title;
  remainingTime = quizData.timeLimitSec;

  startTimer();
  render();
}

function render() {
  const q = quizData.questions[currentIndex];

  progressEl.textContent = `Вопрос ${currentIndex + 1} из ${quizData.questions.length}`;
  questionTextEl.textContent = q.text;

  optionsForm.innerHTML = "";

  q.options.forEach((opt, i) => {
    const label = document.createElement("label");

    label.innerHTML = `
      <input type="radio" name="option" value="${i}">
      ${opt}
    `;

    if (answers[q.id] === i) {
      label.querySelector("input").checked = true;
    }

    label.addEventListener("change", () => {
      answers[q.id] = i;
    });

    optionsForm.appendChild(label);
  });

  btnPrev.disabled = currentIndex === 0;
  btnNext.disabled = false;
  btnFinish.disabled = currentIndex !== quizData.questions.length - 1;
}

btnNext.onclick = () => {
  if (currentIndex < quizData.questions.length - 1) {
    currentIndex++;
    render();
  }
};

btnPrev.onclick = () => {
  if (currentIndex > 0) {
    currentIndex--;
    render();
  }
};

btnFinish.onclick = finish;

function finish() {
  clearInterval(timer);

  let correct = 0;

  quizData.questions.forEach(q => {
    if (answers[q.id] === q.correctIndex) {
      correct++;
    }
  });

  const percent = correct / quizData.questions.length;

  resultSummary.innerHTML = `
    Правильных: ${correct} / ${quizData.questions.length}<br>
    Процент: ${Math.round(percent * 100)}%<br>
    Статус: ${percent >= quizData.passThreshold ? "Пройден" : "Не пройден"}
  `;

  document.querySelector(".header").style.display = "none";
  document.getElementById("question-section").style.display = "none";

  btnPrev.style.display = "none";
  btnNext.style.display = "none";
  btnFinish.style.display = "none";

  resultSection.classList.remove("hidden");
}

function startTimer() {
  timer = setInterval(() => {
    remainingTime--;

    const min = String(Math.floor(remainingTime / 60)).padStart(2, "0");
    const sec = String(remainingTime % 60).padStart(2, "0");

    timerEl.textContent = `${min}:${sec}`;

    if (remainingTime <= 0) {
      clearInterval(timer);
      finish();
    }
  }, 1000);
}

function showAnswers() {
  resultSection.innerHTML = `
    <h2>Разбор ответов</h2>
  `;

  quizData.questions.forEach((q, index) => {
    const userAnswer = answers[q.id];

    const block = document.createElement("div");
    block.className = "card";

    let optionsHtml = "";

    q.options.forEach((opt, i) => {
      let className = "";
      let marker = "";

      if (i === q.correctIndex) {
        className = "correct";
        marker = " ✅ (правильный)";
      }

      if (i === userAnswer && i !== q.correctIndex) {
        className = "wrong";
        marker = " ❌ (ваш ответ)";
      }

      optionsHtml += `
        <div class="${className}">
          ${opt}${marker}
        </div>
      `;
    });

    block.innerHTML = `
      <h3>Вопрос ${index + 1}</h3>
      <p>${q.text}</p>
      <div class="review-options">
        ${optionsHtml}
      </div>
    `;

    resultSection.appendChild(block);
  });
}

init();