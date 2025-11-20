const luntu = document.getElementById("luntu");
const watermelons = [
  document.getElementById("w0"),
  document.getElementById("w1"),
  document.getElementById("w2")
];

const msgWindow = document.getElementById("messageWindow");
const msgImage = document.getElementById("messageImage");

let charIndex = Math.floor(Math.random() * 3); // 当たりスイカ
let lastClicked = -1;

// -----------------------------
// 共通：メッセージ制御
// -----------------------------
function showMessage(imgName) {
  msgImage.src = imgName;
  msgWindow.style.display = "block";
}

function hideMessage() {
  msgWindow.style.display = "none";
}

// -----------------------------
// ルントウ移動：スイカの上側に移動
// -----------------------------
function moveLuntuTo(target) {
  luntu.style.left = target.offsetLeft + "px";
  luntu.style.top = (target.offsetTop - 80) + "px"; 
  // ↑スイカより上に来るように調整
}

// -----------------------------
// メイン：スイカをクリックしたときの処理
// -----------------------------
watermelons.forEach((wm, index) => {
  wm.addEventListener("click", async () => {

    // ---------- 1回目タップ：移動のみ ----------
    if (lastClicked !== index) {
      lastClicked = index;
      moveLuntuTo(wm);
      return;
    }

    // ---------- 2回目タップ：当たり判定＋演出 ----------

    // attackメッセージ表示（読み時間確保）
    showMessage("attack.png");

    // 少し間を置いて演出開始（読みやすくする）
    await new Promise(r => setTimeout(r, 700));

    // ルントウジャンプ & スイカ点滅
    luntu.classList.add("jump");
    wm.classList.add("flash");

    // ジャンプアニメーション時間
    await new Promise(r => setTimeout(r, 300));

    // ジャンプ・点滅終了
    luntu.classList.remove("jump");
    wm.classList.remove("flash");

    // attack 消える
    hideMessage();

    // ---------- 判定 ----------
    if (index === charIndex) {

      // 当たり
      showMessage("hit.png");

      // hitメッセージをタップでリセット
      msgWindow.onclick = () => location.reload();

    } else {

      // ハズレ
      wm.style.display = "none"; // スイカ消去
      showMessage("miss.png");

      // missメッセージをタップで閉じて続行
      msgWindow.onclick = () => hideMessage();
    }

    // 次回クリック用にリセット
    lastClicked = null;

    // 前回のイベントの残りをクリア
    msgWindow.onclick = null;
  });
});
