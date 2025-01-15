---
title: "首次创建博客记录"
description: "首次使用Cloudflare构建了一个属于自己的博客，集成了giscus进行文章评论"
pubDate: "2025-01-09 20:54:00"
category: "astro"
banner: "@images/banners/gblog-2.jpg"
banner2: "@images/banners/gblog.jpg"
tags: ["Gblog", "Astro"]
selected: true
---

:::info
💡 起因：在逛 2024 年终分享的时候，偶然看见一个[大佬的分享](about:blank)，之后看他的主页，翻了翻，发现有一个开源的博客文章，[如何快速搭建自己的博客网站](https://godruoyi.com/posts/how-to-build-your-blog/)，于是乎，按照步骤，开始部署开发属于自己的博客（ps：站在巨人的肩膀上看世界）

:::



# 构建步骤
## fork gblog 开源项目
开源项目 gblog 地址：[https://github.com/godruoyi/gblog](https://github.com/godruoyi/gblog)

fork 时，注意：取消「Copy the astro branch only」我们需要用 gblog-template 这个分支进行构建

## Cloudflare 构建部署
登录 Cloudflare 后，选择 workers & pages，新建一个 page，构建 branch 的时候选择 gblog-template 即可

最后！构建完成，等待一会儿，点击默认的域名访问，就可以看到属于自己的博客了~

## 总结
感慨，可真简单啊，在大学的时候，自己就有想法，弄一个属于自己的博客，但苦于前后端都得干，还得自己搞域名，没有那个动力，但是现在纯前端，托管云服务，可太行了。

在此，立个 flag，2025 年，希望我可以更新 10 个博客文章，不限内容题材，冲啊！

# 使用方法
## 本地部署
vscode 克隆项目，顺便按照 jetbrains 的风格配置了下页面，终于顺眼了一些

![](https://cdn.nlark.com/yuque/0/2025/png/21772425/1736395850814-14ad0e2e-ac4d-4a84-b80f-3db476b13e91.png)



打开终端，在项目的根目录，执行命令，即可访问链接：[http://localhost:4321/](http://localhost:4321/)，进行本地调试

```swift
# 进入 myblog 文件夹
cd myblog

# 安装博客所需依赖
npm install

# 在本地启动一个开发预览版本
npm run dev
```



## 云端编辑
在项目的 github 页面，按 `.`（点，英文状态下的点），即可进入编辑页面，可以对 blog 进行小调整

![](https://cdn.nlark.com/yuque/0/2025/png/21772425/1736414248524-d58bd271-cc77-462e-af49-ce45efcd2296.png)



# 自定义
## 添加评论
按照这个[博客的内容](https://liruifengv.com/posts/add-comments-to-astro/)，一步一步操作即可，或者 giscus 网址也可以，[https://giscus.app/zh-CN](https://giscus.app/zh-CN)

找到 src/config.ts 修改其中的 comment 对象即可

![](https://cdn.nlark.com/yuque/0/2025/png/21772425/1736424562787-ae063fcb-fa54-4ad2-9d7f-18f38c99c454.png)

之后就可以拥有评论啦，注意：本地部署测试是不会出来的，需要推到远程部署

![](https://cdn.nlark.com/yuque/0/2025/png/21772425/1736424619798-cc10d9cd-b3ef-4230-bbd6-deab0988425f.png)



## 资源上传到 S3 加速访问


## 添加目录


# 相关文档
1. 部署构建网址 Cloudflare：[https://dash.cloudflare.com/](https://dash.cloudflare.com/)
2. astro 文档：[https://docs.astro.build/zh-cn/guides/deploy/cloudflare/#how-to-deploy-a-site-with-git](https://docs.astro.build/zh-cn/guides/deploy/cloudflare/#how-to-deploy-a-site-with-git)
3. github 地址：[https://github.com/DaFeiTwo/gblog](https://github.com/DaFeiTwo/gblog)







