const loaderUtils = require('loader-utils')

module.exports = function (source) {
    const options = loaderUtils.getOptions(this);
    const callback = this.async()   //this.async()返回的也是一个this.callback所以和this.callback传参使用是一样的
    setTimeout(() => {
        const result = source.replace('xu', options.name)
        callback(null, result)
    }, 1000)
}

// 如果我们的返回结果是异步的，就需要使用this.async() ，否则就会打包出错