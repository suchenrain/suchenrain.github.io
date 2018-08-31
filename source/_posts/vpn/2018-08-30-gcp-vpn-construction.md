---
title: 谷歌云搭建免费VPN
categories:
  - 工具
tags:
  - 科学上网
  - vpn
abbrlink: 37388
date: 2018-08-30 20:06:33
updated: 2018-08-31 19:28:21
---

{% hint danger%}
_仅供技术学习探索，请合理科学上网，遵纪守法。_
{% endhint%}

## \# 前面

[Google Cloud Platform][0] 是 Google 提供的云端服务,目前提供 365 天免费的 300 美金优惠试用,并且超过 365 天或者赠金已消费完,没有你的允许它也不会继续扣款,以下是我在上面搭建个人 VPN 的过程,欢迎参考:D

整体大概流程：_申请免费谷歌云服务_ => _创建虚拟实例_ => _在实例搭建`SSR`或`L2TP/IPsec`VPN 服务_

## \# 申请谷歌云服务

#### \# 准备工作

- 能够科学上网（搭建过程需要爬梯）
- [谷歌账号][1]
- 一张双币信用卡(VISA/JCB/MasterCard)

#### \# 账号申请

**申请地址：** https://cloud.google.com/free/?hl=zh-cn

- 国家和地区资料填写，我们在右侧栏可以看到 12 个月有效期的 300 刀赠额说明。国家地区选择真实所在地，这里我选择中国，勾选同意条款，点击同意并继续：

- 接下来进行个人资料和信用卡资料的填写，个人资料和信用卡资料如实填写就好了。账号类型选择个人，个人资料和信用卡信息填写完成之后直接点击开始免费试用选项即可。

- 接着你的信用卡账户消费 1 美金，这是谷歌为了确认你不是机器人用于验证账户的， 5 分钟内你会收到账户撤销 1 美金的消费操作，1 美元会返回你的账户，整个过程完全免费。另外除非你主动确认升级成付费账号，300 美金的赠款消费完毕以后并不会直接从你的信用卡账户续费扣款。

#### \# 创建实例

直接访问 https://console.cloud.google.com/compute/instances 或登录 GCP 控制台后, 点击计算引擎 - 创建实例. 如图:

```bash
　　# 可免费使用1年，价值300美金。
　　# Google Cloud Platform计算引擎是按小时收费，网络按流量收费.
　　# 我们可以算一算:
　　# 注册赠送了300美金, 一年免费使用期.
　　# 主机选的是微型(最低配置机型), $5/月.
　　# 还剩300-5*12=$240, 用于抵扣流量的费用.
　　# 谷歌云服务器出口大陆流量1T以内价格约为0.23$/1G.
　　# 那么每个月可用流量 = 240/12/0.23 ≈ 86G, 一般日常使用绝对够用。
```

- 名称: 随便填
- 地区: 建议选 asia-east1-c, asia-east1-a, asia-east1-b, asia-east1-c 机房都在中国台湾彰化县, 实测 c 区更好.
- 机器类型: 选微型(一个共享 vCPU)
- 0.6G 内存, 一般加速上网, 看视频, 玩游戏都够用了. 不够再换
- 启动磁盘: 推荐选 CentOS 7.
- 防火墙允许 HTTP 和 HTTPS
- 本文命令都是基于 CentOS 7, 如选 Debian, Ubuntu 等其他系统, 命令会稍有不同

#### \# 外部静态 IP

两种方式创建外部静态 IP：

- 在创建实例阶段，选择网络并将外部 IP 设置为静态和保存
- VPC 网络=>外部 IP 地址修改相应实例地址类型为静态

#### \# IPsec 服务器搭建

##### \# 防火墙规则

VPC 网络=>防火墙规则, 建立新的规则：

```bash
# 名称：ipsecvpn
# 流量方向: 输入
# 相符时执行的动作：允许
# 目标 IP范围: 0.0.0.0/0
# 设定指定通讯: udp:500;udp:4500;esp
```

##### \# 设定 VPC IP 转发

VPC 网络=>default=>编辑=>动态传送模式设置为全域=>保存

##### \# 负载均衡

网络服务=>负载平衡=>建立负载平衡=>UDP 负载平衡=>从网际网路到我的 VM=>继续

```bash
##后端设定
# 区域：刚才实例创建所选区域
# 后端：选择创建的现有实例

##前端设定
# IP: 临时
# 端口：500-4500
```

最后填入名称并建立。

##### \# 配置 ipsec vpn 服务

将使用[setup-ipsec-vpn][2]搭建 IPsec VPN 服务器

回到 VM 实例列表，通过 SSH 连接到虚拟机器：
运行`yum update`并重启。（可选步骤，推荐）

```bash
wget https://git.io/vpnsetup-centos -O vpnsetup.sh
vim vpnsetup.sh
# [替换设置相应的值： YOUR_IPSEC_PSK, YOUR_USERNAME 和 YOUR_PASSWORD]
sudo sh vpnsetup.sh
```

**`管理VPN用户`**

在默认情况下，将只创建一个用于 VPN 登录的用户账户。如果你需要添加，更改或者删除用户，请[阅读本文档][3]。

首先，IPsec PSK (预共享密钥) 保存在文件`/etc/ipsec.secrets` 中。如果要更换一个新的 PSK，可以编辑此文件。所有的 VPN 用户将共享同一个 IPsec PSK。

%any %any : PSK "你的 IPsec 预共享密钥"
对于`IPsec/L2TP`，VPN 用户账户信息保存在文件 `/etc/ppp/chap-secrets`。该文件的格式如下：

```bash
"你的 VPN 用户名 1" l2tpd "你的 VPN 密码 1" _
"你的 VPN 用户名 2" l2tpd "你的 VPN 密码 2" _
... ...
```

你可以添加更多用户，每个用户对应文件中的一行。不要 在用户名，密码或 PSK 中使用这些字符：`\ " '`

对于 `IPsec/XAuth ("Cisco IPsec")`， VPN 用户账户信息保存在文件 `/etc/ipsec.d/passwd`。该文件的格式如下：

```bash
你的 VPN 用户名 1:你的 VPN 密码 1 的加盐哈希值:xauth-psk
你的 VPN 用户名 2:你的 VPN 密码 2 的加盐哈希值:xauth-psk
... ...
```

这个文件中的密码以加盐哈希值的形式保存。该步骤可以借助比如 `openssl` 工具来完成：

```bash
# 以下命令的输出为：你的 VPN 密码 1 的加盐哈希值

openssl passwd -1 '你的 VPN 密码 1'
```

最后，如果你更换了新的 PSK，则需要重启服务。对于添加，更改或者删除 VPN 用户，一般不需重启。

```bash
service ipsec restart
service xl2tpd restart
```

至此，搭建完成。

**`VPN连接测试`**

[配置 IPsec/L2TP VPN 客户端][4]
[配置 IPsec/XAuth ("Cisco IPsec") VPN 客户端][5]

- iPhone
  设定=>VPN=添加配置
  图
- windows
  to be done
- linux

#### \# SSR 的搭建

[0]: https://cloud.google.com/free/?hl=zh-cn
[1]: https://accounts.google.com/signup/v2/webcreateaccount
[2]: https://github.com/hwdsl2/setup-ipsec-vpn/blob/master/README-zh.md
[3]: https://github.com/hwdsl2/setup-ipsec-vpn/blob/master/docs/manage-users-zh.md
[4]: https://github.com/hwdsl2/setup-ipsec-vpn/blob/master/docs/clients-zh.md
[5]: https://github.com/hwdsl2/setup-ipsec-vpn/blob/master/docs/clients-xauth-zh.md
