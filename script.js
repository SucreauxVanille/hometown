const luntu = document.getElementById("luntu");
const watermelons = [
  document.getElementById("w0"),
  document.getElementById("w1"),
  document.getElementById("w2")
];
const message = document.getElementById("message");

// 画像ファイル名（同一ディレクトリ）
const MSG_START = "start.png";
const MSG_ATTACK = "attack.png";
const MSG_MISS = "miss.png";
const MSG_HIT = "hit.png";

let charIndex = 0;      // 当たり
let lastClicked = -1;   // 前回クリックしたスイカ
let gameEnabled = false; // start.png が消えてから true

// ▼ ゲーム初期化
function initGame() {
  // スイカ復活
  watermelons.forEach(w => {
    w.style.display = "block";
    w.classList.remove("flash");
  });

  // ルントウ初期化
  luntu.style.left = "160px";
  luntu.style.top = "150px";

  // 当たり再設定
  charIndex = Math.floor(Math.random() * 3);

  lastClicked = -1;
  gameEnabled = false;

  // スタートメッセージを表示
  showMessage(MSG_START, () => {
    message.style.display = "none";
    gameEnabled = true;
  });
}

// ▼ メッセージを画像で表示（タップで callback 実行）
function showMessage(imgName, callback) {
  message.src = imgName;
  message.style.display = "block";

  const handler = () => {
    message.removeEventListener("click", handler);
    callback();
  };

  message.addEventListener("click", handler);
}

// ▼ ルントウを移動
function moveLuntuTo(target) {
  luntu.style.left = target.offsetLeft + "px";
  luntu.style.top = (target.offsetTop + 70) + "px";
}

// ▼ 攻撃演出（attack.png を短時間表示）
function showAttackMessage() {
  message.src = MSG_ATTACK;
  message.style.display = "block";

  setTimeout(() => {
    message.style.display = "none";
  }, 300);
}

// ▼ ゲーム本体
watermelons.forEach((wm, index) => {
  wm.addEventListener("click", () => {
    if (!gameEnabled) return;

    // 移動フェーズ（1回目タップ）
    if (lastClicked !== index) {
      lastClicked = index;
      moveLuntuTo(wm);
      return;
    }

    // 攻撃フェーズ（2回目タップ）
    luntu.classList.add("jump");
    setTimeout(() => luntu.classList.remove("jump"), 250);
    wm.classList.add("flash");

    // attack.png を表示
    showAttackMessage();

    setTimeout(() => {
      if (index === charIndex) {
        // 当たり！
        showMessage(MSG_HIT, initGame);
      } else {
        // 外れ
        showMessage(MSG_MISS, () => {
          message.style.display = "none";
          wm.style.display = "none"; // スイカを消去して続行
        });
      }
      lastClicked = -1;
    }, 800);
  });
});

// ▼ ページ読み込みでゲーム開始
initGame();
