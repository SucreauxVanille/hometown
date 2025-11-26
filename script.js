// =====================
// Stage 2対応完全版 script.js
// =====================

// =====================
// グローバル変数
// =====================
let currentStage = 1;       // 1 → 2
let gameEnabled = false;
let selectedIndex = null;
let lastClicked = null;
let repeatCount = 0;
let missCount = 0;
let missedIndexes = new Set();
let charIndex = 0;          // 当たりスイカ index

// DOM取得
const game = document.getElementById("game");
const intro = document.getElementById("intro");
const opening = document.getElementById("opening");
const curtainLeft = document.getElementById("curtainLeft");
const curtainRight = document.getElementById("curtainRight");
const luntu = document.getElementById("luntu");
const deku = document.getElementById("deku");

let watermelons = [];       // スイカDOMの配列

// =====================
// メッセージ画像ファイル
// =====================
const MSG_ATTACK = "attack.png";
const MSG_MISS   = "miss.png";
const MSG_HIT1   = "hit.png";
const MSG_HIT2   = "hit2.png";
const MSG_HIT3   = "hit3.png";
const MSG_CLEAR  = "clear.png";
const MSG_GAMEOVER = "gameover.png";
const MSG_START    = "start.png";

// =====================
// ステージ準備
// =====================
function setupStage1() {
  currentStage = 1;

  // Stage1スイカ
  watermelons = [
    document.getElementById("w0"),
    document.getElementById("w1"),
    document.getElementById("w2")
  ];
  watermelons.forEach(w => {
    w.style.display = "block";
    w.classList.remove("flash");
  });

  // Stage2スイカは非表示
  [document.getElementById("w3"), document.getElementById("w4")].forEach(w => {
    w.style.display = "none";
    w.classList.remove("flash");
  });

  charIndex = Math.floor(Math.random() * 3);
  resetGameVariables();
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
    w.classList.remove("flash");
  });

  charIndex = Math.floor(Math.random() * 5);
  resetGameVariables();
}

function resetGameVariables() {
  gameEnabled = false;
  selectedIndex = null;
  lastClicked = null;
  repeatCount = 0;
  missCount = 0;
  missedIndexes.clear();
  resetLuntu();
}

// =====================
// ステージクリア演出
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

  setTimeout(() => { intro.style.transition = "opacity 0.6s"; intro.style.opacity = 1; }, 600);
  setTimeout(() => { intro.style.opacity = 0; }, 1800);

  setTimeout(() => {
    intro.style.display = "none";
    curtainLeft.classList.remove("curtain-close");
    curtainRight.classList.remove("curtain-close");
    curtainLeft.classList.add("curtain-open");
    curtainRight.classList.add("curtain-open");

    setupStage2();
    gameEnabled = true;
  }, 2600);
}

function playFinalClearSequence() {
  alert("ステージ2 クリア！");
  resetToOpening();
}

// =====================
// ルントウ初期位置
// =====================
function resetLuntu() {
  luntu.style.left = "120px";
  luntu.style.top = "40px";
  luntu.style.opacity = 1;
}

// =====================
// reset to Opening
// =====================
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
// 照準点滅
// =====================
function setFlash(index) {
  watermelons.forEach(w => w.classList.remove("flash"));
  if (index !== null) watermelons[index].classList.add("flash");
}

// =====================
// ルントウ移動
// =====================
function moveLuntuTo(target) {
  const centerX = target.offsetLeft + target.offsetWidth / 2;
  const left = centerX - luntu.offsetWidth / 2;
  const top  = target.offsetTop - luntu.offsetHeight * 1.2;
  luntu.style.left = left + "px";
  luntu.style.top  = top + "px";
}

// =====================
// 攻撃演出
// =====================
function showAttackMessage(duration = 700) {
  return new Promise(resolve => {
    gameEnabled = false;

    const msgWindow = document.getElementById("messageWindow");
    const msgImage = document.getElementById("messageImage");
    msgImage.src = MSG_ATTACK;
    msgWindow.style.display = "block";

    setTimeout(() => {
      msgWindow.style.display = "none";
      gameEnabled = true;
      resolve();
    }, duration);
  });
}

// =====================
// 当たり演出
// =====================
async function playHitSequence() {
  gameEnabled = false;
  const msgWindow = document.getElementById("messageWindow");
  const msgImage = document.getElementById("messageImage");

  msgImage.src = MSG_HIT1;
  msgWindow.style.display = "block";
  await new Promise(r => setTimeout(r, 600));

  msgImage.src = MSG_HIT2;
  await new Promise(r => setTimeout(r, 600));

  msgImage.src = MSG_HIT3;
  await new Promise(r => setTimeout(r, 600));

  msgWindow.style.display = "none";
  luntu.classList.add("jump");
  await new Promise(r => setTimeout(r, 400));
  luntu.classList.remove("jump");

  // クリアメッセージ
  alert("クリア！");
  if (currentStage === 1) playStageClearSequence();
  else playFinalClearSequence();
}

// =====================
// クリック処理初期化
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

      await showAttackMessage(400);

      if (index === charIndex) {
        setFlash(null);
        selectedIndex = null;
        lastClicked = null;
        playHitSequence();
      } else {
        wm.style.display = "none";
        missCount++;
        if (missCount >= 2) resetToOpening();
      }
    });
  });
}

// =====================
// ゲーム開始
// opening.js側が呼ぶ
// =====================
function startGame() {
  setupStage1();
  initClickHandlers();
  gameEnabled = true;
  game.style.display = "block";
}
