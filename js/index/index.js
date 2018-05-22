// 当前被选中的tab的id
let pageid = undefined;
// 上一次扫描后的图片URL
let scannedImgs = [];

// 当点击标签页时
chrome.tabs.getSelected(function (tab) {
    pageid = tab.id;
});

// 通知content.js返回对应CSS选择器对应的img标签的src属性内容
function getImgsByCssSelector(selector, selected) {
    chrome.tabs.sendMessage(pageid, { text: 'getImgsByCssSelector', selector: selector }, function (imgs) {
        return selected instanceof Function ? selected.call(this, imgs) : undefined;
    });
}

// 下载链接
function download() {
    for (let i = 0; i < scannedImgs.length; i++) {
        chrome.downloads.download({
            url: scannedImgs[i],
            filename: 
            ($('#savePath').val() + ($('#savePath').val()[$('#savePath').val().length - 1] === '/' ? '' : '/')) + 
            (
                scannedImgs[i].startsWith('data:') ? 
                (i + '.' + scannedImgs[i].substring(scannedImgs[i].indexOf('/') + 1, scannedImgs[i].indexOf(';'))) :
                scannedImgs[i].substring(scannedImgs[i].lastIndexOf('/') + 1, scannedImgs[i].length)
            )
        });
    }
}

// 根据CSS选择器下载图片
function scanImgs() {
    // 获取输入的选择器代码
    const queryStr = $('#queryStr').val();
    if (queryStr === '') {
        layer.msg('请输入CSS选择器以便选择img标签');
        return;
    }
    // 通知content.js获取对应的img标签
    getImgsByCssSelector(queryStr, function (imgs) {
        if (imgs === undefined || imgs.length === 0) {
            scannedImgs = [];
            DomUtil.freeze($('#confirmBtn').get(0));
            layer.msg('该CSS选择器有误或没有找到对应的图片标签');
        } else {
            scannedImgs = imgs;
            DomUtil.unfreeze($('#confirmBtn').get(0));
        }
        showImgs();
    });
}

// 展示上一次扫描了之后的图片
function showImgs() {
    // 清空元素
    $('#imgViewer').empty();
    // 递归拼接元素
    for (let i = 0; i < scannedImgs.length; i++) {
        const img = scannedImgs[i];
        $('#imgViewer').append(
            `
                <div class="col-xs-12" imgIndex="` + i + `">
                    <img src="` + img + `" />
                    <img src="` + img + `" />
                </div>
            `
        );
    }
    // 绑定删除事件
    $('#imgViewer').children('div').bind({
        click: function() {
            thiz = $(this);
            scannedImgs.splice(thiz.attr('imgIndex'), 1);
            thiz.fadeOut(150, function() {
                thiz.remove();
            });
        }
    });
    // 显示出场动画
    if (scannedImgs.length === 0) {
        $('#imgViewer').fadeOut();
    } else {
        $('#imgViewer').fadeIn();
    }
}

$(function () {
    $('#confirmBtn').bind({
        click: function () {
            download();
        }
    });

    $('#scanBtn').bind({
        click: function() {
            scanImgs();
        }
    });

    showImgs();
});
