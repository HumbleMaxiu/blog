## NPM CLI
> 记录阅读 NPM 文档里 CLI 的部分
### npm
javascript 包管理器
#### Dependencies
如果一个软件包使用 git url 列出地址，那么 npm 会使用 git 命令来安装他
#### 配置 npm cli
- 你可以使用 --key val 设置一个配置，所有的键(--key)都需要一个值，如果没传val，那他默认是 true
### npm access
在发布的软件包上设置访问级别   
```js
npm access list packages [<user>|<scope>|<scope:team> [<package>]
npm access list collaborators [<package> [<user>]]
npm access get status [<package>]
npm access set status=public|private [<package>]
npm access set mfa=none|publish|automation [<package>]
npm access grant <read-only|read-write> <scope:team> [<package>]
npm access revoke <scope:team> [<package>]
```
### npm ci
example
```js
$ cd ./my/npm/project
$ npm install
added 154 packages in 10s
$ ls | grep package-lock
```
使用 npm ci，需要确保你对应目录下存在 package.json
```js
$ npm ci
added 154 packages in 5s
```