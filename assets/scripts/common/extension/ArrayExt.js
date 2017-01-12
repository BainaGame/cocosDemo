/** 
 * 组件扩展
 * Author      : donggang
 * Create Time : 2016.8.1
 */

/** 数组去重复 */
Array.prototype.unique = function()
{
	var n = {}, r=[];                           //n为hash表，r为临时数组
	for(var i = 0; i < this.length; i++)        //遍历当前数组
	{
		if (!n[this[i]])                        //如果hash表中没有当前项
		{
			n[this[i]] = true;                  //存入hash表
			r.push(this[i]);                    //把当前数组的当前项push到临时数组里面
		}
	}
	return r;
}