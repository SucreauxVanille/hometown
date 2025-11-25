// ============================================
// ▼ オープニング画面制御
// ============================================
const opening = document.getElementById("opening");
const openingPress = document.getElementById("openingPress");
const game = document.getElementById("game");
const curtainLeft = document.getElementById("curtainLeft");
const curtainRight = document.getElementById("curtainRight");
const intro = document.getElementById("intro"); // イントロ画像
document.getElementById("backgroundLayer").classList.add("hidden");

let openingActive = true;

// ==============================
// イントロ表示（フェードイン→静止→フェードアウト）
// ==============================
function showIntro(duration = 5500) {
  return new Promise(resolve => {
    intro.style.display = "block";
    setTimeout(() => { intro.style.opacity = 1; }, 55); // フェードイン

    setTimeout(() => {
      intro.style.opacity = 0; // フェードアウト
      setTimeout(() => {
        intro.style.display = "none";
        resolve();
      }, 1000); // フェードアウト同期
    }, duration);
  });
}

// ==============================
// オープニングクリック処理
// ==============================
opening.addEventListener("click", async () => {
  if (!openingActive) return;
  openingActive = false;

  // press点滅
  openingPress.classList.add("press-flash");

  // 点滅終了後、暗転
  await new Promise(r => setTimeout(r, 600));
  curtainLeft.classList.add("curtain-show");
  curtainRight.classList.add("curtain-show");

  await new Promise(r => setTimeout(r, 400)); // 暗転待機

  // イントロ表示
  await showIntro(5500);

  document.getElementById("backgroundLayer").classList.remove("hidden");

  // カーテンオープン
  opening.style.display = "none";
  game.style.display = "block";
  curtainLeft.classList.add("curtain-open-left");
  curtainRight.classList.add("curtain-open-right");

  setTimeout(() => {
    curtainLeft.style.display = "none";
    curtainRight.style.display = "none";
    initGame(); // script.js 側関数
  }, 1000);
});

// -----------------------------
// resetToOpening 修正版（introは非表示のままリロード）
// -----------------------------
function resetToOpening() {
  // ゲーム画面非表示・オープニング表示
  game.style.display = "none";
  opening.style.display = "flex";

  // カーテン初期化
  curtainLeft.style.display = "block";
  curtainRight.style.display = "block";
  curtainLeft.className = "curtain";    
  curtainRight.className = "curtain";

  // Press 初期化
  openingPress.style.display = "block";
  openingPress.classList.remove("press-flash");

  // luntu 初期化
  luntu.style.left = "120px";
  luntu.style.top = "40px";
  luntu.style.opacity = 1;

  deku.style.display = "none";

  // intro.gif 再読み込み（非表示のまま）
  intro.style.display = "none";
  intro.style.opacity = 0;

  const gifSrc = "intro.gif";
  intro.src = "";                
  setTimeout(() => { 
    intro.src = gifSrc;          
  }, 10);

  openingActive = true;
}
