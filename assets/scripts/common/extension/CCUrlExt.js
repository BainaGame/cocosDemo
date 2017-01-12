/** 
 * 项目资源路径地址
 * Author      : donggang
 * Create Time : 2016.8.12
 */

/** 
 * 获取模块路径
 * @param url(string)           资源地址
 * @param script(string)        脚本名
 */
cc.url.common = function(url, script){
    return cc.url.custom("common/module/", url, script);
}

cc.url.custom = function(folder, url, script){
    if(script)
        return folder + url + "," + script;
    
    return folder + url; 
}