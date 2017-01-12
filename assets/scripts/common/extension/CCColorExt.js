/** 
 * 颜色对象扩展
 * Author      : donggang
 * Create Time : 2016.9.3
 */

/** 
 * 16进制颜色值转RGB值
 * @param color(0xFFFFFF)  颜色值
 */
cc.Color.valueToRGB = function(color){
    var r = (0xff0000 & color) >>> 16;
    var g = (0x00ff00 & color) >>> 8;
    var b = 0x0000ff & color;
    return cc.color(r,g,b);
}

/** 
 * 16进制颜色值转RGBA值
 * @param color(0xFFFFFF)  颜色值
 */
cc.Color.valueToRGBA = function(color){
    var r = (0xff000000 & color) >>> 24;
    var g = (0x00ff0000 & color) >>> 16;
    var b = (0x0000ff00 & color) >>> 8;
    var a = 0x000000ff & color;
    return cc.color(r,g,b,a);
}