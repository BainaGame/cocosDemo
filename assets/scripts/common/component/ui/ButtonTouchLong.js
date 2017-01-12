/** 
 * 简单按钮
 * Author      : donggang
 * Create Time : 2016.8.12
 * 
 * 需求说明
 * 1、可让父节点触发冒泡事件
 * 2、防连点击
 */
window.game       = window.game       || {};
game.ui           = game.ui           || {};
game.ui.EventType = game.ui.EventType || {};
game.ui.EventType.BUTTON_TOUCH_LONG = "button_touch_long";        // 长按事件

game.ui.ButtonTouchLong = module.exports = cc.Class({
    extends: require("ButtonSimple"),

    properties: {
        time : {
            default : 0.8,
            tooltip : "长按时间"
        }
    },
    
    onLoad: function () {
        this._isTouchStart = false;
        this._isTouchLong  = true;
        this._timer        = new game.ui.timer(this.time);                                 // 计时器

        this._super();
    },

    /** 触摸开始 */
    _onTouchtStart : function(event){
        this._event         = event;        // 长按事件参数
        this._isTouchStart  = true;         // 触摸开始
        this._isTouchLong   = false;        // 是否已触发长按
        this._timer.reset();
    },

    /** 触摸结束 */
    _onTouchEnd : function (event) {
        this._isTouchStart = false;
        
        // 长按事件触发后就不触发触摸结束
        if (this._isTouchLong) {
            this._event = null;
            event.stopPropagation();
            return;
        }

        this._super(event);
    },

    /** 长按事件 */
    _onTouchLong : function(event){
        
    },
    
    // 计算长按事件
    update : function(dt){
        if (this._isTouchStart && this._isTouchLong == false) {
            if (this._timer.update(dt)){
                this._isTouchLong = true;
                this._onTouchLong(this._event);

                this._event.type  = game.ui.EventType.BUTTON_TOUCH_LONG;
                this.node.dispatchEvent(this._event);
            }
        }
    }
});