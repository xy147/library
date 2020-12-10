// class CopyrightWebpackPlugin{
//     constructor(){

//     }

//     apply(compiler){

//     }
// }
//插件是一个类，与loader不同的是，loader是去处理对应类型的文件，插件是在打包的某个时刻，帮我们做一些事情
//上面的类，就是一个插件最基本的框架样子了。

class CopyrightWebpackPlugin {
    apply(compiler) { //接收一个webpack的实例
        compiler.hooks.emit.tapAsync('CopyrightWebpackPlugin', (compilation, cb) => {
            debugger
            compilation.assets['copyright.txt'] = {
                source: function () {
                    return 'learn plugin'
                },
                size: function () {
                    return 12
                }
            }
            cb()
        })
    }
}

module.exports = CopyrightWebpackPlugin

//compiler.hooks 都有哪些时刻的钩子可以去官网api里查看，emit是将打包好的文件放入指定目录的时刻。
//emit是一个异步钩子，具体使用 需要调用tapAsync，并在传入的第二个函数参数中调用回调，像上面这样使用。
//compilation存放了本次打包所有的内容，可以通过assets属性查看。
//我们这个插件目的是在打包好的文件放入指定目录的时刻，再额外生成一个txt文件，直接加入到assets里就可以了
//上述这种在assets加入copyright.txt，并制定其内容的写法，回头再研究下。



//最后我们再package.json的scripts中新增了 debug的指令
//该指令的运行方式和下面的build是一样的
//但是用 node 去显示的执行webpack.js是可以传入node的参数的，
//这里的传的第一个参数的意思是开启node的调试工具，第二个参数的意思是在webpack.js第一行的打断点。
//然后我们就可以在浏览器调试模式下点开绿色小按钮，就会弹出我们webpack.js执行的代码，并断在第一行
//最后我们再上面插件中写入debugger，这样就可以断点停在插件的这个位置，就可以以此方式调试或者查看比如compilation中都有些什么啦。