let lastTapped = null;     // 直前にタップされたスイカ
let answer = Math.floor(Math.random() * 3);  // チャーが潜む位置（0,1,2）

const luntu = document.getElementById("luntu");
const message = document.getElementById("message");
const panels = document.querySelectorAll(".panel");

panels.forEach(panel => {
  panel.addEventListener("click", () => {
    const id = Number(panel.dataset.id);

    // ルントウをスイカ位置に移動
    const rect = panel.getBoundingClientRect();
    const parentRect = document.getElementById("game").getBoundingClientRect();
    const centerX = rect.left - parentRect.left + rect.width / 2;
    luntu.style.left = `${centerX}px`;

    // 初回タップ → 移動のみ
    if (lastTapped !== id) {
      lastTapped = id;
      message.textContent = "";
      return;
    }

    // 二回目タップ → 判定
    if (id === answer) {
      message.textContent = "チャーをたおした！";
      disableAll();
    } else {
      message.textContent = "チャーはいなかった…";

      // そのスイカを無効化
      panel.classList.add("disabled");
      panel.style.pointerEvents = "none";

      // ロック解除
      lastTapped = null;
    }
  });
});

function disableAll() {
  panels.forEach(p => {
    p.style.pointerEvents = "none";
  });
}

