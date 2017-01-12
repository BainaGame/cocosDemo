/** 
 * 资源加载管理扩展
 * Author      : donggang
 * Create Time : 2016.8.1
 */

/** 
 * 获得当前加载进度
 * return number
 */
cc.loader.getProgress = function(){
    var loadingItem = cc.loader.getItems();
    var completed   = loadingItem.completedCount;
    var total       = loadingItem.totalCount;
    var progress    = completed / total;
    return progress;
}

/** 
 * 加载一个组件中的资源
 * @param urls(Array)                       地址数组
 * @param completeCallback(function)        完成回调
 */
cc.loader.loadResByUrls = function(urls, completeCallback){
    var loadSingleComplete = function(error, content){
        if(error){
            cc.error(error.message || error);
        }
        else if (list.length > 0) {
            loadSingle(list.shift());
        }
        else if(list.length == 0) {
            if (completeCallback) completeCallback();
        }
    }

    var loadSingle = function(url){
        cc.loader.loadRes(url, loadSingleComplete);
    }

    var list = urls.slice(0);
    if (list.length > 0)
        loadSingle(list.shift());
}

/** 
 * 获取指定类型的资源 
 * @param url(string)   文件地址
 * @param type(object)  资源对象类型
 */
cc.loader.getResByType = function(url, type){
    var uuid = this._getResUuid(url, type);
    var item = this.getItem(uuid);

    if(item){
      return item.content;
    }

    return null;
}

/**
 * 通过具体的 url 来访问到文件内容
 * @param url(string) 文件地址
 */
cc.loader.getResByUrl = function(url){
    var fullUrl = cc.url.raw(cc.path.join("resources/", url));
    var mapItem = this.getItems().map[fullUrl];

    var uuid;

    if (mapItem) {
        uuid = mapItem.alias;
    }
    else {
        return null;
    }

    var item = this.getItem(uuid);
    
    if(item){
        return item.content;
    }

    return null;
}

/** 
 * 释放一个文件夹的资源内存（现在有智能释放内存，建议不要用这个）
 * @param url(url) 文件夹地址
 * @param type(url) 文件夹地址
 */
// cc.loader.unLoadResAll = function(url, type){
//     var mapItem     = this.getItems().map;
//     var paths       = this._resources.getAllPaths();

//     if (type && !cc.isChildClassOf(type, cc.RawAsset)) {                // typet父类不能为cc.RawAsse
//         type = null;
//     }

//     var uuids  = this._resources.getUuidArray(url, type);
//     var remain = uuids.length;
//     for (var i = 0, len = remain; i < len; ++i) {
//         var uuid = uuids[i];
//         var item = this.getItem(uuid);                                  // 通过uuid获取内存中加载完成的资源项
//         if(item){
//             if (item.url.toLowerCase().indexOf(".png") > -1 || item.url.toLowerCase().indexOf(".jpg") > -1) {
//                 cc.textureCache.removeTextureForKey(item.url);
//             }
//             else if(url.toLowerCase().indexOf("/import/")){
//                 var start = url.lastIndexOf("/") + 1;
//                 var end   = url.lastIndexOf(".");
//                 cc.loader.release(url.substring(start, end));
//             }
//             else {
//                 cc.loader.release(item.url);
//             }
//         }
//     }
// }