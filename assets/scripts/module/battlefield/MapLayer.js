/** 
 * 游戏玩法层
 * Author      : donggang
 * Create Time : 2016.8.27
 * 
 * 需求说明
 * 1、地图滚屏
 * 2、地图上可添加的游戏元素
 */
module.exports = cc.Class({
    extends: cc.Node,

    ctor: function () {
        this._map          = new (require("Map"))();                       // 地图层
        this._effectBottom = new cc.Node("layer_play_effect_bottom");      // 底特效层
        this._effectGoods  = new cc.Node("layer_play_effect_rock");        // 障碍物层
        this._player       = new cc.Node("layer_play_palyer");             // 玩家角色层
        this._effectTop    = new cc.Node("layer_play_effect_top");         // 上特效层

        this.addChild(this._map);
        this.addChild(this._effectBottom);
        this.addChild(this._effectGoods);
        this.addChild(this._player);
        this.addChild(this._effectTop);

        this._playerNodes       = {};                                      // 玩家节点集合   
        this._effectTopNodes    = {};                                      // 上层特效节点集合
        this._effectBottomNodes = {};                                      // 上层特效节点集合
        this._bulletNodes       = {};                                      // 子弹节点集合
    },

    /**
     * 删除场景上所有节点
     */
    clear : function(){
        this._playerNodes       = {};                                      // 玩家节点集合   
        this._effectTopNodes    = {};                                      // 上层特效节点集合
        this._effectBottomNodes = {};                                      // 上层特效节点集合
        
        for(var i = 0; i < this.childrenCount; i++){
            this.children[i].removeAllChildren(true);
        }

        this._map.clear();
    },


    clearElement : function(){
        for(var key in this._playerNodes){
            this.removePlayer(key);
        }
        this._playerNodes       = {};                                      // 玩家节点集合   

        for(var key in this._effectTopNodes){
            this.removeEffectTop(key);
        }
        this._effectTopNodes    = {};                                      // 上层特效节点集合

        for(var key in this._effectBottomNodes){
            this.removeEffectBottom(key);
        }
        this._effectBottomNodes = {};                                      // 上层特效节点集合

        this._effectGoods.removeAllChildren();
    },

    /**
     * 创建地图
     * @param width(int)     地图宽
     * @param height(int)    地图高
     */
    createMap : function(width, height) {
        this.setContentSize(width, height);
        this._map.create(width, height);
    },

    removeBullet(id){
        var bullet = this._bulletNodes[id];      
        if (bullet){
            bullet.stopAllActions();
            game.pool.put("bullet", bullet);
            delete this._bulletNodes[id];
        }
    },

    /**
     * 添加玩家对象
     * @param id(int|string)            玩家唯一编号
     * @param prefabPath(string)        预制路径
     */
    addPlayer : function(id, prefabPath) {
        var player = this._playerNodes[id];
        if (player == null) {
            var prefab = cc.loader.getResByType(prefabPath, cc.Prefab);
            player = cc.instantiate(prefab);
            this._playerNodes[id] = player;
        }

        if (player.parent == null)
            this._player.addChild(player);

        return player;
    },

    /**
     * 移除玩家对象
     * @param id(int|string)            玩家唯一编号
     */
    removePlayer : function(id) {
        var player = this._playerNodes[id];      
        if (player){
            this._player.removeChild(player);
        }
    },

    /**
     * 添加上层特效
     */
    addEffectTop : function(id, prefabPath) {
        var prefab = cc.loader.getResByType(prefabPath, cc.Prefab);
        var effect = cc.instantiate(prefab);
        this._effectTopNodes[id + "_" + prefabPath] = effect;
        this._effectTop.addChild(effect);

        return effect;
    },

    /**
     * 移除上层特效
     */
    removeEffectTop : function(child) {
        this._effectTop.removeChild(child);
    },

    /**
     * 添加下层特效
     */
    addEffectBottom : function(id, child) {
        this._effectBottomNodes[id] = child;
        this._effectBottom.addChild(child);
    },

    /**
     * 移除下层特效
     */
    removeEffectBottom : function(id) {
        var child = this._effectBottomNodes[id];      
        if (child){
            this._effectBottom.removeChild(child);
        }
        return child;
    },
});
