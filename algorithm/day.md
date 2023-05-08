# 每日一题
## DAY 1
> leetCode：1043. 分隔数组以得到最大和
问题描述：
> 给你一个整数数组 arr，请你将该数组分隔为长度 最多 为 k 的一些（连续）子数组。分隔完成后，每个子数组的中的所有值都会变为该子数组中的最大值。
> 返回将数组分隔变换后能够得到的元素最大和。本题所用到的测试用例会确保答案是一个 32 位整数。
示例：
> 输入：arr = [1,15,7,9,2,5,10], k = 3
> 输出：84
> 解释：数组变为 [15,15,15,9,10,10,10]

来源：力扣（LeetCode） 
问题链接：https://leetcode.cn/problems/partition-array-for-maximum-sum  

解题：
```js
function maxSumAfterPartitioning(arr: number[], k: number): number {
    let n: number = arr.length
    let dp: number[] = new Array(n + 1).fill(0)
    for(let i = 1;i <= arr.length;i++) {
        // 每次都要重新初始化 maxValue
        let maxValue = arr[i - 1]
        for (let j = i - 1;j >= Math.max(0, i - k);j--) {
            dp[i] = Math.max(dp[i], dp[j] + maxValue * (i - j))
            // 向左扩大子数组的同时，更新maxValue
            if (j > 0) {
                maxValue = Math.max(maxValue, arr[j - 1])
            }
        }
    }
    return dp[n]
};
```
## DAY2
> leetCode: 143. 重排链表
问题描述：
> 给定一个单链表 L 的头节点 head ，单链表 L 表示为：
>> L0 → L1 → … → Ln - 1 → Ln
> 请将其重新排列后变为：
>> L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …
不能只是单纯的改变节点内部的值，而是需要实际的进行节点交换。
示例：
> 输入：head = [1,2,3,4]
> 输出：[1,4,2,3]

来源：力扣（LeetCode）
链接：https://leetcode.cn/problems/reorder-list

解题1，使用线性表记录下标，快速访问链表元素，复杂度：时O(n)，空O(n)
```js
function reorderList(head: ListNode | null): void {
    let arr: ListNode[] = []
    let node: ListNode = head.next
    while (node) {
        arr.push(node)
        let v: ListNode = node.next
        node.next = null
        node = v
    }
    let l: number = 0
    let r: number = arr.length - 1
    let tmp: ListNode = head
    while (l <= r) {
        if (l === r) {
            tmp.next = arr[l]
        } else {
            tmp.next = arr[r]
            tmp.next.next = arr[l]
            tmp = tmp.next.next
        }
        l++
        r--
    }
};
```
解题2，先使用快慢指针找到中间节点，反转后面的链表，合并两个链表，复杂度：时O(n)，空O(1)  
下面是第一版代码，时间空间都不如使用线性表的方式，看看别人怎么实现的，哪里可以优化
```js
function reorderList(head: ListNode | null): void {
    // 特殊处理空节点和只有一个节点的情况
    if (!head || !head.next) return
    // 快慢指针，找到中间节点
    let slow = head
    let fast = head
    while (fast && fast.next) { 
        slow = slow.next
        fast = fast.next.next
    }
    fast = null
    
    // 把前面那段链表最后一个元素指向null，防止循环链表
    let node = head
    while (node) {
        if (node.next === slow) {
            node.next = null
            break
        }
        node = node.next
    }
    node = null

    // 反转后面的链表
    let pre = null
    while (slow) {
        let next = slow.next
        slow.next = pre
        if (!next) break
        pre = slow
        slow = next
    }

    // 合并前后两个链表
    let l = head
    let r = slow
    while (l.next && r.next) {
        let rNext = r.next
        let lNext = l.next
        r.next = l.next
        l.next = r
        r = rNext
        l = lNext
    }
    l.next = r
};
```
## DAY3
#### leetCode: 6. N 字形变换
将一个给定字符串 s 根据给定的行数 numRows ，以从上往下、从左到右进行 Z 字形排列。
比如输入字符串为 "PAYPALISHIRING" 行数为 3 时，排列如下：

> P   A   H   N
> A P L S I I G
> Y   I   R

之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如："PAHNAPLSIIGYIR"。
请你实现这个将字符串进行指定行数变换的函数：

> string convert(string s, int numRows);

示例 1：

> 输入：s = "PAYPALISHIRING", numRows = 3
> 输出："PAHNAPLSIIGYIR"

来源：力扣（LeetCode）
链接：https://leetcode.cn/problems/zigzag-conversion

解题1，把z字形变换拆分，可以看成每次转弯到头部为一段，之后每次都是重复这个过程 （46.5%， 56.6%）还可以试试其他方法，这种嵌套循环的方式，如果字符串长度很短，效率并不高。
> P   | A   | H   | N
> A P | L S | I I | G
> Y   | I   | R   |
```js
function convert(s: string, numRows: number): string {
    // numRows是1，直接返回
    if (numRows === 1) return s
    const arr: string[] = new Array(numRows).fill('')
    let idx = 0
    while (idx < s.length) {
        // 按照规律，可以把一段转弯操作分为 numRows - 1 段
        for (let i = 1;i <= numRows - 1;i++) {
            if (idx >= s.length) break
            // 为 1 时就是一直往下走，按顺序输入到 arr 里即可
            if (i === 1) {
                for (let j = 0;j < numRows;j++) {
                    let str = s[idx]
                    if (!str) break
                    arr[j] += str
                    idx++
                }
                // 不为 1 时，就是在转弯，输出到 numRows - i 里，因为是反过来的嘛
            } else {
                let tar = numRows - i
                arr[tar] += s[idx++]
            }
        }
    }
    // 拼接结果
    return arr.reduce((value, cur) => {
        return value + cur
    }, '')
};
```
解法2，取模运算，来确定当前在哪一段:
```js
function convert(s: string, numRows: number): string {
    if (numRows === 1) return s
    // 字符串数组保存结果
    const arr: string[] = new Array(numRows).fill('')
    for (let i = 0;i < s.length;i++) {
        let ans = Math.floor(i / (numRows - 1))
        let cur = i % (numRows - 1)
        // 按照刚才那样划分，当 ans % 2 === 0 时，说明在第一段
        if (ans % 2 === 0) {
            arr[cur] += s[i]
        } else {
            // 不在第一段，逆序保存
            arr[numRows - cur - 1] += s[i]
        }
    }
    // reduce 换成 for 循环会快一点（可以看下 reduce 的原理），这里这样写就是方便
    return arr.reduce((value, cur) => {
        return value + cur
    }, '')
};
```