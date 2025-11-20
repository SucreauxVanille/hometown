// ============================================
// ▼ オープニング画面制御
// ============================================
const opening = document.getElementById("opening");
const openingPress = document.getElementById("openingPress");
const game = document.getElementById("game");
const curtainLeft = document.getElementById("curtainLeft");
const curtainRight = document.getElementById("curtainRight");
const intro = document.getElementById("intro"); // イントロ画像

let openingActive = true;

// ==============================
// イントロ表示（フェードイン→静止→フェードアウト）
// ==============================
function showIntro(duration = 4000) {
  return new Promise(resolve => {
    intro.style.display = "block";
    setTimeout(() => { intro.style.opacity = 1; }, 50); // フェードイン

    setTimeout(() => {
      intro.style.opacity = 0; // フェードアウト
      setTimeout(() => {
        intro.style.display = "none";
        resolve();
      }, 1000); // フェードアウト同期
    }, duration);
  });
}

// ==============================
// オープニングクリック処理
// ==============================
opening.addEventListener("click", async () => {
  if (!openingActive) return;
  openingActive = false;

  // press点滅
  openingPress.classList.add("press-flash");

  // 点滅終了後、暗転
  await new Promise(r => setTimeout(r, 600));
  curtainLeft.classList.add("curtain-show");
  curtainRight.classList.add("curtain-show");

  await new Promise(r => setTimeout(r, 400)); // 暗転待機

  // イントロ表示
  await showIntro(4000);

  // カーテンオープン
  opening.style.display = "none";
  game.style.display = "block";
  curtainLeft.classList.add("curtain-open-left");
  curtainRight.classList.add("curtain-open-right");

  setTimeout(() => {
    curtainLeft.style.display = "none";
    curtainRight.style.display = "none";
    initGame();
  }, 1000);
});

// ============================================
// ▼ ゲーム本編制御
// ============================================
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
const MSG_GAMEOVER = "gameover.png";

let charIndex = 0;       // 当たりスイカ
let lastClicked = -1;    // 前回クリック
let gameEnabled = false; // ゲーム開始判定
let missCount = 0;       // 異なるハズレ回数
let missedIndexes = new Set(); // ハズレスイカのindex管理
let repeatCount = 0;     // 連続クリック回数

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
  watermelons.forEach(w => {
    w.style.display = "block";
    w.classList.remove("flash");
  });

  luntu.style.left = "150px";
  luntu.style.top = "60px";

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

// -----------------------------
// ルントウ移動：スイカ中央＋y位置調整
// -----------------------------
function moveLuntuTo(target) {
  const targetCenterX = target.offsetLeft + target.offsetWidth / 2;
  const luntuLeft = targetCenterX - luntu.offsetWidth / 2;
  const luntuTop = target.offsetTop - luntu.offsetHeight - 0.3 * luntu.offsetHeight;
  luntu.style.left = `${luntuLeft}px`;
  luntu.style.top = `${luntuTop}px`;
}

// -----------------------------
// 攻撃演出（短時間表示）
// -----------------------------
function showAttackMessage(duration = 700) {
  return new Promise(resolve => {
    gameEnabled = false; // 表示中クリック無効化
    showMessage(MSG_ATTACK);
    setTimeout(() => {
      msgWindow.style.display = "none";
      gameEnabled = true; // 再度有効化
      resolve();
    }, duration);
  });
}

// -----------------------------
// 当たり演出（hit → hit2 → hit3 → clear）
// -----------------------------
async function playHitSequence() {
  gameEnabled = false;
  showMessage(MSG_HIT1);
  await new Promise(r => setTimeout(r, 600));
  showMessage(MSG_HIT2);
  await new Promise(r => setTimeout(r, 600));
  showMessage(MSG_HIT3, () => {
    showMessage(MSG_CLEAR, resetToOpening);
    gameEnabled = true;
  });
}
const deku = document.getElementById("deku"); // 老いたルントウ画像

// ==============================
// ゲームオーバー演出：ルントウ老化（luntu追従版）
// ==============================
async function playGameOverSequence() {
  gameEnabled = false; // 操作禁止
  msgWindow.style.display = "block";
  msgImage.src = MSG_GAMEOVER;

  deku.style.display = "block";
  deku.style.opacity = 0;
  
  // luntuの位置にdekuを追従させる
  const followInterval = setInterval(() => {
    deku.style.left = luntu.offsetLeft + "px";
    deku.style.top = luntu.offsetTop + "px";
  }, 50);

  let intervalTime = 200;

  // luntuとdekuの交互点滅
  for (let i = 0; i < 20; i++) {
    luntu.style.opacity = i % 2 === 0 ? 1 : 0;
    deku.style.opacity = 1 - luntu.style.opacity;
    await new Promise(r => setTimeout(r, intervalTime));
    if (i === 9) intervalTime = 100;
    if (i === 14) intervalTime = 50;
  }

  // luntu消してdekuのみ点滅
  luntu.style.opacity = 0;
  intervalTime = 50;
  for (let i = 0; i < 20; i++) {
    deku.style.opacity = i % 2 === 0 ? 1 : 0;
    await new Promise(r => setTimeout(r, intervalTime));
    if (i === 9) intervalTime = 100;
    if (i === 14) intervalTime = 200;
  }

  // deku固定表示
  deku.style.opacity = 1;
  clearInterval(followInterval); // 追従終了

  // ワンテンポ置いてクリック可能に
  await new Promise(r => setTimeout(r, 500));
  msgWindow.onclick = () => {
    msgWindow.style.display = "none";
    deku.style.display = "none";
    luntu.style.opacity = 1; // ←ここでluntuを復活
    resetToOpening();
  };
}

// -----------------------------
// resetToOpening 修正版
// -----------------------------
function resetToOpening() {
  game.style.display = "none";
  opening.style.display = "flex";

  curtainLeft.style.display = "block";
  curtainRight.style.display = "block";
  curtainLeft.className = "curtain";    
  curtainRight.className = "curtain";

  openingPress.style.display = "block";
  openingPress.classList.remove("press-flash");

  // luntuを初期位置・表示状態に戻す
  luntu.style.left = "150px";
  luntu.style.top = "60px";
  luntu.style.opacity = 1;

  deku.style.display = "none"; // 念のため

  openingActive = true;
}


// -----------------------------
// メイン：スイカクリック処理
// -----------------------------
watermelons.forEach((wm, index) => {
  wm.addEventListener("click", async () => {
    if (!gameEnabled) return;

    if (lastClicked !== index) repeatCount = 0;
    else repeatCount++;
    if (repeatCount >= 2) return;

    if (lastClicked !== index) {
      lastClicked = index;
      moveLuntuTo(wm);
      return;
    }

    await showAttackMessage(400);

    luntu.classList.add("jump");
    wm.classList.add("flash");
    await new Promise(r => setTimeout(r, 300));
    luntu.classList.remove("jump");
    wm.classList.remove("flash");

    if (index === charIndex) {
      playHitSequence();
    } else {
      if (!missedIndexes.has(index)) {
        missedIndexes.add(index);
        missCount++;
      }
      wm.style.display = "none";

if (missCount >= 2) {
  showMessage(MSG_MISS, () => {
    // 従来の resetToOpening → 新演出関数に差し替え
    playGameOverSequence();
  });
} else {
  showMessage(MSG_MISS);
}

    }

    lastClicked = null;
  });
});

// -----------------------------
// ページロードで初期化
// -----------------------------
initGame();
