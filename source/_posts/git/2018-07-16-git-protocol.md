---
title: GitHub的三种协议比较
categories:
  - git 系列
  - git 协议
tags:
  - git 协议
abbrlink: 65521
date: 2018-07-16 14:30:54
updated: 2018-07-16 18:59:48
---

Primary differences between SSH and HTTPS. This post is specifically about accessing Git repositories on GitHub.

## Protocols to choose from when cloning:

**plain Git**, aka `git://github.com/`

- **Does not add security** beyond what Git itself provides. The server is not verified.

  If you clone a repository over git://, you should check if the latest commit's hash is correct.

- You **cannot push** over it. (But see "Mixing protocols" below.)

  <!--more-->

  **HTTPS**, aka `https://github.com/`

- HTTPS **will always verify the server** automatically, using certificate authorities.

- (On the other hand, in the past years several certificate authorities have been broken into, and many people consider them not secure enough. Also, some important HTTPS security enhancements are only available in web browsers, but not in Git.)

- Uses **password** authentication for pushing, and still allows anonymous pull.

- Downside: You have to enter your GitHub password every time you push. [Git can remember passwords][2] for a few minutes, but you need to be careful when storing the password permanently – since it can be used to change anything in your GitHub account.

- If you have two-factor authentication enabled, you will have to use a [personal access token][3] instead of your regular password.

- HTTPS **works practically everywhere**, even in places which block SSH and plain-Git protocols. In some cases, it can even be **a little faster** than SSH, especially over high-latency connections.

**HTTP**, aka `http://github.com/`

- Doesn't work with GitHub anymore, but is offered by some other Git hosts.

- Works practically everywhere, like HTTPS.

- But does not provide any security – the connection is plain-text.

**SSH**, aka `git@github.com:` or `ssh://git@github.com/`

- Uses **public-key** authentication. You have to [generate a **keypair**][1] (or "public key"), then add it to your GitHub account.

- Using keys is **more secure than passwords**, since you can add many to the same account (for example, a key for every computer you use GitHub from). The private keys on your computer can be protected with passphrases.

- On the other hand, since you do not use the password, GitHub does not require two-factor auth codes either – so whoever obtains your private key can push to your repositories without needing the code generator device.

- However, the keys only allow pushing/pulling, but _not_ editing account details. If you lose the private key (or if it gets stolen), you can just remove it from your GitHub account.

- A minor downside is that authentication is needed for all connections, so you always **need a GitHub account** – even to pull or clone.

- You also need to **carefully verify the server's fingerprint** when connecting for the first time. Many people skip that and just type "yes", which is insecure.

- (Note: This description is about GitHub. On personal servers, SSH can use passwords, anonymous access, or various other mechanisms.)

## Mixing protocols

### Globally

You can clone everything over `git://`, but tell Git to push over HTTPS.

    [url "https://github.com/"]
        pushInsteadOf = git://github.com/

Likewise, if you want to clone over `git://` or HTTPS, but push over SSH:

    [url "git@github.com:"]
        pushInsteadOf = git://github.com/
        pushInsteadOf = https://github.com/

These go to your _git_ config file – sometimes `~/.config/git/config`, or `~/.gitconfig`, or just run `git config --edit --global`.

### Per-repository

You can also set different pull and push URLs for every remote separately, by changing <code>remote.<i>name</i>.pushUrl</code> in the repository's own `.git/config`:

    [remote "origin"]
        url = git://nullroute.eu.org/~grawity/rwho.git
        pushUrl = ssh://sine/pub/git/rwho.git

[1]: https://help.github.com/articles/generating-ssh-keys
[2]: https://help.github.com/articles/set-up-git#password-caching
[3]: https://help.github.com/articles/creating-an-access-token-for-command-line-use

---

**`[相关阅读]`**

在最新的官方 Git 客户端正式版 2.18 中添加了对 Git wire 协议 v2 的支持，并引入了一些性能与 UI 改进的新特性。

在 Git 的核心团队成员 Brandon Williams 公开宣布这一消息前几周，[Git 协议 v2][8] 刚刚合并至 Git 的 master 主干分支。Git wire 协议定义了 Git 客户端与服务端如何对于 clone、fetch 和 push 等操作进行通信。按 Williams 所说，新版本协议的目标是提升性能，并使其能够更好的适应未来的改进。
{% note info%}
新版本协议的主要驱动力是使 Git 服务端能够对各种 ref（分支与 tag）进行过滤操作。
{% endnote %}
这就意味着，Git 服务器无需将代码库中所有的 ref 一次性发送给客户端，再由客户端进行过滤。在大型的代码库中可能会存在不计其数的 ref，即使某些 ref 是客户端无需使用的，也不得不加载多达数个 MB 的 ref 数据。在使用 v2 协议之后，Git 服务器将根据客户端所需的操作类型，对 ref 进行过滤之后再将列表发送至客户端。Williams 举了一个例子，如果开发者所更新的分支仅比其远程分支落后几个提交，或是仅仅检查本地分支是否已更新，则完全没有必要在服务端传递整个 ref 列表，这对于时间和带宽都是一种浪费。Williams 表示，基于 Google 内部对协议 v2 的使用，在访问例如 Chrome 这种包含了超过 50 万个分支和 tag 的大型仓库时，比起使用 v1 协议可达到三倍速以上。此外，通过使用新版本协议，更便于实现某些新的特性，例如[按需选取 ref][4]，以及[拉取和推送 symref][5] 等等。

支持协议 v2 的 Git 客户端仍然可以与尚未支持 v2 的旧版本服务端进行通信。这要感谢当初在设计时决定通过一个独立的通道发送 v2 所必须的额外信息。旧版本的服务端会直接忽略这个额外的通道，并返回 ref 的完整列表。

为了让开发者能够自行选择协议的版本，Git 现在添加了一个新的 `-c`命令行选项，如以下示例：

```
git -c protocol.version=2 ls-remote
```

如果希望默认使用 v2 协议，可以修改 Git 的配置：

```
git config --global protocol.version=2
```

Git 2.18 中的另一个新特性是通过[序列化的 commit graph][6] 改善性能。简单来说，就是新版本的 Git 可以将 commit graph 的结构保存在某个文件中，并附加一些额外的元数据，以加速图形的加载。在进行获取列表，对提交历史进行过滤，以及计算合并的 base 等操作时，会表现得非常高效。这项功能是由微软的团队所实现的，该团队的成员 Derrick Stole 表示，对于大型代码库，例如 Linux kernel 或 Git 本身的代码库进行这类操作时，速度可提升 75–99%。Git 的 commit graph 仍然是一项处于实验性阶段的功能，因为某些 Git 特性无法很好地与 commit graph 相配合，例如浅克隆、对象替换，以及 commit graft 等等。如果不打算使用这些特性，可以通过运行 git config core.commitGraph true 命令启用 commit graph。

读者可在[官方发布说明][7]中了解 Git 2.18 的完整特性。

---

[4]: https://public-inbox.org/git/20170126230046.aknesybfyzxhx3ia@sigill.intra.peff.net/
[5]: https://public-inbox.org/git/20160816161838.klvjhhoxsftvkfmd@x/
[6]: https://github.com/git/git/blob/master/Documentation/technical/commit-graph.txt
[7]: http://lkml.iu.edu/hypermail/linux/kernel/1806.2/05042.html
[8]: https://mirrors.edge.kernel.org/pub/software/scm/git/docs/technical/protocol-v2.html
