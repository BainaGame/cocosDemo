/** 
 * 纹理缓存管理扩展
 * Author      : donggang
 * Create Time : 2016.8.1
 */

/** 释放没有使用的纹理内存 */
cc.textureCache.removeUnusedMemory = function(){
    if (cc.sys.isNative)
        cc.textureCache.removeUnusedTextures();
    else {
        // 注:H5版引擎未开发资源引用计数，需要此功能则需要自己扩展(PS:坑爹，阉割版引擎。。。)
    }
}

/** 打印缓存的纹理内存消耗数据(用于开发测试) */
cc.textureCache.memory = function () {
    if (cc.sys.isNative)
        cc.log(cc.textureCache.getCachedTextureInfo());
    else {
        var count = 0;
        var totalBytes = 0, locTextures = this._textures;

        for (var key in locTextures) {
            var selTexture = locTextures[key];
            count++;
            if (selTexture.getHtmlElementObj() instanceof HTMLImageElement)
                cc.log(cc._LogInfos.textureCache.dumpCachedTextureInfo, key, selTexture.getHtmlElementObj().src, selTexture.getPixelWidth(), selTexture.getPixelHeight());
            else {
                cc.log(cc._LogInfos.textureCache.dumpCachedTextureInfo_2, key, selTexture.getPixelWidth(), selTexture.getPixelHeight());
            }
            totalBytes += selTexture.getPixelWidth() * selTexture.getPixelHeight() * 4;
        }

        var locTextureColorsCache = this._textureColorsCache;
        for (key in locTextureColorsCache) {
            var selCanvasColorsArr = locTextureColorsCache[key];
            for (var selCanvasKey in selCanvasColorsArr) {
                var selCanvas = selCanvasColorsArr[selCanvasKey];
                count++;
                cc.log(cc._LogInfos.textureCache.dumpCachedTextureInfo_2, key, selCanvas.width, selCanvas.height);
                totalBytes += selCanvas.width * selCanvas.height * 4;
            }

        }
        cc.log(cc._LogInfos.textureCache.dumpCachedTextureInfo_3, count, totalBytes / 1024, (totalBytes / (1024.0 * 1024.0)).toFixed(2));
    }
}