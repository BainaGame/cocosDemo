/** 
 * 全局缓存管理
 * Author      : donggang
 * Create Time : 2016.8.8
 * 
 * 例：
 * var a = function(){
       this.x = 1;
       this.y = 2;
   }
   game.cache.registerDataModel(a);
   game.cache.getDataModel(a);
   game.cache.getDataModel("a");
 */
module.exports = cc.Class({
    extends: cc.Component,

    onLoad : function () {
        this._dataType  = {};        // 数据类型集合
        this._dataCache = {};        // 游戏数据缓存
    },

    /**
     * 注册游戏数据模型
     * @param type(function)  数据结构对象
     */
    registerDataModel : function(type){
        var typeName = cc.js.getFunctionName(type);
        this._dataType[typeName] = type;
        
        if (this._dataCache[typeName] == null)
            this._dataCache[typeName] = new type();

        return this._dataCache[typeName];
    },

    /**
     * 获取数据模型
     * @param typeOrClassName(class/string)  数据结构对象
     */
    getDataModel : function (typeOrClassName){
        var typeName;
        if(cc.js.isString(typeOrClassName))
            typeName = typeOrClassName;
        else
            typeName = cc.js.getFunctionName(typeOrClassName);
            
        return this._dataCache[typeName];
    },

    /**
     * 移除数据模型
     * @param typeOrClassName(class/string)  数据结构对象
     */
    removeDataModel : function (typeOrClassName){
        var typeName;
        if(cc.js.isString(typeOrClassName))
            typeName = typeOrClassName;
        else
            typeName = cc.js.getFunctionName(typeOrClassName);

        delete this._dataCache[typeName];
    }
});