## Vue-Router源码
#### 从使用开始
我们在项目里使用 VueRouter 的方法一般分为以下几步：
1. 使用 Vue.use(VueRouter) 注册 VueRouter 插件。
2. new 一个 VueRouter 实例，通常命名为 router（实例化时需要传入路由配置，你可以把他们分散到多个文件里，然后在 index.js 文件里进行整合）。
3. 实例化 Vue 时，在 option 里传入 router 实例。
经过以上几个步骤，我们就可以在快乐的在项目里使用 VueRouter 来控制路由跳转了。

为什么要总结这些呢，因为我看源码比较喜欢从初始化入手，了解了基本流程后，再去看各个 API 的具体实现方式（不知道别人怎么看源码的，可以探讨一下），现在确定了阅读代码的顺序，让我们开始吧。
#### 第一步：Vue.use(VueRouter)
这一步我们需要提前了解一些内容才能继续，不过都是些基础内容。第一步，我们先来到 Vue2 的代码里，看看 Vue.use 的实现方式
```js
export function initUse(Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | any) {
    // 判断传入的插件是否已经注册，如果已经注册就直接返回
    const installedPlugins =
      this._installedPlugins || (this._installedPlugins = [])
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // 传入的插件没有注册，调用传入插件的 install 方法，或者传入的是一个函数，直接调用
    const args = toArray(arguments, 1)
    // 把当前 Vue 的 this 作为参数传入 install 方法
    args.unshift(this)
    if (isFunction(plugin.install)) {
      plugin.install.apply(plugin, args)
    } else if (isFunction(plugin)) {
      plugin.apply(null, args)
    }
    // 缓存插件
    installedPlugins.push(plugin)
    return this
  }
}
```
具体可参考上面代码的注释。我们需要了解的就是，Vue.use方法，需要你传入一个有 install 函数作为属性的对象，或者直接传入一个函数

了解了这些，我们可以正式进入 VueRouter 源码的阅读，先从哪里开始呢？准备了这么久，当然是从 VueRouter 提供的 install 方法入手。
##### install 方法
我直接把 install.js 文件里的所有代码 copy 过来，并且贴上注释，因为 VueRouter 本身还算轻量，所以可以这么做，以后看到 Vue2 Vue3 的代码，就得需要自己去文件里对照着查看了
```js
import View from './components/view'
import Link from './components/link'

export let _Vue

// install 方法会传入被注册的Vue的构造函数
// eg：在 main.js 中使用 Vue.use(vueRouter)，此时 main.js中的Vue会被作为参数传入 install
// install方法里会给Vue添加一些方法
export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    // 初始化子组件的情况，vm.$options._parentVnode才有值
    // _parentVnode 是一个对象
    let i = vm.$options._parentVnode
    // 这里的 isDef 的用法可以学习一下，其实就是等同于访问 i.data.registerRouteInstance，只不过是在每次判断的时候就进行赋值
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      // 找到 registerRouteInstance 方法再执行，这个方法有什么用呢？？？？？
      // 这个方法的来源是 RouteView 组件里的 data，具体位置可见 src/components/view.js
      i(vm, callVal)
    }
  }

  Vue.mixin({
    // 为什么有两种情况呢？
    beforeCreate () {
      // 为什么有两种情况呢？首先是 this.$options.router 存在的情况，这里的 router 存在只能是我们在 new Vue 的时候
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        // this.$options.router 是我们 new Vue 时传入的 router 实例
        this._router = this.$options.router

        // TODO：下面两行有啥用
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
        // 为什么有两种情况呢？这里是为了处理子组件，当父组件 beforeCreate 触发后，就会走进子组件的 beforeCreate ，此时子组件是没有 $option.router 的，就要到外层去拿
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this // 保底，给 this._routerRoot 指向当前的 this
      }
      // 当是初始化子组件的情况时，走到这里就需要进行处理了
      registerInstance(this, this)
    },
    destroyed () {
      // 不传第二个参数时表示取消注册组件
      registerInstance(this)
    }
  })

  // 代理
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  // 全局注册组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  // Vue.config.optionMergeStrategies Vue的混入策略，可以在这里自定义某些函数的混入策略
  const strats = Vue.config.optionMergeStrategies
  // 组件内的钩子都使用 created 的混入策略，即按顺序执行组件的函数mixin进来的函数
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```
install 的代码留给我们两个悬念，一个是 registerInstance 方法的作用和调用时机，一个是 this._router.init(this) 做了什么
这两个悬念先留着，我们先朝下一个步骤前进

#### new VueRouter({ routes: [] })
这一步我们会进行 VueRouter 实例的初始化，router.js 的代码有点多，我们分段来看（VueRouter是一个构造函数，外壳我们就不贴进来了，遇到外部引入的内容我会标注出来），先看第一段：

来点简单的，注册构造函数里的静态属性，其中就有我们心心念念的 install 方法，这个方法就是我们上面提到的 install.js 里导出的。这些静态方法，我们都可以在 VueRouter 的文档中找到用法
时间允许的话，会挨个看一下他们的代码，希望能有点收获
```js
static install: () => void
static version: string
static isNavigationFailure: Function
static NavigationFailureType: any
static START_LOCATION: Route // 以路由对象的形式，展示路由的初始地址
```
接下来，都是 flow 的类型定义，我们可以在这里找到对应参数的类型定义，来获知这些参数可以携带的属性和具体作用。
```js
pp: any
apps: Array<any>
ready: boolean
readyCbs: Array<Function>
options: RouterOptions
mode: string
history: HashHistory | HTML5History | AbstractHistory
matcher: Matcher
fallback: boolean
beforeHooks: Array<?NavigationGuard>
resolveHooks: Array<?NavigationGuard>
afterHooks: Array<?AfterNavigationHook>
```
然后就是正文了，constructor 方法，option 参数是 RouterOptions 类型，查看这个类型的定义，我们就能知道 new VueRouter(option) 时，传入的这个 option 都可以携带哪些属性了。简单的内容我直接写在注释里了，这里对一些细节稍作解释，毕竟代码不难看懂。
```js
constructor (options: RouterOptions = {}) {
  // 生产环境下警告提示
  if (process.env.NODE_ENV !== 'production') {
    // warn 方法，第一个参数为 false 时，使用 console.warn 打印第二个参数
    // this instanceof VueRouter 的作用和原理想必都知道吧，不知道也没事，后面我会单独介绍
    warn(this instanceof VueRouter, `Router must be called with the new operator.`)
  }
  // 配置了 router 的 Vue 根实例
  this.app = null
  // 保存所有使用了该 router 实例的 Vue实例
  this.apps = []
  this.options = options
  // 注册各种 hook 数组
  this.beforeHooks = []
  this.resolveHooks = []
  this.afterHooks = []
  // 创建一个 matcher ，第一个坑，坑1：matcher的作用。
  this.matcher = createMatcher(options.routes || [], this)
  // 默认使用 hash 模式
  let mode = options.mode || 'hash'
  // fallback 当前浏览器不支持 history.pushState 方法，回退到 hash 模式（需要传入配置）
  this.fallback =
    mode === 'history' && !supportsPushState && options.fallback !== false
  if (this.fallback) {
    mode = 'hash'
  }
  // 不在浏览器环境，抽象模式
  if (!inBrowser) {
    mode = 'abstract'
  }
  this.mode = mode
  // 根据路由模式，生成对应的历史栈管理实例
  switch (mode) {
    case 'history':
      this.history = new HTML5History(this, options.base)
      break
    case 'hash':
      this.history = new HashHistory(this, options.base, this.fallback)
      break
    case 'abstract':
      this.history = new AbstractHistory(this, options.base)
      break
    default:
      if (process.env.NODE_ENV !== 'production') {
        assert(false, `invalid mode: ${mode}`)
      }
  }
}
```
接下来，我们就会看到 VueRouter 内部的一些属性方法，这些方法我们都可以通过 this.$router 访问到，我们一个一个看，先来 match
```js
match (raw: RawLocation, current?: Route, redirectedFrom?: Location): Route {
  // 调用我们之前注册的 matcher 的 match 方法
  return this.matcher.match(raw, current, redirectedFrom)
}
```
然后是一个访问器属性，这让我们可以通过原型访问 currentRoute ，而且是经过计算后得到的结果：
```js
get currentRoute (): ?Route {
  return this.history && this.history.current
}
```
接下来就到了我们上面提出的那个 init 方法了，注意，我们只有一个主 app。下面代码里会首次出现两个类，HTML5History 和 HashHistory，这两个类主要用来进行历史栈管理，其实例的方法我们先忽略，了解整体流程，之后会细讲这两个类的作用。这里三个坑，坑2：主app的作用，坑3：为什么要销毁 app，坑4：两个历史类的实现
```js
init (app: any /* Vue 组件实例 */) {
  process.env.NODE_ENV !== 'production' &&
    assert(
      install.installed,
      `not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
        `before creating root instance.`
    )
  this.apps.push(app)
  // 注册 app 销毁时的钩子
  // https://github.com/vuejs/vue-router/issues/2639
  app.$once('hook:destroyed', () => {
    // 组件销毁时，从 apps 数组中移除当前的 app
    const index = this.apps.indexOf(app)
    if (index > -1) this.apps.splice(index, 1)
    // 确保我们还有个 main app
    // 我们不会释放路由，所以可以重用他
    if (this.app === app) this.app = this.apps[0] || null
    if (!this.app) this.history.teardown()
  })
  // 主 app 先前已经初始化
  // 直接返回，我们不需要注册新的历史监听器
  if (this.app) {
    return
  }
  this.app = app
  // 历史控制器实例
  const history = this.history
  // 注册历史
  if (history instanceof HTML5History || history instanceof HashHistory) {
    const handleInitialScroll = routeOrError => {
      const from = history.current
      const expectScroll = this.options.scrollBehavior
      const supportsScroll = supportsPushState && expectScroll
      if (supportsScroll && 'fullPath' in routeOrError) {
        handleScroll(this, routeOrError, from, false)
      }
    }
    const setupListeners = routeOrError => {
      history.setupListeners()
      handleInitialScroll(routeOrError)
    }
    history.transitionTo(
      history.getCurrentLocation(),
      setupListeners,
      setupListeners
    )
  }
  // 历史监听器
  history.listen(route => {
    this.apps.forEach(app => {
      app._route = route
    })
  })
}
```
继续，接下来到了钩子的注册，代码很简单也很清晰，通过 registerHook 方法，把我们传入的 fn ，存入对应的 hooks 数组里（钩子调用方式：router.beforeEach((to, from, next) => {})），后面再进一步看钩子的处理，这里我们留下第五个坑，坑5：钩子的具体实现和触发时机
```js
beforeEach (fn: Function): Function {
  return registerHook(this.beforeHooks, fn)
}

beforeResolve (fn: Function): Function {
  return registerHook(this.resolveHooks, fn)
}

afterEach (fn: Function): Function {
  return registerHook(this.afterHooks, fn)
}
```
继续继续，用来处理异步初始化路由的方法，具体实现会在坑4里面讲
```js
onReady (cb: Function, errorCb?: Function) {
  this.history.onReady(cb, errorCb)
}

onError (errorCb: Function) {
  this.history.onError(errorCb)
}
```
接下来就是跳转相关的方法了，都是通过调用 history 实例里的方法实现的，如果时了解过 Vue Router 的原理的童鞋，应该就会猜到 history 里面会做什么了，没错，使用 pushState，replaceState 等方法，来控制路由跳转，并保存路由历史栈，这就是 history 实例的作用，当然如果时 hash 模式的话，那就是通过添加 hashChange 的监听事件处理，总之就是根据不同的模式，在 history 里做出相应的路由跳转处理。所以这一部分内容也放在 history 里面讲，这里的逻辑很简单，看注释就行。
```js
// 三个参数，location对象，用来跳转，onComplete，路由跳转完全完成时触发回调，onAbort，路由导航完成前，跳转到其他路由时触发
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  // $flow-disable-line
  // 没有回调函数，且 Promise 可用，用 Pormise 包装 history.push 方法
  if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
    return new Promise((resolve, reject) => {
      this.history.push(location, resolve, reject)
    })
  } else {
    this.history.push(location, onComplete, onAbort)
  }
}
replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  // $flow-disable-line
  if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
    return new Promise((resolve, reject) => {
      this.history.replace(location, resolve, reject)
    })
  } else {
    this.history.replace(location, onComplete, onAbort)
  }
}
go (n: number) {
  this.history.go(n)
}
back () {
  this.go(-1)
}
forward () {
  this.go(1)
}
```
接下来是 getMatchedComponents 方法，返回目标位置或是当前路由匹配的组件数组 (是数组的定义/构造类，不是实例)。通常在服务端渲染的数据预加载时使用
```js
getMatchedComponents (to?: RawLocation | Route): Array<any> {
  const route: any = to
    ? to.matched
      ? to
      : this.resolve(to).route
    : this.currentRoute
  if (!route) {
    return []
  }
  // 拉平二维数组，使用 apply 或者展开符（...）都可以，主要原理是使用 concat 拉平二维数组
  return [].concat.apply(
    [],
    route.matched.map(m => {
      return Object.keys(m.components).map(key => {
        return m.components[key]
      })
    })
  )
}
```
再然后就是上面经常用到的 resolve 方法了，这个方法主要作用是解析目标位置，返回完整的路径信息（在 href 中），大火比较认同的一个用法是，在新标签页打开时，使用 router.resolve 获取完整的路由信息，再用 window.open 打开。
```js
resolve (
  to: RawLocation,
  current?: Route,
  append?: boolean
): {
  location: Location,
  route: Route,
  href: string,
  // for backwards compat
  normalizedTo: Location,
  resolved: Route
} {
  current = current || this.history.current
  const location = normalizeLocation(to, current, append, this)
  const route = this.match(location, current)
  const fullPath = route.redirectedFrom || route.fullPath
  const base = this.history.base
  const href = createHref(base, fullPath, this.mode)
  return {
    location,
    route,
    href,
    // for backwards compat
    normalizedTo: location,
    resolved: route
  }
}
```
normalizeLocation 方法是外部引入的一个工具方法，里面有一个特殊情况的处理，即没有传入 name ，也没有传入 path，但是传入了 params 的情况，我一开始看到这很懵，为什么要做这个处理，于是我去翻了一下 github 的提交历史，发现尤大做了个提交为了解决一个[issue](https://github.com/vuejs/vue-router/issues/738)，这个 issue 提出了上述这种情况。尤大也给出了一个例子，在源码的 /example/nested-route 路径下。我会在下面的代码里注释一下，方便理解。(router-link组件初始化时就会调用这个方法，如果你的 to 没有写 path 也没有写 name，那么就会走下面的逻辑)
```js
export function normalizeLocation (
  raw: RawLocation,
  current: ?Route,
  append: ?boolean,
  router: ?VueRouter
): Location {
  let next: Location = typeof raw === 'string' ? { path: raw } : raw
  // 已经统一化处理过，直接返回
  if (next._normalized) {
    return next
  } else if (next.name) {
    // 使用 name 属性的处理
    // extend 方法同 Object.assign ，会继承对象和原型对象上的属性
    next = extend({}, raw)
    const params = next.params
    if (params && typeof params === 'object') {
      // params 是对象，再拷贝一次
      next.params = extend({}, params)
    }
    return next
  }

  // 没有传入 name ， 也没有传入 path，但是传入了 params
  if (!next.path && next.params && current) {
    // 拷贝一次 next
    next = extend({}, next)
    next._normalized = true
    // 拷贝 current 的 params，因为最后大概率是在原地跳转，然后再把 next 的 params 合并过去，拿到最后的 params 对象。
    const params: any = extend(extend({}, current.params), next.params)
    // 如果 current 存在 name，那么就是原地跳转，但是 params 不同
    if (current.name) {
      // 使用 current 的 name 属性和整合后的 params
      next.name = current.name
      next.params = params
      // 处理 current 没有 name 属性的情况
    } else if (current.matched.length) {
      // 获取当前页面路径
      const rawPath = current.matched[current.matched.length - 1].path
      next.path = fillParams(rawPath, params, `path ${current.path}`)
    } else if (process.env.NODE_ENV !== 'production') {
      // 以上情况都没有匹配到，说明出错了
      warn(false, `relative params navigation requires a current route.`)
    }
    return next
  }

  // 为啥 path 需要处理？因为里面可能有 query，hash 这些东西，下面的处理也是处理这两种情况
  // 正常走 next 存在 path 的情况
  // parsedPath 是一个对象，为 { path: '', hash: '', query: ''} 的形式
  const parsedPath = parsePath(next.path || '')
  const basePath = (current && current.path) || '/'
  // 根据处理过后的 parsedPath.path 做出不同处理，如果为空值就使用 basePath，否则进行处理
  const path = parsedPath.path
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    : basePath

  const query = resolveQuery(
    parsedPath.query,
    next.query,
    router && router.options.parseQuery
  )

  let hash = next.hash || parsedPath.hash
  if (hash && hash.charAt(0) !== '#') {
    hash = `#${hash}`
  }

  return {
    _normalized: true,
    path,
    query,
    hash
  }
}

```
其中，parsePath 方法很简单，就是从 path 中取出 hash、path 和 query
```js
export function parsePath (path: string): {
  path: string;
  query: string;
  hash: string;
} {
  let hash = ''
  let query = ''
  // 处理带 hash 的 path
  const hashIndex = path.indexOf('#')
  if (hashIndex >= 0) {
    hash = path.slice(hashIndex)
    path = path.slice(0, hashIndex)
  }
  // 处理 query
  const queryIndex = path.indexOf('?')
  if (queryIndex >= 0) {
    query = path.slice(queryIndex + 1)
    path = path.slice(0, queryIndex)
  }
  // 处理过后，path 去除了 hash 和 query。
  return {
    path,
    query,
    hash
  }
}
```
然后是 resolvePath 方法，可以简单过一下，代码逻辑不复杂
```js
export function resolvePath (
  relative: string,
  base: string,
  append?: boolean
): string {
  // 取出第一个字符
  const firstChar = relative.charAt(0)
  // 以 “/” 开头的字符串，直接返回 relative
  if (firstChar === '/') {
    return relative
  }
  // 以 “?” 或 “#” 开头，把 relative 拼接到 base 后面
  if (firstChar === '?' || firstChar === '#') {
    return base + relative
  }

  const stack = base.split('/')

  // remove trailing segment if:
  // - not appending
  // - appending to trailing slash (last segment is empty)
  if (!append || !stack[stack.length - 1]) {
    stack.pop()
  }

  // resolve relative path
  const segments = relative.replace(/^\//, '').split('/')
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    if (segment === '..') {
      stack.pop()
    } else if (segment !== '.') {
      stack.push(segment)
    }
  }

  // ensure leading slash
  if (stack[0] !== '') {
    stack.unshift('')
  }

  return stack.join('/')
}
```
#### History类
OK，我们已经走了一部分 new VueRouter({ routes: [] }) 的流程了，到了 init 那一步，出现了两个我们没见过的类，HTML5History 和 HashHistory
