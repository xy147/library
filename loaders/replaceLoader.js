const loaderUtils = require('loader-utils')

module.exports = function (source) {
    return source.replace('yi', this.query.name)
    //这里的 this.query里就包含了我们再config里配置的该loader的option这个对象。
    //this还有更多的东西我们可以在官网的api loaders里去查看。
}



// module.exports = function (source) {
//     const options = loaderUtils.getOptions(this);
//     return source.replace('xu', options.name)
// }

//这里我们也可以loader-utils下的方法去分析this，比如这里用getOptions分析this就能更好的获取
//config里配置的该loader的option对象。



// module.exports = function (source) {
//     const options = loaderUtils.getOptions(this);
//     const result = source.replace('xu', options.name)
//     this.callback(null, result) //这里没有生成sourcemap，以及不需要传递额外信息。所以只传两个参数。
// }

//如果要返回的不仅仅是源码，还想返回sourcemap的信息，或者额外的信息，可以使用this.callback
//可以在官方api里好好看下this.callback。比较常用


