/** 
 * 简单按钮
 * Author      : donggang
 * Create Time : 2016.8.12
 * 
 * 需求说明
 * 1、可让父节点触发冒泡事件
 * 2、防连点击
 */
window.game = window.game || {};
game.ui     = game.ui     || {}; 
game.ui.ButtonSimple = module.exports = cc.Class({
    extends: cc.Component,

    properties: {
        once : {
            default : false,
            tooltip : "是否只能触发一次"
        },
        interval : {
            default :  500,
            tooltip : "每次触发间隔"
        }
    },
    
    onLoad: function () {
        this._touchCount = 0;

        this.node.on(cc.Node.EventType.TOUCH_START , this._onTouchtStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END   , this._onTouchEnd   , this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd   , this);
    },

    /** 触摸开始 */
    _onTouchtStart : function(event){

    },

    /** 触摸结束 */
    _onTouchEnd : function (event) {
        if (this.once) {
            if (this._touchCount > 0) {
                event.stopPropagation();
                return;
            }
            this._touchCount++;
        }

        // 防连点500毫秒出发一次事件
        if (this._touchtEndTime && game.getTime() - this._touchtEndTime < this.interval) { 
            event.stopPropagation();
        }
        else {
            this._touchtEndTime = game.getTime();
        }
    }
});