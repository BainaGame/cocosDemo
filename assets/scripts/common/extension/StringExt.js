/** 
 * 字符串对象扩展
 * Author      : donggang
 * Create Time : 2016.8.1
 */
String.prototype.format = function()
{
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
    function(m,i){
        return args[i];
    });
}