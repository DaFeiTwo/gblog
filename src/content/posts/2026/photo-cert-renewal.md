---
title: "photo网址证书重新签发"
description: "在阿里云控制台重新签发证书，还是挺方便的，就是证书每次都只有三个月有效期"
pubDate: "2026-02-28 17:30:09"
category: "log"
# banner2: "https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/03/ogUiHPK.jpeg"
banner: "https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2026/02/EVDWkEk.png"
tags: ["证书签发","阿里云"]
selected: true
---


## 一、背景
之前的免费证书就 3 个月时间，到 25 年底过期好久了，今天有时间更新下新证书。

![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2026/02/uQaVkEk.png)



## 二、步骤
### 登录阿里云控制台
链接：[数字证书管理服务](https://yundun.console.aliyun.com/?spm=5176.12818093_47.resourceCenter.4.546016d0T4aVmb&p=cas#/instance/buy/cn-hangzhou)

![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2026/02/W0rukEk.png)

突然发现之前申请的是 V1.0，现在都变成 2.0 了。



### 购买免费证书
![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2026/02/BbwukEk.png)

依旧是购买个人免费证书，只有 3 个月有效期。



![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2026/02/GT0VkEk.png)

每个人可以同时并发申请 20 个免费证书。

这里我们先申请一个免费证书。



### 部署下发证书
![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2026/02/UZsVkEk.png)

这里我已经申请完了，没有申请的，待申请这里是可以点击，然后再点击部署。



![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2026/02/1qoVkEk.png)

这里选择云服务器部署，创建任务。



![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2026/02/EZtVkEk.png)

填写名称、选择证书、云服务器，之后到最终的配置。

这里的部署配置的意思，是把我们申请下来证书的 key 和 pem 上传得到服务器里。

所以要填下 nginx 的配置中的目录。



### nginx 中的配置目录
##### cat nginx.conf
![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2026/02/VVUVkEk.png)

可以看到我的证书和 key 配置的目录是：

`ssl_certificate /etc/nginx/cert/photo.kalami.icu.pem;`

`ssl_certificate_key /etc/nginx/cert/photo.kalami.icu.key;`



把目录分别填上即可。点击部署，就把 pem 和 key 上传到对应的目录中。



##### 是否上传成功
![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2026/02/nyRVkEk.png)

看时间也能对应上，即为上传成功。

别急还有最后一步。



### 重启 nginx
命令：`sudo nginx -s reload`



至此结束~



## 三、踩坑记录
![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2026/02/mHRVkEk.png)

发现还是出现问题。



不要急，问了下 AI，可能是浏览器缓存的问题。用无痕访问，果然成功了。

![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2026/02/t4lVkEk.png)



