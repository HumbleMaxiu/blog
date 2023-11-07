## git 命令
### 获取帮助
以下两种方式会打开一个网页，展示详细的命令文档
```bash
git help <verb>
git <verb> --help

git <verb> -h // 获取简单命令行帮助
```
如果你想在克隆远程仓库的时候，自定义本地仓库的名字，你可以通过额外的参数指定新的目录名：
```bash
git clone https://github.com/libgit2/libgit2 mylibgit
git commit -m "fix:xxxxx" // 提交时，-m参数允许你把提交信息写在行内
git commit -a -m "fix:xxxxx" // -a 参数会把所有文件都添加到暂存区，然后提交
```
git rm // 移除追踪

```bash
git mv README.md README
// 运行git mv 等于
mv README.md README // 改名
git rm README.md // 移除旧文件
git add README // 添加新文件

git log // 展示最近的提交信息
git lop -p // 显示改动
git log -p -2 // 显示最近 2 次提交，并展示修改
git log --stat // 显示简略的统计信息
git log --pretty=oneline // 行内展示，pretty选项可以格式化log输出，支持 oneline, short, full, fuller
git log --pretty=format:"%h - %an, %ar : %s" // 自定义输出格式
git log --since=2.weeks // 显示最近两周的提交
git log -S function_name // 显示修改内容包含 "function_name" 字符串的修改
git log --grep // 显示 commit message 里包含某个字符的提交
```
### 撤销操作
有时候我们提交完了才发现漏掉了几个文件没有添加，或者提交信息写错了。 此时，可以运行带有 --amend 选项的提交命令来重新提交：
```bash
git commit --amend  // 修订提交

git commit -m 'initial commit' // 创建了一个commit
git add forgotten_file // 临时添加 forgotten_file 文件
git commit --amend // 传递 amend 参数，将 forgotten_file 文件添加到这次提交中
```
其实是会用一个新的 commit 替代旧的 commit
```bash
git add * // 会将所有文件暂存
git reset xxx.js // 将 xxx.js 文件取消暂存
git checkout -- CONTRIBUTING.md // 撤销文件修改
```
### 远程服务器
```bash
git remote // 列出远程仓库
git remote -v // 列出所有远程仓库
git remote show origin // 展示缩写为 origin 的远程仓库的所有细节
```
你可以运行 git remote rename 来修改一个远程仓库的简写名。 例如，想要将 pb 重命名为 paul，可以用 git remote rename 这样做：
```bash
$ git remote rename pb paul

$ git remote
origin
paul
```
如果因为一些原因想要移除一个远程仓库——你已经从服务器上搬走了或不再想使用某一个特定的镜像了， 又或者某一个贡献者不再贡献了——可以使用 git remote remove 或 git remote rm ：
```bash
$ git remote remove paul
$ git remote
origin
```

### 别名
```bash
$ git config --global alias.co checkout
```

### 流程
使用 `-b` 参数，创建并切换到一个分支
```bash
$ git checkout -b iss53
Switched to a new branch "iss53"

$ git branch -d hotfix
Deleted branch hotfix (3a0874c).

$ git mergetool 可视化合并工具
```
### 远程分支
```bash
$ git checkout --track origin/serverfix
Branch serverfix set up to track remote branch serverfix from origin.
Switched to a new branch 'serverfix'
```
由于这个操作太常用了，该捷径本身还有一个捷径。 如果你尝试检出的分支 (a) 不存在且 (b) 刚好只有一个名字与之匹配的远程分支，那么 Git 就会为你创建一个跟踪分支：
```bash
$ git checkout serverfix
Branch serverfix set up to track remote branch serverfix from origin.
Switched to a new branch 'serverfix'
```