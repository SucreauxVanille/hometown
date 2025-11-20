// ============================================
// ▼ ユーティリティ
// ============================================
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

// ============================================
// ▼ オープニング・イントロ制御
// ============================================
const opening = document.getElementById("opening");
const openingPress = document.getElementById("openingPress");
const curtainLeft = document.getElementById("curtainLeft");
const curtainRight = document.getElementById("curtainRight");
const introImage = "intro.png"; // イントロ画像
let openingActive = true;

async function startOpeningSequence() {
  if (!openingActive) return;
  openingActive = false;

  // press点滅
  openingPress.classList.add("press-flash");
  await delay(600);

  // 暗転開始
  curtainLeft.classList.add("curtain-show");
  curtainRight.classList.add("curtain-show");
  await delay(400); // 暗転完了待機

  // イントロ表示
  await new Promise(resolve => {
    showMessage(introImage, resolve);
  });

  // カーテンオープン
  curtainLeft.classList.add("curtain-open-left");
  curtainRight.classList.add("curtain-open-right");
  await delay(1000);

  // カーテン非表示
  curtainLeft.style.display = "none";
  curtainRight.style.display = "none";

  // ゲーム画面表示
  game.style.display = "block";
  initGame();
}

// pressクリックでオープニング開始
openingPress.addEventListener("click", startOpeningSequence);

// ============================================
// ▼ ゲーム本編
// ============================================
const game = document.getElementById("game");
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

let charIndex = 0;       
let lastClicked = -1;    
let gameEnabled = false; 
let missCount = 0;       
let missedIndexes = new Set(); 
let repeatCount = 0;     

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
// ルントウ移動
// -----------------------------
function moveLuntuTo(target) {
  const targetCenterX = target.offsetLeft + target.offsetWidth / 2;
  const luntuLeft = targetCenterX - luntu.offsetWidth / 2;
  const luntuTop = target.offsetTop - luntu.offsetHeight - 0.3 * luntu.offsetHeight;
  luntu.style.left = `${luntuLeft}px`;
  luntu.style.top = `${luntuTop}px`;
}

// -----------------------------
// 攻撃演出
// -----------------------------
async function showAttackMessage(duration = 700) {
  gameEnabled = false;
  showMessage(MSG_ATTACK);
  await delay(duration);
  msgWindow.style.display = "none";
  gameEnabled = true;
}

// -----------------------------
// 当たり演出(hit → hit2 → hit3 → clear)
// -----------------------------
async function playHitSequence() {
  gameEnabled = false;
  showMessage(MSG_HIT1);
  await delay(600);
  showMessage(MSG_HIT2);
  await delay(600);
  showMessage(MSG_HIT3, async () => {
    showMessage(MSG_CLEAR, startOpeningSequence); // clear後はオープニングへ
    gameEnabled = true;
  });
}

// -----------------------------
// スイカクリック処理
// -----------------------------
watermelons.forEach((wm, index) => {
  wm.addEventListener("click", async () => {
    if (!gameEnabled) return;

    // 連続クリック制御
    if (lastClicked !== index) repeatCount = 0;
    else repeatCount++;
    if (repeatCount >= 2) return;

    // 1回目：移動
    if (lastClicked !== index) {
      lastClicked = index;
      moveLuntuTo(wm);
      return;
    }

    // 2回目：攻撃演出
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
      if (!missedIndexes.has(index)) {
        missedIndexes.add(index);
        missCount++;
      }
      wm.style.display = "none";

      if (missCount >= 2) {
        showMessage(MSG_MISS, () => {
          showMessage(MSG_GAMEOVER, startOpeningSequence);
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
game.style.display = "none"; // 最初は非表示
initGame();

