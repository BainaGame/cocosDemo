/** 
 * 节点对象池管理  
 * Author      : donggang
 * Create Time : 2016.9.16
 */
var PoolManager = cc.Class({
    ctor : function(){
        this._pools = {};
    }, 

    /**
     * 创建池
     * @param name(string)                 池类型名
     * @param count(int)                   初始池里的对象数量
     * @param createNodeCallBakc(function) 创建节点回调函数
     */
    create : function(name, count, createNodeCallBack){
        var pool = this._pools[name];
        if (pool == null){
            pool = new cc.NodePool();
            pool.createNodeCallBack = createNodeCallBack;
            this._pools[name] = pool;
        }

        for(var i = 0; i < count; i++){
            pool.put(createNodeCallBack());
        }
    },

    /**
     * 向缓冲池中存入一个不再需要的节点对象。 这个函数会自动将目标节点从父节点上移除，但是不会进行 cleanup 操作
     * @param name(string)                 池类型名
     * @param node(cc.Node)                回收节点
     */
    put : function(name, node){
        var pool = this._pools[name];

        if (pool == null){
            cc.error("名为{0}的池对象不存在".format(name));
            return null;
        }

        pool.put(node);
    },

    /**
     * 获取对象池中的对象，如果对象池没有可用对象，则返回空。
     * @param name(string)                 池类型名
     */
    get : function(name){
        var pool = this._pools[name];

        if (pool == null){
            cc.error("名为{0}的池对象不存在".format(name));
            return null;
        }
        
        if (pool.size() == 0) {
            pool.put(pool.createNodeCallBack());
        }
        return pool.get();
    },

    /**
     * 销毁对象池中缓存的所有节点
     * @param name(string)                 池类型名
     */
    clear : function(name){
        var pool = this._pools[name];

        if (pool == null){
            cc.error("名为{0}的池对象不存在".format(name));
            return;
        }
        
        pool.clear();

        delete this._pools[name];
    },

    /**
     * 销毁对象池中缓存的所有节点
     * @param name(string)                 池类型名
     */
    clearAll : function(){
        for (var name in this._pools){
            this.clear(name);
        }
    },
});

module.exports = new PoolManager();