/** 
 * 节点对象扩展
 * Author      : donggang
 * Create Time : 2016.8.9
 */

/** 
 * 创建Sprite类型的节点组件 
 * @param resPath(string)        资源地址（资源必须已加载到内存中）
 * @param spriteFrameKey(string) 精灵帧关键字
 */
cc.Node.createSprite = function(resPath, spriteFrameKey = null) {
    var node   = new cc.Node();
    var sprite = node.addComponent(cc.Sprite);
    if (spriteFrameKey == null)
        sprite.spriteFrame = cc.loader.getResByType(resPath,cc.SpriteFrame);
    else 
        sprite.spriteFrame = cc.loader.getResByType(resPath,cc.SpriteAtlas).getSpriteFrame(spriteFrameKey);
    return node;
}
/** 
 * 复制给定的对象并绑定脚本组件
 * @param resPath(string)      预制资源地址
 * @param scriptPath(string)   脚本资源地址
 */
cc.Node.createPrefab = function(resPath, scriptPath){
    var prefab = cc.loader.getRes(resPath);
    var result = cc.instantiate(prefab);
    if (scriptPath && result.getComponent(scriptPath) == null)
        result.addComponent(require(scriptPath));
    return result;
}

/** 创建一个全屏模糊层蒙板 */
cc.Node.createBlock = function(){
    var node = new cc.Node("block");
    var ctx  = node.addComponent(cc.Graphics);
    ctx.rect(
        -cc.director.getWinSize().width / 2, 
        -cc.director.getWinSize().height / 2, 
        cc.director.getWinSize().width, 
        cc.director.getWinSize().height);
    ctx.fillColor = cc.color(0, 0, 0, 100);
    ctx.fill();
    return node;
}

/** 所有触摸事件停止冒泡开启 */
cc.Node.touchStopPropagationOpen = function(node){
    node.on(cc.Node.EventType.TOUCH_START , cc.Node._stopPropagation);
    node.on(cc.Node.EventType.TOUCH_MOVE  , cc.Node._stopPropagation);
    node.on(cc.Node.EventType.TOUCH_END   , cc.Node._stopPropagation);
    node.on(cc.Node.EventType.TOUCH_CANCEL, cc.Node._stopPropagation);

    node.on(cc.Node.EventType.MOUSE_ENTER, cc.Node._stopPropagation);
    node.on(cc.Node.EventType.MOUSE_LEAVE, cc.Node._stopPropagation);
},

/** 所有触摸事件停止冒泡关闭 */
cc.Node.touchStopPropagationClose = function(node){
    node.off(cc.Node.EventType.TOUCH_START , cc.Node._stopPropagation);
    node.off(cc.Node.EventType.TOUCH_MOVE  , cc.Node._stopPropagation);
    node.off(cc.Node.EventType.TOUCH_END   , cc.Node._stopPropagation);
    node.off(cc.Node.EventType.TOUCH_CANCEL, cc.Node._stopPropagation);

    node.off(cc.Node.EventType.MOUSE_ENTER, cc.Node._stopPropagation);
    node.off(cc.Node.EventType.MOUSE_LEAVE, cc.Node._stopPropagation);
}

cc.Node._stopPropagation = function(event){
    event.stopPropagation();
}

//--------------------------------------------------------------------------------------------------------------

/** 
 * 触发所有组件的指定方法
 * @param funName(string)    方法名
 * @param params(Array)      数组
 */
cc.Node.prototype.applyComponentsFunction = function(funName, params){
    var components = this._components;
    for (var i = 0; i < components.length; i++) {
        var component = components[i];
        var func      = component[funName];
        if (func) func.call(component, params);
    }
}