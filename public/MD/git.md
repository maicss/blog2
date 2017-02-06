# git memo

- uncommit `git reset --soft HEAD^`, this is uncommit with added. `git reset HEAD` is rm from stage keep modification. `git reset --hard HEAD^` is uncommit and revert modification, means last time `git pull` status.
- git untrack: `git rm --cached file`, but the most voted is `git update-index --assume-unchanged file`, this is  not worked.