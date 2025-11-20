// ============================================
// ▼ オープニング画面制御（イントロ付き）
// ============================================
const opening = document.getElementById("opening");
const openingPress = document.getElementById("openingPress");
const game = document.getElementById("game");
const curtainLeft = document.getElementById("curtainLeft");
const curtainRight = document.getElementById("curtainRight");
const msgWindow = document.getElementById("messageWindow");
const msgImage = document.getElementById("messageImage");

let openingActive = true;

// ▼ press 点滅 + 暗転 + イントロ表示
opening.addEventListener("click", () => {
  if (!openingActive) return;
  openingActive = false;

  // pressアイコン点滅
  openingPress.classList.add("press-flash");

  // 点滅終了後：暗転開始
  setTimeout(() => {
    curtainLeft.classList.add("curtain-show");
    curtainRight.classList.add("curtain-show");

    // 暗転完了したらイントロ表示
    setTimeout(() => {
      showMessage("intro.png", () => {
        // イントロ閉じたらカーテン開放
        curtainLeft.classList.add("curtain-open-left");
        curtainRight.classList.add("curtain-open-right");

        // カーテン開放後に非表示
        setTimeout(() => {
          curtainLeft.style.display = "none";
          curtainRight.style.display = "none";

          // ゲーム開始
          initGame();
        }, 1000);
      });
    }, 500); // 暗転完了の待機時間
  }, 600); // press 点滅時間
});

// ============================================
// ▼ ゲーム本編
// ============================================
const luntu = document.getElementById("luntu");
const watermelons = [
  document.getElementById("w0"),
  document.getElementById("w1"),
  document.getElementById("w2")
];

const msgWindow = document.getElementById("messageWindow");
const msgImage = document.getElementById("messageImage");

// 黒フェード用
const fadeBlack = document.getElementById("fadeBlack");

// 画像ファイル名
const MSG_START = "start.png";
const MSG_ATTACK = "attack.png";
const MSG_MISS = "miss.png";
const MSG_HIT1 = "hit.png";
const MSG_HIT2 = "hit2.png";
const MSG_HIT3 = "hit3.png";
const MSG_CLEAR = "clear.png";
const MSG_GAMEOVER = "gameover.png";

let charIndex = 0;
let lastClicked = -1;
let gameEnabled = false;
let missCount = 0;
let missedIndexes = new Set();
let repeatCount = 0;

// ------------------------------------
// メッセージ表示（クリックで閉じる）
// ------------------------------------
function showMessage(imgName, onClick = null) {
  msgImage.src = imgName;
  msgWindow.style.display = "block";
  msgWindow.onclick = () => {
    msgWindow.style.display = "none";
    if (onClick) onClick();
  };
}

// ------------------------------------
// 暗転 → opening に戻る
// ------------------------------------
function returnToOpening() {
  gameEnabled = false;
  fadeBlack.classList.add("fade-active");

  setTimeout(() => {
    // フェードアウト完了 → オープニング表示
    fadeBlack.classList.remove("fade-active");
    game.style.display = "none";
    opening.style.display = "block";
    openingActive = true;
  }, 900);
}


// ------------------------------------
// ゲーム初期化
// ------------------------------------
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

// ------------------------------------
// ルントウ移動
// ------------------------------------
function moveLuntuTo(target) {
  const targetCenterX = target.offsetLeft + target.offsetWidth / 2;
  const luntuLeft = targetCenterX - luntu.offsetWidth / 2;
  const luntuTop = target.offsetTop - luntu.offsetHeight - 0.3 * luntu.offsetHeight;
  luntu.style.left = `${luntuLeft}px`;
  luntu.style.top = `${luntuTop}px`;
}

// ------------------------------------
// 攻撃演出
// ------------------------------------
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

// ------------------------------------
// 当たり演出 → CLEAR → opening
// ------------------------------------
async function playHitSequence() {
  gameEnabled = false;

  showMessage(MSG_HIT1);
  await new Promise(r => setTimeout(r, 600));

  showMessage(MSG_HIT2);
  await new Promise(r => setTimeout(r, 600));

  showMessage(MSG_HIT3, () => {
    // CLEAR 表示 → 暗転 → opening
    showMessage(MSG_CLEAR, () => {
      returnToOpening();
    });
  });
}

// ------------------------------------
// スイカクリック処理
// ------------------------------------
watermelons.forEach((wm, index) => {
  wm.addEventListener("click", async () => {
    if (!gameEnabled) return;

    // ▼ 連続クリック制御
    if (lastClicked !== index) {
      repeatCount = 0;
    } else {
      repeatCount++;
    }
    if (repeatCount >= 2) return;

    // 1回目タップ：移動
    if (lastClicked !== index) {
      lastClicked = index;
      moveLuntuTo(wm);
      return;
    }

    // 2回目 → 攻撃
    await showAttackMessage(400);

    luntu.classList.add("jump");
    wm.classList.add("flash");
    await new Promise(r => setTimeout(r, 300));
    luntu.classList.remove("jump");
    wm.classList.remove("flash");

    // 判定
    if (index === charIndex) {
      playHitSequence();
      lastClicked = null;
      return;
    }

    // ▼ ハズレ処理
    if (!missedIndexes.has(index)) {
      missedIndexes.add(index);
      missCount++;
    }
    wm.style.display = "none";

    // 2回目の異なるハズレ
    if (missCount >= 2) {
      showMessage(MSG_MISS, () => {
        showMessage(MSG_GAMEOVER, () => {
          returnToOpening();
        });
      });
    } else {
      // 1回目
      showMessage(MSG_MISS);
    }

    lastClicked = null;
  });
});

// ------------------------------------
// ページロード時
// ------------------------------------
initGame();
