# git memo

tags: git

date: 2017-03-08 17:41

<abstract>
关于git的一些笔记，有些老是记不住，给自己这笨脑子跪了。
<abstract>


## untrack file

```bash
git rm --cache file
```

这个是GitHub推荐的方法。

也可以使用`git update-index --assume-unchanged file`

以上两种都是在保存文件的情况下，只是不再跟踪文件了。如果想不跟踪文件的时候也不想要文件了，就直接`git rm file`完事。

<!--more-->

## list tracked file

```bash
git ls-tree -r master --name-only
```

## git merge 和 git rebase

## 线上强制覆盖本地

```bash
git fetch --all
git reset --hard origin/master # master 为分支名称
```

## 恢复没有提交的本地删除文件
```bash
git checkout HEAD <path>
```
## 其他

- 1, commit之后修改上次的commit信息:
`git commit --amend -m 'some message'`

- 2, commit之后想再往上面的commit里追加文件

```shell
 git add somefile; 
 git commit --amend
```

- 3,撤销add
`git reset HEAD <file>`

- 4, 撤销commit

```shell
git reset <hash>  // 撤销commit 保存文件
git reset --hard <hash> // 撤销从没有 删除文件. 如果是删除文件之后commit, 想恢复文件, 用这个可以还原
```
- 5,创建分支
` git checkout <branch name>`

- 6, 切换分支
` git checkout <branch name>`

- 7, merge分支
` git merge <branch name>`

- 8, rebase分支

``` shell
// 切换到副分支
git rebase master
// 切换到主分支
git checkout master
git merge <branch name>
```

- 9, cherry-pick命令 用来获得在单个提交中引入的变更，然后尝试将作为一个新的提交引入到你当前分支上. // 还没遇到需要使用的场景


