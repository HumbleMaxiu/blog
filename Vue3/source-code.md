## Run Build
在 ESM 模式下，创建 require 方法，参考 nodejs 文档，module模块，createRequire 方法。
```js
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
```
获取最新 commit sha-1 编号前缀，主要是使用 git rev-parse HEAD 命令
```js
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)
```
根据 CPU 是多少核，开多少个异步执行的 promise 处理构建
```js
async function buildAll(targets) {
  await runParallel(cpus().length, targets, build)
}

async function runParallel(maxConcurrency, source, iteratorFn) {
  const ret = []
  const executing = []
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item, source))
    ret.push(p)

    if (maxConcurrency <= source.length) {
      // 在 p 执行结束之后，从 executing 里取出 e 执行
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)
      // 判断执行栈大小是否超过 cpu 核数，超过就 race 一下，找一个最快的执行完的
      if (executing.length >= maxConcurrency) {
        // 一个 promise 执行结束后，会自动从 executing 里弹出
        await Promise.race(executing)
      }
    }
  }
  // 最后返回所有结果，ret 里同时存在未决议和已决议的 promise，剩余未决议的也会在这里最终执行完毕
  return Promise.all(ret)
}
```