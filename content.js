// 监听消息
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === 'getImgsByCssSelector') {
        const imgs = document.body.querySelectorAll(msg.selector);
        const imgSrcs = [];
        for (const img of imgs) {
            if (img.src) imgSrcs.push(img.src);
        }
        sendResponse(imgSrcs);
    }
});