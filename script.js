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
const MSG_HIT1 = "hit.png";
const MSG_HIT2 = "hit2.png";
const MSG_HIT3 = "hit3.png";
const MSG_CLEAR = "clear.png";
const MSG_GAMEOVER = "gameover.png";

let charIndex = 0;       // 当たりスイカ
let lastClicked = -1;    // 前回クリック
let gameEnabled = false; // ゲーム開始判定
let missCount = 0;       // 異なるハズレ回数
let missedIndexes = new Set(); // ハズレスイカのindex管理
let repeatCount = 0; // 連続クリック回数

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
  watermelons.forEach(w => {
    w.style.display = "block";
    w.classList.remove("flash");
  });

  luntu.style.left = "150px";
  luntu.style.top = "60px";

  charIndex = Math.floor(Math.random() * 3);
  lastClicked = -1;
  missCount = 0;
  missedIndexes.clear();
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
  const luntuTop = target.offsetTop - luntu.offsetHeight - 0.3 * luntu.offsetHeight;
  luntu.style.left = `${luntuLeft}px`;
  luntu.style.top = `${luntuTop}px`;
}

// -----------------------------
// 攻撃演出（短時間表示）
// -----------------------------
function showAttackMessage(duration = 700) {
  return new Promise(resolve => {
    gameEnabled = false; // 表示中クリック無効化
    showMessage(MSG_ATTACK);
    setTimeout(() => {
      msgWindow.style.display = "none";
      gameEnabled = true; // 再度有効化
      resolve();
    }, duration);
  });
}

// -----------------------------
// 当たり演出（hit → hit2 → hit3 → clear）
// -----------------------------
async function playHitSequence() {
  gameEnabled = false; // 表示中クリック無効化
  showMessage(MSG_HIT1);
  await new Promise(r => setTimeout(r, 600));
  showMessage(MSG_HIT2);
  await new Promise(r => setTimeout(r, 600));
  showMessage(MSG_HIT3, () => {
    showMessage(MSG_CLEAR, initGame);
    gameEnabled = true; // clearクリック後は有効化
  });
}

// -----------------------------
// メイン：スイカクリック処理
// -----------------------------
watermelons.forEach((wm, index) => {
  wm.addEventListener("click", async () => {
    if (!gameEnabled) return;
    // ▼▼▼ 連続クリック制御 ▼▼▼

    // 異なるスイカなら連続回数リセット
    if (lastClicked !== index) {
      repeatCount = 0;
    } else {
      repeatCount++;
    }

    // 同じスイカ3連続以上は禁止
    if (repeatCount >= 2) {
      return; // 完全無効（動作しない）
    }

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
    await new Promise(r => setTimeout(r, 300));
    luntu.classList.remove("jump");
    wm.classList.remove("flash");

    // 判定
    if (index === charIndex) {
      // 当たり
      playHitSequence();
    } else {
      // ハズレ
      if (!missedIndexes.has(index)) {
        missedIndexes.add(index);
        missCount++;
      }
      wm.style.display = "none";

      if (missCount >= 2) {
        // 2回目の異なるハズレ → まず MSG_MISS 表示
        showMessage(MSG_MISS, () => {
          // クリックで gameover
          showMessage(MSG_GAMEOVER, initGame);
        });
      } else {
        // ハズレ1回目 → MSG_MISS 表示のみ
        showMessage(MSG_MISS);
      }
    }

    lastClicked = null;
  });
});

// -----------------------------
// ページロードで初期化
// -----------------------------
initGame();

