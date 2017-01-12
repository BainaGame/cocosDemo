/** 
 * 引擎cc.js的扩展
 * Author      : donggang
 * Create Time : 2016.8.12
 */

/** 
 * 获取方法名
 * @param fun(function) 方法对象
 */
cc.js.getFunctionName = function(fun){
    var regex = /function\s*(\w*)/i;
    var name  = regex.exec(fun)[1];

    if (name == ""){
        name = fun.toString();
    }

    return name;
}