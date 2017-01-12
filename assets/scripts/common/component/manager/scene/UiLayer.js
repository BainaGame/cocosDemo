/** 
 * 游戏界面层
 * Author      : donggang
 * Create Time : 2016.9.24
 */
module.exports = cc.Class({
    extends: cc.Node,

    ctor : function () {
        this._nodes = {};           // 节点结合

        // 设置背景水平居中、垂直居低
        this.setContentSize(cc.director.getWinSize().width, cc.director.getWinSize().height);

        // 子节点移除事件
        this.on("child-removed", this._onChildRemoved, this);
    },

    /** 
     * 清除逻辑层节点 
     * @param cleanup(boolen)                                   是否清理在实例管理器中的缓存
     */
    clear : function(cleanup = false){
        if (cleanup){
            this._nodes = {};
        }
        this.removeAllChildren(cleanup);
    },

    /** 
     * 获取资源
     * @param operate                             
     * @param completeCallback  : function(ndoe)                加载完成回调（内部使用）
     */
    _loadRes : function(operate, completeCallback){
        var loadPrefab = function(){
            cc.loader.loadRes(operate.resPath, cc.Prefab, function(error, content){
                if(error)
                    cc.error(error.message || error);
                else
                    completeCallback(content);
            });
        }

        // 自定义预加载资源
        if (operate.preloaded){
            if (cc.js.isString(operate.preloaded)) {
                cc.loader.loadResAll(operate.preloaded, function(error, content) { 
                    if(error)
                        cc.error(error.message || error);
                    else
                        loadPrefab(); 
                });
            } 
            else if (operate.preloaded instanceof Array) {
                cc.loader.loadResByUrls(operate.preloaded, function() { loadPrefab(); });
            }
        }
        else {
            loadPrefab();
        }
    },

    /** 加载所以资源完成 */
    _loadComplete : function(node) {},

    /** 节点显示之前 */
    _showBefore : function(node) {},

    /** 显示新节点 */
    _show : function(node, operate, completeCallback){
        // 显示之前
        this._showBefore(node);                          

        // 绑定场景管理相关当前节点数据
        node.manager_data = operate;
        
        // 节点添加到场景上
        if (node.parent == null){
            this.addChild(node, this.childrenCount);
        }
        
        // 子节点添加到父节点事件
        node.applyComponentsFunction("onAdded", operate.addedToSceneParams);
        
        // 新场景处理完成事件
        if (completeCallback) completeCallback(node);
        
        // 窗口打开动画
        if (operate.animationOpen) { 
            if (cc.js.isString(operate.animationClose)) {                       // 静态动画资源文件
                
            } 
            else if(operate.animationClose instanceof cc.Action) {              // 动态Action动画
                
            }
        }
        
        // 添加到场景事件
        if (operate.addedToScene) operate.addedToScene(node);
    },

    /** 
     * 添加预制实例
     * path         : "common/prefab"                             预制资源路径
     * @param operate{
     *      preloaded      : "common/image"|['a.png', 'b.png']    预加载文件夹
     *      params         : [a,b,c]                              自定义参数，在新界面的added事件中接受
     *      addedToScene   : function                             添加到场景事件
     *      removedToScene : function                             移除场景事件
     * }
     * completeCallback  : function(ndoe)                         加载完成回调（内部使用）
     */
    add : function(path, operate, completeCallback){
        if (operate != null && typeof operate != "object") {
            cc.error("operate参数必须是一个object对象");
            return;
        }
        else if (operate == null)  operate = {};
        
        // 添加到场景时的参数
        operate.addedToSceneParams = operate.params;
        delete operate["params"];

        // 新场景预制资源路径
        operate.path = path;                                    

        var paths = operate.path.split(',');
        if (paths.length > 1){
            operate.resPath    = paths[0];
            operate.scrpitPath = paths[1];
        }
        else { 
            operate.resPath = operate.path;
        }

        var newNode = this._nodes[operate.resPath];
        if (newNode != null && newNode.parent != null) {
            cc.error("【{0}】层的【{1}】资源已在舞台上".format(this.name, operate.resPath));
            return;
        }
        else if(newNode != null && newNode.parent == null) {
            this._show(newNode, operate, completeCallback); 
        }
        else {
            this._loadRes(operate, function(operate, completeCallback, prefab){
                var node = cc.instantiate(prefab);

                // 绑定预制脚本文件
                if (operate.scrpitPath && node.getComponent(operate.scrpitPath) == null){
                    node.addComponent(require(operate.scrpitPath));
                }
                
                // 缓存节点
                this._nodes[operate.resPath] = node;             // 添加到节点集合缓存

                if (node.width == 0 || node.height == 0)
                    cc.error("节点宽和高不都不能为零，请检查预制【{0}】在编辑器中根节点的Size属性".format(node.name));

                // 加载完成
                this._loadComplete(node);
                
                // 显示节点
                this._show(node, operate, completeCallback);     
            }.bind(this, operate, completeCallback));
        }
    },

    /** 
     * 添加预制实例
     * @param resPathOrCCNode(string|cc.Node)   资源路径
     * @param operate{
     *      params         : [a,b,c]            自定义参数，在关闭界面的onRemoved、removedToScene事件中接受
     *      cleanup        : false              是否清理实例内存
     * }
     */
    remove : function(resPathOrCCNode, op) {
        var resPath;
        if (resPathOrCCNode instanceof cc.Node) {
            if (resPathOrCCNode.manager_data == null) {
                cc.warn("节点不在框架管理范围内");
                return;
            }

            resPath = resPathOrCCNode.manager_data.resPath;
        }
        else 
            resPath = resPathOrCCNode;

        var node    = this._nodes[resPath];
        var operate = node.manager_data;
        if (op) {
            operate.removedToSceneParams = op.params;
            operate.cleanup              = op.cleanup;
        }
        else{
            operate.cleanup              = false;
        }

        // 窗口关闭动画
        if (operate.animationClose) { 
            if (cc.js.isString(operate.animationClose)) {                   // 静态动画资源文件
               
            } 
            else if(operate.animationClose instanceof cc.Action) {          // 动态Action动画
                
            }
        }

        // 从父节点移除节点
        node.parent = null;

        // 释放窗口节点
        if (operate.cleanup == true) { 
            delete this._nodes[resPath];
            node.destroy();
        }
    },

    /** 子节点从父节点移除事件 */
    _onChildRemoved : function(event) {
        var parentNode = event.currentTarget;
        var childNode  = event.detail;
        var operate    = childNode.manager_data;

        if (operate == null) {
            cc.warn("节点不在框架管理范围内");
            return;
        }

        // 触发节点移出事件
        childNode.applyComponentsFunction("onRemoved", operate.removedToSceneParams);

        // 触发从场景移除事件
        if (operate.removedToScene) {
            operate.removedToScene(operate.removedToSceneParams);
        }
    }
});
