let lastTapped = null;     // 直前にタップされたスイカ
let answer = Math.floor(Math.random() * 3);  // チャーが潜む位置（0,1,2）

const luntu = document.getElementById("luntu");
const message = document.getElementById("message");
const panels = document.querySelectorAll(".panel");

panels.forEach(panel => {
  panel.addEventListener("click", () => {
    const id = Number(panel.dataset.id);

    // ルントウをスイカ位置に移動（panelの中央へ）
    const rect = panel.getBoundingClientRect();
    const parentRect = document.getElementById("game").getBoundingClientRect();
    const centerX = rect.left - parentRect.left + rect.width / 2;
    luntu.style.left = `${centerX}px`;

    // 初回タップ → 移動して終わり
    if (lastTapped !== id) {
      lastTapped = id;
      message.textContent = "";
      return;
    }

    // 2回目タップ → 判定
    if (id === answer) {
      message.textContent = "チャーをたおした！";
      disableAll();
    } else {
      message.textContent = "チャーはいなかった…";
      panel.classList.add("disabled");
      panel.removeEventListener("click", this);
      // パネルが消えたので続行
      lastTapped = null;
    }
  });
});

// 全パネルクリック不可にする
function disableAll() {
  panels.forEach(p => {
    p.style.pointerEvents = "none";
  });
}
