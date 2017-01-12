cc.Class({
    extends: cc.Animation,

    onLoad: function () {
        this.on("finished", this._onFinished, this);
    },

    _onFinished : function(event){
        this.node.parent = null;
    }
});
