// ============================================
// Stage 2 完全版：stage2.js（DOM再宣言削除版）
// ============================================

// スイカ DOM（index.html に w0～w4 を配置済みとする）
const stage2Watermelons = [
  document.getElementById("w0"),
  document.getElementById("w1"),
  document.getElementById("w2"),
  document.getElementById("w3"),
  document.getElementById("w4")
];

// 画像ファイル
const MSG_ATTACK = "attack.png";
const MSG_HIT1 = "hit.png";
const MSG_HIT2 = "hit2.png";
const MSG_HIT3 = "hit3.png";
const MSG_CLEAR = "clear.png";
const MSG_MISS  = "miss.png";

// ゲーム管理変数
let stage2CharIndex = 0;
let stage2SelectedIndex = null;
let stage2MissCount = 0;
let stage2MissedIndexes = new Set();
let stage2RepeatCount = 0;
let stage2Enabled = false;

// スイカ仮配置（M字型）
const stage2Positions = [
  { x: 80,  y: 110 },
  { x: 240, y: 110 },
  { x: 40,  y: 200 },
  { x: 160, y: 200 },
  { x: 280, y: 200 }
];

// -----------------------------
// メッセージ表示
// -----------------------------
function showStage2Message(imgName, onClick = null) {
  msgImage.src = imgName;
  msgWindow.style.display = "block";
  msgWindow.onclick = () => {
    msgWindow.style.display = "none";
    if (onClick) onClick();
  };
}

// -----------------------------
// スイカ点滅
// -----------------------------
function stage2SetFlash(index) {
  stage2Watermelons.forEach(w => w.classList.remove("flash"));
  if (index !== null) stage2Watermelons[index].classList.add("flash");
}

// -----------------------------
// ルントウ移動
// -----------------------------
function stage2MoveLuntuTo(target) {
  const targetCenterX = target.offsetLeft + target.offsetWidth / 2;
  const luntuLeft = targetCenterX - luntu.offsetWidth / 2;
  const luntuTop = target.offsetTop - luntu.offsetHeight - 0.2 * luntu.offsetHeight;
  luntu.style.left = `${luntuLeft}px`;
  luntu.style.top = `${luntuTop}px`;
}

// -----------------------------
// 攻撃演出
// -----------------------------
function stage2ShowAttack(duration = 700) {
  return new Promise(resolve => {
    stage2Enabled = false;
    showStage2Message(MSG_ATTACK);
    setTimeout(() => {
      msgWindow.style.display = "none";
      stage2Enabled = true;
      resolve();
    }, duration);
  });
}

// -----------------------------
// 勝利演出
// -----------------------------
async function stage2PlayHitSequence() {
  stage2Enabled = false;

  showStage2Message(MSG_HIT1);
  await new Promise(r => setTimeout(r, 600));
  showStage2Message(MSG_HIT2);
  await new Promise(r => setTimeout(r, 600));
  showStage2Message(MSG_HIT3, async () => {
    await stage2ClearDance();
    showStage2Message(MSG_CLEAR, () => {
      resetToOpening(); // script.js 側関数を呼ぶ
      stage2Enabled = false;
    });
  });
}

// -----------------------------
// 勝利の舞（簡易）
async function stage2ClearDance() {
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
  stage2Enabled = true;
}

// -----------------------------
// Stage2 ゲームオーバー演出
// -----------------------------
function stage2PlayGameOver() {
  stage2Enabled = false;
  showStage2Message(MSG_MISS, () => {
    resetToOpening(); // script.js 側関数
  });
}

// -----------------------------
// クリック処理
// -----------------------------
function stage2ClickHandler(wm, index) {
  if (!stage2Enabled) return;

  if (stage2SelectedIndex !== index) {
    stage2SelectedIndex = index;
    stage2RepeatCount = 0;
    stage2SetFlash(index);
    stage2MoveLuntuTo(wm);
    return;
  }

  stage2RepeatCount++;
  if (stage2RepeatCount >= 2) return;

  stage2ShowAttack(400).then(() => {
    if (index === stage2CharIndex) {
      stage2SetFlash(null);
      stage2SelectedIndex = null;
      stage2PlayHitSequence();
    } else {
      if (!stage2MissedIndexes.has(index)) {
        stage2MissedIndexes.add(index);
        stage2MissCount++;
      }
      wm.style.display = "none";

      stage2SelectedIndex = null;
      stage2SetFlash(null);

      if (stage2MissCount >= 2) stage2PlayGameOver();
    }
  });
}

// -----------------------------
// Stage2 初期化
// -----------------------------
function initStage2Game() {
  stage2Watermelons.forEach((w, i) => {
    w.style.left = stage2Positions[i].x + "px";
    w.style.top  = stage2Positions[i].y + "px";
    w.style.display = "block";
    w.classList.remove("flash");
    w.onclick = () => stage2ClickHandler(w, i);
  });

  stage2CharIndex = Math.floor(Math.random() * stage2Watermelons.length);
  stage2SelectedIndex = null;
  stage2MissCount = 0;
  stage2MissedIndexes.clear();
  stage2RepeatCount = 0;
  stage2Enabled = false;

  luntu.style.left = "120px";
  luntu.style.top  = "40px";
}

// -----------------------------
// Stage2 開始演出
// -----------------------------
function startStage2() {
  // 黒幕表示
  curtainLeft.style.display = "block";
  curtainRight.style.display = "block";
  curtainLeft.classList.add("curtain-close");
  curtainRight.classList.add("curtain-close");

  // next.gif 表示
  intro.src = "next.gif";
  intro.style.opacity = 0;
  intro.style.display = "block";

  setTimeout(() => { intro.style.transition = "opacity 0.6s"; intro.style.opacity = 1; }, 600);
  setTimeout(() => { intro.style.opacity = 0; }, 1800);

  setTimeout(() => {
    intro.style.display = "none";
    curtainLeft.classList.remove("curtain-close");
    curtainRight.classList.remove("curtain-close");
    curtainLeft.classList.add("curtain-open");
    curtainRight.classList.add("curtain-open");

    initStage2Game();
    stage2Enabled = true;
  }, 2600);
}
