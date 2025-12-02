// ============================================
// ▼ ゲーム本編制御
// ============================================
import { showGameOver } from "./gameover.js";

const luntu = document.getElementById("luntu");
const watermelons = [
  document.getElementById("w0"),
  document.getElementById("w1"),
  document.getElementById("w2")
];
const msgWindow = document.getElementById("messageWindow");
const msgImage = document.getElementById("messageImage");

// 画像ファイル名
const MSG_START = "start.png";
const MSG_ATTACK = "attack.png";
const MSG_MISS = "miss.png";
const MSG_HIT1 = "hit.png";
const MSG_HIT2 = "hit2.png";
const MSG_HIT3 = "hit3.png";
const MSG_CLEAR = "clear.png";

let charIndex = 0;
let lastClicked = -1;
let gameEnabled = false;
let missCount = 0;
let missedIndexes = new Set();
let repeatCount = 0;
let selectedIndex = null; // 照準中のスイカ index

//ウェイト
function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// -----------------------------
// メッセージ表示
// -----------------------------
function showMessage(imgName, onClick = null) {
  msgImage.src = imgName;
  msgWindow.style.display = "block";
  msgWindow.onclick = () => {
    msgWindow.style.display = "none";
    if (onClick) onClick();
  };
}

// -----------------------------
// ゲーム初期化
// -----------------------------
function initGame() {
  // Stage1 では w3, w4 を非表示
  ["w3", "w4"].forEach(id => {
    const w = document.getElementById(id);
    if (w) w.style.display = "none";
  });

  // 既存処理
  watermelons.forEach(w => {
    w.style.display = "block";
    w.classList.remove("flash");
  });

  luntu.style.left = "120px";
  luntu.style.top = "40px";

  charIndex = Math.floor(Math.random() * 3);
  lastClicked = -1;
  missCount = 0;
  missedIndexes.clear();
  repeatCount = 0;
  gameEnabled = false;

  showMessage(MSG_START, () => {
    gameEnabled = true;
  });
}
window.initGame = initGame;

// -----------------------------
// ルントウ移動：スイカ中央＋y位置調整
// -----------------------------
function moveLuntuTo(target) {
  const targetCenterX = target.offsetLeft + target.offsetWidth / 2;
  const luntuLeft = targetCenterX - luntu.offsetWidth / 2;
  const luntuTop = target.offsetTop - luntu.offsetHeight - 0.2 * luntu.offsetHeight;
  luntu.style.left = `${luntuLeft}px`;
  luntu.style.top = `${luntuTop}px`;
}

// -----------------------------
// 攻撃演出
// -----------------------------
function showAttackMessage(duration = 700) {
  return new Promise(resolve => {
    gameEnabled = false;
    showMessage(MSG_ATTACK);
    setTimeout(() => {
      msgWindow.style.display = "none";
      gameEnabled = true;
      resolve();
    }, duration);
  });
}

// -----------------------------
// 当たり演出
// -----------------------------

async function playHitSequence() {
  gameEnabled = false;
  
  showMessage(MSG_HIT1);
  await new Promise(r => setTimeout(r, 600));

  showMessage(MSG_HIT2);
  await new Promise(r => setTimeout(r, 600));

  showMessage(MSG_HIT3);
  await new Promise(r => setTimeout(r, 600));

  // 勝利の舞
  await playClearDance();

  // -------------------------
  // Stage1 のオブジェクトを非表示・無効化
  // -------------------------
  watermelons.forEach(w => w.style.display = "none");
  luntu.style.display = "none";
  msgWindow.style.display = "none";
  
  // -------------------------
  // カーテン出現（暗転）
  // -------------------------
  curtainLeft.style.display = "block";
  curtainRight.style.display = "block";
  curtainLeft.classList.add("curtain-show");
  curtainRight.classList.add("curtain-show");

  // -------------------------
  // Stage2.js 読み込み
  // -------------------------
  await loadStage2Script();

  // -------------------------
  // Stage2 開始（カーテン・next.gif 演出は stage2 内で処理）
  // -------------------------
  startStage2();
}

// ステージ2スクリプト読み込み
function loadStage2Script() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "stage2.js";
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

// -----------------------------
// スイカ照準
// -----------------------------
function setFlash(index) {
  watermelons.forEach(w => w.classList.remove("flash"));
  if (index === null) return;
  watermelons[index].classList.add("flash");
}

// -----------------------------
// スイカクリック処理（ゲームオーバー統合版）
// -----------------------------
watermelons.forEach((wm, index) => {
  wm.addEventListener("click", async () => {
    if (!gameEnabled) return;

    // 1回目クリック：選択＆移動
    if (selectedIndex !== index) {
      selectedIndex = index;
      setFlash(index);
      lastClicked = index;
      repeatCount = 0;
      moveLuntuTo(wm);
      return;
    }

    // 2回目クリック：攻撃
    repeatCount++;
    if (repeatCount >= 2) return;

    await showAttackMessage(400);
    luntu.classList.add("jump");
    await wait(300);
    luntu.classList.remove("jump");

    // 正解ヒット
    if (index === charIndex) {
      setFlash(null);
      selectedIndex = null;
      lastClicked = null;
      playHitSequence();
      return;
    }

    // ミス処理
    if (!missedIndexes.has(index)) {
      missedIndexes.add(index);
      missCount++;
    }
    wm.style.display = "none";

    // ★ 2ミス → gameover.js 呼び出し
    if (missCount >= 2) {

      gameEnabled = false; // ロック
      setFlash(null);
      selectedIndex = null;
      lastClicked = null;

      // Stage1 のメッセージウィンドウを直接渡して gameover 演出へ
      showGameOver(
        luntu,
        msgWindow,
        msgImage,
        initGame // ← Stage1専用リセット関数
      );

      return;
    }

    // 1ミス時：miss表示のみ
    showMessage(MSG_MISS);
    setFlash(null);
    selectedIndex = null;
    lastClicked = null;
  });
});


// -----------------------------
// 勝利の舞
// -----------------------------
async function playClearDance() {
  gameEnabled = false;
  luntu.style.left = "120px";
  luntu.style.top = "40px";

  for (let set = 0; set < 2; set++) {
    for (let jump = 0; jump < 2; jump++) {
      luntu.classList.add("jump");
      await new Promise(r => setTimeout(r, 400));
      luntu.classList.remove("jump");
      await new Promise(r => setTimeout(r, 50));
    }
    await new Promise(r => setTimeout(r, 50));
    luntu.style.transform = "scaleX(-1)";
    await new Promise(r => setTimeout(r, 400));
    luntu.style.transform = "scaleX(1)";
    await new Promise(r => setTimeout(r, 300));
  }

  luntu.classList.add("jump");
  await new Promise(r => setTimeout(r, 400));
  luntu.classList.remove("jump");

  gameEnabled = true;
}

// -----------------------------
// ページロードで初期化
// -----------------------------
initGame();
