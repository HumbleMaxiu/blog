---
title: Vue-Router使用方式及其源码
lang: zh-cn
---

## 使用方式
#### 响应路由参数变化
当我们使用`/user/:userName`动态路由传参时，从`/user/foo`跳转到`/user/bar`时，原来的**组件实例会被复用**，因为两个路由都渲染同一个组件，此时不会触发生命周期钩子，所以想要检测路由参数的变化，需要自己手动添加监听，添加监听有两种方式。
> 1. 使用`watch`监听`$route`对象的变化

> 2. 使用`beforeRouteUpdate`路由守卫，感觉使用这种方式更好一点，可以把对路由的操作都封装到路由守卫里，方便查找和修改，统一编码风格
#### 捕获所有路由
```js
{
  // 会匹配所有路径
  path: '*'
}
{
  // 会匹配以 `/user-` 开头的任意路径
  path: '/user-*'
}
```
当使用一个通配符时，`$route.params` 内会自动添加一个名为 `pathMatch` 参数。它包含了 `URL` 通过通配符被匹配的部分：
```js
// 给出一个路由 { path: '/user-*' }
this.$router.push('/user-admin')
this.$route.params.pathMatch // 'admin'
// 给出一个路由 { path: '*' }
this.$router.push('/non-existing')
this.$route.params.pathMatch // '/non-existing'
```
#### 高级匹配模式
`vue-router` 支持很多高级的匹配模式，甚至自定义正则匹配，查看`path-to-regexp`了解更多。从笔者的角度看来，这种匹配方式可以一定程度上减少代码量，更多的实用场景有待开发。
#### 嵌套路由
顶层，及其路由：
```js
<div id="app">
  <router-view></router-view>
</div>

const router = new VueRouter({
  routes: [{ path: '/user/:id', component: User }]
})
```
此时可以在 User 组件内嵌套一层路由，User 组件里的`<router-view></router-view>`就是子层的路由匹配组件:
```js
const User = {
  template: `
    <div class="user">
      <h2>User {{ $route.params.id }}</h2>
      <router-view></router-view>
    </div>
  `
}
```
此时我们可以在参数中使用 children 渲染到子层的路由出口，所以修改路由配置为：
```js
const router = new VueRouter({
  routes: [
    {
      path: '/user/:id',
      component: User,
      children: [
        {
          // 当 /user/:id/profile 匹配成功，
          // UserProfile 会被渲染在 User 的 <router-view> 中
          path: 'profile',
          component: UserProfile
        },
        {
          // 当 /user/:id/posts 匹配成功
          // UserPosts 会被渲染在 User 的 <router-view> 中
          path: 'posts',
          component: UserPosts
        }
      ]
    }
  ]
})
```
#### 编程式的导航
所谓编程式导航，指我们不使用`<route-link path="/">Home</route-link>`的形式进行路由跳转，而是通过 router 对象里的方法进行路由跳转
##### `router.push(location, onCompelete?, onAbort?)`
使用 push 进行路由跳转，会向 history 中添加一个新记录
注意：使用 path 进行跳转时，params 属性不生效，例子如下：
```js
const userId = '123'
router.push({ name: 'user', params: { userId }}) // -> /user/123
router.push({ path: `/user/${userId}` }) // -> /user/123
// 这里的 params 不生效
router.push({ path: '/user', params: { userId }}) // -> /user
```
onCompelete 回调会在路由导航完成之后执行，onAbort会在路由导航完成前，被导航到另一个不同的路由时触发（以上两条未实践）。
3.1.0版本后，`router.push`和`router.replace`会返回一个 Promise 可以代替函数中的后两个参数进行路由跳转后的处理
##### `router.replace(location, onCompelete?, onAbort?)`
和`router.push`差不多，只是不会向 history 中添加新的记录，而是修改顶层的记录。
##### `router.go(n)`
传入一个整数（n），向前或向后跳转n步
#### 命名路由
可以给路由添加一个`name`属性，以方便后续的编程式跳转，eg：
```js
const router = new VueRouter({
  routes: [
    {
      path: '/user/:userId',
      name: 'user',
      component: User
    }
  ]
})
```
此时进行跳转，我们可以这么写：
```js
router.push({ name: 'user', params: { userId: 123 } })
```
#### 命名视图
如果一个视图内，相同时展示多个路由组件，可以这么写。eg：
```js
<router-view class="view one"></router-view>
<router-view class="view two" name="a"></router-view>
<router-view class="view three" name="b"></router-view>
```
此时，我们需要配置 component 属性为一个对象，eg：
```js
const router = new VueRouter({
  routes: [
    {
      path: '/',
      // 匹配多个命名视图
      components: {
        default: Foo,
        a: Bar,
        b: Baz
      }
    }
  ]
})
```
命名视图可以在嵌套视图里使用，具体操作就是在 children 数组里的路由里的 component 属性配置为一个对象，对应组件里的命名视图
#### 路由重定向
从`/a`重定向到`/b`我们有以下几种写法：
```js
// 重定向到一个path
const router = new VueRouter({
  routes: [
    { path: '/a', redirect: '/b' }
  ]
})
// 重定向到一个命名路由
const router = new VueRouter({
  routes: [
    { path: '/a', redirect: { name: 'foo' }}
  ]
})
// 使用一个函数，动态返回重定向目标
const router = new VueRouter({
  routes: [
    { path: '/a', redirect: to => {
      // 方法接收 目标路由 作为参数
      // return 重定向的 字符串路径/路径对象
    }}
  ]
})
```
#### 别名
重定向的意思是，我们访问`/a`，url 会被定向到`/b`，路由匹配为`/b`。

别名和重定向略有区别，别名是指，我们把`/b`设为`/a`的别名，此时用户访问`/b`，此时路由保持在`/b`，但是路由匹配为`/a`，相当于在访问`/a`
eg：
```js
const router = new VueRouter({
  routes: [
    { path: '/a', component: A, alias: '/b' }
  ]
})
```
别名的作用：官方给出的作用是，我们可以自由的将 UI 结构映射到任意路由，而不受嵌套路由的限制（需要实践尝试，感觉是个不错的功能）
#### 路由组件传参
使用 props 进行路由的解耦，我们在组件里使用 $route 获取参数，会让组件和 $route 强相关，为了解决这种情况，我们可以使用 $route 进行解耦，官方例子：

耦合的写法：
```js
const User = {
  template: '<div>User {{ $route.params.id }}</div>'
}
const router = new VueRouter({
  routes: [{ path: '/user/:id', component: User }]
})
```
使用 props 解耦：
```js
const User = {
  props: ['id'],
  template: '<div>User {{ id }}</div>'
}
const router = new VueRouter({
  routes: [
    { path: '/user/:id', component: User, props: true },

    // 对于包含命名视图的路由，你必须分别为每个命名视图添加 `props` 选项：
    {
      path: '/user/:id',
      components: { default: User, sidebar: Sidebar },
      props: { default: true, sidebar: false }
    }
  ]
})
```
这样，我们可以在不同的地方使用同一个组件，通过 props 控制组件的行为。

如果 props 被设置为 true ，那么 route.params 会被作为组件属性传入。props也可以是一个对象，只有在静态的时候可以使用对象。不同的使用方式如下：
```js
function dynamicPropsFn (route) {
  const now = new Date()
  return {
    name: (now.getFullYear() + parseInt(route.params.years)) + '!'
  }
}

{ path: '/', component: Hello }, // No props, no nothing
{ path: '/hello/:name', component: Hello, props: true }, // Pass route.params to props
{ path: '/static', component: Hello, props: { name: 'world' }}, // static values
{ path: '/dynamic/:years', component: Hello, props: dynamicPropsFn }, // custom logic for mapping between route and props
{ path: '/attrs', component: Hello, props: { name: 'attrs' }}
```
## 进阶
#### 全局前置守卫
使用`router.beforeEach`注册一个全局前置守卫
```js
const router = new VueRouter({ ... })

router.beforeEach((to, from, next) => {
  // ...
})
```
守卫中的三个参数，to：即将要进入的路由，from：即将离开的路由，next：调用该方法来 resolve 这个钩子，执行效果依赖 next 传入的参数：
```js
next() // 进行管道中的下一个钩子，如果全部钩子执行完毕，导航状态为 confirmed
next(false) // 中断当前的导航
next('/') // 跳转到一个不同的地址，并中断当前导航
next(error) // 中断导航，并且触发全局注册的 router.onError注册的回调函数。
```
#### 全局后置守卫
```js
router.afterEach((to, from) => {
  // ...
})
```
不需要 next 参数
#### 路由独享守卫
可以在路由配置上直接定义 beforeEnter 钩子，eg：
```js
const router = new VueRouter({
  routes: [
    {
      path: '/foo',
      component: Foo,
      beforeEnter: (to, from, next) => {
        // ...
      }
    }
  ]
})
```
#### 组件内的守卫
组件内的守卫有三种：
> `beforeRouteEnter`
> `beforeRouteUpdate`
> `beforeRouteLeave`
```js
const Foo = {
  template: `...`,
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
  },
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 可以访问组件实例 `this`
  },
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
  }
}
```
`beforeRouteEnter` 守卫内，不能访问 this，因为守卫执行前，组件实例还没被创建

不过你可以在 next 方法里传入一个回调函数，在导航被确认时调用，并且把组件实例作为回调函数的参数（待实践测试）
```js
beforeRouteEnter (to, from, next) {
  next(vm => {
    // 通过 `vm` 访问组件实例
  })
}
```
注意，只有 beforeRouteEnter 可以在 next 里传递回调函数，其他两个守卫内已经可以访问 this ，所以没必要
#### 完整的导航解析流程
1. 导航被触发。
2. 在失活的组件里调用 beforeRouteLeave 守卫。
3. 调用全局的 beforeEach 守卫。
4. 在重用的组件里调用 beforeRouteUpdate 守卫 (2.2+)。
5. 在路由配置里调用 beforeEnter。
6. 解析异步路由组件。
7. 在被激活的组件里调用 beforeRouteEnter。
8. 调用全局的 beforeResolve 守卫 (2.5+)。
9. 导航被确认。
10. 调用全局的 afterEach 钩子。
11. 触发 DOM 更新。
12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入。
#### 路由元信息
所谓路由元信息，就是指在定义路由时可以设置 meta 属性
```js
const router = new VueRouter({
  routes: [
    {
      path: '/foo',
      component: Foo,
      children: [
        {
          path: 'bar',
          component: Bar,
          // a meta field 一个元信息属性
          meta: { requiresAuth: true }
        }
      ]
    }
  ]
})
```
如何访问这里的 meta 属性，很重要！！！可以用来做权限校验

我们把 routes 中的配置称为路由记录，路由记录可以嵌套，每一层都可以配置 meta 标签，那么我们在访问到具体路由时，会匹配其父子路由记录，eg：
```js
const router = new VueRouter({
  routes: [
    {
      path: '/foo',
      component: Foo,
      children: [
        {
          path: 'bar',
          component: Bar,
          // a meta field
          meta: { requiresAuth: true }
        }
      ]
    }
  ]
})
```
上面这个例子，我们访问`/foo/bar`，此时这个路由匹配到的所有路由记录会被添加到 $route.matched 数组，因此，我们可以遍历 $route.matched 数组来检查路由记录中的 `meta` 字段，eg：
```js
router.beforeEach((to, from, next) => {
  // 检测所有路由记录的 requireAuth 属性，如果有某个为 true，表示该路由的访问需要登录 
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 此时就需要校验用户是否登录，如果用户未登录，跳转到登录页。已登录就直接 next
    if (!auth.loggedIn()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next() // 确保一定要调用 next()
  }
})
```
#### `scrollBehavior(to, from, savePosition)`
控制路由跳转后页面的滚动行为，我们可以在创建 router 实例时提供一个 scrollBehavior方法
```js
const router = new VueRouter({
  routes: [...],
  scrollBehavior (to, from, savedPosition) {
    // return 期望滚动到哪个的位置
  }
})
```
第三个参数 savePosition 只有当且仅当 popstate（通过浏览器的前进/后退进行路由跳转） 导航时才有用，方法滚动信息如下：
```js
{ x: number, y: number }
{ selector: string, offset? : { x: number, y: number }} (offset 只在 2.6.0+ 支持)
```
注意，这里的 x，y 都是在对应位置的偏移量，举例：
```js
scrollBehavior (to, from, savedPosition) {
  return { x: 0, y: 0 }
}
```
平滑滚动，只需要在返回对象里加入 behavior 属性：
```js
scrollBehavior (to, from, savedPosition) {
  if (to.hash) {
    return {
      selector: to.hash,
      behavior: 'smooth',
    }
  }
}
```
#### 路由懒加载
可以把异步组件定义为一个返回 Promise 的工厂函数，而且 webpack2 支持动态引入 `import(./Foo.vue)`，把这两点结合，我们可以这么写
```js
import('./Foo.vue') // 返回 Promise

const Foo = () => import('./Foo.vue')

// 在路由中正常使用 Foo
const router = new VueRouter({
  routes: [{ path: '/foo', component: Foo }]
})
```
命名 chunk ，把组件某个路由下的组件都打包到一个 chunk 里
```js
const Foo = () => import(/* webpackChunkName: "group-foo" */ './Foo.vue')
const Bar = () => import(/* webpackChunkName: "group-foo" */ './Bar.vue')
const Baz = () => import(/* webpackChunkName: "group-foo" */ './Baz.vue')
```
需要使用 webpack 的魔法注释，具体细节参考 webpack 官方文档