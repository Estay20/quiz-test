export class Question {
  constructor(data) {
    this.id = data.id;
    this.text = data.text;
    this.options = data.options;
    this.correctIndex = data.correctIndex;
  }

  isCorrect(answerIndex) {
    return answerIndex === this.correctIndex;
  }
}