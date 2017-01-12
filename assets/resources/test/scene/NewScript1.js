cc.Class({
    extends: cc.Component,

    onLoad: function () {
        // cc.loader.setAutoRelease("SceneDemo1", true);
        // cc.loader.setAutoRelease("SceneDemo2", true);

        cc.log(cc.loader.isAutoRelease("SceneDemo1"));


        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    },

    _onTouchEnd: function (event) {
           cc.loader.release(cc.url.raw("resources/persist/health_add2.png")); 
        cc.textureCache.memory();
        // cc.director.preloadScene('SceneDemo2', function () {
                
        //     var deps = cc.loader.getDependsRecursively('SceneDemo1');
        //     cc.loader.release(deps);
        //     cc.loader.releaseRes("persist/health_add3");
        //     cc.director.loadScene('SceneDemo2'); 
        // });
    },
});
