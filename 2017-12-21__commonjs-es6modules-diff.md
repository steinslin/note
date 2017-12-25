# 笔记

## commonjs和es6模块的差异

### commonjs是动态加载 es6是静态解析

```js
if (true) {
  // 可以这样写 因为commonjs是动态的
  exports.a = 1
} else {
  // 错误
  export const a = 1
}
```

##### 在webpack打包时，设置如下的babel配置进行实验的结果

```js
{
  "presets": [
    ["env", {
      "modules": false
    }],
    "stage-2"
  ],
  "plugins": ["transform-runtime"],
}
```

> 采用modules: false是为了让webpack采用es6的方式处理模块，这个时候不会存在 `arguments` `require` `module` `exports` `__filename` `__dirname`这些顶层变量，这些变量是在commonjs在处理模块时在外面包的一层自执行所带来的

> 当一个模块中采用es6抛出时,就不能再使用commonjs抛出，因为不存在`module` `exports`这些对象，去掉moudles:false就可以

##### 采用es抛出
```js
// a.js
export let a = 1
let b = 2
setInterval(() => {
  a++
  b++
}, 1000)
export default b

// 设置为module:false时报错 不存在exports、module
exports.c = 3
module.exports = {
  c: 3
}
```

```js
// b.js
let { a } = require('./a.js')
// => 1 1 1 1 1 1

let b = require('./a.js')
// => {default: 2, __esModule: true} 不变
// => 如果上面没有抛出default的话 会变成 {__esModule: true}
```

```js
// c.js
import b, { a } from './a.js'
// a => 1 2 3 4 5 6
// b => 2 2 2 2 2 2
```


##### 采用commonjs抛出
```js
// d.js
exports.b = 1

setInterval(() => {
  exports.b++
}, 1000)
```

```js
// e.js
let { b } = require('./d.js')
// => 1 1 1 1 1 1

let b = require('./a.js')
// => {b: 1} {b: 2} {b: 3} {b: 4}
```

```js
// f.js
import { b } from './d.js'
// => 1 2 3 4 5 6

import b from './d.js'
// => {b: 1} {b: 2} {b: 3} {b: 4}
```

##### commonjs处理es6模块（删除modules: false）

```js
// h.js
export let a = 1

let b = 2

exports.c = 2

setInterval(() => {
  a++
  b++
  exports.c++
}, 1000)

export default b
```

```js
i.js
let a = require('./h.js')
// => {a: 1, c: 2, default: 2, __esModule: true} {a: 2, c: 3, default: 2, __esModule: true} {a: 3, c: 4, default: 2, __esModule: true}

let {a} = require('./h.js')
// => 1
```

##### 并不是抛出的default不会被改变 而是在打包的时候 上面的代码会变为如下：

```js
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var a = exports.a = 1;

var b = 2;

exports.c = 2;

setInterval(function () {
  exports.a = a += 1;
  b++;
  exports.c++;
}, 1000);

exports.default = b;
```

并没有实时修改exports.default的值，所以default没有改变，但是可以用一下写法让他改变

```js
export default function c () {
  console.log('c')
}

setTimeout(() => {
  /* eslint-disable */
  c = 2
}, 1000)
```

这样再引入的时候 1s后会变成2，因为打包后的代码如下，会实时修改exports.default的值

```js
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function c() {
  console.log('c');
}

setTimeout(function () {
  /* eslint-disable */
  exports.default = c = 2;
}, 1000);

```

##### UMD模块

`umd` 模块是动态导出，所以不能采用es6方式导入（并不是指不能import，而是指设置"modules": false），只能使用 `commonjs` 方式导入


##### 各种在es6模块下不能正常引入，但是在commonjs中可以的例子

1. `umd`

```js
(function (root, factory) {
  console.log(typeof module);
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Popper = factory();
  }
}(this, function () {
  // return 
})
```

上面是典型的umd格式，动态导出，由于es6是静态解析，所以不能采用es6进行处理

2. 当`module.exports` 或 `exports` 和 `import` 或 `export` 共存的时候

```js
// 两者共存只能采用commonjs打包，因为这样不存在exports对象
export const a = 1;

exports.b = 1;
```
