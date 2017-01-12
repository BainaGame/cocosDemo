/** 
 * 游戏全局消息管理
 * Author      : donggang
 * Create Time : 2016.8.28
 * 
 * 需求说明
 * 1、单个或批量注册、移除全局事件
 */
var eventMap = {};
 
window.game = window.game || {};

/**
 * 注册事件
 * @param event(string)      事件名
 * @param listener(function) 处理事件的侦听器函数
 * @param thisObj(object)    侦听函数绑定的this对象
 */
game.addEventListener = function(event, listener, thisObj) {
    var list = eventMap[event];
    if(list == null) {
        list = [];
        eventMap[event] = list;
    }

    var length = list.length;
    for(var i = 0;i < length;i++) {
        var bin = list[i];
        if (bin.listener == listener && bin.thisObj == thisObj) {
            cc.assert(false, "名为【{0}】的事件重复注册侦听器".format(event));
        }
    }

    cc.assert(listener != null, "注册【{0}】事件的侦听器函数为空".format(event));

    list.push({listener: listener, thisObj: thisObj});
},

/**
 * 移除注册事件
 * @param event(string)      事件名
 * @param listener(function) 处理事件的侦听器函数
 * @param thisObj(object)    侦听函数绑定的this对象
 */
game.removeEventListener = function(event, listener, thisObj) {
    var list = eventMap[event];

    cc.assert(list != null, "名为【{0}】的事件不存在".format(event));

    var length = list.length;
    for (var i = 0; i < length; i++) {
        var bin = list[i];
        if (bin.listener == listener && bin.thisObj == thisObj) {
            list.splice(i,  1);
            break;
        }
    }
    if (list.length == 0) {
        delete eventMap[event];
    }
}

/** 
 * 触发全局事件 
 * @param event(string)      事件名
 * @param arg(Array)         事件参数
 */
game.dispatchEvent = function(event, arg) {
    var list = eventMap[event];

    if (list == null)
        cc.warn("名为【{0}】的事件没有被注册过".format(event));
    else {
        var length = list.length;
        for(var i = 0;i < length;i++) {
            var eventBin = list[i];
            eventBin.listener.call(eventBin.thisObj, event, arg);
        }
    }
}

//--------------------------------------------------------------------------------------------------------------

/**
 * 批量注册、移除全局事件对象
 */
game.Message = cc.Class({
    ctor: function () {
        this.events = {};
    },

    addEventListener : function(event, listener, thisObj) {
        this.events[event] = {listener: listener,thisObj: thisObj};
        game.addEventListener(event, listener, thisObj);
    },

    removeEventListener : function(event) {
        var eb = this.events[event];
        game.removeEventListener(event, eb.listener, eb.thisObj);
        delete this.events[event];
    },
        
    removes : function() {
        for (var event in this.events) {
            this.removeEventListener(event);
        }
    }
});
