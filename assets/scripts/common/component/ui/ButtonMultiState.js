var ButtonMultiStateItem = cc.Class({
    name: 'ButtonMultiStateItem',
    properties: {
        state: {
            default : "",
            tooltip : "状态关键字"
        },

        image: {
            default : null,
            type    : cc.Sprite, 
            tooltip : "图片数据"
        }
    }
});
   
/** 
 * 多状态按钮组件
 * Author      : donggang
 * Create Time : 2016.8.6
 * 
 * 需求说明
 * 1、设置默认状态
 * 2、设置多状态关键字、状态图标
 * 3、重写__changeStateHandler处理状态切换时的组件变化效果
 * 4、重写__clickHandler处理不同状态的业务逻辑
 * 5、继承此类使用
 * 6、如果有两个状态可以同时出现，使用方法changeState("State1,State2")，复合状态只需要处理点击逻辑，不需要设计状态图标
 */

window.game = window.game || {};
game.ui     = game.ui     || {}; 
game.ui.ButtonMultiState = module.exports = cc.Class({ 
    extends: cc.Sprite,
    properties: {
        defaultState : {
            default : "Default",
            tooltip : "默认状态关键字"
        },
        states : {
            default : [],
            type    : ButtonMultiStateItem,
            tooltip : "按钮状态项"
        }
    },

    onLoad: function () {
        this.stateCurrentName = null;                                                // 当前状态名
        this.stateDict        = {};                                                  // 状态对象集合
        for (var i = 0; i < this.states.length; i++){
            var stateName             = this.states[i].state;
            this.stateDict[stateName] = this.states[i];
        }

        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchtEnd, this);

        // 触发默认状态
        if (!CC_EDITOR)
            this.changeState(this.defaultState);
    },

    _onTouchtEnd : function(event){
        this.__clickHandler(this.stateCurrentName);
    },

    /** 
     * 切换状态 
     * @param stateName(string)     状态关键字
     */
    changeState : function (stateName) {
        var currentState = this.stateDict[stateName];
        if (currentState){
            this.stateCurrentName = stateName;
            
            var names = stateName.split(",");
            for(var i = 0; i < this.states.length; i++){
                for(var j = 0; j < names.length; j++){
                    if (this.states[i].image) {
                        if(names[j] == this.states[i].state){
                            this.states[i].image.node.active = true;
                        }
                        else {
                            this.states[i].image.node.active = false;
                        }
                    }
                }
            }

            this.__changeStateHandler(stateName); 
        } 
    },

    /** 切换状态处理程序（重写方法） */
    __changeStateHandler : function (stateName){
       
    },
    
    /** 切换状态处理程序（重写方法） */
    __clickHandler : function (stateName){
        
    }
});