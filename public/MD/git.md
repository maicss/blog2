# git memo

tags: git

date: 2017-03-08 17:41

关于git的一些笔记，有些老是记不住，给自己这笨脑子跪了。


## untrack file

`git rm --cache file`

这个是GitHub推荐的方法。

也可以使用`git update-index --assme-unchanged file`

以上两种都是在保存文件的情况下，只是不再跟踪文件了。如果想不跟踪文件的时候也不想要文件了，就直接`git rm file`完事。

<!--more-->

## list tracked file

`git ls-tree -r master --name-only`

## git merge 和 git rebase



