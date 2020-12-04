const path = require('path')

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    externals: ['lodash'],//打包的时候忽略该库文件，因为可能用户使用的时候也会引入该库，那就会重复了。externals的具体配置可以去官网看，还有别的功能
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'library.js',
        library: 'library',  //可以以script标签的方式引入该库，将该库挂载到了library变量上，可以通过library变量去访问
        libraryTarget: 'umd'  //可以以任意方式引入该库
    }
}