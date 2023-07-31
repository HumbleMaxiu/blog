## 文件系统
1. cd指令
```bash
cd /usr/bin 使用绝对路径
cd usr/bin 相对路径
cd ..
```
2. ls指令
```bash
-a 显示隐藏文件
-R 递归展示文件，会遍历子目录，如果文件很大，打印内容会很多
-F 输出目录（dir），不包括文件
-l 以长列表格式输出文件
ls -l my_test 过滤器，搜索带 my_test 的文件，可以用正则（？代表一个字符，*代表零个或多个字符）
```
3. touch指令 创建文件
```bash
touch test_one 创建 test_one 文件
-a 更新文件访问时间
```
4. cp指令，复制文件
```bash
cp <dir1> <dir2> 若无 dir2，会创建对应的文件
-i 询问是否覆盖
. 表示当前路径，eg：cp /etx/NetworkManager . ，复制 NetworkManager 到当前目录
-R 递归的复制整个目录
```