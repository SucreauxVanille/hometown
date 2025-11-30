// gameover.js

/**
 * 共通ゲームオーバー演出
 * @param {HTMLElement} luntu - ルントウ DOM
 * @param {HTMLElement} deku - デク DOM
 * @param {HTMLElement} msgWindow - メッセージウィンドウ DOM
 * @param {HTMLElement} msgImage - メッセージ画像 DOM
 * @param {Function} resetCallback - ステージ固有オブジェクトリセット & オープニング移行
 */
async function showGameOver(luntu, deku, msgWindow, msgImage, resetCallback) {

    // クリック無効化
    let stageEnabled = false;
    stageEnabled = false;

    // --- 画像読み込み ---
    const missImg = new Image();
    missImg.src = "miss.png";

    const dekuImg = new Image();
    dekuImg.src = "deku.png";

    const gameOverImg = new Image();
    gameOverImg.src = "gameover.png";

    // --- Deku 初期化 ---
    deku.style.position = "absolute";
    deku.style.opacity = 0;
    deku.style.display = "block";
    deku.style.visibility = "hidden";

    const startLeft = luntu.offsetLeft;
    const startTop  = luntu.offsetTop;
    deku.style.left = startLeft + "px";
    deku.style.top  = startTop + "px";
    deku.style.visibility = "visible";

    // Deku が Luntu に追従
    const followInterval = setInterval(() => {
        deku.style.left = luntu.offsetLeft + "px";
        deku.style.top  = luntu.offsetTop + "px";
    }, 40);

    // --- miss.png 短時間表示 ---
    msgImage.src = missImg.src;
    msgWindow.style.display = "block";
    await new Promise(r => setTimeout(r, 800));
    msgWindow.style.display = "none";

    // --- Luntu 点滅 ---
    let intervalTime = 200;
    for (let i = 0; i < 10; i++) {
        luntu.style.opacity = i % 2 === 0 ? 1 : 0;
        deku.style.opacity = 0;
        await new Promise(r => setTimeout(r, intervalTime));
    }

    // --- Luntu & Deku 交互点滅 ---
    intervalTime = 200;
    for (let i = 0; i < 20; i++) {
        luntu.style.opacity = i % 2 === 0 ? 1 : 0;
        deku.style.opacity  = i % 2 === 0 ? 0 : 1;
        await new Promise(r => setTimeout(r, intervalTime));
        if (i === 9) intervalTime = 120;
        if (i === 14) intervalTime = 60;
    }

    // --- Deku 点滅 ---
    luntu.style.opacity = 0;
    intervalTime = 60;
    for (let i = 0; i < 20; i++) {
        deku.style.opacity = i % 2 === 0 ? 1 : 0;
        await new Promise(r => setTimeout(r, intervalTime));
        if (i === 9) intervalTime = 120;
        if (i === 14) intervalTime = 200;
    }
    deku.style.opacity = 1;

    clearInterval(followInterval);

    // --- ゲームオーバー表示 ---
    msgImage.src = gameOverImg.src;
    msgWindow.style.display = "block";

    // --- クリックで閉じる & ステージリセット ---
    await new Promise(resolve => setTimeout(resolve, 500));
    msgWindow.onclick = () => {
        msgWindow.style.display = "none";
        deku.style.display = "none";
        deku.style.opacity = 0;
        luntu.style.opacity = 1;
        luntu.style.display = "block";

        // ステージ固有オブジェクトリセット
        resetCallback();
    };
}

