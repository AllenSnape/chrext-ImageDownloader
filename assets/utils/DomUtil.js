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

}