// ============================================
// Stage 2 制御（DOM 遅延取得）
// ============================================

// --- DOMを参照しないステージ2用変数 ---
let stage2Watermelons = [];
let stage2CharIndex = 0;
let stage2SelectedIndex = null;
let stage2GameEnabled = false;

// ============================================
// ▼ Stage2 開始
// ============================================
function startStage2() {

  // -----------------------------
  // Stage2 用 DOM をここで取得（遅延取得）
  // -----------------------------
  const luntu        = document.getElementById("luntu");
  const curtainLeft  = document.getElementById("curtainLeft");
  const curtainRight = document.getElementById("curtainRight");
  const intro        = document.getElementById("intro");

  stage2Watermelons = [
    document.getElementById("w0"),
    document.getElementById("w1"),
    document.getElementById("w2"),
    document.getElementById("w3"),
    document.getElementById("w4")
  ];

  // 念のため、null が紛れていたら警告
  if (stage2Watermelons.some(w => !w)) {
    console.error("Stage2 のスイカ要素が取得できませんでした。ID を確認してください。");
  }

  // -----------------------------
  // Stage1 用スイカを全て非表示にしてから、Stage2配置
  // -----------------------------
  stage2Watermelons.forEach(w => {
    if (!w) return;
    w.style.display = "block";
    w.classList.remove("flash");
  });

  // ルントウ位置リセット
  luntu.style.left = "120px";
  luntu.style.top = "40px";

  // 当たりスイカ：5つのうち1つにランダム設定
  stage2CharIndex = Math.floor(Math.random() * 5);
  stage2SelectedIndex = null;
  stage2GameEnabled = false;

  // -----------------------------
  // Stage2 開始演出（黒幕 → next.gif → カーテンオープン）
  // -----------------------------
  intro.style.display = "block";
  intro.style.opacity = 1;
  intro.src = "next.gif";

  // next.gif フェードイン → フェードアウト
  fadeIn(intro, 600, async () => {
    await new Promise(r => setTimeout(r, 800));
    fadeOut(intro, 800, () => {
      intro.style.display = "none";
      openCurtains(curtainLeft, curtainRight, () => {
        stage2GameEnabled = true; // 操作開始
      });
    });
  });

  // -----------------------------
  // スイカクリック処理（Stage2 専用）
  // -----------------------------
  stage2Watermelons.forEach((wm, index) => {
    wm.onclick = async () => {
      if (!stage2GameEnabled) return;

      // 初回クリック → 照準
      if (stage2SelectedIndex !== index) {
        stage2SelectedIndex = index;
        setStage2Flash(index);
        moveLuntuForStage2(luntu, wm);
        return;
      }

      // 2回目クリック → 攻撃
      await stage2Attack(luntu);

      // 当たり判定
      if (index === stage2CharIndex) {
        setStage2Flash(null);
        stage2SelectedIndex = null;

        await stage2ClearSequence(luntu);

        // Stage2 → clear → resetToOpening()
        showMessage("clear.png", () => {
          resetToOpening();
        });

        return;
      }

      // はずれ：消す
      wm.style.display = "none";
      setStage2Flash(null);
      stage2SelectedIndex = null;
    };
  });
}

// ============================================
// ▼ Stage2 スイカ照準（Stage1 と名前衝突しないように専用化）
// ============================================
function setStage2Flash(index) {
  stage2Watermelons.forEach(w => w.classList.remove("flash"));
  if (index == null) return;
  stage2Watermelons[index].classList.add("flash");
}

// ============================================
// ▼ Stage2 ルントウ移動
// ============================================
function moveLuntuForStage2(luntu, target) {
  const targetCenterX = target.offsetLeft + target.offsetWidth / 2;
  const luntuLeft = targetCenterX - luntu.offsetWidth / 2;
  const luntuTop = target.offsetTop - luntu.offsetHeight - 0.2 * luntu.offsetHeight;
  luntu.style.left = `${luntuLeft}px`;
  luntu.style.top = `${luntuTop}px`;
}

// ============================================
// ▼ Stage2 攻撃演出（簡易版）
// ============================================
async function stage2Attack(luntu) {
  stage2GameEnabled = false;
  luntu.classList.add("jump");
  await new Promise(r => setTimeout(r, 300));
  luntu.classList.remove("jump");
  stage2GameEnabled = true;
}

// ============================================
// ▼ Stage2 クリア演出（勝利の舞）
// ============================================
async function stage2ClearSequence(luntu) {
  stage2GameEnabled = false;
  for (let i = 0; i < 3; i++) {
    luntu.classList.add("jump");
    await new Promise(r => setTimeout(r, 350));
    luntu.classList.remove("jump");
    await new Promise(r => setTimeout(r, 150));
  }
  stage2GameEnabled = true;
}

// ============================================
// ▼ 汎用：フェードイン / フェードアウト
// ============================================
function fadeIn(elem, duration, callback) {
  elem.style.transition = `opacity ${duration}ms`;
  elem.style.opacity = 1;
  setTimeout(() => callback && callback(), duration);
}

function fadeOut(elem, duration, callback) {
  elem.style.transition = `opacity ${duration}ms`;
  elem.style.opacity = 0;
  setTimeout(() => callback && callback(), duration);
}

// ============================================
// ▼ 汎用：カーテン開き
// ============================================
function openCurtains(left, right, callback) {
  left.style.transition = "left 0.8s";
  right.style.transition = "right 0.8s";

  left.style.left = "-50%";
  right.style.right = "-50%";

  setTimeout(() => callback && callback(), 900);
}

