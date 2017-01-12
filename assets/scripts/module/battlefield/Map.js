/** 
 * 游戏玩法层地图
 * Author      : donggang
 * Create Time : 2016.8.27
 * 
 * 需求说明
 * 1、自动生成指定尺寸的地图
 */
module.exports = cc.Class({
    extends: cc.Node,

    ctor: function () {
        this.name = "layer_play_map";
    },

    updateDangerLeft : function(r,g,b){
        this._bg.rect(this._mapX, this._mapY, this.leftOrRightWidth, this._height);
        this._bg.fillColor = cc.color(r,g,b,255);
        this._bg.fill();
    },

    updateDangerRight : function(r){
        this._bg.rect(-this._mapX - this.leftOrRightWidth , this._mapY, this.leftOrRightWidth, this._height);
        this._bg.fillColor = cc.color(r,0,0,255);
        this._bg.fill();
    },

    clear : function(){

    },

    /**
     * 创建地图
    * @param width(int)     地图宽
    * @param height(int)    地图高
    */
    create : function(width, height){
        var offectX = 24;
        var offectY = 10;

        width  += offectX * 2 * 50;
        height += offectY * 2 * 50;

        this._width  = width;
        this._height = height;
        
        var bgNode = new cc.Node();
        bgNode.parent = this;
        this._bg = bgNode.addComponent(cc.Graphics);

        var lineNode    = new cc.Node();
        lineNode.parent = this;
        var line        = lineNode.addComponent(cc.Graphics);
        this.xMax       = width  / 50;
        this.yMax       = height / 50;

        // 背景
        this._mapX = -width  / 2;
        this._mapY = -height / 2;
        this._bg.rect(this._mapX, this._mapY, width, height);
        this._bg.fillColor = cc.color(38,36,53,255);
        this._bg.fill();

        this.leftOrRightWidth = offectX * 50;
        
        this.updateDangerLeft(100, 0, 0);
        this.updateDangerRight(100, 0, 0);

        this.leftDangerMinX  = this._mapX;
        this.leftDangerMaxX  = this._mapY;
        this.rigthDangerMinX = -this._mapX - this.leftOrRightWidth;
        this.rigthDangerMaxX = -this._mapX;

        // 竖线
        for (var x = 0; x < this.xMax; x++) {
            line.moveTo(this._mapX + x * 50, this._mapY);
            line.lineTo(this._mapX + x * 50, height / 2); 
            line.strokeColor = cc.color(255,255,255,100);
            line.stroke();
        }

        // 横线
        for (var y = 0; y <= this.yMax; y++) {
            if (y == offectY || y == this.yMax - offectY){
                line.strokeColor = cc.color(255,255,255,50);
                line.lineWidth   = 7;
            }
            else {
                line.strokeColor = cc.color(255,255,255,100);
                line.lineWidth   = 1;
            }

            line.moveTo(this._mapX     , this._mapY + y * 50);
            line.lineTo(width / 2, this._mapY + y * 50);
            line.stroke();
        }
    }
});
