var GallerySliderItem = cc.Class({
    name: 'GallerySliderData',
    properties: {
        image: {
            default : null,
            type    : cc.SpriteFrame, 
            tooltip : "图片数据"
        },
        clickEvents:{
            default : [],
            type    : cc.Component.EventHandler,
            tooltip : "图片点击事件回调"
        }
    }
});
    
/** 
 * 图片轮播组件
 * Author      : donggang
 * Create Time : 2016.8.4
 * 
 * 需求说明
 * 1、设置轮播图片数据和关联的点击后事件回调
 * 2、设置定时制动轮播
 * 3、播放到最后一个数据时，会回到第一个数据继续播放
 * 4、自定义每个图片的点击事件回调方法
 */
window.game = window.game || {};
game.ui     = game.ui     || {}; 
game.ui.GallerySlider = module.exports = cc.Class({
    extends: cc.Mask,

    properties: {
        autoMove : {
            default : 3,
            type    : cc.Integer, 
            tooltip : "自动滚动时间间隔（秒)"
        },
        navigationShow : {
            default : null,
            type    : cc.SpriteFrame, 
            tooltip : "导航显示状态图标"
        },
        navigationHide : {
            default : null,
            type    : cc.SpriteFrame, 
            tooltip : "导航隐藏状态图标"
        },
        contentLayout : {
            default : null,
            type    : cc.Node, 
            tooltip : "导航层背景"
        },
        navigationLayout : {
            default : null,
            type    : cc.Node, 
            tooltip : "导航层"
        },
        navigationSpacing : {
            default : 0,
            type    : cc.Integer, 
            tooltip : "导航间距"
        },
        items : {
            default : [],
            tooltip : "轮播项目",
            type    : GallerySliderItem
        }
    },

    onLoad: function () {
        if (CC_EDITOR) return;

        this.isMove            = false   // 是否在轮播中（轮播中不能在次触发轮播，必须等当前处理完）
        this.currentIndex      = 0;      // 发前轮播索引
        this.imageNodes        = [];     // 轮播图片节点集合
        this.navigationSrpites = [];     // 导航图片精灵集合

        // 设置导航提示居中
        var navigationOffect = (this.node.getContentSize().width - this.navigationSpacing * this.items.length) / 2;
        this.navigationLayout.x = -navigationOffect;

        for(var i = 0; i < this.items.length; i++){
            // 创建图片
            var nodeSprite     = new cc.Node();
            var srpite         = nodeSprite.addComponent(cc.Sprite);
            srpite.spriteFrame = this.items[i].image;
            nodeSprite.parent  = this.contentLayout;
            nodeSprite.setPosition(i * this.node.getContentSize().width, 0);
            this.imageNodes.push(nodeSprite);

            // 创建导航
            var navigationNode            = new cc.Node();
            navigationNode.data           = i;
            navigationNode.on(cc.Node.EventType.TOUCH_START, this._onNavigationTouchtStart, this);

            var navigationSrpite          = navigationNode.addComponent(cc.Sprite);
            navigationSrpite.spriteFrame  = this.navigationHide;
            navigationNode.parent         = this.navigationLayout;
            navigationNode.x = i * this.navigationSpacing;
            this.navigationSrpites.push(navigationSrpite);

            if (i > 0) {
                nodeSprite.active = false;
                this.navigationSrpites[i].spriteFrame = this.navigationHide;
            }
            else {
                nodeSprite.active = true;
                this.navigationSrpites[i].spriteFrame = this.navigationShow;
            }
        } 
        
        this.node.on(cc.Node.EventType.TOUCH_START , this._onTouchStart, this);      // 开启滑动状态验证
        this.node.on(cc.Node.EventType.TOUCH_END   , this._onTouchtEnd , this);      // 结束滑动状态验证
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchtEnd , this);      // 结束滑动状态验证

        this.elapsedTime = 0;     
    },

    _onNavigationTouchtStart : function(event){
        if (this.isMove) return;

        var index = event.target.data;

        // 重置节点活动状态
        for(var i = 0; i < this.items.length; i++) {
            this.imageNodes[i].active = false;
            this.navigationSrpites[i].spriteFrame = this.navigationHide;
        }

        var dir = this.currentIndex > index ? -1 : 1;

        // 设置当前节点动画
        var currentMove = cc.moveBy(0.5, cc.p(dir * this.node.getContentSize().width, 0));
        var currentNode	= this.imageNodes[this.currentIndex];
        currentNode.active = true;
        currentNode.runAction(currentMove);

        // 设置下个节点动画
        var nextMove    = cc.moveBy(0.5, cc.p(dir * this.node.getContentSize().width, 0));
        var nextNode    = this.imageNodes[index];
        nextNode.active = true;
        nextNode.setPosition(-dir * this.node.getContentSize().width, 0);

        var nextCallF = cc.callFunc(function(){
            this.currentIndex = index;
        	this.isMove = false;
        }, this);
        nextNode.runAction(cc.sequence(nextMove, nextCallF));

        this.navigationSrpites[index].spriteFrame = this.navigationShow;

        this.elapsedTime = 0; 
    },

    _onTouchStart : function(event){
        var touches = event.getTouches();
        this.startLocation = event.getTouches()[0].getLocation();
    },

    _onTouchtEnd : function(event){
        if (this.isMove) return;

        this.endLocation = event.getTouches()[0].getLocation();

        // 计算滑动方向
        var distance = cc.pDistance(this.startLocation, this.endLocation);               // 两点距离
        
        if (distance < this.node.getContentSize().width / 2) {                           // 出发事件
            var clickEvent = this.items[this.currentIndex].clickEvents;
            cc.Component.EventHandler.emitEvents(clickEvent, event);
        }
        else {                                                                           // 设置开始移动状态
            var isLeft  = this.endLocation.x < this.startLocation.x ? true : false;      // 滑动方向
            this._move(isLeft)
        }
    },

    update : function(dt){
        this.elapsedTime += dt;
        if (this.elapsedTime >= this.autoMove) {
            this.elapsedTime -= this.autoMove;
            this._move(true);
        }
    },

    _move : function(isLeft){
        this.isMove = true;

        // 重置节点活动状态
        for(var i = 0; i < this.items.length; i++) {
            this.imageNodes[i].active = false;
            this.navigationSrpites[i].spriteFrame = this.navigationHide;
        }

        var dir = isLeft ? -1 : 1;

        // 设置当前节点动画
        var currentMove = cc.moveBy(0.5, cc.p(dir * this.node.getContentSize().width, 0));
        var currentNode	= this.imageNodes[this.currentIndex];
        currentNode.active = true;
        currentNode.runAction(currentMove);

        if (isLeft) {
            this.currentIndex++;
            if (this.currentIndex >= this.items.length ) this.currentIndex = 0;
        }
        else {
            this.currentIndex--;
            if (this.currentIndex < 0 ) this.currentIndex = this.items.length - 1;
        }

        // 设置下个节点动画
        var nextMove    = cc.moveBy(0.5, cc.p(dir * this.node.getContentSize().width, 0));
        var nextNode    = this.imageNodes[this.currentIndex];
        nextNode.active = true;
        nextNode.setPosition(-dir * this.node.getContentSize().width, 0);

        var nextCallF = cc.callFunc(function(){
        	this.isMove = false;
        }, this);
        nextNode.runAction(cc.sequence(nextMove, nextCallF));

        this.navigationSrpites[this.currentIndex].spriteFrame = this.navigationShow;
        
        this.elapsedTime = 0;
    }
});