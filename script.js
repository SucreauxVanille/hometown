// =====================
// Stage 2対応 完全版 script.js（修正版）
// =====================

// =====================
// グローバル変数
// =====================
let currentStage = 1;      // 1 → 2
let gameEnabled = false;   // ゲーム操作可能判定
let selectedIndex = null;  // 現在照準中スイカ
let lastClicked = null;    
let repeatCount = 0;       
let missCount = 0;         
let missedIndexes = new Set();
let charIndex = 0;         // 当たりスイカ index

// イベント重複防止ガード
let handlersInitialized = false;

// DOM取得
const game = document.getElementById("game");
const intro = document.getElementById("intro");
const opening = document.getElementById("opening");
const curtainLeft = document.getElementById("curtainLeft");
const curtainRight = document.getElementById("curtainRight");
const luntu = document.getElementById("luntu");
const deku = document.getElementById("deku");
const msgWindow = document.getElementById("messageWindow");
const msgImage = document.getElementById("messageImage");

// 画像ファイル名
const MSG_START  = "start.png";
const MSG_ATTACK = "attack.png";
const MSG_MISS   = "miss.png";
const MSG_HIT1   = "hit.png";
const MSG_HIT2   = "hit2.png";
const MSG_HIT3   = "hit3.png";
const MSG_CLEAR  = "clear.png";
const MSG_GAMEOVER = "gameover.png";

let watermelons = []; // スイカDOMの配列

// =====================
// メッセージ表示関数
// =====================
function showMessage(imgName, onClick = null) {
  msgImage.src = imgName;
  msgWindow.style.display = "block";
  // 上書きされる可能性を考慮して一旦解除してから再設定
  msgWindow.onclick = null;
  msgWindow.onclick = () => {
    msgWindow.style.display = "none";
    if (onClick) onClick();
  };
}

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
  // Stage1で不要なw3,w4は非表示（ある場合）
  [ "w3", "w4" ].forEach(id => {
    const w = document.getElementById(id);
    if (w) {
      w.style.display = "none";
      w.classList.remove("flash");
    }
  });

  watermelons.forEach(w => {
    if (w) {
      w.style.display = "block";
      w.classList.remove("flash");
    }
  });
  charIndex = Math.floor(Math.random() * 3);

  resetLuntu();
  selectedIndex = null;
  lastClicked = null;
  repeatCount = 0;
  missCount = 0;
  missedIndexes.clear();
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
    if (!w) return;
    w.style.left = pos[i].x + "px";
    w.style.top  = pos[i].y + "px";
    w.style.display = "block";
    w.classList.remove("flash");
  });
  charIndex = Math.floor(Math.random() * 5);

  resetLuntu();
  selectedIndex = null;
  lastClicked = null;
  repeatCount = 0;
  missCount = 0;
  missedIndexes.clear();
}

// =====================
// ステージクリア時進行
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
    gameEnabled = true;
  }, 2600);
}

function playFinalClearSequence() {
  showMessage(MSG_CLEAR, resetToOpening);
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
// ゲームをオープニングに戻す
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
  void intro.offsetWidth; // 再描画トリガー
}

// =====================
// スイカ点滅
// =====================
function setFlash(index) {
  watermelons.forEach(w => {
    if (w) w.classList.remove("flash");
  });
  if (index !== null && watermelons[index]) watermelons[index].classList.add("flash");
}

// =====================
// ルントウ移動
// =====================
function moveLuntuTo(target) {
  const targetCenterX = target.offsetLeft + target.offsetWidth / 2;
  const luntuLeft = targetCenterX - luntu.offsetWidth / 2;
  const luntuTop = target.offsetTop - luntu.offsetHeight - 0.2*luntu.offsetHeight;
  luntu.style.left = `${luntuLeft}px`;
  luntu.style.top = `${luntuTop}px`;
}

// =====================
// 攻撃演出
// =====================
function showAttackMessage(duration=700) {
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

// =====================
// ゲームオーバー演出（簡易：他ファイルで詳細実装している場合はそちらを使用）
// =====================
async function playGameOverSequence() {
  // ここでは簡易にオーバー→オープニングへ戻す
  showMessage(MSG_GAMEOVER, resetToOpening);
}

// =====================
// スイカクリック初期化（1回だけ登録）
// =====================
function initClickHandlers() {
  if (handlersInitialized) return;
  handlersInitialized = true;

  // イベントは watermelons 配列が setupStageX() によりセットされた後で発火する想定です。
  // ただし、要素自体は DOM に存在しているためここで参照可能です。
  const allIds = ["w0","w1","w2","w3","w4"];
  allIds.forEach((id, idx) => {
    const wm = document.getElementById(id);
    if (!wm) return;
    wm.addEventListener("click", async () => {
      if (!gameEnabled) return;

      // selectedIndex / lastClicked / repeatCount の連続クリックガード
      if (selectedIndex !== idx) {
        selectedIndex = idx;
        lastClicked = idx;
        repeatCount = 0;
        setFlash(idx);
        moveLuntuTo(wm);
        return;
      }

      repeatCount++;
      if (repeatCount >= 2) return;

      await showAttackMessage(400);

      // 判定（現在の charIndex は stage に依存）
      // 当該 idx が水マークの配列内で valid かどうかは stage セットアップで調整される
      // ここでは index の比較で判定
      if (idx === charIndex) {
        // ヒット
        setFlash(null);
        selectedIndex = null;
        lastClicked = null;
        if (currentStage === 1) playStageClearSequence();
        else playFinalClearSequence();
      } else {
        // ミス
        wm.style.display = "none";
        if (!missedIndexes.has(idx)) {
          missedIndexes.add(idx);
          missCount++;
        }
        if (missCount >= 2) {
          // game over：詳細な演出が別にある場合は playGameOverSequence を差し替えてください
          showMessage(MSG_MISS, () => {
            playGameOverSequence();
          });
        } else {
          showMessage(MSG_MISS);
        }
      }

      // 照準解除
      selectedIndex = null;
      setFlash(null);
    });
  });
}

// =====================
// 元の initGame を復活：ステージ準備→ハンドラ登録→スタートメッセージ
// =====================
function initGame() {
  // デフォルトは Stage1 を準備
  setupStage1();

  // クリックハンドラは一度だけ登録
  initClickHandlers();

  // ルントウ等初期化（念のため）
  resetLuntu();

  // メッセージ表示で開始待ち（ユーザーがクリックすると gameEnabled=true）
  game.style.display = "block";
  showMessage(MSG_START, () => {
    gameEnabled = true;
  });
}

// =====================
// opening.js 等が呼ぶ入口
// =====================
function startGame() {
  initGame();
}
