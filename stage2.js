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
let ST2_charIndex, ST2_selectedIndex, ST2_missCount;
let ST2_missedIndexes, ST2_repeatCount, ST2_enabled;

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

  // DOM遅延取得（stage2 専用 ID）
  const ST2_luntu = document.getElementById("luntu");
  const ST2_msgWindow = document.getElementById("messageWindow");
  const ST2_msgImage  = document.getElementById("messageImage");
  const ST2_curtainLeft  = document.getElementById("curtainLeft");
  const ST2_curtainRight = document.getElementById("curtainRight");
  const ST2_intro        = document.getElementById("intro");

  // ステージ2専用のスイカ
  const ST2_watermelons = [
    document.getElementById("st2_w0"),
    document.getElementById("st2_w1"),
    document.getElementById("st2_w2"),
    document.getElementById("st2_w3"),
    document.getElementById("st2_w4")
  ];

  // ==============================
  // 安全なメッセージ表示
  function ST2_showMsg(imgName, onClick = null) {
    ST2_enabled = false; // メッセージ中は操作禁止
    ST2_msgImage.src = imgName;
    ST2_msgWindow.style.display = "block";

    ST2_msgWindow.onclick = () => {
      ST2_msgWindow.style.display = "none";
      if (onClick) onClick();
      ST2_enabled = true;
    };
  }

  // ==============================
  function ST2_setFlash(index) {
    ST2_watermelons.forEach(w => w.classList.remove("flash"));
    if (index !== null) ST2_watermelons[index].classList.add("flash");
  }

  // ==============================
  function ST2_moveLuntuTo(target) {
    const cx = target.offsetLeft + target.offsetWidth / 2;
    const lx = cx - ST2_luntu.offsetWidth / 2;
    const ly = target.offsetTop - ST2_luntu.offsetHeight * 1.2;
    ST2_luntu.style.left = `${lx}px`;
    ST2_luntu.style.top  = `${ly}px`;
  }

  // ==============================
  function ST2_showAttack(duration = 700) {
    return new Promise(resolve => {
      ST2_showMsg(ST2_MSG_ATTACK);
      setTimeout(() => {
        ST2_msgWindow.style.display = "none";
        resolve();
      }, duration);
    });
  }

  // ==============================
  async function ST2_clearDance() {
    ST2_luntu.style.left = "120px";
    ST2_luntu.style.top  = "40px";

    for (let set = 0; set < 2; set++) {
      for (let j = 0; j < 2; j++) {
        ST2_luntu.classList.add("jump");
        await new Promise(r => setTimeout(r, 400));
        ST2_luntu.classList.remove("jump");
        await new Promise(r => setTimeout(r, 50));
      }
      await new Promise(r => setTimeout(r, 50));
      ST2_luntu.style.transform = "scaleX(-1)";
      await new Promise(r => setTimeout(r, 400));
      ST2_luntu.style.transform = "scaleX(1)";
      await new Promise(r => setTimeout(r, 300));
    }

    ST2_luntu.classList.add("jump");
    await new Promise(r => setTimeout(r, 400));
    ST2_luntu.classList.remove("jump");
  }

  // ==============================
  async function ST2_playHitSequence() {
    ST2_enabled = false;
    ST2_showMsg(ST2_MSG_HIT1);
    await new Promise(r => setTimeout(r, 600));

    ST2_showMsg(ST2_MSG_HIT2);
    await new Promise(r => setTimeout(r, 600));

    ST2_showMsg(ST2_MSG_HIT3);
    await new Promise(r => setTimeout(r, 600));

    await ST2_clearDance();

    // クリア
    ST2_showMsg(ST2_MSG_CLEAR, () => {
      ST2_enabled = false;
      resetToOpening();
    });
  }

  // ==============================
  function ST2_playGameOver() {
    ST2_enabled = false;
    ST2_showMsg(ST2_MSG_MISS, () => {
      resetToOpening();
    });
  }

  // ==============================
  function ST2_clickHandler(wm, index) {
    if (!ST2_enabled) return;

    // 初回選択
    if (ST2_selectedIndex !== index) {
      ST2_selectedIndex = index;
      ST2_repeatCount = 0;
      ST2_setFlash(index);
      ST2_moveLuntuTo(wm);
      return;
    }

    // 2回目クリックで攻撃
    ST2_repeatCount++;
    if (ST2_repeatCount > 1) return;

    ST2_showAttack(400).then(() => {

      if (index === ST2_charIndex) {
        ST2_setFlash(null);
        ST2_selectedIndex = null;
        ST2_playHitSequence();
      } else {
        if (!ST2_missedIndexes.has(index)) {
          ST2_missedIndexes.add(index);
          ST2_missCount++;
        }

        wm.style.display = "none";
        ST2_selectedIndex = null;
        ST2_setFlash(null);

        if (ST2_missCount >= 2) ST2_playGameOver();
      }
    });
  }

  // ==============================
  function ST2_initStage2() {
    ST2_watermelons.forEach((w, i) => {
      w.style.left = ST2_POSITIONS[i].x + "px";
      w.style.top  = ST2_POSITIONS[i].y + "px";
      w.style.display = "block";
      w.classList.remove("flash");
      w.onclick = () => ST2_clickHandler(w, i);
    });

    ST2_charIndex     = Math.floor(Math.random() * ST2_watermelons.length);
    ST2_selectedIndex = null;
    ST2_missCount     = 0;
    ST2_missedIndexes = new Set();
    ST2_repeatCount   = 0;

    ST2_luntu.style.left = "120px";
    ST2_luntu.style.top  = "40px";
    ST2_luntu.style.display = "block";
  }

  // ==============================
  // 開始演出
  ST2_curtainLeft.style.display  = "block";
  ST2_curtainRight.style.display = "block";
  setTimeout(() => {
    ST2_curtainLeft.classList.add("curtain-show");
    ST2_curtainRight.classList.add("curtain-show");
  }, 50);

  ST2_intro.src = "next.gif";
  ST2_intro.style.opacity = 0;
  ST2_intro.style.display = "block";
  setTimeout(() => {
    ST2_intro.style.transition = "opacity 0.6s";
    ST2_intro.style.opacity = 1;
  }, 100);

  setTimeout(() => {
    ST2_intro.style.opacity = 0;
  }, 7100);

  setTimeout(() => {
    ST2_intro.style.display = "none";
    ST2_curtainLeft.classList.remove("curtain-show");
    ST2_curtainRight.classList.remove("curtain-show");
    ST2_curtainLeft.classList.add("curtain-open-left");
    ST2_curtainRight.classList.add("curtain-open-right");

    ST2_initStage2();
    ST2_enabled = true;
  }, 7800);
}

