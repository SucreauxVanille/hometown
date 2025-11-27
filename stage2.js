// ============================================
// Stage2 完全独立版：DOM生成方式＋リファクタリング済
// ============================================

// ==============================
// 定数
// ==============================
const ST2_MSG_ATTACK   = "attack.png";
const ST2_MSG_HIT1     = "hit.png";
const ST2_MSG_HIT2     = "hit2.png";
const ST2_MSG_HIT3     = "hit3.png";
const ST2_MSG_CLEAR    = "clear.png";
const ST2_MSG_MISS     = "miss.png";
const ST2_MSG_GAMEOVER = "gameover.png";

// スイカ座標
const ST2_POS = [
  { x: 80,  y: 110 },
  { x: 240, y: 110 },
  { x: 40,  y: 200 },
  { x: 160, y: 200 },
  { x: 280, y: 200 }
];

// ==============================
// Stage2 変数
// ==============================
let st2_wms = [];           
let st2CharIndex;
let st2SelectedIndex;
let st2MissCount;
let st2Repeat;
let st2Missed;
let stage2Enabled = false;

// ==============================
// Stage2 開始
// ==============================
function startStage2() {

  const luntu       = document.getElementById("luntu");
  const msgWindow   = document.getElementById("messageWindow");
  const msgImage    = document.getElementById("messageImage");
  const curtainLeft = document.getElementById("curtainLeft");
  const curtainRight= document.getElementById("curtainRight");
  const intro       = document.getElementById("intro");
  const gameArea    = document.getElementById("game");

  // ----------------------------------------------------
  // Stage2用スイカ生成／削除
  // ----------------------------------------------------
  function createStage2Watermelons() {
    removeStage2Watermelons();
    st2_wms = ST2_POS.map((p, i) => {
      const w = document.createElement("img");
      w.src = "watermelon.png";
      w.className = "watermelon";
      w.id = `st2_w${i}`;
      w.style.left = p.x + "px";
      w.style.top  = p.y + "px";
      gameArea.appendChild(w);
      return w;
    });
  }

  function removeStage2Watermelons() {
    st2_wms.forEach(w => w.remove());
    st2_wms = [];
  }

  // ==============================
  // メッセージ表示
  // ==============================
  function st2_showMsg(img, onClick = null) {
    stage2Enabled = false;
    msgImage.src = img;
    msgWindow.style.display = "block";
    msgWindow.onclick = () => {
      msgWindow.style.display = "none";
      stage2Enabled = true;
      if (onClick) onClick();
    };
  }

  // ==============================
  // スイカ点滅
  // ==============================
  function st2_flash(idx) {
    st2_wms.forEach(w => w.classList.remove("flash"));
    if (idx !== null) st2_wms[idx].classList.add("flash");
  }

  // ==============================
  // ルントウ移動
  // ==============================
  function st2_moveLuntu(target) {
    const x = target.offsetLeft + target.offsetWidth / 2;
    const y = target.offsetTop  - target.offsetHeight * 1.2;
    luntu.style.left = `${x - luntu.offsetWidth/2}px`;
    luntu.style.top  = `${y}px`;
  }

  // ==============================
  // 攻撃演出
  // ==============================
  function st2_attack() {
    return new Promise(resolve => {
      stage2Enabled = false;
      st2_showMsg(ST2_MSG_ATTACK, () => {
        resolve();
      });
    });
  }

  // ==============================
  // 勝利の舞
  // ==============================
  async function st2_clearDance() {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        luntu.classList.add("jump");
        await new Promise(r=>setTimeout(r,400));
        luntu.classList.remove("jump");
        await new Promise(r=>setTimeout(r,80));
      }
      luntu.style.transform="scaleX(-1)";
      await new Promise(r=>setTimeout(r,300));
      luntu.style.transform="scaleX(1)";
      await new Promise(r=>setTimeout(r,300));
    }
  }

  // ==============================
  // 勝利演出
  // ==============================
  async function st2_win() {
    stage2Enabled = false;
    st2_showMsg(ST2_MSG_HIT1);
    await new Promise(r=>setTimeout(r,600));
    st2_showMsg(ST2_MSG_HIT2);
    await new Promise(r=>setTimeout(r,600));
    st2_showMsg(ST2_MSG_HIT3);
    await new Promise(r=>setTimeout(r,600));

    await st2_clearDance();

    st2_showMsg(ST2_MSG_CLEAR, () => {
      removeStage2Watermelons();
      resetToOpening();
    });
  }

  // ==============================
  // ゲームオーバー演出
  // ==============================
  function st2_gameover() {
    stage2Enabled = false;
    st2_showMsg(ST2_MSG_MISS, () => {
      st2_showMsg(ST2_MSG_GAMEOVER, () => {
        removeStage2Watermelons();
        resetToOpening();
      });
    });
  }

  // ==============================
  // クリック処理
  // ==============================
  function st2_click(w, idx) {
    if (!stage2Enabled) return;

    // 1回目：選択
    if (st2SelectedIndex !== idx) {
      st2SelectedIndex = idx;
      st2Repeat = 0;
      st2_flash(idx);
      st2_moveLuntu(w);
      return;
    }

    // 2回目：攻撃
    st2Repeat++;
    if (st2Repeat >= 2) return;

    st2_attack().then(() => {
      if (idx === st2CharIndex) {
        st2_flash(null);
        st2SelectedIndex = null;
        st2_win();
      } else {
        if (!st2Missed.has(idx)) {
          st2Missed.add(idx);
          st2MissCount++;
        }
        w.style.display = "none";
        st2_flash(null);
        st2SelectedIndex = null;

        if (st2MissCount >= 2) {
          st2_gameover();
        } else {
          st2_showMsg(ST2_MSG_MISS);
        }
      }
    });
  }

  // ==============================
  // 初期化
  // ==============================
  function st2_init() {
    createStage2Watermelons();
    st2_wms.forEach((w, i) => {
      w.onclick = () => st2_click(w, i);
      w.classList.remove("flash");
      w.style.display = "block";
    });

    st2CharIndex     = Math.floor(Math.random()*5);
    st2SelectedIndex = null;
    st2MissCount     = 0;
    st2Repeat        = 0;
    st2Missed        = new Set();

    luntu.style.display = "block";
    luntu.style.left    = "120px";
    luntu.style.top     = "40px";

    stage2Enabled = true;
  }

  // ==============================
  // 演出（next→カーテン）
  // ==============================
  intro.src = "next.gif";
  intro.style.display = "block";
  intro.style.opacity = 1;

  setTimeout(()=>{ intro.style.opacity = 0; }, 6500);
  setTimeout(()=>{ intro.style.display = "none"; }, 7200);

  curtainLeft.style.display  = "block";
  curtainRight.style.display = "block";
  curtainLeft.classList.add("curtain-show");
  curtainRight.classList.add("curtain-show");

  setTimeout(()=>{
    curtainLeft.classList.remove("curtain-show");
    curtainRight.classList.remove("curtain-show");
    curtainLeft.classList.add("curtain-open-left");
    curtainRight.classList.add("curtain-open-right");
    st2_init();
  }, 7800);
}

