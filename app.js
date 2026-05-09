const QUESTIONS_URL = "./questions.json";
const BATCH_SIZE = 5;

/** @typedef {{question: string, answer: string}} Card */

const els = {
  progress: document.getElementById("progress"),
  restartBtn: document.getElementById("restartBtn"),
  question: document.getElementById("question"),
  myAnswer: document.getElementById("myAnswer"),
  showAnswerBtn: document.getElementById("showAnswerBtn"),
  reveal: document.getElementById("reveal"),
  correctAnswer: document.getElementById("correctAnswer"),
  wrongBtn: document.getElementById("wrongBtn"),
  rightBtn: document.getElementById("rightBtn"),
  done: document.getElementById("done"),
  error: document.getElementById("error"),
  errorBody: document.getElementById("errorBody"),
};

/** @type {Card[]} */
let allCards = [];
/** @type {Card[]} */
let deck = [];
/** @type {Card[]} */
let batchCards = [];
/** @type {Card[]} */
let pending = [];
/** @type {Card[]} */
let review = [];
/** @type {Card|null} */
let current = null;

let revealShown = false;
let totalInitial = 0;
let masteredCount = 0;
let wrongCount = 0;
let batchNumber = 0;
let roundNumber = 1;

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function setHidden(el, hidden) {
  if (!el) return;
  el.hidden = !!hidden;
}

function setText(el, text) {
  if (!el) return;
  el.textContent = String(text ?? "");
}

function resetRevealUI() {
  revealShown = false;
  setHidden(els.reveal, true);
  els.showAnswerBtn.disabled = false;
  els.myAnswer.disabled = false;
  els.myAnswer.value = "";
  els.myAnswer.focus();
}

function updateProgress() {
  if (allCards.length === 0) {
    setText(els.progress, "Loading…");
    return;
  }

  const remainingInBatch = pending.length + (current ? 1 : 0);
  const remainingInDeck = deck.length;
  setText(
    els.progress,
    `Batch ${batchNumber}  |  Round ${roundNumber}  |  In batch: ${remainingInBatch}/${batchCards.length}  |  Remaining total: ${remainingInDeck}  |  Mastered: ${masteredCount}/${totalInitial}  |  Missed: ${wrongCount}`
  );
}

function showDone() {
  current = null;
  setHidden(els.done, false);
  setHidden(els.reveal, true);
  els.showAnswerBtn.disabled = true;
  els.myAnswer.disabled = true;
  setText(els.question, "—");
  updateProgress();
}

function beginNextBatch() {
  if (deck.length === 0) {
    showDone();
    return;
  }

  batchNumber += 1;
  roundNumber = 1;
  batchCards = deck.splice(0, BATCH_SIZE);
  pending = batchCards.slice();
  review = [];
  nextCard();
}

function finishBatch() {
  masteredCount += batchCards.length;
  batchCards = [];
  pending = [];
  review = [];
  current = null;
  beginNextBatch();
}

function maybeAdvanceRoundOrBatch() {
  if (pending.length > 0) return;

  if (review.length === 0) {
    finishBatch();
    return;
  }

  roundNumber += 1;
  pending = review;
  review = [];
}

function nextCard() {
  setHidden(els.error, true);
  setHidden(els.done, true);

  maybeAdvanceRoundOrBatch();
  if (pending.length === 0) return;

  const idx = Math.floor(Math.random() * pending.length);
  current = pending.splice(idx, 1)[0] ?? null;
  resetRevealUI();
  setText(els.question, current?.question ?? "—");
  setText(els.correctAnswer, "");
  updateProgress();
}

function showAnswer() {
  if (!current) return;
  revealShown = true;
  els.showAnswerBtn.disabled = true;
  els.myAnswer.disabled = true;
  setText(els.correctAnswer, current.answer ?? "");
  setHidden(els.reveal, false);
  els.rightBtn.focus();
}

function grade(isCorrect) {
  if (!current) return;
  if (!revealShown) return;

  if (!isCorrect) {
    wrongCount += 1;
    review.push(current);
  }

  current = null;
  nextCard();
}

function restart() {
  deck = allCards.slice();
  shuffleInPlace(deck);
  totalInitial = deck.length;
  masteredCount = 0;
  wrongCount = 0;
  batchNumber = 0;
  roundNumber = 1;
  batchCards = [];
  pending = [];
  review = [];
  current = null;
  setHidden(els.done, true);
  beginNextBatch();
}

async function load() {
  try {
    const res = await fetch(QUESTIONS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} while fetching ${QUESTIONS_URL}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("questions.json must be an array");

    allCards = data
      .filter((x) => x && typeof x.question === "string" && typeof x.answer === "string")
      .map((x) => ({ question: x.question.trim(), answer: x.answer.trim() }))
      .filter((x) => x.question.length > 0);

    if (allCards.length === 0) throw new Error("No valid cards found in questions.json");

    setHidden(els.restartBtn, false);
    restart();
  } catch (e) {
    setHidden(els.error, false);
    setHidden(els.done, true);
    setHidden(els.reveal, true);
    els.showAnswerBtn.disabled = true;
    els.myAnswer.disabled = true;
    setText(els.progress, "Error");
    setText(els.question, "—");
    setText(els.errorBody, e instanceof Error ? e.message : String(e));
  }
}

els.showAnswerBtn.addEventListener("click", showAnswer);
els.rightBtn.addEventListener("click", () => grade(true));
els.wrongBtn.addEventListener("click", () => grade(false));
els.restartBtn.addEventListener("click", restart);

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    if (!revealShown) showAnswer();
    return;
  }
  if (!revealShown) return;
  if (e.key === "ArrowRight") grade(true);
  if (e.key === "ArrowLeft") grade(false);
});

load();

