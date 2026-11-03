const HOLE_COUNT = 12;
const GAME_TIME = 30;

const board = document.getElementById("board");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const startButton = document.getElementById("startButton");
const message = document.getElementById("message");

let score = 0;
let timeLeft = GAME_TIME;
let gameRunning = false;
let moleTimer = null;
let countdownTimer = null;
let currentMole = -1;

const holes = [];

for (let i = 0; i < HOLE_COUNT; i++) {
  const hole = document.createElement("button");
  hole.className = "hole";
  hole.type = "button";
  hole.setAttribute("aria-label", "モグラの穴");

  const mole = document.createElement("span");
  mole.className = "mole";
  mole.textContent = "🐹";

  hole.appendChild(mole);
  board.appendChild(hole);
  holes.push(hole);

  hole.addEventListener("click", () => {
    if (!gameRunning || i !== currentMole) return;

    score++;
    scoreDisplay.textContent = score;

    hole.classList.remove("active");
    hole.classList.add("hit");

    setTimeout(() => {
      hole.classList.remove("hit");
    }, 200);

    currentMole = -1;
  });
}

function hideMoles() {
  holes.forEach((hole) => {
    hole.classList.remove("active");
  });
  currentMole = -1;
}

function showMole() {
  if (!gameRunning) return;

  hideMoles();

  const nextMole = Math.floor(Math.random() * HOLE_COUNT);
  currentMole = nextMole;

  holes[nextMole].classList.add("active");
}

function startGame() {
  score = 0;
  timeLeft = GAME_TIME;
  gameRunning = true;

  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  message.textContent = "モグラをタップしてね！";
  startButton.textContent = "ゲーム中…";
  startButton.disabled = true;

  hideMoles();

  showMole();

  moleTimer = setInterval(showMole, 800);

  countdownTimer = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameRunning = false;

  clearInterval(moleTimer);
  clearInterval(countdownTimer);

  hideMoles();

  message.textContent = `終了！ ${score}点でした！`;
  startButton.textContent = "もう一度あそぶ";
  startButton.disabled = false;
}

startButton.addEventListener("click", startGame);
