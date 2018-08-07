const ImageDownloaderMsgDict = {
    // 根据CSS选择器筛选图片
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
                // 根据CSS选择器获取图片信息
                case ImageDownloaderMsgDict.getImgsByCssSelector: {
                    // 扫描出来的图片
                    const imgSource = this.document.body.querySelectorAll(msg.selector);
                    // 返回的图片集合
                    const imgs = [];
                    for (const img of imgSource) {
                        // 检查参数
                        if (img.src === undefined || img.src === null) continue;

                        // 检查连接是否已经存在
                        let exists = false;
                        for (const i of imgs) {
                            if (i.src === img.src) {
                                exists = true;
                                break;
                            }
                        }

                        // 不存在则添加到集合
                        if (!exists) { 
                            imgs.push({
                                src: img.src
                            });
                        }
                    }

                    // 返回图片
                    sendResponse(imgs);
                } break;
                default: console.warn('未知消息命令!')
            }
        });
    }

}