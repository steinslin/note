## DeepClone

需要注意的点

> 非原始类型需要递归copy

> 不可破坏原型链，可以借用`Object.getPrototypeOf(object)`来拿到原型，再通过`Object.create`来继承原型，从而保护原型链

> 需要考虑循环引用

> 包括但不限于`Date` `RegExp` `Arguments` `Set` `Map` `Array` `Symbol` `object String` `object Boolean`等类型，可以使用`Object.prototype.toString.call`来判断类型，分别做处理

> 一些特殊类型无需拷贝，包括`function` `error` `weakMap`
