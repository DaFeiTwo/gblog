---
title: "图床管理工具"
description: "使用Cloudflare Workers + R2 + Tinypng构建免费图床管理工具。"
pubDate: "2025-02-07 16:54:22"
category: "log"
# banner2: "https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/02/RYVFPOK.png"
banner: "https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/02/HmEfPOK.png"
tags: ["R2", "Tinypng", "图床"]
selected: true
---


# 背景
24 年底的时候创建了属于自己的博客，头一等大事就是解决图床问题，好在 Cloudflare 提供了 R2 方式可以进行存储。

网上找了个比较火的 [PicGo](https://github.com/Molunerfinn/PicGo) 进行客户端配置，但是不知道为什么每次上传图片的时候大概率都会失败，找了网上的方式也没有解决，正在愁眉不展的时候...

偶然间发现了一个[大佬的博客](https://blog.lianglianglee.com/posts/22b7ecba)，使用 R2 + Page 部署免费的图床，二话不说，直接开整！

# 部署步骤
## fork 仓库
项目地址：[https://github.com/liangliangle/roim-picx](https://github.com/liangliangle/roim-picx)

## 部署项目
进入 Cloudflare 控制台页面，Pages 选择 连接到 Git，选择一个存储库（这里，有不知道怎么连接到 github 的，可以参考[这个博客](https://godruoyi.com/posts/how-to-build-your-blog/)）

![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/02/B5F5POK.png)



点击进行下一步，项目名称写自己喜欢的，保存并部署即可

![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/02/rH25POK.png)



## 创建 R2
写一个自己喜欢的名字，保存创建存储桶

![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/02/CsH5POK.png)

创建完后进入设置，找到 R2.dev 子域，复制 URL，后续配置环境变量会用到

![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/02/9Z75POK.png)



## 配置环境变量
回到我们刚刚部署好的 pages 项目中，进入设置，设置`AUTH_TOKEN` 和`COPY_URL`的变量名称，其中`AUTH_TOKEN`就相当于密码（自己想一个就好），我们每次登录都需要输入这个 token，而`COPY_URL`就是上面我们复制的 URL。

![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/02/ZBe5POK.png)

## 设置 R2
还是在 pages 的设置页面，找到可用的资源集，点击添加，选择我们刚刚好创建的 R2，之后我们上传删除都是对这个 R2 进行操作。

![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/02/U5D5POK.png)

> 注意：配置环境变量之后，还是手动部署才会生效。
>



# 项目截图
基于上述，点进 pages 默认提供的项目 URL，即可看到部署成功的首页，输入`AUTH_TOKEN`进入管理页面

![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/02/qyG5POK.png)



![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/02/15I5POK.png)



# 后续改动
> 二次魔改的项目其实已经比较完善了，在二次魔改的基础上，又按照我自己的想法，做一些些改动
>

## 管理页面图片降序
`src/views/ManageImages.vue`修改 listImages 方法：

```vue
const listImages = () => {
	loading.value = true
	requestListImages(<ImgReq> {
    limit: 100,
    delimiter: delimiter.value
  }).then((data) => {
    // console.log('返回的图片列表：', data.list); // 添加这行来查看数据
    uploadedImages.value = data.list.sort((a, b) => {
      if (!a.uploadedAt || !b.uploadedAt) return 0;  // 处理可能不存在 uploadedAt 的情况
      return b.uploadedAt - a.uploadedAt;
    });
    if (data.prefixes && data.prefixes.length) {
      prefixes.value = data.prefixes
      if (delimiter.value !== '/') {
        prefixes.value = ['/', ...data.prefixes]
      }
    } else {
      prefixes.value = ['/']
    }
  }).catch(() => {})
		.finally(() => {
			loading.value = false
		})
}
```



`src/utils/types.ts`修改 ImgItem 对象

```vue
export interface ImgItem {
	key : string
	url : string
	size: number
	copyUrl: string
	filename ?: string
	uploadedAt?: number  // 添加这个字段
}
```



`functions/rest/routes/index.ts`修改 urls return 字段

```vue
    const urls = objs.map(it => {
        return <ImgItem>{
            url: `/rest/${it.key}`,
            copyUrl: `${env.COPY_URL}/${it.key}`,
            key: it.key,
            size: it.size,
            uploadedAt: it.uploaded?.getTime() || 0  // 添加这行，使用 R2 对象的 uploaded 时间
        }
    })
```

## 图片压缩功能实现
链接：[cloudflare 的 R2 + picgo：教你搭建免费图床并实现快速上传和压缩图片 | 科技Ins](https://techins.xyz/build-a-free-image-hosting-service-with-r2#7623ee9089ab40698eea1993f4473f0f)

使用 tinypng API 进行实现图片的压缩功能，每月有 500 次的免费压缩次数，够用。

### 申请 Tinypng API
链接：[https://tinypng.com/developers](https://tinypng.com/developers)

输入 name 和 email，会发送邮件，点击邮件中 visit dashboard 进入开发者后台，获取 API KEY，将这个 KEY 写入到 Cloudflare 的环境变量中，`TINYPNG_API_KEY=you api key`

![](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/02/wpE5POK.png)



### 图片压缩方法
```typescript
// TinyPNG压缩图片
export async function compressImage(imageBuffer: ArrayBuffer, apiKey: string): Promise<ArrayBuffer> {
    if (!apiKey) {
        throw new Error('TinyPNG API key is not configured');
    }

    const auth = btoa(`api:${apiKey}`);
    
    // 上传图片到TinyPNG
    const uploadResponse = await fetch('https://api.tinify.com/shrink', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new Uint8Array(imageBuffer)
    });

    if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(`TinyPNG compression failed: ${error.message || uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();

    // 下载压缩后的图片
    const downloadResponse = await fetch(uploadResult.output.url);
    
    if (!downloadResponse.ok) {
        throw new Error(`Failed to download compressed image: ${downloadResponse.statusText}`);
    }

    return await downloadResponse.arrayBuffer();
}
```



### 上传图片前进行压缩
```typescript
// batch upload file
router.post('/upload', auth, async (req: Request, env: Env) => {
    const files = await req.formData()
    const images = files.getAll("files")
    const errs = []
    const urls = Array<ImgItem>()
    
    for (let item of images) {
        const fileType = item.type
        if (!checkFileType(fileType)) {
            errs.push(`${fileType} not support.`)
            continue
        }

        try {
            // 读取文件内容
            const arrayBuffer = await item.arrayBuffer();
            
            // 压缩图片
            let compressedBuffer = arrayBuffer;
            if (fileType === 'image/jpeg' || fileType === 'image/png') {
                try {
                    compressedBuffer = await compressImage(arrayBuffer, env.TINYPNG_API_KEY);
                } catch (error) {
                    console.error('Image compression failed:', error);
                    // 如果压缩失败，使用原始图片继续
                }
            }

            const time = new Date().getTime()
            const objectPath = await getFilePath(fileType, time)
            
            const header = new Headers()
            header.set("content-type", fileType)
            header.set("content-length", `${compressedBuffer.byteLength}`)
            
            const object = await env.R2.put(objectPath, compressedBuffer, {
                httpMetadata: header,
            })

            if (object || object.key) {
                urls.push({
                    key: object.key,
                    size: object.size,
                    copyUrl: `${env.COPY_URL}/${object.key}`,
                    url: `/rest/${object.key}`,
                    filename: item.name
                })
            }
        } catch (error) {
            errs.push(`Failed to process ${item.name}: ${error.message}`);
            continue;
        }
    }
    
    return json(Build(urls, errs.toString()))
})
```



> 当然，依旧是大模型~~辅助~~(全部)开发，试用了下字节旗下的 Trae，还不错~
>



## 管理页面默认展示内容
图片管理页面，二级文件展示（现在只到年的目录，没有月份的目录，待定...



# 相关链接：
博客链接：[使用R2+Page部署免费的图床【白嫖Cloudflare】 | 墓灵守护的博客](https://blog.lianglianglee.com/posts/22b7ecba)

克隆项目：[https://github.com/liangliangle/roim-picx](https://github.com/liangliangle/roim-picx)





