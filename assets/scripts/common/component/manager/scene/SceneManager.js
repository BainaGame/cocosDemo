/** 
 * 游戏场景管理
 * Author      : donggang
 * Create Time : 2016.8.6
 * 
 * 需求说明　　　　　　　　　　　   
 * 1、智能内存块加载、释放资源管理
 * 2、场景转换时会将新场景的预制路径做为当前内存块名，此场景后面所有加载的资源都属于此内存块
 */
module.exports = cc.Class({
    extends: cc.Component,

    onLoad : function(){
        this._resManager     = new (require("ResourceManager"))();           // 资源内存管理
        this._isReplaceScene = false;                                        // 是否在替换场景
        this._scenes         = {};
        this._sceneType      = "Scene";
    },

    /** 
     * 设置转场时的场景类型 
     * @params  sceneType  场景类型（类型为 Scene、SceneRPG）
     */
    setSceneType : function(sceneType){
        this._sceneType = sceneType;
    },

    /** 获取当前场景 */
    getScene : function(){
        return this._current;
    },

    /** 
     * 获取逻辑层节点对象（可能会删除这个方法）
     * return cc.Node
     */
    getLayer : function(name){
        return this._current.getChildByName(name);
    },

    /** 
     * 获取资源管理对象
     * return ResourceManager
     */
    getResManager(){
        return this._resManager;
    },

    //--------------------------------------------------------------------------------------------------------------

    /** 
     * 替换场景（会释放上一个场景标记的的内存）
     * @param newSceneResPath(string)                        新场景资源地址
     * @param operate{
     *      preloaded : "common/image"|['a.png', 'b.png']    预加载文件夹
     *      params    : [a,b,c]                              自定义参数，在新界面的added事件中接受
     * }
     * @param cache   : false                                是否缓存场景
     */
    replaceScene : function(newSceneResPath, operate, cache = false){
        if (this._isReplaceScene) {
            cc.error("正有一个场景在替换中，在当前场景替换完成前不能在替换新场景")
            return;
        }

        // 新场景加载完成
        var complete = function(node) {
            if (this._previous){
                this._previous.parent = null;

                if (this._previous.cache == false){                // 释放不缓存的场景
                    this._previous.destroy();                      // 释放场景对象
                    this._resManager.releasePrevious();            // 转场释放当前标记的内存（思考：缓存场景中的资源，在前两个场景中有用到，在释放时，会释放缓存场景中的资源，这时会出问题, 考虑资源引用计数来解决、公共场景中）
                    delete this._scenes[this._previous.name]; 
                }
            }

            this._isReplaceScene = false;
            // if (game.environment.showMemory) cc.textureCache.memory();
        }.bind(this);

        // 开始替换场景
        this._isReplaceScene  = true;
        this._previous        = this._current;

        // 标记内存块
        this._resManager.retain(newSceneResPath);
        
        // 显示当前场景
        this._current = this._scenes[newSceneResPath];
        if (this._current == null){
            var Scene            = require(this._sceneType);
            this._current        = new Scene(newSceneResPath); 
            this._current.res    = this._resManager;
            this._current.cache  = cache;
            this._current.load(newSceneResPath, operate, complete);
            this._scenes[newSceneResPath] = this._current;
        }
        this._current.parent = this.node;
    },

    /** 
     * 替换界面
     * @param newUiResPath(string)                           新界面资源地址
     * @param operate{
     *      preloaded : "common/image"|['a.png', 'b.png']    预加载文件夹
     *      params    : [a,b,c]                              自定义参数，在新界面的added事件中接受
     *      cleanup   : false                                是否清理上一个界面的实例缓存
     *      sign      : false                                是否标记新的内存块并释放上一个内存块
     * }
     */
    replaceUi : function(newUiResPath, operate){
        this._current.replaceUi(newUiResPath, operate);
    },

    /** 
     * 添加弹出窗口 
     * @param resPath(string)           资源路径
     * @param operate{
     *      preloaded      : "common/image"|['a.png', 'b.png']    预加载文件夹
     *      params         : [a,b,c]                              自定义参数，在新界面的added事件中接受
     *      addedToScene   : function(node)                       添加到场景事件
     *      removedToScene : function()                           移除场景事件
     * }
     */
    addPop : function(resPath, operate){
        this._current.addPop(resPath, operate);
    },

    /** 
     * 移除弹出窗口 
     * @param resPathOrCCNode(string|cc.Node)       资源路径
     * @param cleanup(boolen)                       是清理实例内存
     */
    removePop : function(resPathOrCCNode, cleanup = false) {
        this._current.removePop(resPathOrCCNode, cleanup);
    },

    /** 
     * 添加静态弹出窗口 
     * @param resPath(string)       资源路径
     * @param operate{
     *      preloaded      : "common/image"|['a.png', 'b.png']    预加载文件夹
     *      params         : [a,b,c]                              自定义参数，在新界面的added事件中接受
     *      addedToScene   : function(node)                       添加到场景事件
     *      removedToScene : function()                           移除场景事件
     * }
     */
    addPopStatic(resPath, operate) {
        this._current.addPopStatic(resPath, operate);
    },

    /** 
     * 移除静态弹出窗口 
     * @param resPathOrCCNode(string|cc.Node)       资源路径
     * @param cleanup(boolen)                       是清理实例内存
     */
    removePopStatic : function(resPathOrCCNode, cleanup = false) {
        this._current.removePopStatic(resPathOrCCNode, cleanup);
    },

    // /** 
    //  * 添加提示界面-提示窗口会自动在目标附近显示
    //  * @param name(string)       资源名
    //  * @param target(cc.Node)    提示的目标节点
    //  */
    // addTips : function(resPath, target, operate){
    //     this._current.addTips(resPath, target, operate);
    // },

    //  /** 
    //  * 移除提示窗口 
    //  * @param resPathOrCCNode(string|cc.Node)       资源路径
    //  */
    // removeTips : function(resPathOrCCNode) {
    //     this._current.removeTips(resPathOrCCNode);
    // },

    /** 
     * 清除所有逻辑层节点 
     * @param cleanup(boolen)                       是否清理在实例管理器中的缓存
     */
    clear : function(cleanup = false) {
        this._current.clear(cleanup);
    }
});