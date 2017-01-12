/** 
 * 延迟释放组件的父节点
 * Author      : donggang
 * Create Time : 2016.9.8
 */
cc.Class({
    extends: cc.Component,

    properties: {
        delay : {
            default : 1,
            tooltip : "延时释放"
        },
    },

    onLoad: function () {
        this._timer = new game.ui.timer(this.delay);
    },

    update: function (dt) {
        if (this._timer.update(dt)){
            this.node.parent = null;
        }
    },
});
