const path = require('path')

module.exports = {
    mode: 'development',
    entry: {
        main: './src/index.js' //以往我们都是说引入了js的文件然后webpack如何去处理这个文件比如引入js，
        //但其实，这个index.js文件本身也是要被webpack去打包分析的，因此下面的loader也会对这个index.js生效
    },
    resolveLoader: {
        modules: ['mode_modules', './loaders']//自己写的loader要以下面注释部分的方式是使用，这里这样配置以后
        //就可以先去mode_modules找，找不到再去./loaders目录下面找。就可以像使用第三方loader那样一样了。
    },
    module: {
        rules: [{
            test: /\.js/,
            use: [
                {
                    loader: 'replaceLoader',
                    options: {
                        name: 'tian'
                    }
                },
                {
                    loader: 'replaceLoaderAsync',
                    options: {
                        name: 'tian'
                    }
                }
                // {
                //     loader: path.resolve(__dirname, './loaders/replaceLoader.js'),
                //     options: {
                //         name: 'tian'
                //     }
                // },
                // {
                //     loader: path.resolve(__dirname, './loaders/replaceLoaderAsync.js'),
                //     options: {
                //         name: 'tian'
                //     }
                // }
            ]
        }]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    }
}