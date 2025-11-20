// ============================================
// ▼ DOM取得
// ============================================
const opening = document.getElementById("opening");
const openingPress = document.getElementById("openingPress");
const game = document.getElementById("game");
const curtainLeft = document.getElementById("curtainLeft");
const curtainRight = document.getElementById("curtainRight");
const msgWindow = document.getElementById("messageWindow");
const msgImage = document.getElementById("messageImage");

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

let charIndex = 0;       // 当たりスイカ
let lastClicked = -1;    // 前回クリック
let gameEnabled = false; // ゲーム開始判定
let missCount = 0;       // 異なるハズレ回数
let missedIndexes = new Set(); // ハズレスイカindex管理
let repeatCount = 0;     // 連続クリック回数
let openingActive = true; // オープニング処理中フラグ

// ============================================
// ▼ 共通：メッセージ表示
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
// ▼ 攻撃演出（短時間表示）
// ============================================
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

// ============================================
// ▼ 当たり演出（hit → hit2 → hit3 → clear）
// ============================================
async function playHitSequence() {
  gameEnabled = false;
  showMessage(MSG_HIT1);
  await new Promise(r => setTimeout(r, 600));
  showMessage(MSG_HIT2);
  await new Promise(r => setTimeout(r, 600));
  showMessage(MSG_HIT3, () => {
    // クリックでclear表示 → クリックでオープニングに戻る
    showMessage(MSG_CLEAR, () => returnToOpening());
    gameEnabled = true;
  });
}

// ============================================
// ▼ クリア／ゲームオーバー後オープニング戻し
// ============================================
function returnToOpening() {
  gameEnabled = false;

  // カーテンリセット
  curtainLeft.style.display = "block";
  curtainRight.style.display = "block";
  curtainLeft.className = "curtain";
  curtainRight.className = "curtain";

  // オブジェクト初期位置リセット
  luntu.style.left = "150px";
  luntu.style.top = "60px";
  watermelons.forEach(w => {
    w.style.display = "block";
    w.classList.remove("flash");
  });

  // ゲーム画面非表示 → オープニング表示
  game.style.display = "none";
  opening.style.display = "block";
  openingActive = true;
}

// ============================================
// ▼ オープニング画面制御（イントロ付き）
// ============================================
opening.addEventListener("click", () => {
  if (!openingActive) return;
  openingActive = false;

  // press点滅
  openingPress.classList.add("press-flash");

  setTimeout(() => {
    // 暗転開始
    curtainLeft.classList.add("curtain-show");
    curtainRight.classList.add("curtain-show");

    setTimeout(() => {
      // イントロ画像表示（クリックで閉じる）
      const intro = document.createElement("img");
      intro.src = "intro.png";
      intro.id = "introMessage";
      intro.style.position = "absolute";
      intro.style.top = "20px";
      intro.style.left = "50%";
      intro.style.transform = "translateX(-50%)";
      intro.style.zIndex = "1000";
      document.body.appendChild(intro);

      intro.addEventListener("click", () => {
        intro.remove();

        // カーテン開放
        curtainLeft.classList.add("curtain-open-left");
        curtainRight.classList.add("curtain-open-right");

        setTimeout(() => {
          curtainLeft.style.display = "none";
          curtainRight.style.display = "none";

          // ゲーム開始
          initGame();
        }, 1000);
      });
    }, 500); // 暗転完了待機
  }, 600); // press点滅時間
});

// ============================================
// ▼ メイン：スイカクリック処理
// ============================================
watermelons.forEach((wm, index) => {
  wm.addEventListener("click", async () => {
    if (!gameEnabled) return;

    // 連続クリック制御
    if (lastClicked !== index) repeatCount = 0;
    else repeatCount++;
    if (repeatCount >= 2) return;

    // 1回目：移動のみ
    if (lastClicked !== index) {
      lastClicked = index;
      moveLuntuTo(wm);
      return;
    }

    // 2回目：攻撃演出
    await showAttackMessage(400);

    luntu.classList.add("jump");
    wm.classList.add("flash");
    await new Promise(r => setTimeout(r, 300));
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
          showMessage(MSG_GAMEOVER, () => returnToOpening());
        });
      } else {
        showMessage(MSG_MISS);
      }
    }

    lastClicked = null;
  });
});

// ============================================
// ▼ ページロードで初期化
// ============================================
initGame();
