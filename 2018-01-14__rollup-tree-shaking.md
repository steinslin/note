# 笔记

## tree shaking

rollup的tree shaking是自带的，无需额外配置

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

```output
'use strict';

function a () {
  console.log('a');
}

a();
```

输出结果不会引入b函数，而且对比webpack代码更少，也能直接读懂
