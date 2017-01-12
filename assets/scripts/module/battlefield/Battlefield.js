cc.Class({
    extends: cc.Component,

    onLoad: function () {
        // cc.loader.loadResourceAll("persist",cc.SpriteFrame, function(a){
        //     cc.log(a);
        // });

        // 纹理图集
        game.sheet = cc.loader.getResByType("persist/plist/sheet", cc.SpriteAtlas);
        game.play  = game.scene.getLayer(game.SceneLayerType.MAP);
        
        // 创建地图
        game.play.createMap(2000,1000);

        // 攻击键
        cc.find("btn_attack", this.node).on(cc.Node.EventType.TOUCH_END   , this._onTouchEnd, this);
        cc.find("btn_attack", this.node).on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
        
        // 加速键
        cc.find("btn_speed", this.node).on(cc.Node.EventType.TOUCH_END   , this._onTouchEnd, this);
        cc.find("btn_speed", this.node).on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);

        // 创建飞机
        var player = game.play.addPlayer(1, "persist/prefab/battlefield/plane_hero");

        player.on("position-changed", function(event){
            game.play.x = - event.currentTarget.x;
            game.play.y = - event.currentTarget.y;
        }, this);
    },

     /** 战斗技能按钮 */
    _onTouchEnd : function(event){
        switch(event.target.name){
            case "btn_attack":
                cc.log("攻击");
                break;
            case "btn_speed":
                cc.log("加速");
                break;
        }
    }
});
