cc.Class({
    extends: cc.Component,

    properties: {
        /** 玩家名 */
        nickname: {
            set: function (value) {
                this._nickname    = value;
                this._name.string = value == undefined ? "" : value;
            }
        },

        /** 设置飞机皮肤 */
        skin: {
            set: function (value) {
                this._avatar.getComponent(cc.Sprite).spriteFrame = game.sheet.getSpriteFrame("plane{0}_0".format(value + 1));
            }
        }
    }, 

    onLoad: function () {

    }
});
