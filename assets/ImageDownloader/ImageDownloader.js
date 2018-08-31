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

    // 扫描出来的图片
        this.imageList = [];
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

                    /* const imgs = [];

                    this.imageList = this.document.querySelectorAll(msg.selector);
                    for (let i = 0; i < this.imageList.length; i++) {
                        this.getBlobFromImg(this.imageList[i], (url, params) => {
                            imgs[params.index] = {src: url};

                            if (params.index === this.imageList.length - 1) {
                                console.log(imgs);
                                sendResponse(imgs);
                            }
                        }, {index: i});
                    } */

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
    
    /**
     * 获取img标签blob的url
     * @param {HTMLImageElement} img 图片标签
     * @param {Function} gotBlob     获取到blob之后的回调
     * @param {any} params           回调调用时返回的参数
     */
    getBlobFromImg(img, gotBlob, params) {
        // 创建canvas对象
        const canvas = document.createElement("canvas");
        // 设置画布大小
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        // 填充图片
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        // 获取图片blob
        canvas.toBlob((b) => {
            gotBlob.call(this, URL.createObjectURL(b), params);
        });
    }

}