// ============================================
// ▼ オープニング画面制御
// ============================================
const opening = document.getElementById("opening");
const openingPress = document.getElementById("openingPress");
const game = document.getElementById("game");
const curtainLeft = document.getElementById("curtainLeft");
const curtainRight = document.getElementById("curtainRight");

let openingActive = true;

// ▼ オープニング画面のクリックで開始準備
opening.addEventListener("click", () => {
  if (!openingActive) return;
  openingActive = false;

  // pressアイコン点滅
  openingPress.classList.add("press-flash");

  // 点滅終了後：暗転開始
  setTimeout(() => {
    curtainLeft.classList.add("curtain-show");
    curtainRight.classList.add("curtain-show");
  }, 600);

  // 暗転が完全に行われた後、ゲーム画面へ切り替え
  setTimeout(() => {
    opening.style.display = "none";
    game.style.display = "block";

    // カーテンを左右に開く
    curtainLeft.classList.add("curtain-open-left");
    curtainRight.classList.add("curtain-open-right");

    // カーテンが開き終わった後、黒幕を消す
    setTimeout(() => {
      curtainLeft.style.display = "none";
      curtainRight.style.display = "none";
    }, 1000);

    // ゲーム開始
    initGame();
  }, 1000);
});

// ============================================
// ▼ ゲーム用オブジェクト
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

// ゲーム状態
let charIndex = 0;
let lastClicked = -1;
let gameEnabled = false;
let missCount = 0;
let missedIndexes = new Set();
let repeatCount = 0;

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
// オープニングに戻す
// -----------------------------
function resetToOpening() {
  game.style.display = "none";
  opening.style.display = "block";

  // カーテン初期化
  curtainLeft.style.display = "none";
  curtainRight.style.display = "none";
  curtainLeft.className = "curtain";
  curtainRight.className = "curtain";

  // press 再表示
  openingPress.style.display = "block";
  openingPress.classList.remove("press-flash");

  openingActive = true;
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
// 当たり演出（hit → hit2 → hit3 → clear）
// -----------------------------
async function playHitSequence() {
  gameEnabled = false;
  showMessage(MSG_HIT1);
  await new Promise(r => setTimeout(r, 600));
  showMessage(MSG_HIT2);
  await new Promise(r => setTimeout(r, 600));
  showMessage(MSG_HIT3, () => {
    showMessage(MSG_CLEAR, resetToOpening); // ここを initGame → resetToOpening に変更
    gameEnabled = true;
  });
}

// -----------------------------
// メイン：スイカクリック処理
// -----------------------------
watermelons.forEach((wm, index) => {
  wm.addEventListener("click", async () => {
    if (!gameEnabled) return;

    if (lastClicked !== index) {
      repeatCount = 0;
    } else {
      repeatCount++;
    }
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
          showMessage(MSG_GAMEOVER, resetToOpening); // ここも resetToOpening
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
