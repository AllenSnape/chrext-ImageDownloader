const ImageDownloaderMsgDict = {
    getImgsByCssSelector: 'getImgsByCssSelector'
};

class ImageDownloader {

}

/**
 * 图片下载器content_scripts的内容
 */
class ImageDownloaderContentScript {
    
    /**
     * 构造器
     * @param chrome chrome插件可以访问的chrome对象
     * @param document 被监听的dom对象
     */
    constructor (chrome, document) {
        this.chrome = chrome;
        this.document = document;
    }

    /**
     * 开始监听
     */
    startListen() {
        // 开启消息监听
        this.chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            switch(msg.text) {
                case ImageDownloaderMsgDict.getImgsByCssSelector: {
                    const imgs = this.document.body.querySelectorAll(msg.selector);
                    const imgSrcs = [];
                    for (const img of imgs) {
                        if (img.src && !imgSrcs.includes(img.src)) imgSrcs.push(img.src);
                    }
                    sendResponse(imgSrcs);
                } break;
                default: console.warn('未知消息命令!')
            }
        });
    }

}