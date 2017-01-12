/** 
 * 游戏入口
 * Author      : donggang
 * Create Time : 2016.8.10
 */
cc.Class({
    extends: require("Game"),
    
    run : function(){
        game.scene.setSceneType("SceneRPG");
        game.scene.replaceScene("persist/prefab/battlefield", {preloaded:"persist"}); 
    }
});