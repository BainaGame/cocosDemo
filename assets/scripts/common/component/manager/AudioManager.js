/** 
 * 游戏音乐管理
 * Author      : donggang
 * Create Time : 2016.8.22
 * 
 * 需求说明
 * 1、管理背景音乐和音效的加载播放
 * 2、统一管理背景音乐和音效的音量控制
 */
cc.Class({
    extends: cc.Component,
    
    onLoad: function () {
        this._musicVolume  = 1.0;       // 背景音乐音量
        this._effectVolume = 1.0;       // 音效音量
        this._effects      = {};        // 音乐剪辑集合
        this._musicPlaying = false;     // 背景音乐正在播放
        this._musicPlayFinish = null;   // 播放完成回调
    },

    update(dt){
        if (this._musicPlaying) {
            if (this.isMusicPlaying() == false){
                this._musicPlaying = false;

                // 背景音乐播放完成事件
                if (this._musicPlayFinish)
                    this._musicPlayFinish();
            }
        }
    },

    /**
     * 背景音乐播放完成回调
     * @param callBack(function)       回调方法
     */
    setMusicPlayFinish(callBack){
        this._musicPlayFinish = callBack;
    },

    /** 
     * 播放指定音乐
     * @param url(string)              音效路径
     */
    playMusic : function(url, loop = false) {
        var rawUrl = cc.url.raw(url);
        cc.audioEngine.setMusicVolume(this._musicVolume); 
        cc.audioEngine.playMusic(rawUrl, loop);

        this._musicPlaying = true;
    },

    /**
     * 停止当前音乐
     * @param releaseData(boole)        如果释放的音乐数据则为true, 为默认值是false
     */
    stopMusic : function(releaseData) {
        cc.audioEngine.stopMusic(releaseData);
    },

    /** 
     * 暂停正在播放音乐
     */
    pauseMusic : function() {
        cc.audioEngine.pauseMusic();
    },

    /** 
     * 恢复音乐播放
     */
    resumeMusic : function() {
        cc.audioEngine.resumeMusic();
    },

    /** 
     * 从头开始重新播放当前音乐
     */
    rewindMusic : function() {
        cc.audioEngine.rewindMusic();
    },

    /** 
     * 获取音量 
     * return Number                   音量（0.0 ~ 1.0）
     */
    getMusicVolume : function(){
        return cc.audioEngine.getMusicVolume();
    },

    /**
     * 设置音量
     * @param volume(Number)           音量（0.0 ~ 1.0）
     */
    setMusicVolume : function(volume){
        this._musicVolume = volume;
        cc.audioEngine.setMusicVolume(volume);
    },

    /** 
     * 音乐是否正在播放（验证些方法来实现背景音乐是否播放完成）
     * return boolen
     */
    isMusicPlaying : function(){
        return cc.audioEngine.isMusicPlaying();
    },

    //------------------------------------------------------------------------------------------

    /** 
     * 播放音效
     * @param path(string)              音效路径
     */
    playEffect : function(url, loop = false) {
        var rawUrl = cc.url.raw(url);
        var audio  = cc.audioEngine.playEffect(rawUrl, loop, this._effectVolume);
        this._effects[url] = audio;
    },

     /** 
     * 获取音效音量
     * return Number                   音量（0.0 ~ 1.0）
     */
    getEffectsVolume : function(){
        return cc.audioEngine.getEffectsVolume();
    },

    /**
     * 设置音效音量
     * @param volume(Number)           音量（0.0 ~ 1.0）
     */
    setEffectsVolume : function(volume){
        this._effectVolume = volume;
        cc.audioEngine.setEffectsVolume(volume);
    },

    /** 
     * 暂停指定的音效
     * @param url(string)              音效路径
     */
    pauseEffect : function(url){
        var audio = this._effects[url];
        if (audio)
            cc.audioEngine.pauseEffect(audio);
        else
            cc.error("地址为【{0}】的音效文件不存在".format(url));
    },

    /** 
     * 暂停现在正在播放的所有音效 
     */
    pauseAllEffects : function(){
        cc.audioEngine.pauseAllEffects();
    },

    /**
     * 恢复播放指定的音效
     * @param url(string)              音效路径
     */
    resumeEffect : function(url){
        var audio = this._effects[url];
        if (audio)
            cc.audioEngine.resumeEffect(audio);
        else
            cc.error("地址为【{0}】的音效文件不存在".format(url));
    },

    /** 
     * 恢复播放所有之前暂停的所有音效
     */
    resumeAllEffects : function(){
        cc.audioEngine.resumeAllEffects();
    },

    /**
     * 停止播放指定音效
     * @param url(string)              音效路径
     */
    stopEffect : function(url){
        var audio = this._effects[url];
        if (audio)
            cc.audioEngine.stopEffect(audio);
        else
            cc.error("地址为【{0}】的音效文件不存在".format(url));
    },

    /**
     * 停止正在播放的所有音效
     */
    stopAllEffects : function(){
        cc.audioEngine.stopAllEffects();
    },

    /**
     * 卸载预加载的音效
     */
    unloadEffect : function(url){
        var rawUrl = cc.url.raw(url);
        cc.audioEngine.unloadEffect(url);
    },

    /**
     * 停止所有音乐和音效的播放
     */
    end : function(){
        cc.audioEngine.end();
    }
});
