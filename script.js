// ============================================
// ▼ ヘルパー関数
// ============================================
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// ▼ オープニング画面制御
// ============================================
const opening = document.getElementById("opening");
const openingPress = document.getElementById("openingPress");
const game = document.getElementById("game");
const curtainLeft = document.getElementById("curtainLeft");
const curtainRight = document.getElementById("curtainRight");
const msgWindow = document.getElementById("messageWindow");
const msgImage = document.getElementById("messageImage");

// オープニング状態
let openingActive = true;

// ============================================
// ▼ メッセージ制御
// ============================================
function showMessage(imgName, onClick = null) {
  msgImage.src = imgName;
  msgWindow.style.display = "block";
  msgWindow.onclick = () => {
    msgWindow.style.display = "none";
    if (onClick) onClick();
  };
}

// ============================================
// ▼ ゲーム用オブジェクト
// ============================================
const luntu = document.getElementById("luntu");
const watermelons = [
  document.getElementById("w0"),
  document.getElementById("w1"),
  document.getElementById("w2")
];

// 画像ファイル名
const MSG_START = "start.png";
const MSG_ATTACK = "attack.png";
const MSG_MISS = "miss.png";
const MSG_HIT1 = "hit.png";
const MSG_HIT2 = "hit2.png";
const MSG_HIT3 = "hit3.png";
const MSG_CLEAR = "clear.png";
const MSG_GAMEOVER = "gameover.png";
const MSG_INTRO = "intro.png";

// ゲーム状態
let charIndex = 0;       // 当たりスイカ
let lastClicked = -1;    // 前回クリック
let gameEnabled = false; // ゲーム開始判定
let missCount = 0;       // 異なるハズレ回数
let missedIndexes = new Set(); // ハズレスイカのindex管理
let repeatCount = 0; // 連続クリック回数

// ============================================
// ▼ オープニング開始処理
// ============================================
async function startOpeningSequence() {
  if (!openingActive) return;
  openingActive = false;

  // press 点滅
  openingPress.classList.add("press-flash");
  await delay(600);
  openingPress.style.display = "none";

  // 暗転開始（カーテンを前面に表示）
  curtainLeft.style.display = "block";
  curtainRight.style.display = "block";
  curtainLeft.classList.add("curtain-show");
  curtainRight.classList.add("curtain-show");
  await delay(400);

  // イントロ表示
  await new Promise(resolve => {
    showMessage(MSG_INTRO, resolve);
  });

  // カーテンオープン
  curtainLeft.classList.add("curtain-open-left");
  curtainRight.classList.add("curtain-open-right");
  await delay(1000);

  // カーテン非表示
  curtainLeft.style.display = "none";
  curtainRight.style.display = "none";

  // ゲーム本編表示
  game.style.display = "block";
  initGame();
}

// クリックでオープニング開始
opening.addEventListener("click", startOpeningSequence);

// ============================================
// ▼ ゲーム初期化
// ============================================
function initGame() {
  // スイカ復活
  watermelons.forEach(w => {
    w.style.display = "block";
    w.classList.remove("flash");
  });

  // ルントウ初期位置
  luntu.style.left = "150px";
  luntu.style.top = "60px";

  // 当たり再抽選
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

// ============================================
// ▼ ルントウ移動：スイカ中央＋y位置調整
// ============================================
function moveLuntuTo(target) {
  const targetCenterX = target.offsetLeft + target.offsetWidth / 2;
  const luntuLeft = targetCenterX - luntu.offsetWidth / 2;
  const luntuTop = target.offsetTop - luntu.offsetHeight - 0.3 * luntu.offsetHeight;
  luntu.style.left = `${luntuLeft}px`;
  luntu.style.top = `${luntuTop}px`;
}

// ============================================
// ▼ 攻撃演出
// ============================================
async function showAttackMessage(duration = 700) {
  gameEnabled = false;
  showMessage(MSG_ATTACK);
  await delay(duration);
  msgWindow.style.display = "none";
  gameEnabled = true;
}

// ============================================
// ▼ 当たり演出（hit1→hit2→hit3→clear）
async function playHitSequence() {
  gameEnabled = false;
  showMessage(MSG_HIT1);
  await delay(600);
  showMessage(MSG_HIT2);
  await delay(600);
  showMessage(MSG_HIT3, () => {
    showMessage(MSG_CLEAR, () => {
      // クリア後はオープニングに戻す
      resetToOpening();
    });
    gameEnabled = true;
  });
}

// ============================================
// ▼ ゲームオブジェクトクリック処理
// ============================================
watermelons.forEach((wm, index) => {
  wm.addEventListener("click", async () => {
    if (!gameEnabled) return;

    // 連続クリック制御
    if (lastClicked !== index) {
      repeatCount = 0;
    } else {
      repeatCount++;
    }
    if (repeatCount >= 2) return;

    // 1回目タップ：移動のみ
    if (lastClicked !== index) {
      lastClicked = index;
      moveLuntuTo(wm);
      return;
    }

    // 2回目タップ：攻撃演出
    await showAttackMessage(400);

    luntu.classList.add("jump");
    wm.classList.add("flash");
    await delay(300);
    luntu.classList.remove("jump");
    wm.classList.remove("flash");

    // 判定
    if (index === charIndex) {
      playHitSequence();
    } else {
      // ハズレ処理
      if (!missedIndexes.has(index)) {
        missedIndexes.add(index);
        missCount++;
      }
      wm.style.display = "none";

      if (missCount >= 2) {
        // 2回目の異なるハズレ → MSG_MISS → クリックで GAMEOVER
        showMessage(MSG_MISS, () => {
          showMessage(MSG_GAMEOVER, resetToOpening);
        });
      } else {
        // ハズレ1回目 → MSG_MISS 表示のみ
        showMessage(MSG_MISS);
      }
    }

    lastClicked = null;
  });
});

// ============================================
// ▼ ゲーム終了後オープニングへ戻す
// ============================================
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

// ============================================
// ▼ ページ読み込みで初期化
// ============================================
window.addEventListener("load", () => {
  game.style.display = "none";
  curtainLeft.style.display = "none";
  curtainRight.style.display = "none";
  opening.style.display = "block";
});
