window.game = window.game || {};

var initTime = (new Date()).getTime();      // 当前游戏进入的时间毫秒值

/** 获取游戏当前运行时间 */
game.getTime = function() {
    return (new Date()).getTime() - initTime;
}
