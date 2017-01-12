/** 
 * ＲＰＧ类游戏场景
 * Author      : donggang
 * Create Time : 2016.9.18　　　　　　　　　　　　　　　　　　   
 */
module.exports = cc.Class({
    extends: require("Scene"),

    /** 场景初始化 */
    _init : function(){
        var MapLayer = require(game.SceneLayerType.MAP);　
        　　　
        this.addChild(new MapLayer(game.SceneLayerType.MAP));

        this._super();
    },
});
