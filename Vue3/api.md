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

### customRef
用来注册自定义ref
```typescript
function customRef<T>(factory: CustomRefFactory<T>): Ref<T>

type CustomRefFactory<T> = (
  track: () => void,
  trigger: () => void
) => {
  get: () => T
  set: (value: T) => void
}
```
实例：debounceRef，你可以自己控制 track 和 trigger 的时机
```js
import { customRef } from 'vue'

export function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => {
    // 返回一个 get, set 的对象
    return {
      get() {
        // get 时追踪
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          // set 时触发
          trigger()
        }, delay)
      }
    }
  })
}
```
在组件中使用，当我们在输入框输入时，v-model 会通过 input 方法触发 text 的更新，走入我们的 set 里，而我们在 set 里实现了一个 debounce 方法，所以会在一定时间后才会更新
```html
<script setup>
import { useDebouncedRef } from './debouncedRef'
const text = useDebouncedRef('hello')
</script>

<template>
  <input v-model="text" />
</template>
```
### toValue
把一个 ref 转成值，感觉可以用来处理 复制 props 的情况
```js
let copy = toValue(props.action)
```
### toRaw()
返回一个 Vue 创建的代理的原始对象，可以和 toValue 一样，用来处理 props 复制的情况，后续可以看看能不能开发出其他用法
### markRaw
将一个对象标记为不可转为代理，看起来会在很多静态对象上使用，很多示例代码里有用到 markRaw 。
### effectScope()
创建一个 effect 作用域，可以用来统一管理 effect，需要同时 kill 掉 effect 的情况，推荐使用
```js
function effectScope(detached?: boolean): EffectScope

interface EffectScope {
  run<T>(fn: () => T): T | undefined // 如果作用域不活跃就为 undefined
  stop(): void
}
```
示例：
```js
const scope = effectScope()

scope.run(() => {
  const doubled = computed(() => counter.value * 2)

  watch(doubled, () => console.log(doubled.value))

  watchEffect(() => console.log('Count: ', doubled.value))
})

// 处理掉当前作用域内的所有 effect
scope.stop()
```
### getCurrentScope
获取当前活跃的 effect 作用域
### onScopeDispose
在当前活跃的 effect 作用域上注册一个回调函数，当 effect 作用域被kill时触发
### v-pre 指令
跳过该元素及其所有子元素的编译，最常见的情况就是要展示双 {{}}
```js
<span v-pre>{{ this will not be compiled }}</span>
```
### v-memo 指令
v-memo 仅用于性能至上场景中的微小优化，应该很少需要。最常见的情况可能是有助于渲染海量 v-for 列表 (长度超过 1000 的情况)：
### teleport
感觉可以用来特殊处理某些情况下的模板复用问题，但是目前看起来不支持动态的传入 to 属性  
想要支持动态主要是为了解决相同组件在页面不同位置的情况，如果可以动态传入，那就可以在需要展示的几个位置定义容器，使用teleport控制模板展示位置
### 异步组件
使用setup时，会把最上层的await自动让该组件成为一个异步依赖
```html
<script setup>
const res = await fetch(...)
const posts = await res.json()
</script>

<template>
  {{ posts }}
</template>
```
### setup 命名空间组件
可以使用带 . 的组件标签，例如 <Foo.Bar> 来引用嵌套在对象属性中的组件。这在需要从单个文件中导入多个组件的时候非常有用：
```vue
<script setup>
import * as Form from './form-components'
</script>

<template>
  <Form.Input>
    <Form.Label>label</Form.Label>
  </Form.Input>
</template>
```
### setup 使用自定义指令
全局注册的自定义指令将正常工作。本地的自定义指令在 <script setup> 中不需要显式注册，但他们必须遵循 vNameOfDirective 这样的命名规范：
```vue
<script setup>
const vMyDirective = {
  beforeMount: (el) => {
    // 在元素上做些操作
  }
}
</script>
<template>
  <h1 v-my-directive>This is a Heading</h1>
</template>
```
如果指令是从别处导入的，可以通过重命名来使其符合命名规范：
```vue
<script setup>
import { myDirective as vMyDirective } from './MyDirective.js'
</script>
```
### setup defineExpose()
同选项式组件里的 setup 方法的 expose，组件默认是封闭的，如果要暴露方法出去，需要显示的定义，在setup语法糖里使用 defineExpose
```vue
<script setup>
import { ref } from 'vue'

const a = 1
const b = ref(2)

defineExpose({
  a,
  b
})
</script>
```
### setup 可以使用 `<script>` 标签上的 generic 属性声明泛型类型参数：
```vue
<script setup lang="ts" generic="T">
defineProps<{
  items: T[]
  selected: T
}>()
</script>
```
generic 的值与 TypeScript 中位于 <...> 之间的参数列表完全相同。例如，您可以使用多个参数，extends 约束，默认类型和引用导入的类型：
```vue
<script
  setup
  lang="ts"
  generic="T extends string | number, U extends Item"
>
import type { Item } from './types'
defineProps<{
  id: T
  list: U[]
}>()
</script>
```
### css 作用域，插槽选择器
默认情况下，作用域样式不会影响到 `<slot/>` 渲染出来的内容，因为它们被认为是父组件所持有并传递进来的。使用 :slotted 伪类以明确地将插槽内容作为选择器的目标：
```vue
<style scoped>
:slotted(div) {
  color: red;
}
</style>
```
### 全局选择器
如果想让其中一个样式规则应用到全局，比起另外创建一个 `<style>`，可以使用 :global 伪类来实现 (看下面的代码)：
```vue
<style scoped>
:global(.red) {
  color: red;
}
</style>
```
### css的v-bind
实际的值会被编译成哈希化的 CSS 自定义属性，因此 CSS 本身仍然是静态的。自定义属性会通过内联样式的方式应用到组件的根元素上，并且在源值变更的时候响应式地更新。
```vue
<script setup>
const theme = {
  color: 'red'
}
</script>

<template>
  <p>hello</p>
</template>

<style scoped>
p {
  // theme.color 变化时，更新 color
  color: v-bind('theme.color');
}
</style>
```
### cloneVNode() 克隆一个 vnode
```typescript
function cloneVNode(vnode: VNode, extraProps?: object): VNode
```
示例：
```js
import { h, cloneVNode } from 'vue'

const original = h('div')
const cloned = cloneVNode(original, { id: 'foo' })
```

### resolveComponent 解析一个组件
看起来，是用来解析一个全局组件，然后再 createVNode 方法里使用, 为了能从正确的组件上下文进行解析，resolveComponent() 必须在setup() 或渲染函数内调用
```js
const { h, resolveComponent } = Vue

export default {
  setup() {
    const ButtonCounter = resolveComponent('ButtonCounter')

    return () => {
      return h(ButtonCounter)
    }
  }
}
```
### withDirectives()
用自定义指令包装一个现有的 VNode
```typescript
function withDirectives(
  vnode: VNode,
  directives: DirectiveArguments
): VNode

// [Directive, value, argument, modifiers]
type DirectiveArguments = Array<
  | [Directive]
  | [Directive, any]
  | [Directive, any, string]
  | [Directive, any, string, DirectiveModifiers]
>
```
示例
```js
import { h, withDirectives } from 'vue'

// 一个自定义指令
const pin = {
  mounted() {
    /* ... */
  },
  updated() {
    /* ... */
  }
}

// <div v-pin:top.animate="200"></div>
const vnode = withDirectives(h('div'), [
  [pin, 200, 'top', { animate: true }]
])
```
### withModifiers()
用于向一个 VNode 添加 v-on 修饰符
```js
import { h, withModifiers } from 'vue'

const vnode = h('button', {
  // 等价于 v-on:click.stop.prevent
  onClick: withModifiers(() => {
    // ...
  }, ['stop', 'prevent'])
})
```
## TypeScript 工具类型
### PropType<T>
```typescript
import type { PropType } from 'vue'

interface Book {
  title: string
  author: string
  year: number
}

export default {
  props: {
    book: {
      // 提供一个比 `Object` 更具体的类型
      type: Object as PropType<Book>,
      required: true
    }
  }
}
```