
const HOLE_COUNT = 9;
const GAME_TIME = 30;

const board = document.getElementById("board");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const startButton = document.getElementById("startButton");
const message = document.getElementById("message");

let score = 0;
let timeLeft = GAME_TIME;
let gameRunning = false;
let currentMole = -1;

let moleTimer = null;
let countdownTimer = null;
let hideTimer = null;

let audioContext = null;
// ===== サウンド設定 =====
let bgmTimer = null;
let bgmStep = 0;
let bgmGain = null;
let soundEnabled = true;

// 音を鳴らす準備
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  if (!bgmGain) {
    bgmGain = audioContext.createGain();
    bgmGain.gain.value = 0.06;
    bgmGain.connect(audioContext.destination);
  }
}

// 音を1つ鳴らす
function playTone(frequency, duration, volume = 0.3, type = "sine") {
  if (!soundEnabled) return;

  initAudio();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(
    frequency,
    audioContext.currentTime
  );

  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

// ディグダを叩いたときの音
function playHitSound() {
  playTone(880, 0.12, 0.45, "triangle");
  playTone(1320, 0.09, 0.22, "sine");
}

// ゲーム終了音
function playEndSound() {
  playTone(523, 0.18, 0.3, "triangle");

  setTimeout(() => {
    playTone(659, 0.18, 0.3, "triangle");
  }, 180);

  setTimeout(() => {
    playTone(784, 0.35, 0.35, "triangle");
  }, 360);
}

// BGMを開始
function startBGM() {
  initAudio();
  stopBGM();

  const melody = [
    523, 659, 784, 659,
    587, 698, 880, 698,
    523, 659, 784, 1047,
    880, 784, 659, 523
  ];

  bgmStep = 0;

  bgmTimer = setInterval(() => {
    playTone(melody[bgmStep], 0.16, 0.12, "square");
    bgmStep = (bgmStep + 1) % melody.length;
  }, 220);
}

// BGMを停止
function stopBGM() {
  if (bgmTimer) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }
}

const holes = [];

// 9個の穴を作る
for (let i = 0; i < HOLE_COUNT; i++) {
  const hole = document.createElement("button");

  hole.className = "hole";
  hole.type = "button";
  hole.setAttribute("aria-label", "ディグダの穴");

  const mole = document.createElement("span");
  mole.className = "mole";

  const image = document.createElement("img");
  image.src = "IMG_0765.png";
  image.alt = "ディグダ";
  image.className = "diglett-image";

  mole.appendChild(image);
  hole.appendChild(mole);

  board.appendChild(hole);
  holes.push(hole);

  // ディグダを叩いたとき
  hole.addEventListener("click", () => {
    if (!gameRunning || i !== currentMole) {
      return;
    }

    score++;
    scoreDisplay.textContent = score;
    playHitSound();

    hole.classList.remove("active");
    hole.classList.add("hit");

    setTimeout(() => {
      hole.classList.remove("hit");
    }, 150);

    clearTimeout(hideTimer);
    currentMole = -1;

    // 次のディグダをすぐに出す
    showMole();
  });
}

// すべてのディグダを隠す
function hideMoles() {
  holes.forEach((hole) => {
    hole.classList.remove("active");
  });

  currentMole = -1;
  clearTimeout(hideTimer);
}

// ディグダをランダムに出す
function showMole() {
  if (!gameRunning) {
    return;
  }

  hideMoles();

  let nextMole;

  do {
    nextMole = Math.floor(Math.random() * HOLE_COUNT);
  } while (
    nextMole === currentMole &&
    HOLE_COUNT > 1
  );

  currentMole = nextMole;

  holes[nextMole].classList.add("active");

  // 0.7〜1.3秒で引っ込む
  const visibleTime = 700 + Math.random() * 600;

  hideTimer = setTimeout(() => {
    if (!gameRunning) {
      return;
    }

    holes[nextMole].classList.remove("active");
    currentMole = -1;

    // 少し間を空けて次を出す
    moleTimer = setTimeout(showMole, 250);
  }, visibleTime);
}

// 効果音を鳴らす
function playHitSound() {
  try {
    if (!audioContext) {
      audioContext = new (
        window.AudioContext ||
        window.webkitAudioContext
      )();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

const oscillator = audioContext.createOscillator();
const gain = audioContext.createGain();

// 高くてはっきりした「ピコン！」音
oscillator.type = "triangle";

oscillator.frequency.setValueAtTime(
  1000,
  audioContext.currentTime
);

oscillator.frequency.exponentialRampToValueAtTime(
  650,
  audioContext.currentTime + 0.08
);

    gain.gain.setValueAtTime(
      0.25,
      audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.15
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (error) {
    console.log("音声を再生できませんでした");
  }
}

// ゲーム開始
function startGame() {
  clearInterval(countdownTimer);
  clearTimeout(moleTimer);
  clearTimeout(hideTimer);

  score = 0;
timeLeft = GAME_TIME;
gameRunning = true;

// ★ここに追加
startBGM();

currentMole = -1;

  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;

  message.textContent = "ディグダをタップしてね！";
  startButton.textContent = "ゲーム中…";
  startButton.disabled = true;

  hideMoles();

  showMole();

  countdownTimer = setInterval(() => {
    timeLeft--;

    timeDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// ゲーム終了
function endGame() {
  gameRunning = false;
  stopBGM();

  clearInterval(countdownTimer);
  clearTimeout(moleTimer);
  clearTimeout(hideTimer);

  hideMoles();

  message.textContent =
    `終了！ ${score}匹のディグダを叩きました！`;

  startButton.textContent = "もう一度あそぶ";
  startButton.disabled = false;
}

// スタートボタン
startButton.addEventListener("click", startGame);
