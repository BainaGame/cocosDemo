/** 
 * 全局环境设置
 * Author      : donggang
 * Create Time : 2016.7.26
 */
module.exports = new (cc.Class({
    ctor : function () {
        this.version        = '1.0';
        this.persist        = "";
        this.debugMode      = cc.DebugMode.INFO;        // 调试模式
        this.showFPS        = true;                     // 是否显示FPS数据
        this.showMemory     = false;                    // 是打印转场时内存数据

        cc._initDebugSetting(this.debugMode);           // 初始化调试模式
        cc.director.setDisplayStats(this.showFPS);      // 是否显示FPS工具
    }
}))();