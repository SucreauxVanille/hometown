// gameover.js

/**
 * 共通ゲームオーバー演出
 * @param {HTMLElement} luntu - ルントウのDOM
 * @param {HTMLElement} deku - デクのDOM
 * @param {HTMLElement} msgWindow - メッセージウィンドウDOM
 * @param {HTMLElement} msgImage - メッセージ画像DOM
 * @param {Function} resetCallback - オブジェクトリセット＆オープニング移行関数
 */
async function showGameOver(luntu, deku, msgWindow, msgImage, resetCallback) {
    // クリックロック用
    let stageEnabled = false;
    stageEnabled = false;

    // 初期処理：オブジェクトリセット
    // ここでは Luntu を残す、Deku は非表示
    deku.style.position = "absolute";
    deku.style.opacity = 0;
    deku.style.display = "block";
    deku.style.visibility = "hidden";

    const startLeft = luntu.offsetLeft;
    const startTop  = luntu.offsetTop;
    deku.style.left = startLeft + "px";
    deku.style.top  = startTop + "px";
    deku.style.visibility = "visible";

    // Deku を Luntu に追従させる
    const followInterval = setInterval(() => {
        deku.style.left = luntu.offsetLeft + "px";
        deku.style.top  = luntu.offsetTop + "px";
    }, 40);

    // Luntu 点滅
    let intervalTime = 200;
    for (let i = 0; i < 10; i++) {
        luntu.style.opacity = i % 2 === 0 ? 1 : 0;
        deku.style.opacity = 0;
        await new Promise(r => setTimeout(r, intervalTime));
    }

    // Luntu & Deku 交互点滅
    intervalTime = 200;
    for (let i = 0; i < 20; i++) {
        luntu.style.opacity = i % 2 === 0 ? 1 : 0;
        deku.style.opacity  = i % 2 === 0 ? 0 : 1;
        await new Promise(r => setTimeout(r, intervalTime));
        if (i === 9) intervalTime = 120;
        if (i === 14) intervalTime = 60;
    }

    // Deku 点滅
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

    // メッセージ表示
    msgImage.src = "gameover.png";
    msgWindow.style.display = "block";

    // クリックで閉じる
    await new Promise(resolve => setTimeout(resolve, 500)); // 少し待つ
    msgWindow.onclick = () => {
        msgWindow.style.display = "none";
        deku.style.display = "none";
        deku.style.opacity = 0;
        luntu.style.opacity = 1;
        luntu.style.display = "block";
        resetCallback();
    };
}
