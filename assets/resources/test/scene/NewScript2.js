cc.Class({
    extends: cc.Component,

    onLoad: function () {
        cc.log(cc.loader.isAutoRelease("SceneDemo2"));
        cc.textureCache.memory();
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    },

    _onTouchEnd: function (event) {
        cc.director.preloadScene('SceneDemo1', function () {
            cc.director.loadScene('SceneDemo1');
        });
    },
});
