/** 触摸类型 */
var TouchType = {  
    DEFAULT: "default",     // 默认位置
    FOLLOW : "follow"       // 触摸开始时候现形
};  
  
/** 方向类型 */
var DirectionType = {  
    FOUR : "four",          // 四方向移动
    EIGHT: "eight",         // 八方向移动
    ALL  : "all"            // 全方向移动
};  

cc.Class({
    extends : cc.Component,

    properties: {
        avatar : {
            default : null,
            type    : cc.Node,
            tooltip : "皮肤"
        },
        arrow : {
            default : null,
            type    : cc.Node,
            tooltip : "移动方向提示图标"
        },
    },

    onLoad : function () {
        this._listener       = null;                  // 监听器   

        this._target         = this.node;             // 操控的目标  
        this._speed          = 5;                     // 实际速度 
        this._angle          = 0;                     // 准备移动的角度
        this._angleRad       = 0;                     // 准备移动的角度（弧度）
        this._angleRadToServer = 0;                   // 发送给服务器的弧度  
        this._touchType      = TouchType.FOLLOW;      // 触摸类型  
        this._directionType  = DirectionType.ALL;     // 方向类型  
        this._circleCenter   = null;                  // 圆心
        this._stopRadius     = 30;                    // 摇杆非操作区域半径
        this._radius         = 100;                   // 摇杆操作区域半径
        this._circleDistance = 0;                     // 与圆心的距离
        this._isControl      = false;                 // 是开始控制
        this._isTouchEnd     = true;                  // 是否没有触摸

       switch (this._directionType)  
        {  
            case DirectionType.FOUR:  
                this._direction = this._fourDirectionsMove;
                break;  
            case DirectionType.EIGHT:  
                this._direction = this._eightDirectionsMove;  
                break;  
            case DirectionType.ALL:  
                this._direction = this._allDirectionsMove;  
                break;  
            default :  
                break;  
        }  

        // 初始化全局触摸事件
        this._listener = {
            event           : cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches  : false,  
            onTouchBegan    : this._onTouchBegan.bind(this),
            onTouchMoved    : this._onTouchMoved.bind(this),
            onTouchEnded    : this._onTouchEnded.bind(this),
            onTouchCancelled: this._onTouchEnded.bind(this)
        }
        cc.eventManager.addListener(this._listener, game.play);
        
        this.arrowAnimation = this.arrow.getComponent(cc.Animation);        // 设置组件
    },
  
    // 更新移动目标  
    update: function(dt)  
    {
        if (this._isControl) {
            this._direction();
        }
    },  

    // 设置遥控杆开关  
    setEnable: function(enable) {  
        if (this._listener != null) {  
            if (enable)
                cc.eventManager.addListener(this._listener, this._stickBG);
            else
                cc.eventManager.removeListener(this._listener);
        }  
    },
  
    onDestroy: function() {
        // 移除触摸监听  
        // if (this._listener != null)  
        //     cc.eventManager.removeListener(this._listener);  
    },

    _onTouchBegan : function(touches, event) {
        if (this._isTouchEnd == false) return false;

        // 触摸监听目标  
        var target = event.getCurrentTarget();  
        var touch  = event.getTouches()[0];

        // 如果触摸类型为FOLLOW，则摇控杆的位置为触摸位置, 触摸开始时候现形  
        if (this._touchType == TouchType.FOLLOW)  
        {  
            // 记录圆心
            this._circleCenter = touch.getLocation();        
            
            // 播放显示箭头动画
            this.arrow.stopAllActions(); 
            
            if (this.arrowSourceX)
                this.arrow.x = this.arrowSourceX;
            if (this.arrowSourceY)
                this.arrow.y = this.arrowSourceY;

            this.arrowSourceX = this.arrow.x;
            this.arrowSourceY = this.arrow.y;
            this.arrowAnimation.play("arrow_show");
            this._isTouchEnd = false;

            return true;  
        }  
        return false;  
    }, 

    _onTouchMoved : function(touches, event) {
        var touch    = event.getTouches()[0];
        var location = touch.getLocation();
        
        // 计算摇杆圆心与当前滑动点的距离
        this._circleDistance = Math.distance(this._circleCenter, location);

        // 移动半径超出非操作区，则开始控制
        if (this._circleDistance > this._stopRadius) {
            // 计算提示箭头位置
            var arrowAndTargetDistance = this._circleDistance;
            if (arrowAndTargetDistance < 80) {
                arrowAndTargetDistance = 80;
            }
            else if (arrowAndTargetDistance > 300) {
                arrowAndTargetDistance = 300;
            }
            this.arrow.x = arrowAndTargetDistance;

            // 目标方向
            this.avatar.rotation = -this._getAngle(location);
            var ec = new cc.Event.EventCustom("change_rotation", true);
            ec.setUserData(this._angleRadToServer);
            this.node.dispatchEvent(ec);

            this._isControl = true;
        }
        else {
            this._isControl = false;        // 进入非操作区域
        }
    },

    /** 计算角度并返回  */
    _getAngle: function(point)  
    {  
       var angle = Math.atan2(point.y - this._circleCenter.y, point.x - this._circleCenter.x);
       this._angleRad = angle;
       this._angle    = angle * (180 / Math.PI);
       angle          = angle + 0.5 * Math.PI;
       this._angleRadToServer = angle < 0 ? angle + 2 * Math.PI: angle;
       return this._angle; 
    },

    _onTouchEnded : function(touches, event) {
        // 播放隐藏箭头动画
        this.arrowAnimation.play("arrow_hide");
        var distace = this._circleDistance + 300;

        var action = cc.moveTo(1, 
            distace * Math.sin(Math.angleToRadian(this.arrow.rotation + 90)), 
            distace * Math.cos(Math.angleToRadian(this.arrow.rotation + 90))
        );
        this.arrow.runAction(action);

        // 关闭摇杆控制
        this._isControl = false;

        // 触摸结束
        this._isTouchEnd = true;
    },

    //--------------------------------------------------------------------------------- (暂没用动下面的移动逻辑)

    // 四个方向移动(上下左右)  
    _fourDirectionsMove : function() {  
        if(this._angle > 45 && this._angle < 135)  
        {  
            this._target.y += this._speed;  
        }  
        else if(this._angle > -135 && this._angle < -45)  
        {  
            this._target.y -= this._speed;  
        }  
        else if(this._angle < -135 && this._angle > -180 || this._angle > 135 && this._angle < 180)  
        {  
            this._target.x -= this._speed;  
        }  
        else if(this._angle < 0 && this._angle > -45 || this._angle > 0 && this._angle < 45)  
        {  
            this._target.x += this._speed;  
        }  
    },  
  
    // 八个方向移动(上下左右、左上、右上、左下、右下)  
    _eightDirectionsMove : function() {  
        if(this._angle > 67.5 && this._angle < 112.5)  
        {  
            this._target.y += this._speed;  
        }  
        else if(this._angle > -112.5 && this._angle < -67.5)  
        {  
            this._target.y -= this._speed;  
        }  
        else if(this._angle < -157.5 && this._angle > -180 || this._angle > 157.5 && this._angle < 180)  
        {  
            this._target.x -= this._speed;  
        }  
        else if(this._angle < 0 && this._angle > -22.5 || this._angle > 0 && this._angle < 22.5)  
        {  
            this._target.x += this._speed;  
        }  
        else if(this._angle > 112.5 && this._angle < 157.5)  
        {  
            this._target.x -= this._speed / 1.414;  
            this._target.y += this._speed / 1.414;  
        }  
        else if(this._angle > 22.5 && this._angle < 67.5)  
        {  
            this._target.x += this._speed / 1.414;  
            this._target.y += this._speed / 1.414;  
        }  
        else if(this._angle > -157.5 && this._angle < -112.5)  
        {  
            this._target.x -= this._speed / 1.414;  
            this._target.y -= this._speed / 1.414;  
        }  
        else if(this._angle > -67.5 && this._angle < -22.5)  
        {  
            this._target.x += this._speed / 1.414;  
            this._target.y -= this._speed / 1.414;  
        }  
    },  
  
    // 全方向移动  
    _allDirectionsMove: function() {  
        this._target.x += Math.cos(this._angle * (Math.PI/180)) * this._speed;  
        this._target.y += Math.sin(this._angle * (Math.PI/180)) * this._speed;
    },  
});
