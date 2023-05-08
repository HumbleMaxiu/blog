## 什么是Node？
浏览器，通过提供的 DOM API 和 JS 进行交互，Node 呢？基于 Chrome V8 引擎开发的一个 JS 运行时环境，可以理解为通过 Node API 与 JS 进行交互。

基于上面的理解，我们可以简单的对比一下浏览器环境和Node环境有什么区别：
1. 全局对象不同，浏览器：window，Node：global
2. DOM API只能与浏览器交互，Node API可以操作文件系统（fs），获取进程信息（process），创建web服务器（http），这些API让我们可以与计算机操作系统交互。
下面是 Node 的架构图，从图中我们就能看到，部分 Node API 是基于 C/C++ 实现的。
<img src="/node.jpg" style="margin-top: 16px" />
其中，libUV 负责处理事件循环，c-ares、llhttp/http-parser、open-ssl、zlib 等库提供 DNS 解析、HTTP 协议、HTTPS 和文件压缩等功能。

## Node常用模块
1. File System模块（fs），操作系统的目录和文件的模块，提供文件的读、写、创建、删除、权限设置等功能。
2. Net 模块，提供网络套接字 socket 功能，用来创建 TCP 链接，TCP 连接可以用来访问后台数据库和其他持久化服务。
3. HTTP 模块，提供创建 HTTP 连接的能力，用来创建 Web 服务，是 Node 在前端最核心的模块。
4. URL 模块，用来处理客户端请求信息的辅助模块，用来解析 URL 路径。
5. Path 模块，用来处理文件路径信息的辅助模块，可以解析文件路径的字符串。
6. Process 模块，用来获取进程信息。
7. Buffer 模块，用来处理二进制数据。
8. Console 模块，控制台模块，同浏览器，用来输出信息到控制台。
9. Crypto 加密解密模块，用来处理需要用户授权的服务（？？？？）没咋理解。
10. Events 模块，用来监听和派发用户事件。

## ESM & CJS
在 node 中使用 ESM 模式时，需要把文件名定义为 .mjs 后缀，因为 Node 默认使用 CJS 解析 js 文件，使用 ESM 解析 mjs 文件。如果要使用 ESM 定义 js 文件的模块，可以在 Node 的 package.json 中设置参数 type: module。