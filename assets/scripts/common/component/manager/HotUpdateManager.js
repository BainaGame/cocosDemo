/** 
 * 热更新管理
 * Author      : donggang
 * Create Time : 2016.7.29
 * 
 * 需求说明:
 * 1、可后台更新版本资源
 */
window.game  = window.game || {};
game.version = module.exports = game.version || new (cc.Class({
    ctor : function(){
        this._updates    = {};            // 更新模块集合
        this._queue      = [];            // 更新对列
        this._isUpdating = false;         // 是否正在更新中
        this._current    = null;          // 当前正在更新的模块
        this._noComplete = {};            // 上次未完成的热更项
        this._isDelOldVersionRes = true;  // 是否删除旧版本的本地资源

        this.packageUrl = "";             // 热更地址
    },

    /** 获取模块版本信息 */
    getModules : function(completeCallback){
        if (!cc.sys.isNative) {
            if (completeCallback) completeCallback();
            return;
        }

        // 验证是否有覆盖安装
        cc.loader.loadRes("version/common_project", function(error, content){
            var setting = JSON.parse(content);

            game.http.get(setting.packageUrl + "version.json", function(content){
                this.modules = JSON.parse(content);

                if (completeCallback) completeCallback();
            }.bind(this),

            function(error){
                cc.log("服务器版本配置文件加载出错");
            });
        }.bind(this));
    },

    /*
        1、删除import文件夹下所有文件
        2、删除src文件夹下所有文件
        3、删除raw-internal文件夹下所有文件
        4、删除common文件夹下所有文件
        5、删除对应id_project.manifest中的所有配置资源文件
        6、删除本地id_project.manifest中的文件
        7、检查每个玩法是否需要后台热更（不能提示进度条）
    */
    /** 在覆盖安装新版本的安装包时，将本地游戏资源文件中的旧资源删除 */
    checkStorageRes : function(completeCallback){
        if (!cc.sys.isNative) return;

        // 验证是否有覆盖安装
        cc.loader.loadRes("version/common_project", function(error, content){
            this._delOldVersionRes(content, completeCallback);
        }.bind(this));
    },

    /** 删除旧版本的本地资源 */
    _delOldVersionRes : function(content, completeCallback){
        cc.loader.releaseRes("version/common_project");

        var setting = JSON.parse(content);

        var vm = cc.sys.localStorage.getItem('Version_Module');
        vm     = vm == null ? "" : vm;

        cc.log("【更热】当前热更版本为{0}, 安装包版本为{1}".format(vm == "" ? "暂无" : vm , setting.version));

        if (vm == "") {
            cc.log("【更热】第一次安装游戏，不需要执行旧资源删除");
            this._isDelOldVersionRes = false;
        }

        if (vm.indexOf(setting.version) > -1) {
            cc.log("【更热】安装包目录和热更目录版本一致，不需要执行旧资源删除");
            this._isDelOldVersionRes = false;
        }

        var vmArray = vm.split(",");

        if (this._isDelOldVersionRes == false || vmArray.length == 0){
            if (completeCallback) completeCallback();
            return;
        }

        cc.log("【更热】在覆盖安装新版本的安装包时，将本地游戏资源文件中的旧资源删除");

        var totalComplete = 0;

        for (var i = 0; i < vmArray.length; i++){
            var data         = vmArray[i].split("_");
            let module       = data[0];
            let localVersion = data[1];
            var storagePath  = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'game-remote-asset');
            
            // 本地版本比热更新文件夹中的版本新时，删除更热中相关老资源
            cc.loader.loadRes("version/" + module + "_project", function(error, content){
                if (error){
                    cc.error("【更热】没有找到模块{0}本地热更配置文件".format(module));
                    return;
                }

                var setting = JSON.parse(content);
                if (setting.version > localVersion) {
                    for(var path in setting.assets){
                        var filePath = cc.path.join(storagePath,path);
                        if (path.indexOf("/import/")       > -1 || 
                            path.indexOf("/raw-internal/") > -1 || 
                            path.indexOf("src/")           > -1 || 
                            path.indexOf("res/raw-assets/resources/version/") > -1 ||
                            path.indexOf("/common/")       > -1) {
                            if (jsb.fileUtils.isFileExist(filePath))
                                jsb.fileUtils.removeFile(filePath);
                        }
                        else {
                            if (jsb.fileUtils.isFileExist(filePath))
                                jsb.fileUtils.removeFile(filePath);
                        }
                    }
                
                    var project = cc.path.join(storagePath, module + "_project.manifest");
                    var version = cc.path.join(storagePath, module + "_version.manifest");

                    if (jsb.fileUtils.isFileExist(project)) jsb.fileUtils.removeFile(project);
                    if (jsb.fileUtils.isFileExist(version)) jsb.fileUtils.removeFile(version);

                    // 删除本地存储中的已下载模块标记数据
                    this._updateVersionModule(module);

                    cc.log("【更热】删除旧热更模块{0}完成".format(module));
                }
               
                totalComplete++;
                if (totalComplete == vmArray.length){
                    cc.log("【更热】删除完成所旧热更模块")
                    if (completeCallback) completeCallback();
                }
            }.bind(this));
        }
    },

    _updateVersionModule: function(m){
        // 删除本地存储中的已下载模块标记数据
        var vm = cc.sys.localStorage.getItem('Version_Module');
        if (vm != null && vm != ""){
            var modules = {};
            var vmArray = vm.split(",");
            for(var i = 0; i < vmArray.length; i++){
                var data = vmArray[i].split("_");
                modules[data[0]] = data[1];
            }
            delete modules[m];

            var newVm = "";
            for(var v in modules){
                newVm += v + "_" + modules[v] + ",";
            }
            newVm = newVm.substr(0, newVm.length - 1);
            cc.sys.localStorage.setItem('Version_Module', newVm);
        }
    },

    /**
     * 删除热更的模块资源
     * @param module(string)    模块名
     * @param assets(Array)     资源路径数据
     */
    removeModule : function(module, assets){
        if (!cc.sys.isNative) return;

        // 删除玩法资源
        var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'game-remote-asset');
        var project = cc.path.join(storagePath, module + "_project.manifest");
        var version = cc.path.join(storagePath, module + "_version.manifest");

        if (jsb.fileUtils.isFileExist(project)) jsb.fileUtils.removeFile(project);
        if (jsb.fileUtils.isFileExist(version)) jsb.fileUtils.removeFile(version);

        // 删除本地存储中的已下载模块标记数据
        this._updateVersionModule(module);

        var m = "/" + module + "/";

        var directoryNames = [];
        for (var i = 0; i < assets.length; i++){
            var path = assets[i];
            if (path.indexOf(m) > -1) {
                if (path.indexOf(".") > -1){
                    var filePath = cc.path.join(storagePath, path);
                    if (jsb.fileUtils.isFileExist(filePath))
                        jsb.fileUtils.removeFile(filePath);
                }
                else {
                    directoryNames.push(cc.path.join(storagePath, path));
                }
            }
        }

        // for (var i = 0; i < directoryNames.length; i++){
        //     jsb.fileUtils.removeDirectory(directoryNames[i]);       // JSB的方法删除不了文件夹，暂不影响游戏
        // }

        cc.log("【更热】删除了{0}玩法".format(module));
    },

    /** 保存没更新完的模块状态 */
    save : function(){
        if (!cc.sys.isNative) return;

        var names = [];
        for(var i = 0; i < this._queue.length; i++){
            names.push(this._queue[i].manager_data.name);
        }
        var data = JSON.stringify(names);
        cc.sys.localStorage.setItem("Archived_hot_update", data);
    },

    /** 载入没更新完的模块状态 */
    load : function(){
        if (!cc.sys.isNative) return;
        
        var data = cc.sys.localStorage.getItem("Archived_hot_update");
        if (data){
            var json = JSON.parse(data);
            for(var i = 0; i < json.length; i++){
                this._noComplete[json[i]] = json[i];
            }
            cc.sys.localStorage.setItem("Archived_hot_update", null); 
        }
    },
   
    /**
     * 初始化更新模块名
     * @param name(string)            模块名
     * @param onComplete(function)    模块名
     * @param onProgress(function)    更新完成
     * @param onFinished(function)    更新完成
     * @param onNewVersion(function)  已是最新版本
     * @param onNetError(function)    网络异常事件
     */
    init : function(name, onCheckComplete, onComplete, onProgress, onFinished, onNewVersion, onNetError) {
        var hotUpdate = new HotUpdate();

        // 本地版本配置文件只会在第一次更新时才会读取和服务器配置文件对比需要更新的资源，第一次后则读取本地存储根目录下的当前版本配置文件
        hotUpdate.manifest = cc.url.raw("resources/version/{0}_project.manifest".format(name));     

        var data              = {};
        data.name             = name;
        data.hotUpdate        = hotUpdate;
        data.onCheck          = onCheckComplete
        data.onComplete       = onComplete;
        data.onProgress       = onProgress;
        data.onFinished       = onFinished;
        data.onUiComplete     = onComplete;
        data.onNewVersion     = onNewVersion;
        data.onNetError       = onNetError.bind(this);

        data.onCheckComplete  = this._onCheckComplete.bind(this);
        data.onUpdateComplete = this._onUpdateComplete.bind(this);
        
        this._updates[name] = data;

        hotUpdate.manager_data = data;

        // 如果上次没更新完的数据，下次进入后，会自动进入
        if (this._noComplete[name]) {
            this.check(name);
        }
    },

    /**
     * 检查版本是否需要更新
     */
    check : function(name){
        this._updates[name].hotUpdate.checkVersion();
    },

    /** 
     * 获取当前热更新模块的进度
     */
    getProgress : function(name){
        return this._updates[name].hotUpdate._progress;
    },

    /** 检查版本完成 */
    _onCheckComplete : function(sender){
        this._queue.push(sender);

        if (this._isUpdating == false){
            setTimeout(function(){
                this._isUpdating = true;
                this._current = sender;
                this._current.updateVersion();
            }.bind(this), 100);
        }
    },

    _onUpdateComplete : function(sender){
        // 删除当前完成的更新对象
        this._queue.shift();
        this._isUpdating = false;

        // 更新对列中下一个更新对象
        if (this._queue.length > 0){
            this._isUpdating = true;
            this._current = this._queue[0];
            this._current.updateVersion();
        }
    }
}));

//----------------------------------------------------------------------------------------------------

var HotUpdate = cc.Class({
    properties: {
        manifest: {
            default: null,
            url    : cc.RawAsset,
            tooltip: "本地资源配置文件"
        }
    },

    ctor : function(){
        this._needUpdate = false;                       // 是否需要更新
        this._isError    = false;                       // 是否更新中出错
        this._progress   = 0;                           // 当前进度
    },
    
    /** 检查是否需要更新版本 */
    checkVersion(){
        // 热更新只可在本地建立
        if (!cc.sys.isNative) return;                 

        // 是否已在更新中
        if (this._needUpdate) return;

        this.storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'game-remote-asset');
        cc.log('【更热】模块{0}远程资源存储路径 : {1}'.format(this.manager_data.name, this.storagePath));
        cc.log('【更热】模块{0}本地配置文件地址 : {1}'.format(this.manager_data.name, this.manifest));

        this._am = new jsb.AssetsManager(this.manifest, this.storagePath);
        this._am.retain();

        if (this._am.getLocalManifest().isLoaded())
        {
            if (this._isError){
                this._anim = true;   // 开启假进度数值动画
            }

            // 监听检查版本是事有更新事件
            this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.onCheckVersion.bind(this));
            cc.eventManager.addListener(this._checkListener, 1);

            this._am.checkUpdate();

            cc.log("【更热】开始检查模块{0}版本".format(this.manager_data.name));
        }
    },

    /** 开始更新版本资源 */
    updateVersion() {
        if (this._needUpdate == false) {
        	cc.log("【更热】没有新版本");
            return;
        }
 
        if (this._am) {
            this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.onUpdateVersion.bind(this));
            cc.eventManager.addListener(this._updateListener, 1);

            this._isError = false;
            this._failCount = 0;                        // 重置更新失败次数
            this._am.update();

            cc.log("【更热】开始更新版本");
        }
    },

    /** 检查是否能更新事件(version.manifest) */
    onCheckVersion(event) {
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:                    // 没有找到本地配置文件，热更新跳过
                cc.eventManager.removeListener(this._checkListener);
                cc.log("【更热】没有找到本地配置文件，热更新跳过");
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:                    // 下载更新配置文件出错
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:                       // 解析更新配置文件出错    
                cc.eventManager.removeListener(this._checkListener);
                cc.log("【更热】下载更新配置文件出错");

                if (this.manager_data.onNetError){
                    this.manager_data.onNetError(this);
                }
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:                         // 已是最新版本
                cc.eventManager.removeListener(this._checkListener);
                cc.log("【更热】检查版本为最新版本");
                if (this.manager_data.onNewVersion){
                    this.manager_data.onNewVersion();
                }
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:                          // 找到新版本
                this._needUpdate = true;
                cc.eventManager.removeListener(this._checkListener);
                cc.log("【更热】找到新版本");

                this.manager_data.newVersion = this._am.getRemoteManifest().getVersion();

                this.fixProgress();

                if (this.manager_data.onCheckComplete){
                    this.manager_data.onCheckComplete(this);
                }

                // 对外的版本检查完成事件
                if (this.manager_data.onCheck){
                    this.manager_data.onCheck(this);
                }

                break;
            default:
                break;
        }
    },

    /** 用户体验进度数据 */
    fixProgress : function(){
        if (this._progress == 0 || this._progress == 1) {
            this._progress = Math.randomRange(0.05, 0.2, 2);
            if (this.manager_data.onProgress) {
                this.manager_data.onProgress(this, this._progress);
            }
        }
    },

    /** 更新事件(project.manifest) */
    onUpdateVersion(event) {
        var needRestart = false;
        var failed      = false;
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:                    // 没有找到本地配置文件，热更新跳过
                failed = true;
                cc.log('【更热】没有找到本地配置文件，热更新跳过');
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:                    // 下载更新配置文件出错
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:                       // 解析更新配置文件出错
                failed = true;
                cc.log('【更热】下载更新配置文件出错');

                if (this.manager_data.onNetError){
                    this.manager_data.onNetError(this);
                }
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:                         // 已是最新版本
                failed = true;
                cc.log('【更热】更新版本为是最新版本');
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:                         // 更新文件加载进度
                var percent       = event.getPercent();
                var percentByFile = event.getPercentByFile();
                var msg           = event.getMessage();

                // if (msg) cc.log(msg);
                // cc.log(percent.toFixed(2) + '%', percentByFile);
                var p = percentByFile / 100;
                if (this._isError == false && p > this._progress) {
                    this._progress = p;
                }

                if (this.manager_data.onProgress) {
                    this.manager_data.onProgress(this, this._progress);
                }
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:                            // 更新完成事件
                this._progress = 1;
                needRestart = true;
                cc.log('【更热】更新完成事件 ' + event.getMessage());
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:                              // 更新失败
                cc.log('【更热】更新失败 ' + event.getMessage());       

                this._failCount++;
                if (this._failCount < 3)
                {
                    this._am.downloadFailedAssets();                                // 重下载失败的更新资源
                }
                else
                {
                    cc.log('【更热】达到最大失败数，退出更新过程');        // 达到最大失败数，退出更新过程
                    this._failCount = 0;
                    failed = true;
                }
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:                             // 资源更新错误
                cc.log('【更热】资源更新错误: ' + event.getAssetId() + ', ' + event.getMessage());
                this._isError = true;
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:                           // 资源解压出错
                cc.log('【更热】资源解压出错: ' + event.getMessage());
                break;
            default:
                break;
        }

        // 更新失败
        if (failed) {
            this._needUpdate = false;
            cc.eventManager.removeListener(this._updateListener);

            if (this.manager_data.onFinished){
                this.manager_data.onFinished(this);
            }
        }

        // 更新完重启游戏
        if (needRestart) {
            cc.eventManager.removeListener(this._updateListener);
            // 设计热更新文件的查询路径
            var searchPaths = jsb.fileUtils.getSearchPaths();                       // 获取游戏资源查询目录数组
            var newPaths    = this._am.getLocalManifest().getSearchPaths();         // 获取本地更新资源存储目标

            var flag = false;
            for(var i = 0; i < searchPaths.length; i++){
                if(searchPaths[i] == newPaths){
                    flag = true;
                    break;
                }
            }

            if (flag) {
                Array.prototype.unshift(searchPaths, newPaths);                      // 加载到戏资源查询目录数组第一位
                searchPaths = searchPaths.unique();                                  // 去除重复路径

                // 在游戏启动过程中，这个值将被检索并添加到默认的搜索路径中，加上main.js搜索路径是非常重要的，否则，新的脚本不会生效。
                cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));

                // 记录本地已下载的模块数据
                var vm = cc.sys.localStorage.getItem('Version_Module');
                if (vm == null || vm == ""){
                    vm = this.manager_data.name + "_" + this.manager_data.newVersion;
                }
                else{
                    vm += "," + this.manager_data.name + "_" + this.manager_data.newVersion;
                }
                cc.sys.localStorage.setItem('Version_Module', vm);
            }

            jsb.fileUtils.setSearchPaths(searchPaths);
                
            // 更新完成事件
            if (this.manager_data.onComplete){
                this.manager_data.onComplete(this);
            }

            // 更新完成，内部事件
            if (this.manager_data.onComplete){
                this.manager_data.onUpdateComplete(this);
            }
            
            this._needUpdate = false;
        }
    },

    onDestroy() {
        this._am && this._am.release();
    }
});
