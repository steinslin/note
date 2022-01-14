#笔记

## tree shaking

在 js 中的 `tree shaking` 最早由 `rollup` 作者提出，利用 `ES6 modules` 的 `静态特性` 得以实现的。在打包时可以检测到未使用的代码，然后删除。`webpack2` 也引入了这一技术， `webpack2` 已经内置支持 `es6 `模块和 `tree-shaking`，本文会介绍 `tree-shaking` 的应用和一些问题。

### webpack版

采用es6语法导出fucntion、class、var等

```js
// a.js
export function a () {
  console.log('a')
}

export function b () {
  console.log('b')
}

export const c = 1

export class T1 {
  constructor() {
    console.log('T1')
  }
}

export default class T2 {
  constructor() {
    console.log('T2')
  }
}
```

上述代码中包含了日常会用到的各种export语法，第2个文件只导入部分变量，并作为 `webpack` 打包的entry

```js
// index.js
import { a, T1 } from './a.js'

a()

new T1()
```

webpack配置

```js
module.exports = {
  entry: {
    index: './src/index.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
  // ...
}
```

我们打包时不使用编译器（`Babel` 等）和压缩工具（ `UglifyJS` 等），可以得到如下输出：

```js
(function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = a;
/* unused harmony export b */
function a () {
  console.log('a')
}

function b () {
  console.log('b')
}

const c = 1
/* unused harmony export c */


class T1 {
  constructor() {
    console.log('T1')
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = T1;


class T2 {
  constructor() {
    console.log('T2')
  }
}
/* unused harmony export default */
```

从上面的输出可以看到类似 `/* unused harmony export b */` `/* unused harmony export default */` 这样的结果，webpack会用注释把未使用的class、function等等给记录下来，用 `/* harmony export (immutable) */` 来记录用到的变量。你可能会问为使用的代码怎么还在？不是应该被删除吗？

#### 移除未使用代码（Dead code elimination)

这背后的原因是，`webpack` 仅仅只是把未使用的代码和使用的代码分别用注释标注出来，剩余的工作需要交给类似  `UglifyJS`  这类代码压缩工具。

> 配置 `UglifyJS` 用以压缩代码和DCE

```js
module.exports = {
  // ...
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: true
      },
      output: {
        comments: false
      },
      sourceMap: false
    })
  ]
  // ...
}
```

再次打包，你会发现出现错误，这是因为 `UglifyJS` 不能处理es6代码，所以我们要引入 `babel` ，将es6代码转换到es5

> 配置babel

```js
// .babelrc
{
  presets: [["env", {"modules": false}]],
  plugins: ["transform-runtime"]
}
```

这里需要注意 `"modules": false` 必须声明，默认是 `"modules": "commonjs"` ，它会告诉babel不要处理import export，交由 `webpack` 处理，否则tree shaking失败，因为tree shaking是利用ES6 modules 的静态特性得以实现的。

> webpack引入babel-loader

```js
module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader'
    }]
  }
}
```

再次打包，便能得到被压缩后而且被tree shaking后的代码，并且 `UglifyJS` 会抛出Warning，说明副作用，表示删除了没用的代码

```shell
WARNING in index.bundle.js from UglifyJs 
Dropping unused function b [index.bundle.js:95,9]
Dropping unused variable c [index.bundle.js:99,4]
Dropping unused variable _unused_webpack_default_export [index.bundle.js:113,40]
```

打包后的代码格式化后如下：

```js
! function(n) {
  function t(o) {
    if (e[o]) return e[o].exports;
    var r = e[o] = {
      i: o,
      l: !1,
      exports: {}
    };
    return n[o].call(r.exports, r, r.exports, t), r.l = !0, r.exports
  }
  var e = {};
  t.m = n, t.c = e, t.d = function(n, e, o) {
    t.o(n, e) || Object.defineProperty(n, e, {
      configurable: !1,
      enumerable: !0,
      get: o
    })
  }, t.n = function(n) {
    var e = n && n.__esModule ? function() {
      return n.default
    } : function() {
      return n
    };
    return t.d(e, "a", e), e
  }, t.o = function(n, t) {
    return Object.prototype.hasOwnProperty.call(n, t)
  }, t.p = "/dist/", t(t.s = 0)
}([function(n, t, e) {
  "use strict";
  Object.defineProperty(t, "__esModule", {
    value: !0
  });
  var o = e(1);
  Object(o.b)(), new o.a
}, function(n, t, e) {
  "use strict";

  function o() {
    console.log("a")
  }
  t.b = o, e.d(t, "a", function() {
    return c
  });
  var r = e(2),
    u = e.n(r),
    c = function n() {
      u()(this, n), console.log("T1")
    }
}, function(n, t, e) {
  "use strict";
  t.__esModule = !0, t.default = function(n, t) {
    if (!(n instanceof t)) throw new TypeError("Cannot call a class as a function")
  }
}]);
```

搜索 `console.log` 可以知道 只剩下a和T1，其他没用的代码已经被删除。

#### 第三方包的tree shaking

对第三方包来说也是，应当使用 ES6 模块。现在越来越多的包作者同时发布 CommonJS 格式 和 ES6 格式的模块。ES6 模块的入口由 package.json 的字段 `module` 指定。比如 `vue` ，`module` 指定的是 `dist/vue.runtime.esm.js` ，这个只包含了runtime功能，但是有时候会需要用到 `template` 字段，这个时候就需要引入 `dist/vue.esm.js` 可以通过修改 `alias` 改变。

#### 已知Bug

> 如果我把上面的webpack配置的entry把a.js也给加上之后，tree shaking会失败

```js
module.exports = {
  entry: {
    index: './src/index.js',
    a: './src/a.js'
  }
}
```

这个bug可以在github上的这个[issue](https://github.com/webpack/webpack/issues/5954)找到，解决方案是多entry改为多个webpack配置来编译。

```js
[{
  entry: {
    index: './src/index.js'
  }
}, {
  entry: {
    a: './src/a.js'
  }
}]
```

> 缺少作用域分析，导致tree shaking失败

```js
module.exports = {
  entry: {
    index: './src/index.js'
  }
}
```

```js
// index.js
import { a } from './a.js'

a()
```

```js
// a.js
import _ from 'lodash'

export function a () {
  console.log('a')
}

export function b () {
  return _.xxx()
}
```

按照上面的例子，使用`webpack`打包的话，tree-shasking是会失败的，原因的webpack的处理方式主要是找一个 `import` 进来的变量是否在这个模块内出现过，而函数 `b` 虽然没有被使用，但是因为其函数内部使用了 `lodash` ，因此`lodash`部分的代码不会被删除，详见[issue6264](https://github.com/webpack/webpack/issues/6264)

解决办法，使用插件 `webpack-deep-scope-plugin`,这个插件会对作用域进行分析，从而得出那些可以tree-shaking的代码来进行优化，具体可以看[作者的文章](https://diverse.space/2018/05/better-tree-shaking-with-scope-analysis)

### Rollup版

`rollup` 的 `tree shaking` 是自带的，无需额外配置

> rollup.config.js

```js
export default {
  input: 'src/main.js',
  output: {
    file: 'rollup.bundle.js',
    format: 'cjs'
  }
}
```

> main.js

```js
import { a } from './util'

a()
```

> util.js

```js
export function a () {
  console.log('a')
}

export function b () {
  console.log('b')
}
```

> build

```shell
rollup -c
```

> output rollup.bundle.js
```js
'use strict';

function a () {
  console.log('a');
}

a();
```

输出结果不会引入 `b` 函数，而且对比 `webpack` 代码更少

#### 第三方包的tree shaking

对第三方包来说同样是需要 ES6 模块，另外 `rollup` 处理 `commonjs模块` 需要借助 [rollup-plugin-commonjs](https://github.com/rollup/rollup-plugin-commonjs)插件
