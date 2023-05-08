## 响应式
### ref
一般用来处理基本类型，比如：
```js
const a = ref(0)
const b = ref(false)
```
其实也能用 ref 处理对象类型，比如
```js
const objectRef = ref({ count: 0 })

// 这是响应式的替换
objectRef.value = { count: 1 }
```
对比 reactive 解构之后会丢失响应式，使用 ref 修饰对象属性不会有这种情况
```js
const obj = {
  foo: ref(1),
  bar: ref(2)
}

// 该函数接收一个 ref
// 需要通过 .value 取值
// 但它会保持响应性
callSomeFunction(obj.foo)

// 仍然是响应式的
const { foo, bar } = obj
```
对 Ref 类型的数据进行修改，需要访问到 value 属性才行，但是 value 在模板中会自动解构
```js
foo.value = 'name'

<template>
    <div id="name">{{ foo }}</div>
</template>
```
## setup组合 api
### 使用 <script setup lang="ts"> 的形式
这也是我比较喜欢用的模式，官方也比较推荐，可以在 script 标签里用 export const function 的形式，将局部函数导出到外部使用

#### 先说一个定义props
这里可以使用 defineProps 来实现
```js
import { defineProps } from 'vue'

interface Props {
    name: string
}
const props = defineProps<Props>() // 接收一个说明props类型的泛型，你可以传入一个接口
```
当你需要传入默认值时，使用 withDefault
```js
import { defineProps, withDefault } from 'vue'

interface Props {
    name: string
}
const props = withDefault(defineProps<Props>(), {
    name: 'maxiu'
})
```
#### 导入组件无需注册
你可以直接在模板里使用导入进来的组件
```js
<script setup>
import ComponentA from './ComponentA.vue'
</script>

<template>
  <ComponentA />
</template>
```

## 应用实例App
### createApp
创建一个应用实例，Vue3的入口
```js
const app = createApp(App)
```
App，在我们正常开发项目时，通常使用 App.vue ，你也可以直接在里面写配置。没啥好说的，直接下一个
### createSSRApp
以 SSR 模式激活一个 App，和 createApp 没啥区别，下一个
### app.mount()
```js
interface App {
  mount(rootContainer: Element | string): ComponentPublicInstance
}
```
参数可以是一个实际的 DOM 元素或一个 CSS 选择器 (使用第一个匹配到的元素)。返回根组件的实例。

如果该组件有模板或定义了渲染函数，它将替换容器内所有现存的 DOM 节点。否则在运行时编译器可用的情况下，容器元素的 innerHTML 将被用作模板。(就是你提供了模板，就会替换掉 <div id="app"></div>，不然就渲染里面的内容)
```js
import { createApp } from 'vue'
const app = createApp(/* ... */)

app.mount('#app')
```
### app.unmount()
卸载一个实例，没啥好说的，同样会触发生命周期
### app.provide()
提供一个值，可以在应用中的所有后代组件中注入使用。第一个参数应当是注入的 key，第二个参数则是提供的值。返回应用实例本身。
```js
interface App {
  provide<T>(key: InjectionKey<T> | symbol | string, value: T): this
}
```
示例，在 main.ts 里
```js
import { createApp } from 'vue'

const app = createApp(/* ... */)

app.provide('message', 'hello')
```
在其他子组件里
```js
import { inject } from 'vue'

const h = inject('message') // hello
```
### app.component()
注册一个组件，app.use使用插件，其内部的 install 方法就是用这个实现
```js
interface App {
  component(name: string): Component | undefined
  component(name: string, component: Component): this // 返回自身实例，可以链式调用
}
```
两种用法，只传入 name ，返回组件实例，同时传入 name 和组件相关设置，注册组件
```js
import { createApp } from 'vue'

const app = createApp({ ... })
app.component('my-component', {...})
const myComponent = app.component('my-component')
```
#### 注册组件注意事项！！！
1. 全局注册，但并没有被使用的组件无法在生产打包时被自动移除 (也叫“tree-shaking”)。如果你全局注册了一个组件，即使它并没有被实际使用，它仍然会出现在打包后的 JS 文件中。
2. 全局注册在大型项目中使项目的依赖关系变得不那么明确。在父组件中使用子组件时，不太容易定位子组件的实现。和使用过多的全局变量一样，这可能会影响应用长期的可维护性。