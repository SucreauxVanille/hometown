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
const MSG_HIT = "hit.png";

let charIndex = 0;       // 当たりスイカ
let lastClicked = -1;    // 前回クリックしたスイカ
let gameEnabled = false; // ゲーム開始判定

// -----------------------------
// 共通：メッセージ制御
// -----------------------------
function showMessage(imgName, onClick = null) {
  msgImage.src = imgName;
  msgWindow.style.display = "block";

  // クリック時の動作を設定
  msgWindow.onclick = () => {
    msgWindow.style.display = "none";
    if (onClick) onClick();
  };
}

// -----------------------------
// ゲーム初期化
// -----------------------------
function initGame() {
  // スイカ復活
  watermelons.forEach(w => {
    w.style.display = "block";
    w.classList.remove("flash");
  });

  // ルントウ初期位置
  luntu.style.left = "160px";
  luntu.style.top = "70px";

  // 当たり再抽選
  charIndex = Math.floor(Math.random() * 3);
  lastClicked = -1;
  gameEnabled = false;

  // スタートメッセージ表示
  showMessage(MSG_START, () => {
    gameEnabled = true;
  });
}

// -----------------------------
// ルントウ移動：スイカの上
// -----------------------------
function moveLuntuTo(target) {
  luntu.style.left = target.offsetLeft + "px";
  luntu.style.top = (target.offsetTop - 80) + "px";
}

// -----------------------------
// 攻撃メッセージを表示（短時間）
// -----------------------------
function showAttackMessage(duration = 700) {
  return new Promise(resolve => {
    showMessage(MSG_ATTACK);
    setTimeout(() => {
      msgWindow.style.display = "none";
      resolve();
    }, duration);
  });
}

// -----------------------------
// メイン：スイカクリック処理
// -----------------------------
watermelons.forEach((wm, index) => {
  wm.addEventListener("click", async () => {
    if (!gameEnabled) return;

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

    // ジャンプ時間
    await new Promise(r => setTimeout(r, 300));

    luntu.classList.remove("jump");
    wm.classList.remove("flash");

    // 判定
    if (index === charIndex) {
      // 当たり
      showMessage(MSG_HIT, initGame);
    } else {
      // ハズレ
      wm.style.display = "none";

      // missを表示→クリックで消えるだけ
      showMessage(MSG_MISS, () => {
        // ゲーム続行可能
      });
    }

    lastClicked = null;
  });
});

// -----------------------------
// ページ読み込みで初期化
// -----------------------------
initGame();
