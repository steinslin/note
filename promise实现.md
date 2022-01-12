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
