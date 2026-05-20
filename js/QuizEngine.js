export class QuizEngine {
  constructor(data) {
    this.title = data.title;
    this.timeLimitSec = data.timeLimitSec;
    this.passThreshold = data.passThreshold;
    this.questions = data.questions;

    this.currentIndex = 0;
    this.answers = {}; // { questionId: selectedIndex }
    this.remainingTime = this.timeLimitSec;
    this.timerId = null;
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex];
  }

  selectAnswer(questionId, answerIndex) {
    this.answers[questionId] = answerIndex;
    this.saveState();
  }

  next() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.saveState();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.saveState();
    }
  }

  getResult() {
    let correct = 0;

    this.questions.forEach((q) => {
      if (this.answers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const total = this.questions.length;
    const percent = correct / total;

    return {
      correct,
      total,
      percent,
      passed: percent >= this.passThreshold
    };
  }

  startTimer(onTick, onEnd) {
    this.timerId = setInterval(() => {
      this.remainingTime--;

      onTick(this.remainingTime);
      this.saveState();

      if (this.remainingTime <= 0) {
        this.stopTimer();
        onEnd();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerId);
    this.timerId = null;
  }

  saveState() {
    localStorage.setItem(
      "quiz_state",
      JSON.stringify({
        currentIndex: this.currentIndex,
        answers: this.answers,
        remainingTime: this.remainingTime
      })
    );
  }

  loadState() {
    const saved = localStorage.getItem("quiz_state");
    if (!saved) return;

    const data = JSON.parse(saved);

    this.currentIndex = data.currentIndex ?? 0;
    this.answers = data.answers ?? {};
    this.remainingTime = data.remainingTime ?? this.timeLimitSec;
  }

  clearState() {
    localStorage.removeItem("quiz_state");
  }
}