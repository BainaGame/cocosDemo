/** 
 * 三位计数法
 * Author      : donggang
 * Create Time : 2016.9.1
 * 
 * 需求说明
 * 1、格式 2,250,000
 */
window.game = window.game || {};
game.ui     = game.ui     || {}; 
game.ui.LabelNumber = module.exports = cc.Class({
    extends: cc.Label,

    /** 更新视图 */
    _updateSgNodeString: function() {
        this._sgNode.setString(this._decorateString(this.string));
        this._updateNodeSize();
    },

    /** 计算字符串数字 */
    _decorateString: function(value){
        var num    = parseInt(value);
        var output = "";
        var quotient;
        var remainder;
        do {
            quotient  = Math.floor(num / 1000);
            remainder = num % 1000;
            if (quotient != 0) {
                remainder = this._convertString(remainder);
                output    = ',' + remainder + output;
            } 
            else {
                output = remainder + output;
            }
            num = quotient;
        } 
        while(quotient > 0)

        return output;
    },

    /** 数字转字符串 */
    _convertString : function(num) {
        if (num < 10)
            return "00" + num;
        else if (num < 100)
            return "0" + num;
        else
            return num.toString();
    }
});
