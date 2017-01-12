/** 
 * 资源管理
 * Author      : donggang
 * Create Time : 2016.8.12
 * 
 * 需求说是：
 * 1、监视加载的资源文件
 * 2、分内存块记录资源
 * 3、释放指定内存块的资源内存
 * 
 * 思考问题：
 * 1、如果是个APRG需要灵活在游戏中控制制定资源释放策略时，需要提供稳定的释放接口，且不破坏转场时批量释放的资源配置数据
 */

/**
 * Cocos 引擎内存未开放的 API 说明
 * cc.loader._items.map  加载到内存中的所有资源项
 * 
 * cc.AssetLibrary       获取所有Cocos资源管理数据 
 * cc.AssetLibrary._getAssetInfoInRuntime(item.uuid)    
 *      raw : false
 *      url : "res/import/a2/a23235d1-15db-4b95-8439-a2e005bfff91.json"
 * 
 * cc.loader._resources._pathToUuid
 *     key        : persist/animation/arrow_hide 
 *     value      : {
 *         Entry type : cc_AnimationClip()
 *         uuid       : "629308ce-68ca-4ebd-9a26-f73375f3217d"
 *     }
 * 
 * Cocos默认加载资源
 * project/library/bundle.project.js  : Object
 * stashed-scene.json                 : Object
 * 
 * 特殊处理的资源
 * res/import/91/91ef99eb-0735-4b7d-8c01-d10efb1be8f7/raw-bitmap-font.fnt  字体文件编号后的效果
 */
module.exports = cc.Class({
    ctor: function () {
        this._signs        = {};          // 资源内存块标记数据（可以多个标记同时存在）
        this._raw_internal = {};          // Cocos引擎其它关联资源raw-internal
        
        // 常驻内存资源地址
        this._persistPath = game.config.persist;
        if (!this._persistPath) this._persistPath = "persist/";
       
        // 创建资源表
        this._createResTable();
    },

    /** 创建资源表 */
    _createResTable : function() {
        this._uuids           = {};     // Cocos 引擎资源唯一编号对应相对地址地址数据(0a50765a-5613-4f63-b8cd-73454993eb05 : "persist/plist/sheet")
        this._persist         = {};     // 常驻内存资源
        
        // 记录常驻内存资源表
        var recordPersist = function(uuid){
            var url = cc.AssetLibrary._getAssetInfoInRuntime(uuid).url;
            if (url.toLowerCase().indexOf("/import/") > -1){
                this._persist[uuid] = url;
            }
            else {
                this._persist[url] = url;
            }
        }.bind(this);

        // 记录资源uuid对应url的数据
        for (var path in cc.loader._resources._pathToUuid){
            var isPersist = path.toLowerCase().indexOf(this._persistPath) > -1;     // 验证是否属于永久缓存资源
            var value     = cc.loader._resources._pathToUuid[path];
            if (value instanceof Array){                                            // plist、jpg、png 一个地址会有多个文件(cc.SpriteFrame、cc.Texture2D)
                for (var i = 0; i < value.length; i++) {
                    this._uuids[value[i].uuid] = path;

                    if (isPersist) {
                        recordPersist(value[i].uuid);
                    }
                }
            }
            else if (value instanceof Object){                                      // prefab、fire、mp3
                this._uuids[value.uuid] = path;

                if (isPersist) {
                    recordPersist(value.uuid);
                }
            } 
            else {
                cc.error("资源信息中【{0}】文件被遗漏，重点排查原因".format(path));
            }
        }
    },

    /** 解析预制包含的静态资源文件集合 */
    _parseDepends : function(key, parsed) {
        var item = cc.loader.getItem(key);
        if (item) {
            var depends = item.dependKeys;
            if (depends) {
                for (var i = 0; i < depends.length; i++) {
                    var depend = depends[i];
                    if ( !parsed[depend] ) {
                        parsed[depend] = true;
                        this._parseDepends(depend, parsed);
                    }
                }
            }
        }
    },

    /** 监视引擎加载进度事件，获取加载后的资源文件信息 */
    _ccLoaderOnProgress : function(){
        if (cc.loader.onProgress) return;       // 第一次发有问题，有空检查下（会给覆盖方法）
        
        cc.loader.onProgress = function (completedCount, totalCount, item) {
            if (this._currentSign == null) {
                cc.error("没有定义内存块标记，请先调用 retain 方法，资源：" + item.url);
                return;
            }

            // 注：这里这样写是为了解决 cocos 引擎加工后的资源配置文件名生成机制问题，不处理会导致同名文件下次在也加载不到内存中
            var url = item.url;
            if (url.toLowerCase().indexOf("/import/") > -1){                   // Cocos引擎加工后配置文件
                var start = url.lastIndexOf("/") + 1;
                var end   = url.lastIndexOf(".json");
                if (end > -1){
                    url = url.substring(start, end);

                    // Cocos引擎内部资源的配置文件
                    if (this._uuids[url] == null) {
                        this._raw_internal[url] = item.url;
                    }
                }
            }
            else if (url.lastIndexOf("/raw-internal/") > -1) {                 // Cocos引擎内部文件
                this._raw_internal[url] = item.url;
            }

            // 将加载的文件信息保存到当前内存块中
            this._signs[this._currentSign][url] = item.url; 

            // 预制包含的静态资源文件
            if (item.content instanceof cc.Prefab) {
                var depends = {};
                this._parseDepends(url, depends);
                for (var url in depends){
                    this._signs[this._currentSign][url] = cc.AssetLibrary._getAssetInfoInRuntime(url).url;
                    
                    // cc.log("已加载资源【{0}】".format(cc.AssetLibrary._getAssetInfoInRuntime(url).url));
                }
            }        
            
            // cc.log("已加载资源【{0}】".format(item.url));

            if (game.onProgress){
                game.onProgress((completedCount / totalCount).toFixed(2)); 
            }
        }.bind(this);
    },

    /**
     * 删除指定资源内存
     * @param urls(Array)       待删除的资源
     */
    _delRes(urls){
        for (var url in urls){
            // 删除内存块其它内存
            if (url.toLowerCase().indexOf(".png") > -1 || url.toLowerCase().indexOf(".jpg") > -1) {
                cc.textureCache.removeTextureForKey(url);                                       // 注：引擎自带 cc.loader.release(url);
            }
            else {
                cc.loader.release(url);
            }

            // cc.log("已删除资源【{0}】".format(url));
        }
    },

    /**
     * 释放前一个内存块的资源
     */
    releasePrevious(){
        if (this._previousSign){
            var previousUrls = this._signs[this._previousSign];
            var currentUrls  = this._signs[this._currentSign];

            // 筛选可删除的资源
            var delUrls = {};
            if (previousUrls){
                for (var url in previousUrls){
                    if (currentUrls[url]        == null &&     // 验证文件在当前场景中不存在
                        this._raw_internal[url] == null &&     // 验证文件是不为引擎内部资源
                        this._persist[url]      == null)       // 验证文件是不为常住内存资源
                        delUrls[url] = this._uuids[url];
                }
            }

            // 释放内存
            this._delRes(delUrls);

            cc.log("释放名为【{0}】的资源内存块".format(this._previousSign));
            
            // 删除上一个内存块数据
            delete this._signs[this._previousSign];
            this._previousSign = null;
        }
    },

    /** 
     * 标记资源释放组 
     * @param name(string)      内存块标记名
     */
    retain : function(name){
        this._ccLoaderOnProgress();

        this._previousSign = this._currentSign;
        this._currentSign  = name;

        cc.log("标记名为【{0}】的资源内存块".format(name));

        if (this._signs[name] == null)
            this._signs[name] = {};
    },

    /**
     * 释放标记的内存块所有资源
     * @param name(string)      内存块标记名
     */
    release(name){
        var urls = this._signs[name];

        if (urls == null) {
            cc.error("名为{0}的资源内存块不存在".format(name));
            return;
        }

        // 释放内存
        this._delRes(urls);

        // 删除内存块数据
        delete this._signs[name];

        if (this._previousSign == name)
            this._previousSign = null;

        if (this._currentSign == name)
            this._currentSign = null;
    },

    /** 
     * 释放所有标记的内存块所有资源（当你调用些方法后，你会有惊喜） 
     */
    releaseAll(){
        for (var name in this._signs)
            this.release(name);
    }
});