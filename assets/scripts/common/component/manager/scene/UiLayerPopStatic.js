/** 
 * 游戏静态弹窗界面层
 * Author      : donggang
 * Create Time : 2016.9.24
 */
module.exports = cc.Class({
    extends: require("UiLayer"),

    ctor : function(){
        this._block = cc.Node.createBlock();
        this._block.parent = this;

        cc.Node.touchStopPropagationOpen(this);

        this.active = false;
    },

    /** 加载所以资源完成 */
    _loadComplete : function(node){
        cc.Node.touchStopPropagationOpen(node);
    },
    
    /** 节点显示之前 */
    _showBefore : function(node){
        this.active = true;
    },

    _onChildRemoved : function(event) {
        if (this.childrenCount <= 1){
            this.active = false;
        }

        this._super(event);
    }
});
