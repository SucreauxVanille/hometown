const luntu = document.getElementById("luntu");
const watermelons = [
  document.getElementById("w0"),
  document.getElementById("w1"),
  document.getElementById("w2")
];

let charIndex = Math.floor(Math.random() * 3); // 当たりスイカ
let lastClicked = -1;

function moveLuntuTo(target) {
  luntu.style.left = target.offsetLeft + "px";
  luntu.style.top = (target.offsetTop + 70) + "px";
}

watermelons.forEach((wm, index) => {
  wm.addEventListener("click", () => {
    // 1回目タップ：移動のみ
    if (lastClicked !== index) {
      lastClicked = index;
      moveLuntuTo(wm);
      return;
    }

    // 2回目タップ：判定
    luntu.classList.add("jump"); // ルントウジャンプ
    setTimeout(() => luntu.classList.remove("jump"), 250);

    wm.classList.add("flash"); // スイカ点滅

    setTimeout(() => {
      if (index === charIndex) {
        alert("チャーをたおした！");
      } else {
        alert("チャーはいなかった…");
        wm.style.display = "none"; // 消去
      }
      lastClicked = null; // 次のクリック用にリセット
    }, 900);
  });
});
