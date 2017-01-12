/** 
 * 音乐缩放按钮
 * Author      : donggang
 * Create Time : 2016.8.25
 */
window.game = window.game || {};
game.ui     = game.ui     || {}; 
game.ui.ButtonScale = module.exports = cc.Class({
    extends: require("ButtonSimple"),

    properties: {
        scale : {
            default : 0.85,
            tooltip : "按钮动画缩放比例"
        },
        duration : {
            default :  0.1,
            tooltip : "按钮动画播放时间"
        }
    },

    onLoad: function () {
        this.sourceScale     = this.node.scale;
        this.scaleDownAction = cc.scaleTo(this.duration, this.scale);
        this.scaleUpAction   = cc.scaleTo(this.duration, this.sourceScale);

        this._super();
    },

    _onTouchtStart : function(event) {
        this.node.stopAllActions();
        this.node.runAction(this.scaleDownAction);
        this._super(event); 
    },

    _onTouchEnd : function (event) {
        this.node.stopAllActions();
        this.node.runAction(this.scaleUpAction);

        game.audio.playEffect("resources/persist/sounds/winggrab.mp3");

        this._super(event); 
    }
});
