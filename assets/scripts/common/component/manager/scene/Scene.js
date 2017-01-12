/** 
 * 基础游戏场景
 * Author      : donggang
 * Create Time : 2016.9.18　　　　　　　　　　　　　　　　　　   
 */
window.game         = window.game || {};
game.SceneLayerType = game.SceneLayerType || {};

game.SceneLayerType.MAP        = "MapLayer";                            // 游戏玩法层 － 用于地图滚屏
game.SceneLayerType.UI         = "UiLayer";                             // 操作界面层 － 常驻界面
game.SceneLayerType.POP        = "UiLayerPop";                          // 弹出窗口层 － 窗口获取焦点时绘制在当前逻辑层的最上层
game.SceneLayerType.POP_STATIC = "UiLayerPopStatic";                    // 静态弹出窗口层

game.SceneLayerType.GUIDE      = "layer_guide";                         // 新手引导层 － 引擎界面通过获取目标引导按钮的位置动态定位到目标上，避免不同屏幕出现偏差
game.SceneLayerType.TIPS       = "layer_tips";                          // 提示信息层 － 界面小组手类帮助小提示

module.exports = cc.Class({
    extends: cc.Node,

    ctor : function(){
        this._layers = {};   

        // 场景初始化
        this._init();
    },

    /** 场景初始化 */
    _init : function(){
        var UiLayer          = require(game.SceneLayerType.UI);　　　　
        var UiLayerPop       = require(game.SceneLayerType.POP);　
        var UiLayerPopStatic = require(game.SceneLayerType.POP_STATIC);　　

        this.addChild(new UiLayer(game.SceneLayerType.UI));
        this.addChild(new UiLayerPop(game.SceneLayerType.POP));
        this.addChild(new UiLayerPopStatic(game.SceneLayerType.POP_STATIC));
    },

    /**
     * 加载新场景
     * @param newUiResPath(string)                           新界面资源地址
     * @param operate{
     *      preloaded : "common/image"|['a.png', 'b.png']    预加载文件夹
     *      params    : [a,b,c]                              自定义参数，在新界面的added事件中接受
     *      cleanup   : false                                是否清理上一个界面的实例缓存
     *      sign      : false                                是否标记新的内存块并释放上一个内存块
     * }
     * @param complete(function(node))                       转场完成事件
     */
    load : function(newUiResPath, operate, complete){       
        // 添加游戏主场景
        this.getChildByName(game.SceneLayerType.UI).add(newUiResPath, operate, complete);
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
        var uiLayer      = this.getChildByName(game.SceneLayerType.UI);
        var previousNode = uiLayer.childrenCount == 0 ? null : uiLayer.children[0];

        if (this._isReplaceUi) {
            cc.error("正有一个界面【{0}】在替换中，在当前界面替换完成前不能在替换界面".format(previousNode.manager_data.resPath));
            return;
        }

        if (uiLayer.childrenCount > 1) { 
            cc.error("常驻界面层同时只能存在一个预制界面");
            return;
        }

        var complete = function(node){
            if (previousNode) {
                uiLayer.remove(previousNode, operate);

                if (sign) this.res.releasePrevious(); 
            }

            this._isReplaceUi = false;
        }.bind(this);

        
        // 开始替换界面
        var sign = operate == null || operate.sign == null ? null  : operate.sign;

        if (sign) this.res.retain(sign);

        this._isReplaceUi = true;
        uiLayer.add(newUiResPath, operate, complete);
    },

    /** 
     * 添加弹出窗口 
     * @param resPath(string)           资源路径
     * @param operate{
     *      preloaded    : "common/image"|['a.png', 'b.png']    预加载文件夹
     *      params       : [a,b,c]                              自定义参数，在新界面的added事件中接受
     *      addedToScene : function(node)                       添加到场景事件
     * }
     */
    addPop : function(resPath, operate){
        this.getChildByName(layer_pop).add(resPath, operate);
    },

    /** 
     * 移除弹出窗口 
     * @param resPathOrCCNode(string|cc.Node)       资源路径
     * @param operate{
     *      params         : [a,b,c]                自定义参数，在关闭界面的onRemoved、removedToScene事件中接受
     *      cleanup        : false                  是否清理实例内存
     * }
     */
    removePop : function(resPathOrCCNode, operate) {
        this.getChildByName(layer_pop).remove(resPathOrCCNode, operate);
    },

    /** 
     * 添加静态弹出窗口 
     * @param resPath(string)       资源路径
     * @param operate{
     *      preloaded    : "common/image"|['a.png', 'b.png']    预加载文件夹
     *      params       : [a,b,c]                              自定义参数，在新界面的added事件中接受
     *      addedToScene : function(node)                       添加到场景事件
     * }
     */
    addPopStatic(resPath, operate) {
        this.getChildByName(layer_pop_static).add(resPath, operate);
    },

    /** 
     * 移除静态弹出窗口 
     * @param resPathOrCCNode(string|cc.Node)       资源路径
     * @param operate{
     *      params         : [a,b,c]                自定义参数，在关闭界面的onRemoved、removedToScene事件中接受
     *      cleanup        : false                  是否清理实例内存
     * }
     */
    removePopStatic : function(resPathOrCCNode, operate) {
        this.getChildByName(layer_pop_static).remove(resPathOrCCNode, operate);
    },

    //  /** 
    //  * 添加提示界面-提示窗口会自动在目标附近显示
    //  * @param name(string)       资源名
    //  * @param target(cc.Node)    提示的目标节点
    //  */
    // addTips : function(resPath, target, operate){
    //      this._addPrefab(layer_tips, resPath, null, operate);
    // },

    //  /** 
    //  * 移除提示窗口 
    //  * @param resPathOrCCNode(string|cc.Node)       资源路径
    //  */
    // removeTips : function(resPathOrCCNode) {
    //     this._removePrefab(layer_tips, resPathOrCCNode, false);
    // },

    /** 
     * 清除所有逻辑层节点 
     * @param cleanup(boolen)                       是否清理在实例管理器中的缓存
     */
    clear : function(cleanup = false) {
        for(var i = 0; i < this.childrenCount; i++) {
            this.children[i].clear(cleanup);
        }
    }
});
