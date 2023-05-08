## 原始类型
```js
const name: sting = 'maxiu'
const age: number = 24
const male: boolean = false
const undef: undefined = undefined
const nul: null = null
const obj: object = { name, age, male }
const bigintVar1: bigint = 901065165014650464n
const bigintVar2: bigint = Bigint(901065165014650464)
const symbolVar: symbol = Symbol('unique')
```
这里除了 null 与 undefined 以外，余下的类型基本可以完全对应到 js 中的数据类型概念
## null 与 undefined
在 TS 里，两者都是有意义的值，在没有开启 `strictNullChecks` 检查时，会被视为其他类型的子类型
```js
const tmp1: null = null
const tmp2: undefined = undefined

const tmp3: string = null // 仅在关闭 strictNullChecks 时成立，下同
const tmp4: string = undefined
```
## void
用来表示一个函数没有返回值，如果函数 return 了一个空值，也表示返回值类型是 void ，但在实际代码执行时，返回值是 undefined  
在 TS 里，可以把 undefined 赋值给 void 类型
```js
const voidVar1: void = undefined
const voidVar2: void = null // 需要关闭 strictNullChecks
```
## 数组类型的标注
声明数组有两种方式
```js
const arr1: string[] = []

const arr2: Array<string> = []
```
两种声明方式等价，更多以前者为主。
## 元组（Tuple）
元组是对数组做更多限制，在数组里，我们可以超出长度的访问
```js
const arr3: string[] = ['ma', 'xiu']

console.log(arr3[222]) // 并不会报错
```
上述情况并不符合预期，当我们进行越界访问时，需要给出类型报错，这时我们可以用元组标注。
```js
const arr4: [string, string, string] = ['ma', 'xiu', 'humble']

console.log(arr4[222])
```
此时会产生类型错误：**长度为“3”的元组类型，在索引222处没有元素**，当然元组也可以生成多个不同的元素类型
```js
const arr5: [string, number, boolean] = ['ma', 25, true]
```
同时，元组也支持使用可选符
```js
const arr6: [string, number?, boolean?] = ['ma']

const arr6: [string, number?, boolean?] = ['ma', , ]
```
对于标记为可选的成员，在 `--strictNullCheckes` 配置下会被视为一个 `string | undefined` 的联合类型，此时元组的长度也是一个联合类型，如上面的 arr6
```js
type TupleLength = typeof arr6.length; // 1 | 2 | 3
```
## 具名元组
```js
const arr7: [name: string, age: number?, male: boolean?] = ['ma']
```
某些情况下，不想拼装对象，我们可以使用具名元组，这样也能知晓每个值的具体含义
## 对象的类型标注
声明对象，我们可以使用 interface 声明一个结构，然后使用这个结构来作为一个对象的**类型标注**即可
```js
interface IDescription {
    name: string,
    age: number,
    male: boolean
}

const obj1: IDescription = {
    name: 'maxiu',
    age: 222,
    male: true
}
```
- 每一个属性的值必须一一对应到接口的属性类型
- 不能多，不能少，且包括 obj1.other = 'xxx' 这样的属性访问赋值形式
常见的修饰符包括 可选（Optional）与只读（Readonly）
## 修饰接口属性
在接口结构中，使用`?`来标记一个属性可选
```js
interface IDescription {
    name: string,
    age: number,
    male?: boolean,
    func?: Function=
}

const obj2: IDescription {
    name: 'maxiu',
    age: 111,
    male: false
    // 无需实现 func 也是合法的
}
```
这种情况下，obj2.male的类型是一个联合类型 `boolean | undefined`。  
此时我们给 func 赋值一个函数，然后调用 `obj2.func()` ，TS 还是会提示错误，**不能调用可能是未定义的方法**，我们需要使用类型断言来解决这个问题。

除了标记一个属性为可选外，还可以标记为只读：`readonly`。
```js
interface IDescription {
    readonly name: string,
    age: number
}

const obj3: IDescription = {
    name: 'maxiu',
    age: 222
}

obj3.name = 'xxx' // 报错，无法分配给name
```
你也可以对数组/元组做只读的修饰，但是与对象有两点不同
- 只能将整个数组/元组标记为只读，不能标记单个属性
- 标记完只读后，这个只读数组/元组类型上，将不再具有push、pop等方法，数组其实变为 `ReadonlyArray`，而不是`Array`
## type 与 interface
