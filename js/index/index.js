let pageid = undefined;

// 当点击标签页时
chrome.tabs.getSelected(function (tab) {
    pageid = tab.id;
});

function getImgsByCssSelector(selector, selected) {
    chrome.tabs.sendMessage(pageid, { text: 'getImgsByCssSelector', selector: selector }, function (imgs) {
        return selected instanceof Function ? selected.call(this, imgs) : undefined;
    });
}

function download() {
    // 获取输入的选择器代码
    const queryStr = $('#queryStr').val();
    if (queryStr === '') {
        layer.msg('请输入CSS选择器以便选择img标签');
        return;
    }

    // 通知content.js获取对应的img标签
    getImgsByCssSelector(queryStr, function (imgs) {
        if (imgs === undefined || imgs.length === 0) {
            layer.msg('该CSS选择器有误或没有找到对应的图片标签');
            return;
        }
        for (let i = 0; i < imgs.length; i++) {
            chrome.downloads.download({
                url: imgs[i],
                filename: 
                ($('#savePath').val() + ($('#savePath').val()[$('#savePath').val().length - 1] === '/' ? '' : '/')) + 
                (
                    imgs[i].startsWith('data:') ? 
                    (i + '.' + imgs[i].substring(imgs[i].indexOf('/') + 1, imgs[i].indexOf(';'))) :
                    imgs[i].substring(imgs[i].lastIndexOf('/') + 1, imgs[i].length)
                )
            });
        }
    });
}

$(function () {
    $('#confirmBtn').bind({
        click: function () {
            download();
        }
    });
});
