function _new (fn, ...args) {
  const o = Object.create(fn.prototype)
  fn.apply(o, args)
  if (Object.prototype.toString.call(o) === '[object Object]') {
    return o
  } else {
    return {}
  }
}

function sleep (duration) {
  return new Promise(resolve => setTimeout(resolve, duration))
}

class AI {
  tasks = []
  flushing = false

  sleep (duration) {
    this.tasks.push(async () => {
      console.log('sleeping')
      await sleep(duration)
      console.log('sleeped')
    })
    this.flush()
    return this
  }

  task () {
    this.tasks.push(async () => {
      console.log('task')
    })
    this.flush()
    return this
  }

  cancel () {
    const t = this.tasks.pop()
    this.tasks.push(async () => {
      console.log(t ? 'cancel' : 'notask')
    })
    this.flush()
    return this
  }

  async flush () {
    if (this.flushing) return
    this.flushing = true
    console.log('flushing')
    await sleep(0)
    await runtask(this.tasks)
    this.flushing = false
    console.log('flushed')
  }
}

async function runtask (tasks) {
  if (tasks.length) {
    const task = tasks.shift()
    await task()
    await runtask(tasks)
  }
}
