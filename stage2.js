// ============================================
// Stage2 完全独立版：stage2.js
// ============================================

// ==============================
// 定数（script.js と衝突しない名前）
const ST2_MSG_ATTACK = "attack.png";
const ST2_MSG_HIT1   = "hit.png";
const ST2_MSG_HIT2   = "hit2.png";
const ST2_MSG_HIT3   = "hit3.png";
const ST2_MSG_CLEAR  = "clear.png";
const ST2_MSG_MISS   = "miss.png";

// ==============================
// ゲーム管理変数（stage2専用）
let stage2CharIndex, stage2SelectedIndex, stage2MissCount;
let stage2MissedIndexes, stage2RepeatCount, stage2Enabled;

// スイカ配置（M字型）
const ST2_POSITIONS = [
  { x: 80,  y: 110 },
  { x: 240, y: 110 },
  { x: 40,  y: 200 },
  { x: 160, y: 200 },
  { x: 280, y: 200 }
];

// ==============================
// Stage2 開始
function startStage2() {
  // DOM遅延取得
  const luntu = document.getElementById("luntu");
  const msgWindow = document.getElementById("messageWindow");
  const msgImage  = document.getElementById("messageImage");
  const curtainLeft  = document.getElementById("curtainLeft");
  const curtainRight = document.getElementById("curtainRight");
  const intro        = document.getElementById("intro");

  const stage2Watermelons = [
    document.getElementById("w0"),
    document.getElementById("w1"),
    document.getElementById("w2"),
    document.getElementById("w3"),
    document.getElementById("w4")
  ];

  // ==============================
  // メッセージ表示関数
  function showMsg(imgName, onClick = null) {
    msgImage.src = imgName;
    msgWindow.style.display = "block";
    msgWindow.onclick = () => {
      msgWindow.style.display = "none";
      if (onClick) onClick();
    };
  }

  // ==============================
  // スイカ点滅
  function setFlash(index) {
    stage2Watermelons.forEach(w => w.classList.remove("flash"));
    if (index !== null) stage2Watermelons[index].classList.add("flash");
  }

  // ==============================
  // ルントウ移動
  function moveLuntuTo(target) {
    const targetCenterX = target.offsetLeft + target.offsetWidth / 2;
    const lLeft = targetCenterX - luntu.offsetWidth / 2;
    const lTop  = target.offsetTop - luntu.offsetHeight - 0.2 * luntu.offsetHeight;
    luntu.style.left = `${lLeft}px`;
    luntu.style.top  = `${lTop}px`;
  }

  // ==============================
  // 攻撃演出
  function showAttack(duration = 700) {
    return new Promise(resolve => {
      stage2Enabled = false;
      showMsg(ST2_MSG_ATTACK);
      setTimeout(() => {
        msgWindow.style.display = "none";
        stage2Enabled = true;
        resolve();
      }, duration);
    });
  }

  // ==============================
  // 勝利の舞
  async function clearDance() {
    luntu.style.left = "120px";
    luntu.style.top  = "40px";

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

  // ==============================
  // 勝利演出
  async function playHitSequence() {
    stage2Enabled = false;
    showMsg(ST2_MSG_HIT1);
    await new Promise(r => setTimeout(r, 600));
    showMsg(ST2_MSG_HIT2);
    await new Promise(r => setTimeout(r, 600));
    showMsg(ST2_MSG_HIT3);
    await new Promise(r => setTimeout(r, 600));
    await clearDance();
    showMsg(ST2_MSG_CLEAR, () => {
      resetToOpening(); // script.js 側関数
      stage2Enabled = false;
    });
  }

  // ==============================
  // ゲームオーバー演出
  function playGameOver() {
    stage2Enabled = false;
    showMsg(ST2_MSG_MISS, () => {
      resetToOpening();
    });
  }

  // ==============================
  // クリック処理
  function clickHandler(wm, index) {
    if (!stage2Enabled) return;

    if (stage2SelectedIndex !== index) {
      stage2SelectedIndex = index;
      stage2RepeatCount = 0;
      setFlash(index);
      moveLuntuTo(wm);
      return;
    }

    stage2RepeatCount++;
    if (stage2RepeatCount >= 2) return;

    showAttack(400).then(() => {
      if (index === stage2CharIndex) {
        setFlash(null);
        stage2SelectedIndex = null;
        playHitSequence();
      } else {
        if (!stage2MissedIndexes.has(index)) {
          stage2MissedIndexes.add(index);
          stage2MissCount++;
        }
        wm.style.display = "none";
        stage2SelectedIndex = null;
        setFlash(null);
        if (stage2MissCount >= 2) playGameOver();
      }
    });
  }

  // ==============================
  // Stage2 初期化
  function initStage2() {
    stage2Watermelons.forEach((w, i) => {
      w.style.left = ST2_POSITIONS[i].x + "px";
      w.style.top  = ST2_POSITIONS[i].y + "px";
      w.style.display = "block";
      w.classList.remove("flash");
      w.onclick = () => clickHandler(w, i);
    });

    stage2CharIndex     = Math.floor(Math.random() * stage2Watermelons.length);
    stage2SelectedIndex = null;
    stage2MissCount     = 0;
    stage2MissedIndexes = new Set();
    stage2RepeatCount   = 0;
    stage2Enabled       = false;

    luntu.style.left = "120px";
    luntu.style.top  = "40px";
    luntu.style.display = "block";
  }

  // ==============================
  // Stage2 開始演出
  // カーテン出現（暗転）
  curtainLeft.style.display  = "block";
  curtainRight.style.display = "block";
  setTimeout(() => {
    curtainLeft.classList.add("curtain-show");
    curtainRight.classList.add("curtain-show");
  }, 50); // 表示確定のため短遅延

  // next.gif 表示
  intro.src = "next.gif";
  intro.style.opacity = 0;
  intro.style.display = "block";
  setTimeout(() => { intro.style.transition = "opacity 0.6s"; intro.style.opacity = 1; }, 100);
  setTimeout(() => { intro.style.transition = "opacity 0.6s"; intro.style.opacity = 0; }, 7100); // 7秒表示

  // フェードアウト完了後にカーテン開き & Stage2初期化
  setTimeout(() => {
    intro.style.display = "none";
    curtainLeft.classList.remove("curtain-show");
    curtainRight.classList.remove("curtain-show");
    curtainLeft.classList.add("curtain-open-left");
    curtainRight.classList.add("curtain-open-right");

    initStage2();
    stage2Enabled = true;
  }, 7800);
}
