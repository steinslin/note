# PromiseA+规范

## 术语

1. promise 是一个有then方法的对象或者是函数，行为遵循本规范
2. thenable 是一个有then方法的对象或者是函数
3. value 是promise状态成功时的值，也就是resolve的参数, 包括各种数据类型, 也包括undefined/thenable或者是 promise
4. reason 是promise状态失败时的值, 也就是reject的参数, 表示拒绝的原因
5. exception 是一个使用throw抛出的异常值

## 规范

### Promise States 

promise应该有三种状态. 要注意他们之间的流转关系.

1. pending

    - 1.1 初始的状态, 可改变.
    - 1.2 一个promise在resolve或者reject前都处于这个状态。
    - 1.3 可以通过 resolve -> fulfilled 状态;
    - 1.4 可以通过 reject -> rejected 状态;

2. fulfilled

    - 2.1 最终态, 不可变.
    - 2.2 一个promise被resolve后会变成这个状态.
    - 2.3 必须拥有一个value值

3. rejected

    - 3.1 最终态, 不可变.
    - 3.2 一个promise被reject后会变成这个状态
    - 3.3 必须拥有一个reason

### then

promise应该提供一个then方法, 用来访问最终的结果, 无论是value还是reason.

```js
promise.then(onFulfilled, onRejected)
```

1. 参数要求

    - 1.1 onFulfilled 必须是函数类型, 如果不是函数, 应该被忽略.
    - 1.2 onRejected 必须是函数类型, 如果不是函数, 应该被忽略.

2. onFulfilled 特性

    - 2.1 在promise变成 fulfilled 时，应该调用 onFulfilled, 参数是value
    - 2.2 在promise变成 fulfilled 之前, 不应该被调用.
    - 2.3 只能被调用一次(所以在实现的时候需要一个变量来限制执行次数)

3. onRejected 特性

    - 3.1 在promise变成 rejected 时，应该调用 onRejected, 参数是reason
    - 3.2 在promise变成 rejected 之前, 不应该被调用.
    - 3.3 只能被调用一次(所以在实现的时候需要一个变量来限制执行次数)

4. onFulfilled 和 onRejected 应该是微任务

5. then方法可以被调用多次

    - 5.1 promise状态变成 fulfilled 后，所有的 onFulfilled 回调都需要按照then的顺序执行, 也就是按照注册顺序执行(所以在实现的时候需要一个数组来存放多个onFulfilled的回调)
    - 5.2 promise状态变成 rejected 后，所有的 onRejected 回调都需要按照then的顺序执行, 也就是按照注册顺序执行(所以在实现的时候需要一个数组来存放多个onRejected的回调)

6. 返回值

    then 应该返回一个promise

    ```js
    promise2 = promise1.then(onFulfilled, onRejected);
    ```

    - 6.1 onFulfilled 或 onRejected 执行的结果为x, 调用 resolvePromise
    - 6.2 如果 onFulfilled 或者 onRejected 执行时抛出异常e, promise2需要被reject
    - 6.3 如果 onFulfilled 不是一个函数, promise2 以promise1的value 触发fulfilled
    - 6.4 如果 onRejected 不是一个函数, promise2 以promise1的reason 触发rejected

7. resolvePromise
   
   ```js
   resolvePromise(promise2, x, resolve, reject)
   ```

    - 7.1 如果 promise2 和 x 相等，那么 reject TypeError
    - 7.2 如果 x 是一个 promsie
            如果x是pending态，那么promise必须要在pending,直到 x 变成 fulfilled or rejected.
            如果 x 被 fulfilled, fulfill promise with the same value.
            如果 x 被 rejected, reject promise with the same reason.
    - 7.3 如果 x 是一个 object 或者 是一个 function
        let then = x.then.
        如果 x.then 这步出错，那么 reject promise with e as the reason.
        如果 then 是一个函数，then.call(x, resolvePromiseFn, rejectPromise)
            resolvePromiseFn 的 入参是 y, 执行 resolvePromise(promise2, y, resolve, reject);
            rejectPromise 的 入参是 r, reject promise with r.
            如果 resolvePromise 和 rejectPromise 都调用了，那么第一个调用优先，后面的调用忽略。
            如果调用then抛出异常e 
                如果 resolvePromise 或 rejectPromise 已经被调用，那么忽略
                则，reject promise with e as the reason
        如果 then 不是一个function. fulfill promise with x.

## 实现

```typescript
enum Status {
  Pending = "pending",
  Fulfilled = "fulfilled",
  Rejected = "rejected",
}

type Resolver<T> = (val?: T) => void;
type Rejecter<T> = (reason?: T) => void;

type OnFulfilled<T, ThenT> = (val: T) => ThenT | XPromise<ThenT>;
type onRejected<T, ThenT> = (reason: T) => ThenT | XPromise<ThenT>;

export default class XPromise<T> {
  public _status: Status = Status.Pending;
  public val: T = null;
  public reason: any = null;
  private resolveCbs: OnFulfilled<T, any>[] = [];
  private rejectCbs: onRejected<any, any>[] = [];

  constructor(fn: (resolve: Resolver<T>, reject: Rejecter<any>) => void) {
    fn.call(null, this._resolve.bind(this), this._reject.bind(this));
  }

  private _resolve(val?: T): void {
    if (this.status === Status.Pending) {
      this.val = val;
      this.status = Status.Fulfilled;
    }
  }

  private _reject(reason?: any): void {
    if (this.status === Status.Pending) {
      this.reason = reason;
      this.status = Status.Rejected;
    }
  }

  set status(val: Status) {
    if (this._status !== val) {
      this._status = val;
      const cbs = val === Status.Fulfilled ? this.resolveCbs : this.rejectCbs;
      console.log("set", val, cbs.length);

      cbs.forEach((cb) => {
        setTimeout(() => {
          cb(val === Status.Fulfilled ? this.val : this.reason);
        }, 0);
      });
    }
  }

  get status(): Status {
    return this._status;
  }

  public then<ThenT = T, RejectT = any>(
    onFulfilled?: OnFulfilled<T, ThenT>,
    onRejected?: onRejected<RejectT, ThenT>
  ): XPromise<ThenT> {
    onFulfilled =
      onFulfilled ||
      (function (val: T): ThenT | T {
        return val;
      } as OnFulfilled<T, ThenT>);
    onRejected =
      onRejected ||
      function (err: RejectT) {
        throw err;
      };

    const p = new XPromise<ThenT>((resolve, reject) => {
      const onFulfilledWrapper = (val: T) => {
        try {
          const x = onFulfilled(val);
          this._resolvePromise(p, x, resolve, reject);
        } catch (err) {
          reject(err);
        }
      };
      const onRejectedWrapper = (reason: any) => {
        try {
          const x = onRejected(reason);
          this._resolvePromise(p, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      };
      const status = this.status;

      switch (status) {
        case Status.Pending:
          this.resolveCbs.push(onFulfilledWrapper);
          this.rejectCbs.push(onRejectedWrapper);
          break;
        case Status.Fulfilled:
          onFulfilledWrapper(this.val);
          break;
        case Status.Rejected:
          onRejectedWrapper(this.reason);
      }
    });

    return p;
  }

  public catch<T, ThenT>(onRejected: onRejected<T, ThenT>): XPromise<ThenT> {
    return this.then(null, onRejected);
  }

  private _resolvePromise<ThenT>(
    p: XPromise<ThenT>,
    x: ThenT | XPromise<ThenT>,
    resolve: Resolver<ThenT>,
    reject: Rejecter<any>
  ): void {
    if (x === p) {
      return reject(new TypeError("The promise and the return value are the same"));
    }
    if (x instanceof XPromise) {
      setTimeout(() => {
        x.then((y) => {
          this._resolvePromise(p, y, resolve, reject);
        }, reject);
      });
    } else if (typeof x === "object" || typeof x === "function") {
      if (!x) {
        setTimeout(() => {
          return resolve();
        });
      }
      let then = null;
      try {
        // @ts-ignore
        then = x.then;
      } catch (err) {
        return reject(err);
      }

      if (typeof then === "function") {
        let called = false;
        try {
          then.call(
            x,
            (y) => {
              if (called) {
                return;
              }
              called = true;
              this._resolvePromise(p, y, resolve, reject);
            },
            (r) => {
              if (called) {
                return;
              }
              called = true;
              reject(r);
            }
          );
        } catch (error) {
          // eslint-disable-next-line max-depth
          if (called) {
            return;
          }
          reject(error);
        }
      }
    } else {
      return resolve(x);
    }
  }

  static race<T>(...promises: XPromise<T>[]): XPromise<T> {
    const list = promises.map((p) => {
      if (p instanceof XPromise) {
        return p;
      }
      return XPromise.resolve(p);
    });
    return new XPromise((resolve, reject) => {
      list.forEach((p) => {
        p.then((v) => resolve(v)).catch((err) => reject(err));
      });
    });
  }

  static resolve<T>(val: T | XPromise<T>): XPromise<T> {
    if (val instanceof XPromise) {
      return val;
    }

    return new XPromise((resolve) => {
      resolve(val);
    });
  }

  static all<T>(promises: (XPromise<T> | T)[]): XPromise<T[]> {
    const list = promises.map((p) => {
      if (p instanceof XPromise) {
        return p;
      }
      return XPromise.resolve(p);
    });
    const res = [];

    return new XPromise((resolve, reject) => {
      list.map((p) => {
        p.then((v) => {
          res.push(v);
          if (res.length === list.length) {
            resolve(res);
          }
        }).catch(reject);
      });
    });
  }
}

const p = new XPromise<number>((resolve) => {
  setTimeout(() => {
    resolve(1);
  }, 2000);
});

p.then((val) => {
  console.log(val);
  return "resolve";
})
  .then((val) => {
    console.log(val, val.length.a.b);
  })
  .catch((err) => console.log(err?.message, "reject"));

p.then((val) => {
  console.log(val);
});
```
