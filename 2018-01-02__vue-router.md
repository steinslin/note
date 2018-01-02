# 笔记

## vue-router源码阅读

### 技巧

- 在install.js中，抛出 `Vue` 引用，因为开发插件时，并不想把 `Vue` 也打包进去，但是会用到 `Vue` 的一些特性，这个时候就可以采用这种策略，当然也可以在打包工具中像 `webpack.externals` 进行配置

- pathMap nameMap，将一个需要递归遍历的树结构保存下来，方便后面使用

