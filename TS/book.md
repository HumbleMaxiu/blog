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
## 函数重载
TS的函数重载，可以理解为，有一个具体的实现和其他类型情况。
## 类型工具
类型工具分类：**操作符、关键字和专用语法**  
按照使用目的来划分，可以分为 **类型创建** 与 **类型安全保护**  
包括：类型别名、交叉类型、索引类型、映射类型
### 类型别名(type 关键字)
```typescript
type A = string
```
类型别名的基础使用就是用来声明一个类型，但是它也可以作为工具类型使用，配合泛型。类型别名一旦接受了一个泛型，我们就叫他工具类型
```typescript
type Factory<T> = T | number | string
```
我们可以像这样使用上面的工具类型
```typescript
type FactoryWithBool = Factory<boolean>

const foo: FactoryWithBool = true
```
我们可以用这个模式的工具类型做很多事，比如提示入参可能为 null
```typescript
type MaybeNull<T> = T | null;

function process(input: MaybeNull<{ handler: () => {} }>) {
  input?.handler();
}
```
和这个类似的，还有 MaybePromise, MaybeArray
```typescript
type MaybeArray<T> = T | T[];

// 函数泛型我们会在后面了解~
function ensureArray<T>(input: MaybeArray<T>): T[] {
  return Array.isArray(input) ? input : [input];
}
```
### 交叉类型
和联合类型的区别，就是与和或的区别，你的实现需要满足联合类型中的所有条件
```typescript
interface NameStruct {
  name: string;
}

interface AgeStruct {
  age: number;
}

type ProfileStruct = NameStruct & AgeStruct;

const profile: ProfileStruct = {
  name: "linbudu",
  age: 18
}
```
上述例子，实现的 profile 对象，同时满足 NameSctruct 和 AgeStruct   
对于对象交叉类型，其内部同名的属性会被合并
```typescript
type Struct1 = {
  primitiveProp: string;
  objectProp: {
    name: string;
  }
}

type Struct2 = {
  primitiveProp: number;
  objectProp: {
    age: number;
  }
}

type Composed = Struct1 & Struct2;

type PrimitivePropType = Composed['primitiveProp']; // never
type ObjectPropType = Composed['objectProp']; // { name: string; age: number; }
```
等同与
```typescript
type Composed = {
    primitiveProp: string | number
    objectProp: {
        name: string
        age: number
    }
}
```
### 索引类型
索引类型可以分为三个部分：**索引签名类型**， **索引类型查询**， **索引类型访问**
#### 索引签名类型
索引签名类型主要是用来在对象中，快速声明一个键值类型一致的类型结构
```typescript
interface AllStringTypes {
    [key:string]: string
}

type StringNumberTypes = {
    [key: string]: number
}
```
#### 索引类型查询
keyof 操作符，它可以把对象类型里的所有键值转化为字面量类型，然后再组合为联合类型
```typescript
interface Foo {
  linbudu: 1,
  599: 2
}

type FooKeys = keyof Foo; // "linbudu" | 599
// 在 VS Code 中悬浮鼠标只能看到 'keyof Foo'
// 看不到其中的实际值，你可以这么做：
type FooKeys = keyof Foo & {}; // "linbudu" | 599
```
keyof 的产物必定是一个联合类型。
#### 索引类型访问
具体就是指，我们可以使用类型结构访问对象类型中的属性
```typescript
interface NumberRecord {
  [key: string]: number;
}

type PropType = NumberRecord[string]; // number
```
更直观一点，我们可以使用字面量来访问
```typescript
interface Foo {
  propA: number;
  propB: boolean;
}

type PropAType = Foo['propA']; // number
type PropBType = Foo['propB']; // boolean
```
我们可以用索引类型查询，配合索引类型访问
```typescript
interface Foo {
  propA: number;
  propB: boolean;
  propC: string;
}

type PropTypeUnion = Foo[keyof Foo]; // string | number | boolean
```
### 映射类型，类型编程的第一步
其实就是 in 操作符
```typescript
type Stringify<T> = {
  [K in keyof T]: string;
};
```
K in T 就是把 T 里的字面量类型展开，eg:
```typescript
interface Foo {
  prop1: string;
  prop2: number;
  prop3: boolean;
  prop4: () => void;
}

type StringifiedFoo = Stringify<Foo>;

// 等价于
interface StringifiedFoo {
  prop1: string;
  prop2: string;
  prop3: string;
  prop4: string;
}
```
keyof Foo，把 Foo 类型里的所有键值取出，构成一个联合类型。K in keyof Foo，把联合类型展开得到结果  
基于这种操作，我们可以实现一个 Clone 类型
```typescript
type Clone<T> = {
  [K in keyof T]: T[K];
};
```
这里的T[K]其实就是上面说到的索引类型访问，我们使用键的字面量类型访问到了键值的类型，这里就相当于克隆了一个接口。需要注意的是，这里其实只有K in 属于映射类型的语法，keyof T 属于 keyof 操作符，[K in keyof T]的 [] 属于索引签名类型，T[K] 属于索引类型访问。
## 类型查询操作符与类型守卫
### 类型查询操作符：熟悉又陌生的 typeof
typeof 操作符的基本用法：
```typescript
const str = "linbudu";

const obj = { name: "linbudu" };

const nullVar = null;
const undefinedVar = undefined;

const func = (input: string) => {
  return input.length > 10;
}

type Str = typeof str; // "linbudu"
type Obj = typeof obj; // { name: string; }
type Null = typeof nullVar; // null
type Undefined = typeof undefined; // undefined
type Func = typeof func; // (input: string) => boolean
```
### 类型守卫
像下面这种情况，把类型判读移动到外部函数里，此时typescript无法准确判断上下文里的类型，因为ts只能对同一个函数上下文里的内容进行类型推导
```typescript
function isString(input: unknown): boolean {
  return typeof input === "string";
}

function foo(input: string | number) {
  if (isString(input)) {
    // 类型“string | number”上不存在属性“replace”。
    (input).replace("linbudu", "linbudu599")
  }
  if (typeof input === 'number') { }
  // ...
}
```
为了解决这个问题，ts提供is关键字
```typescript
function isString(input: unknown): input is string {
  return typeof input === "string";
}

function foo(input: string | number) {
  if (isString(input)) {
    // 正确了
    (input).replace("linbudu", "linbudu599")
  }
  if (typeof input === 'number') { }
  // ...
}
```
上面的 isString 方法返回类型是 `input is string` ，如果这个函数返回为 `true` ，就表示传入的参数是字符串类型，这样就能被类型控制流分析收集到
### 基于 in 与 instanceof 的类型保护