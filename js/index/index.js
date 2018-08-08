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
        // 保存路径
        const path = $('#savePath').val();
        // 图片链接
        const url = scannedImgs[i];
        if (url === null) continue;

        // 获取图片名称和格式
        let img = url.src;
        // base64数据是以data开头
        if (img.startsWith('data:')) {
            // 截取出文件格式, 以便组成文件名
            img = i + '.' + img.substring(img.indexOf('/') + 1, img.indexOf(';'));
        } 
        // 其他的就是URL的格式
        else {
            img.replace(/\\/gi, '/');
            // 先判断是否存在问号, 存在问号则先去除问号后的内容
            img = img.indexOf('?') === -1 ? img : img.substring(0, img.indexOf('?'));
            // 获取去除?后的URL的最后一节, 一般都是文件名了
            img = img.substring(img.lastIndexOf('/') + 1, img.length);
        }

        // 如果useDisplayedIndex被选中则使用(i+1)作为文件名称
        if ($('#useDisplayedIndex:checked').length > 0) {
            img = (i + 1) + (img.includes('.') ? img.substring(img.lastIndexOf('.'), img.length) : '');
        }

        chrome.downloads.download({
            url: url.src,
            filename: (['', '/', '\\'].includes(path) ? '' : (path + (path[path.length - 1] === '/' ? '' : '/'))) + img
        });

        // 下载后从列表删除
        // $('#imgViewer > div[imgIndex=' + i + ']').trigger('click');
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
                    <img src="` + img.src + `" />
                </div>
            `
        );
    }
    // 绑定删除事件
    $('#imgViewer').children('div').bind({
        click: function() {
            thiz = $(this);
            scannedImgs[thiz.attr('imgIndex') * 1] = null;
            thiz.fadeOut(150, function() {
                thiz.remove();

                // 如果删除完了则禁用下载按钮
                let allNulled = true;
                for (const img of scannedImgs) {
                    if (img !== null) {
                        allNulled = false;
                        break;
                    }
                }
                if (allNulled) {
                    DomUtil.freeze($('#confirmBtn').get(0));
                }
            });
        }
    });
    /* $('#imgViewer > div').children('img').on({
        load: function () {
            console.log(this, 'loaded');
        }
    }); */
    // 显示出场动画
    /* if (scannedImgs.length === 0) {
        $('#imgViewer').fadeOut();
    } else {
        $('#imgViewer').fadeIn();
    } */
}

// 记忆输入框在localStorage中key的前缀
const REMEMBERED_INPUTS_PREFIX = 'rememberedInputs_';
// 根据提供的key获取localStorage中的数据
function getRememberedInputs(key) {
    // 获取localStorage的数据
    let rememberedInputs = localStorage.getItem(key);
    try {
        // 格式化数据
        rememberedInputs = JSON.parse(rememberedInputs);
        // 检查数据
        rememberedInputs = rememberedInputs === null || rememberedInputs === undefined || !rememberedInputs instanceof Array ? [] : rememberedInputs;
    } catch (e) {
        rememberedInputs = [];
    }
    return rememberedInputs;
}
// 刷新记忆输入框的保存值
function writeToLocalStorage(dom) {
    // 离开时输入框的值
    const value = dom.val();
    if (value === undefined || value === null || value === '') return;
    // 获取localStorage的key
    const key = REMEMBERED_INPUTS_PREFIX + dom.attr('rememberable');
    // 获取设置保存的最多条数
    let count = dom.attr('rememberable-data-count') * 1;
    // 默认5条
    count = count && count > 0 ? count : 5;
    // 获取localStorage中的值
    const rememberedInputs = getRememberedInputs(key);
    // 添加到localStorage
    if (rememberedInputs.includes(value)) {
        rememberedInputs.splice(rememberedInputs.indexOf(value), 1);
    }
    rememberedInputs.push(value);
    // 检查是否超出设定值, 超出的切除
    if (rememberedInputs.length > count) rememberedInputs.splice(0, rememberedInputs.length - count);
    // 重新保存
    localStorage.setItem(key, JSON.stringify(rememberedInputs));
}

$(function () {
    // 绑定扫描按钮事件
    $('#scanBtn').bind({
        click: function() {
            writeToLocalStorage($('#savePath'));
            writeToLocalStorage($('#queryStr'));
            scanImgs();
        }
    });
    // 绑定下载按钮事件
    $('#confirmBtn').bind({
        click: function () {
            download();
        }
    });

    // 初始化"记忆输入框"
    let fadeOutTimeoutFlag = undefined;
    let fadeInTimeoutFlag = undefined;
    function fadeOut($dom) {
        clearTimeout(fadeInTimeoutFlag);
        $dom.css({
            opacity: 0
        });
        fadeOutTimeoutFlag = setTimeout(() => {
            $dom.hide();
        }, 150);
    }
    function fadeIn($dom) {
        clearTimeout(fadeOutTimeoutFlag);
        $dom.show();
        $dom.css({
            opacity: 1
        });
    }
    $('body').append(`
        <div id="rememberedInputsBox" style="display: none;">
            
        </div>
    `);
    $('[rememberable]').bind({
        blur: function() {
            // 隐藏待选框
            fadeOut($('#rememberedInputsBox'));
        },
        focus: function() {
            // 获取localStorage中的数据
            const key = REMEMBERED_INPUTS_PREFIX + $(this).attr('rememberable');
            const rememberedInputs = getRememberedInputs(key).reverse();

            // 清空预选框
            $('#rememberedInputsBox').empty();
            // 循环添加到dom
            for (const input of rememberedInputs) {
                $('#rememberedInputsBox').append(`
                    <div for="` + $(this).attr('rememberable') + `">` + input + `</div>
                `);
            }
            // 给预选项添加点击事件, 点击之后将内部显示的值回填到输入框, 并隐藏预选框
            $('#rememberedInputsBox > div').bind({
                click: function() {
                    $('[rememberable=' + $(this).attr('for') + ']').val($(this).text());
                    fadeOut($('#rememberedInputsBox'));
                }
            });

            // 设置预选框的位置
            const position = DomUtil.getDomPosition($(this).get(0));
            $('#rememberedInputsBox').css({
                top: position.y + 36 + 'px',
                left: position.x + 'px',
                width: $(this).css('width')
            });
            // 显示预选框
            fadeIn($('#rememberedInputsBox'));
        }
    });

    showImgs();
});
