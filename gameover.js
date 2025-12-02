// gameover.js
/**
 * 共通ゲームオーバー演出
 * @param {HTMLElement} luntu - ルントウ DOM
 * @param {HTMLElement} msgWindow - メッセージウィンドウ DOM
 * @param {HTMLElement} msgImage - メッセージ画像 DOM
 * @param {Function} resetCallback - ステージ固有リセット
 */
export async function showGameOver(luntu, msgWindow, msgImage, resetCallback) {

    // --- deku は内部取得 ---
    const deku = document.getElementById("deku");

    // --- 画像読み込み ---
    const missImg = new Image();
    missImg.src = "miss.png";

    const dekuImg = new Image();
    dekuImg.src = "deku.png";

    const gameOverImg = new Image();
    gameOverImg.src = "gameover.png";

    // --- Deku 初期化 ---
    deku.style.position = "absolute";
    deku.style.opacity   = 0;
    deku.style.display   = "block";
    deku.style.visibility = "hidden";

    // Luntu の位置からスタート
    deku.style.left = luntu.offsetLeft + "px";
    deku.style.top  = luntu.offsetTop  + "px";
    deku.style.visibility = "visible";

    // --- Deku が Luntu に追従 ---
    const followInterval = setInterval(() => {
        deku.style.left = luntu.offsetLeft + "px";
        deku.style.top  = luntu.offsetTop  + "px";
    }, 40);

    // ======================================================
    // ① miss表示 → 0.7秒だけ見せる
    // ======================================================
    msgImage.src = missImg.src;
    msgWindow.style.display = "block";
    await wait(700); // ← miss認識時間

    // ======================================================
    // ② miss → gameover に切り替え（msgWindowは閉じない）
    // ======================================================
    msgImage.src = gameOverImg.src;

    // ======================================================
    // ③ gameoverを表示したまま Luntu 点滅開始
    // ======================================================

    // --- Luntu 単独点滅 ---
    await blinkLuntu(luntu, deku);

    // --- Luntu & Deku の交互点滅 ---
    await blinkLuntuDeku(luntu, deku);

    // --- Deku 単独点滅（最後にDekuが残る） ---
    await blinkDeku(luntu, deku);

    clearInterval(followInterval);

    // ======================================================
    // ④ クリックで閉じる → resetCallbackへ
    // ======================================================
    await wait(300); // 少し間を置くと自然

    msgWindow.onclick = () => {
        msgWindow.style.display = "none";

        // 表示初期化
        deku.style.display = "none";
        deku.style.opacity = 0;
        luntu.style.opacity = 1;
        luntu.style.display = "block";

        resetCallback();
    };
}

/* ======================================================
   補助関数（待機）
====================================================== */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ======================================================
   ルントウ点滅（最初）
====================================================== */
async function blinkLuntu(luntu, deku) {
    let interval = 200;
    for (let i = 0; i < 10; i++) {
        luntu.style.opacity = (i % 2 === 0 ? 1 : 0);
        deku.style.opacity = 0;
        await wait(interval);
    }
}

/* ======================================================
   ルントウ & デク 交互点滅
====================================================== */
async function blinkLuntuDeku(luntu, deku) {
    let interval = 200;
    for (let i = 0; i < 20; i++) {
        const l = (i % 2 === 0);
        luntu.style.opacity = l ? 1 : 0;
        deku.style.opacity  = l ? 0 : 1;

        await wait(interval);

        if (i === 9) interval = 120;
        if (i === 14) interval = 60;
    }
}

/* ======================================================
   デク 単独点滅（最後にデクが残る）
====================================================== */
async function blinkDeku(luntu, deku) {
    luntu.style.opacity = 0;
    let interval = 60;
    for (let i = 0; i < 20; i++) {
        deku.style.opacity = (i % 2 === 0 ? 1 : 0);
        await wait(interval);

        if (i === 9) interval = 120;
        if (i === 14) interval = 200;
    }
    deku.style.opacity = 1;
}

