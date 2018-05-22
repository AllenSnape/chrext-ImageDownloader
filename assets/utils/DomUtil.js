class DomUtil {

    /**
     * 给一个标签添加disabled属性
     * @param {*} dom Dom对象
     */
    static freeze(dom) {
        dom.setAttribute('disabled', 'disabled');
    }

    /**
     * 移除一个标签的disabled属性
     * @param {*} dom 
     */
    static unfreeze(dom) {
        dom.removeAttribute('disabled');
    }

    /**
     * 获取dom对象的绝对位置
     * @param {*} dom 
     */
    static getDomPosition(dom) {
        var pos = { "top": 0, "left": 0 };
        if (dom.offsetParent) {
            while (dom.offsetParent) {
                pos.top += dom.offsetTop;
                pos.left += dom.offsetLeft;
                dom = dom.offsetParent;
            }
        } else if (dom.x) {
            pos.left += dom.x;
        } else if (dom.x) {
            pos.top += dom.y;
        }
        return { x: pos.left, y: pos.top };
    }

}