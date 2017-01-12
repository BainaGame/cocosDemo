/** 
 * 游戏弹窗界面层
 * Author      : donggang
 * Create Time : 2016.9.24
 */
module.exports = cc.Class({
    extends: require("UiLayer"),

    _loadComplete : function(node){
        node.on(cc.Node.EventType.TOUCH_START, function(event) {
            for (var i = 0; i < this.childrenCount; i++) {
                var n = this.children[i];
                n.setLocalZOrder(n.getLocalZOrder() - 1);                    
            }

            // 选中弹出框显示在最上层
            event.currentTarget.setLocalZOrder(this.childrenCount);
        }, this);        

        // 弹出窗口添加触摸事件冒泡阻止，常驻界面大多是全屏预知，需要阻止触摸冒泡时在自己的逻辑代码中处理，以避免组织了玩法层的触摸事件
        cc.Node.touchStopPropagationOpen(node);
    }
});
