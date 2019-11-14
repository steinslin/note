const logUpdate = require('log-update')
const asciichart = require('asciichart')
const chalk = require('chalk')
const Measured = require('measured')
const timer = new Measured.Timer()
const history = new Array(120)
history.fill(0)
const monitor = obj => {
  return new Proxy(obj, {
    get(target, propKey) {
      const origMethod = target[propKey]
      if (!origMethod) return
      return (...args) => {
        const stopwatch = timer.start()
        const result = origMethod.apply(this, args)
        return result.then(out => {
          const n = stopwatch.end()
          history.shift()
          history.push(n)
          return out
        })
      }
    }
  })
}
const service = {
  callService() {
    return new Promise(resolve =>
      setTimeout(resolve, Math.random() * 50 + 50))
  }
}
const monitoredService = monitor(service)
setInterval(() => {
  monitoredService.callService()
    .then(() => {
      const fields = ['min', 'max', 'sum', 'variance',
        'mean', 'count', 'median']
      const histogram = timer.toJSON().histogram
      const lines = [
        '',
        ...fields.map(field =>
          chalk.cyan(field) + ': ' +
          (histogram[field] || 0).toFixed(2))
      ]
      logUpdate(asciichart.plot(history, { height: 10 })
        + lines.join('\n'))
    })
    .catch(err => console.error(err))
}, 100)


function Animal() {
  this.type = 123
}

function Cat() {
  Animal.call(this)
  this.name = 'tom'
}

const valueOf = Array.prototype.valueOf
const toString = Array.prototype.toString
const oValueof = Object.prototype.valueOf
const oToString = Object.prototype.toString

Array.prototype.valueOf = function () {
  console.log('array valueOf')
  return valueOf.call(this)
}

Array.prototype.toString = function () {
  console.log('array toString')
  return toString.call(this)
}

Object.prototype.valueOf = function () {
  console.log('object valueOf')
  return oValueof.call(this)
}

Object.prototype.toString = function () {
  console.log('object toString')
  return oToString.call(this)
}
