const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')

const moduleAnalyser = (filename) => {
    const content = fs.readFileSync(filename, 'utf-8')
    const ast = parser.parse(content, { sourceType: 'module' })
    const dependencies = {}
    traverse(ast, {
        ImportDeclaration({ node }) {
            const dirname = path.dirname(filename)
            const newFile = './' + path.join(dirname, node.source.value)
            dependencies[node.source.value] = newFile
        }
    })
    const { code } = babel.transformFromAst(ast, null, {
        presets: ["@babel/preset-env"]
    })
    return {
        filename,
        dependencies,
        code,
    }
}
const makeDependenciesGraph = (entry) => {
    const entryModule = moduleAnalyser(entry)
    const graphArray = [entryModule] //依赖图谱
    for (let i = 0; i < graphArray.length; i++) {
        const item = graphArray[i]
        const { dependencies } = item;
        if (dependencies) {
            for (let j in dependencies) {
                graphArray.push(moduleAnalyser(dependencies[j]))
            }
        }
    }
    const graph = {}
    graphArray.forEach(item => {
        graph[item.filename] = {
            dependencies: item.dependencies,
            code: item.code
        }
    })
    return graph
}

const generateCode = (entry) => {
    const graph = JSON.stringify(makeDependenciesGraph(entry))
    return `
        (function(graph){ 
            function require(module){
                function localRequire(relativePath){
                    return require(graph[module].dependencies[relativePath])
                }
                var exports = {};
                (function(require,exports,code){
                    eval(code)
                })(localRequire,exports,graph[module].code)
                return exports;
            }
            require('${entry}')
        })(${graph})
    `
}
const code = generateCode('./src/index.js')
console.log(code)

//分析下moduleAnalyser

//该函数的作用是对传入路径的文件做一个分析。

//分析的目的是返回三项内容，一是index.js所在路径当然这个本来就是我们所传参数很简单，二是index.js的依赖，三是该index.js下的代码转化为浏览器可识别的代码。

//首先通过fs.readFileSync 去获取index.js 里的全部代码，以字符串形式返回

//虽然我们可以通过字符串截取的方式获取index.js的依赖，但是当依赖变的多了，就不好处理了。所以用下面babel提供的方法来做。

//安装 @babel/parser 去解析返回的字符串，{ sourceType: 'module' } 这个参数是因为我们的代码有import这样的引入模块语法
//需要传入这个参数去解析。该方法会返回一个抽象语法树，即一个描述整个代码的对象。
//通过('@babel/traverse').default  可以去遍历这个抽象语法树ast
//traverse传入的第一个参数就是我们要遍历的ast，第二个参数是如果遍历到了type属性为ImportDeclaration的节点，就会去执行该参数里的ImportDeclaration方法
//该方法会传入一个对象，该对象的node属性就是我们遍历到的type类型为ImportDeclaration的节点（一个对象），然后就可以在该节点的source.value中取得
//我们的依赖即字符串'./message.js'
//但是仅有这个相对路径还不够，我们需要知道该相对路径是相对哪个文件夹下的，因此我们通过path.dirname去获取了该文件所在的路径并与该相对路径做拼接
//最后在我们以键值对的方式，将该相对路径作为键，拼接和后的路径作为值，生成一个反应了各个依赖的引入时路径和，拼接后和bundler.js同级的路径 的对象。

//最后通过安装@babel/core和@babel/preset-env 将我们的抽象语法树ast进行翻译，会返回一个对象，对象中的code属性，即为我们index.js中es6代码翻译成的
//浏览器能看懂的es5代码。

//最后返回这三项内容。
//一个下面这样的对象

//{ 
//  filename: './src/index.js',
//  dependencies: { './message.js': './src/message.js' },
//  code: '"use strict";\n\nvar _message = _interopRequireDefault(require("./message.js"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n\nconsole.log(_message["default"]);' 
//}



//分析下makeDependenciesGraph

//首先我们传入./src/index.js 这个主入口文件，通过调用moduleAnalyser并接收传入的./src/index.js，从而返回一个对象，包含了该文件的路径，该文件的依赖，以及浏览器能识别的代码

//然后我们创建一个数组，将返回对象作为数组的第一项。我们去遍历这个数组。这时候该数组只有一个对象。我们看该对象是否有依赖，如果依赖存在。
//我们就会去for in 这个依赖，这个依赖是一个对象，每个键值对的值都是一个我们之前已经拼接好的相对bundler.js的路径。
//然后我们就再去调用moduleAnalyser，接收的参数就是上面说的路径。那么我们就又得到了一个包含文件路径，文件的依赖以及浏览器能识别的代码的对象，并加入到graphArray中
//graphArray的长度增加了，那么就会继续去循环遍历就会继续，从而继续往graphArray增加对象。直到某个文件没有额外的依赖了，即dependencies为空对象了
//这时候graphArray就是一个依赖图谱，里面的对象，第一个对象，反应了其路径，依赖，源码。第二个对象的路径其实就是第一个文件的依赖，并且会反应它的路径，及它的依赖，源码。

//最终去打包的时候graphArray这样的数组形式还不是很好用，我们用graph对象将该数组格式化一下。变成一个我们更易使用的对象，并返回该对象


//{ './src/index.js': 
//   { dependencies: { './message.js': './src/message.js' },
//     code: '"use strict";\n\nvar _message = _interopRequireDefault(require("./message.js"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n\nconsole.log(_message["default"]);' },
//  './src/message.js': 
//   { dependencies: { './word.js': './src/word.js' },
//     code: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports["default"] = void 0;\n\nvar _word = require("./word.js");\n\nvar message = "say ".concat(_word.word);\nvar _default = message;\nexports["default"] = _default;' },
//  './src/word.js': 
//   { dependencies: {},
//     code: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.word = void 0;\nvar word = \'hello\';\nexports.word = word;' } }




//generateCode函数的分析
//该函数是生成我们最后正式在浏览器可以执行的代码。通过makeDependenciesGraph 返回的依赖图谱对象。
//我们将图谱中的三段代码，去掉换行符，放入到src/finalCode.js中，在对照generateCode函数return回来函数去执行。这样可以更清晰看到整个的 最终代码生成的过程和结果。

//整个返回的函数是字符串拼接的，并不会帮我们自动断句，所以语句上的分号都要加上。不然就会被连在一起从而出现语法错误。

//require('${entry}')  还有这部分在外面额外加了个分号是因为，这里用es6的字符拼接获得的是require(./src/index.js)，整个都是一个字符串，但其实我们需要的是require('./src/index.js')。因此外面加了个分号。
//始终注意这整个是一个字符串，但我们最终要实现的是正常代码的运行。即除去最外面的引号，代码和我们所需执行代码是一模一样的。
