/** 
 * 数学对象扩展
 * Author      : donggang
 * Create Time : 2016.8.27
 */

/** 
 * 角度转弧度 
 * @param angle(float)    角度
 */
Math.angleToRadian = function(angle){
    return Math.PI / 180 * angle;
}

/** 
 * 弧度转角度 
 * @param radian(float)   弧度
 */
Math.radianToAngle = function(radian){
    return 180 / Math.PI * radian;
}

/** 
 * 计算两点距离 
 * @param pos1(cc.p)   第一个点
 * @param pos2(cc.p)   第二个点
 */
Math.distance = function(pos1, pos2){
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) +  Math.pow(pos1.y - pos2.y, 2));
}

/** 
 * 获取范围内随机数 
 * @param min(float)   随机范围最小值
 * @param max(float)   随机范围最大值
 * @param decimal(int) 结果保留的小数位
 */
Math.randomRange = function(min, max, decimal = -1){   
    var range  = max - min;
    var rand   = Math.random();
    var result = min + rand * range;
    var decimalValue = Math.pow(10, decimal);
    if (decimalValue > 0){
        return parseInt(result * decimalValue) / decimalValue;
    }
    else if (decimalValue == 0){
        return parseInt(result);
    }
    return result;
}   