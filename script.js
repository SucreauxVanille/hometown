// Stage 2対応版 script.js

// =====================
// グローバル変数
// =====================
let currentStage = 1; // 1 → 2
let gameEnabled = false;
let selectedIndex = null;
let lastClicked = null;
let repeatCount = 0;
let missCount = 0;
let missedIndexes = new Set();

// DOM取得
const game = document.getElementById("game");
const intro = document.getElementById("intro");
const opening = document.getElementById("opening");
const curtainLeft = document.getElementById("curtainLeft");
const curtainRight = document.getElementById("curtainRight");
const luntu = document.getElementById("luntu");
const deku = document.getElementById("deku");

let watermelons = []; // スイカDOMの配列
let charIndex = 0; // 当たりスイカ index

// =====================
// ステージ準備
// =====================
function setupStage1() {
  currentStage = 1;
  watermelons = [
    document.getElementById("w0"),
    document.getElementById("w1"),
    document.getElementById("w2")
  ];
  watermelons.forEach(w => w.style.display = "block");
  charIndex = Math.floor(Math.random() * 3);
}

function setupStage2() {
  currentStage = 2;
  watermelons = [
    document.getElementById("w0"),
    document.getElementById("w1"),
    document.getElementById("w2"),
    document.getElementById("w3"),
    document.getElementById("w4")
  ];
  const pos = [
    {x: 80,  y: 110},
    {x: 240, y: 110},
    {x: 40,  y: 200},
    {x: 160, y: 200},
    {x: 280, y: 200}
  ];
  watermelons.forEach((w, i) => {
    w.style.left = pos[i].x + "px";
    w.style.top  = pos[i].y + "px";
    w.style.display = "block";
  });
  charIndex = Math.floor(Math.random() * 5);
}

// =====================
// ステージクリア時の進行
// =====================
function playStageClearSequence() {
  gameEnabled = false;

  intro.src = "next.gif";
  intro.style.opacity = 0;
  intro.style.display = "block";

  curtainLeft.style.display = "block";
  curtainRight.style.display = "block";
  curtainLeft.classList.add("curtain-close");
  curtainRight.classList.add("curtain-close");

  setTimeout(() => {
    intro.style.transition = "opacity 0.6s";
    intro.style.opacity = 1;
  }, 600);

  setTimeout(() => {
    intro.style.opacity = 0;
  }, 1800);

  setTimeout(() => {
    intro.style.display = "none";
    curtainLeft.classList.remove("curtain-close");
    curtainRight.classList.remove("curtain-close");
    curtainLeft.classList.add("curtain-open");
    curtainRight.classList.add("curtain-open");

    setupStage2();
    resetLuntu();
    gameEnabled = true;
  }, 2600);
}

function playFinalClearSequence() {
  alert("ステージ2 クリア！（ダミー演出）");
  resetToOpening();
}

function resetLuntu() {
  luntu.style.left = "120px";
  luntu.style.top = "40px";
  luntu.style.opacity = 1;
}

function resetToOpening() {
  game.style.display = "none";
  opening.style.display = "flex";

  curtainLeft.style.display = "block";
  curtainRight.style.display = "block";
  curtainLeft.className = "curtain";
  curtainRight.className = "curtain";

  resetIntro();
}

function resetIntro() {
  intro.src = "intro.gif";
  intro.style.display = "none";
  void intro.offsetWidth;
}

// =====================
// 点滅管理
// =====================
function setFlash(index) {
  watermelons.forEach(w => w.classList.remove("flash"));
  if (index !== null) watermelons[index].classList.add("flash");
}

// =====================
// クリック処理
// =====================
function initClickHandlers() {
  watermelons.forEach((wm, index) => {
    wm.addEventListener("click", async () => {
      if (!gameEnabled) return;

      if (selectedIndex !== index) {
        selectedIndex = index;
        lastClicked = index;
        repeatCount = 0;
        setFlash(index);
        moveLuntuTo(wm);
        return;
      }

      repeatCount++;
      if (repeatCount >= 2) return;

      await showAttackMessage(300);

      if (index === charIndex) {
        if (currentStage === 1) playStageClearSequence();
        else playFinalClearSequence();
      } else {
        wm.style.display = "none";
        missCount++;
        if (missCount >= 2) resetToOpening();
      }

      selectedIndex = null;
      setFlash(null);
    });
  });
}

// ダミー
function moveLuntuTo(){ }
function showAttackMessage(){ return new Promise(r=>setTimeout(r,300)); }

// =====================
// ゲーム開始（opening.js側が呼ぶ）
// =====================
function startGame() {
  setupStage1();
  initClickHandlers();
  gameEnabled = true;
  game.style.display = "block";
}
