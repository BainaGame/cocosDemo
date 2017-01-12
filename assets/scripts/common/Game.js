cc.Class({
    extends: cc.Component,

    onLoad: function () {
        var canvas = cc.find("Canvas");

        // 引擎根路径
        window.game      = window.game || {};

        require("MathExt");                     // 数学对象扩展
        require("DateExt");                     // 日期对象扩展
        require("ArrayExt");                    // 数组对象扩展
        require("StringExt");                   // 字符串对象扩展

        require("CCJSExt");                     // 引擎cc.js对象扩展
        require("CCUrlExt");                    // 引擎cc.url对象扩展
        require("CCNodeExt");                   // 引擎cc.Node对象扩展
        require("CCColorExt");                  // 引擎cc.Color对象扩展
        require("CCLoaderExt");                 // 引擎cc.loader对象扩展
        require("CCTextureCacheExt");           // 引擎cc.textureCache对象扩展

        require("MessageManager")               // 游戏全局消息事件管理
        require("GameTime");                    // 游戏时间管理

        game.canvas   = canvas;
        game.config   = require("GameConfig");
        game.pool     = require("PoolManager");                                    // 节点对象池管理

        game.cache  = canvas.addComponent(require("CacheManager"));                // 全局缓存 
        game.audio  = canvas.addComponent(require("AudioManager"));                // 音乐管理
        game.scene  = canvas.addComponent(require("SceneManager"));                // 场景管理 

        this.run();
    },

    run : function(){
        // TODO:重写方法，进入游戏
    }
});

//------------------------------------------------------------------------------------------

window.__errorHandler = function(){
    var list = arguments;
    var list = Array.prototype.splice(0, list.length);
    cc.log("Global: __errorHandler:")
    cc.log(list)
}

window.cc.kmGLPushMatrix = function(){
    for (var i = 0; i < arguments.length; ++i){
        cc.log("kmGLPushMatrix:" + arguments[i]);
    }
}