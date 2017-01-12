/** 
 * 到计时间标签 
 * Author      : donggang
 * Create Time : 2016.8.3
 * 
 * 需求说明
 * 1、设置时间长度，计算出天、时、分、秒
 * 2、如果天大于1，则显示 "1 Day"，否则显示 "01:12:24"
 */
window.game       = window.game       || {};
game.ui           = game.ui           || {}; 
game.ui.EventType = game.ui.EventType || {};
game.ui.EventType.LABEL_TIME_A_SECOND = "label_time_a_second";      // 倒计时逝去一秒
game.ui.EventType.LABEL_TIME_END      = "label_time_end";           // 倒计时结束

/**
 * 计时器
 * @param step  时间修改步长（秒）
 */
game.ui.timer = cc.Class({
    ctor : function(step = 1){
        this._step        = step;              // 每次修改时间
        this._elapsedTime = 0;                 // 逝去时间
    },

    update : function(dt){
        this._elapsedTime += dt;

        if (this._elapsedTime > this._step){
            this._elapsedTime -= this._step
            return true;
        }
        return false;
    },

    reset : function(){
        this._elapsedTime = 0;
    }
}) 

game.ui.LabelTime = module.exports = cc.Class({
    extends: cc.Label,

    properties: {
        countDown: {
            default : 1000,
            tooltip : "到计时间总时间（单位秒）",
            type    : cc.Integer,
            notify  : function () {
                if (this._sgNode) {
                    this.t = parseInt(this.countDown);
                    this._refresh();
                }
            }
        },
        dayFormat:{
            default : "{0} day" ,
            tooltip : "天数数据格式化",
            notify  : function () {
                if (this._sgNode) {
                    this._refresh();
                }
            }
        },
        timeFormat:{
            default : "{0}:{1}:{2}",
            tooltip : "时候格式化",
            notify  : function () {
                if (this._sgNode) {
                    this._refresh();
                }
            }
        },
        string: {
            override: true,
            tooltip : "这里显示倒计时文本", 
            get     : function () {
                return this.result;
            },
            set: function (value) {
                cc.warn('请设置CountDown属性，些属性不能直接设置');
            }
        },
    },

    _refresh : function(){
        this._formatString();
        this._sgNode.setString(this.string);
        this._updateNodeSize();
    },

    /** 格式化字符串 */
    _formatString: function(){
        var c       = this.t;
        var date    = parseInt(c / 86400);
        c           = c - date * 86400;
        var hours   = parseInt(c / 3600);
        c           = c - hours * 3600;
        var minutes = parseInt(c / 60);
        c           = c - minutes * 60;
        var seconds = c;

        if (date == 0 && hours == 0 && minutes == 0 && seconds == 0){
            this.result = this.timeFormat.format("00", "00", "00");
        }
        else if (date > 0)
            this.result = this.dayFormat.format(date);                         // 如果天大于1，则显示 "1 Day"
        else
            this.result = this.timeFormat.format(
                this._coverString(hours), 
                this._coverString(minutes), 
                this._coverString(seconds));                                   // 否则显示 "01:12:24"

        return this.result;
    },

    /** 个位数的时间数据将字符串补位 */
    _coverString: function (value){
        if (value < 10) 
            return "0" + value;
        return value.toString();
    },

    setCdTime : function(second) {
        this._end        = false;
        this.totalTime   = second;                                             // 倒计时总时间
        this.countDown   = second;                                             // 倒计时，初始化显示字符串
    },

    onLoad: function () {
        this._end      = false;                                                // 倒计时结束
        this._timer    = new game.ui.timer(1);                                 // 计时器
        this.countDown = this.countDown;
    },

    update: function (dt) {
        if (this._end || CC_EDITOR) return;

        if (this._timer.update(dt)){
            this.countDown -= 1;

            if (this.countDown > 0){
                var ec = new cc.Event.EventCustom(game.ui.EventType.LABEL_TIME_A_SECOND, true);
                this.node.dispatchEvent(ec);
            }
            else {
                this._end = true;
                var ec = new cc.Event.EventCustom(game.ui.EventType.LABEL_TIME_END, true);
                this.node.dispatchEvent(ec);
            }
        }
    }
});