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
const deku = document.getElementById("deku"); // 老いたルントウ画像

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
let selectedIndex = null; // 照準中のスイカ index

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

  showMessage(MSG_HIT3, async () => {
    await playClearDance();
    showMessage(MSG_CLEAR, () => {
    startStage2();  // ★ これだけ追加
});

  });
}

// -----------------------------
// ゲームオーバー演出
// -----------------------------
async function playGameOverSequence() {
  gameEnabled = false;

  msgWindow.style.display = "block";
  msgImage.src = MSG_GAMEOVER;

  deku.style.position = "absolute";
  deku.style.opacity = 0;
  deku.style.display = "block";
  deku.style.visibility = "hidden";

  const startLeft = luntu.offsetLeft;
  const startTop = luntu.offsetTop;
  deku.style.left = startLeft + "px";
  deku.style.top = startTop + "px";
  deku.style.visibility = "visible";

  const followInterval = setInterval(() => {
    deku.style.left = luntu.offsetLeft + "px";
    deku.style.top = luntu.offsetTop + "px";
  }, 40);

  // luntu点滅 → deku出現
  let intervalTime = 200;
  for (let i = 0; i < 10; i++) {
    luntu.style.opacity = i % 2 === 0 ? 1 : 0;
    deku.style.opacity = 0;
    await new Promise(r => setTimeout(r, intervalTime));
  }

  intervalTime = 200;
  for (let i = 0; i < 20; i++) {
    luntu.style.opacity = i % 2 === 0 ? 1 : 0;
    deku.style.opacity = i % 2 === 0 ? 0 : 1;
    await new Promise(r => setTimeout(r, intervalTime));
    if (i === 9) intervalTime = 120;
    if (i === 14) intervalTime = 60;
  }

  luntu.style.opacity = 0;
  intervalTime = 60;
  for (let i = 0; i < 20; i++) {
    deku.style.opacity = i % 2 === 0 ? 1 : 0;
    await new Promise(r => setTimeout(r, intervalTime));
    if (i === 9) intervalTime = 120;
    if (i === 14) intervalTime = 200;
  }

  deku.style.opacity = 1;
  clearInterval(followInterval);

  await new Promise(r => setTimeout(r, 500));
  msgWindow.onclick = () => {
    msgWindow.style.display = "none";
    deku.style.display = "none";
    deku.style.opacity = 0;
    luntu.style.opacity = 1;
    luntu.style.display = "block";
    resetToOpening(); // opening.js 側関数
  };
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
// スイカクリック処理
// -----------------------------
watermelons.forEach((wm, index) => {
  wm.addEventListener("click", async () => {
    if (!gameEnabled) return;

    if (selectedIndex !== index) {
      selectedIndex = index;
      setFlash(index);
      lastClicked = index;
      repeatCount = 0;
      moveLuntuTo(wm);
      return;
    }

    repeatCount++;
    if (repeatCount >= 2) return;

    await showAttackMessage(400);
    luntu.classList.add("jump");
    await new Promise(r => setTimeout(r, 300));
    luntu.classList.remove("jump");

    if (index === charIndex) {
      setFlash(null);
      selectedIndex = null;
      lastClicked = null;
      playHitSequence();
      return;
    }

    if (!missedIndexes.has(index)) {
      missedIndexes.add(index);
      missCount++;
    }
    wm.style.display = "none";

    if (missCount >= 2) {
      setFlash(null);
      selectedIndex = null;
      lastClicked = null;
      showMessage(MSG_MISS, () => {
        playGameOverSequence();
      });
    } else {
      showMessage(MSG_MISS);
      setFlash(null);
      selectedIndex = null;
      lastClicked = null;
    }
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
