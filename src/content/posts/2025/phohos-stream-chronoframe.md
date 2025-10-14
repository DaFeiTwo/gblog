---
title: "chronoframe图片展示流"
description: "服务docker部署、域名解析、Nginx反向代理全流程，一个照片展示和管理应用，支持多种图片格式和大尺寸图片渲染。"
pubDate: "2025-10-13 20:03:13"
category: "log"
banner: "https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/10/oA7lkzK.png"
tags: ["博客", "图片展示流"]
selected: true
---

# 最终方案
**阿里云 ECS 部署 chronoframe + 连接 Cloudflare R2 + 购买域名(域名解析、申请 SSL、反向代理)**

购买一年的阿里云服务器 99 元，阿里云服务器使用 Red Hat 系列，包管理用 yum

Cloudflare R2 让 GPT 帮我算了下，差不多 40G 的图片，存储大概 4~5 元/月，没有流量费



## 一、部署 chronoframe 步骤
### 1.1 更新软件源
```bash
# 1. 更新软件源（仓库）列表
yum check-update

# 2. 升级所有可更新的软件包（系统会列出将要升级的包，并询问您是否继续）
yum update
```



### 1.2 安装 docker compose
```bash
# 1. 安装必要的依赖工具和软件源管理工具
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# 2. 添加 Docker 的官方仓库（使用国内阿里云镜像，大幅提升下载速度）
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 3. 安装 Docker 引擎（社区版）及其核心组件
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 4. 启动 Docker 服务，让 Docker 在后台运行
sudo systemctl start docker

# 5. 将 Docker 服务设置为开机自动启动，保证服务器重启后 Docker 自动运行
sudo systemctl enable docker

# 6. 验证 Docker 是否安装成功，成功则会显示版本号
sudo docker --version

# 新版，安装docker后会自动安装docker compose，无需额外安装
# 7. 验证 Docker Compose 是否安装成功，成功则会显示版本号
docker compose --version

```

### 1.3 创建项目目录
```plain
mkdir -p /opt/chronoframe
cd /opt/chronoframe
```

### 1.4 配置 .env 文件
新建 /opt/chronoframe/.env，内容示例：

```plain
# Admin user email (required)
CFRAME_ADMIN_EMAIL=邮箱
# Admin user name (default to Chronoframe, optional)
CFRAME_ADMIN_NAME=名字
# Admin user password (default to CF1234@!, optional)
CFRAME_ADMIN_PASSWORD=密码

# 应用标题与口号
NUXT_PUBLIC_APP_TITLE=名字
NUXT_PUBLIC_APP_SLOGAN=My Photo Album Stream
NUXT_PUBLIC_APP_AUTHOR=作者
NUXT_PUBLIC_APP_AVATAR_URL=

# Mapbox Token
NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN=

# 存储提供者（s3/github/local）
NUXT_STORAGE_PROVIDER=s3
# S3 存储服务配置
NUXT_PROVIDER_S3_ENDPOINT=
NUXT_PROVIDER_S3_BUCKET=
NUXT_PROVIDER_S3_REGION=auto
NUXT_PROVIDER_S3_ACCESS_KEY_ID=你的access_id
NUXT_PROVIDER_S3_SECRET_ACCESS_KEY=你的secret_key
NUXT_PROVIDER_S3_PREFIX=photos/
NUXT_PROVIDER_S3_CDN_URL=

# 会话密码（32 位随机字符串，必须设置）
# 使用命令：openssl rand -base64 32（更安全）
NUXT_SESSION_PASSWORD=用上述命令生成

# GitHub OAuth
NUXT_OAUTH_GITHUB_CLIENT_ID=
NUXT_OAUTH_GITHUB_CLIENT_SECRET=
```

### 1.5 配置compose.yml
新建 /opt/chronoframe/docker-compose.yml：

```plain
# version: "3.8"
services:
  chronoframe:
    image: ghcr.io/hoshinosuzumi/chronoframe:latest
    container_name: chronoframe
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    env_file:
      - .env
```

### 1.6 启动服务
```plain
docker compose up -d
```

查看日志确认服务是否正常：

```plain
docker logs -f chronoframe
```

### 1.7 访问
+ 打开浏览器访问：

```plain
http://服务器公网IP:3000
```

+ 登录后台，上传照片，开始使用。



## 二、域名配置
### 2.1 购买域名
+ 在阿里云、腾讯云、GoDaddy 等平台购买一个您喜欢的域名（例如 `example.com`）。
+ 通常一年几十元就能买到。

### 2.2 配置域名解析
+ 在域名购买平台的控制台，找到“域名解析”或“DNS 管理”。
+ 添加一条 **A 记录**：
    - **主机记录**：`@`（代表主域名）或 `photo`（代表子域名 `photo.example.com`）
    - **记录值**：填写您的云服务器公网 IP `xxx.xxx.xxx.xxx`
    - TTL：默认即可

![image.png](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/10/UjugnzK.png)

### 2.3 申请免费 SSL 证书
#### 阿里云手动配置
##### 申请免费 SSL 证书
1. 登录 [阿里云控制台](https://home.console.aliyun.com/)。
2. 搜索 **“SSL 证书（应用型）”**。
3. 点击 **“申请证书”** → 选择 **免费证书（DV 类型）**。
    - DV 证书是最基础的，足够个人网站使用。
4. 填写你的域名（例如：www.example.com 或根域名 example.com）。

申请后，等待几分钟，证书就会签发。

![image.png](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/10/CnRhnzK.png)

---

##### 部署证书到 ECS
1. 首次需手动部署-操作文档：

[在 Linux（RHEL/CentOS/Ubuntu/Debian）下的 Nginx或Tengine服务器中安装/配置/部署 SSL证书_数字证书管理服务（原SSL证书）(SSL Certificate)-阿里云帮助中心](https://help.aliyun.com/zh/ssl-certificate/user-guide/install-ssl-certificates-on-nginx-servers-or-tengine-servers?spm=5176.2020520163.console-base_help.dexternal.6ab4kQwKkQwKFB#b7df506542fep)




2. 自动部署步骤：
+ 在 **SSL 证书列表** 找到刚签发的证书。
+ 点击 **“部署”** → 选择 **ECS 服务器**。
+ 系统会让你选择目标 ECS 实例（你的网站所在服务器）。
+ 阿里云会自动登录你的 ECS，帮你把证书配置到 **Nginx/Apache**。

---

##### 验证是否成功
+ 打开浏览器访问你的域名：https://your-domain.com
+ 地址栏会显示小锁标志，说明证书生效了。

---

##### 后续续期
+ 阿里云的免费 DV 证书有效期是 **3 个月**，到期前你需要重新申请并部署。
+ 如果不想每年手动操作，可以考虑 Let’s Encrypt 自动续期（但阿里云的免费证书已经足够方便）。



#### 其他方式
+ **最佳选择**：使用 **Let's Encrypt** 的 `certbot`工具，它可以自动获取和部署免费的 SSL 证书。
+ 在您的服务器上运行类似以下命令（具体命令取决于您的 Web 服务器）：

```plain
# 示例：如果使用 Nginx
sudo certbot --nginx -d your-domain.com

# 示例：如果暂时没有 Web 服务器，可以用独立模式先获取证书
sudo certbot certonly --standalone -d your-domain.com
```

+ 证书会自动续期，完全免费。

### 2.4 部署反向代理（Nginx）
+ 这是关键一步。您不再直接通过 `IP:3000`访问 ChronoFrame，而是：
    1. 用户访问 `https://your-domain.com`
    2. Nginx（监听 443 端口）接收到 HTTPS 请求
    3. Nginx 将请求转发给内部运行的 ChronoFrame（`localhost:3000`）
    4. ChronoFrame 处理请求，返回给 Nginx，再返回给用户
+ 这样做，Nginx 专门负责处理 SSL 加密/解密和静态文件，让 ChronoFrame 专心处理应用逻辑，性能更好也更安全。

操作文档里的 Nginx 配置示例 (`/etc/nginx/nginx.conf`)：

```plain
# 原有监听 80 端口的 server 块
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # 其它配置
    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}

# 复制已有监听 80 端口的 server 块，新增为一个新的 server 块
server {
    # 将原有 listen 80 修改为 listen 80 改为 listen 443 ssl
    listen 443 ssl;
    # 原有 server_name，可继续新增更多当前证书支持的域名
    server_name yourdomain.com www.yourdomain.com;
    
    # ======================= 证书配置开始 =======================
    # 指定证书文件（中间证书可以拼接至该pem文件中），请将 /etc/nginx/cert/ssl.pem 替换为您实际使用的证书文件的绝对路径
    ssl_certificate /etc/nginx/cert/ssl.pem;
    # 指定私钥文档，请将 /etc/nginx/cert/ssl.key 替换为您实际使用的私钥文件的绝对路径
    ssl_certificate_key /etc/nginx/cert/ssl.key;
    # 配置 SSL 会话缓存，提高性能
    ssl_session_cache shared:SSL:1m;
    # 设置 SSL 会话超时时间
    ssl_session_timeout 5m;
    # 自定义设置使用的TLS协议的类型以及加密套件（以下为配置示例，请您自行评估是否需要配置）
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    # 指定允许的 TLS 协议版本，TLS协议版本越高，HTTPS通信的安全性越高，但是相较于低版本TLS协议，高版本TLS协议对浏览器的兼容性较差
    ssl_protocols TLSv1.2 TLSv1.3;
    # 优先使用服务端指定的加密套件
    ssl_prefer_server_ciphers on;
    # ======================= 证书配置结束 =======================
   
    # 其它配置
}
```

配置好后，重启 Nginx：`sudo systemctl restart nginx`。



## 三、踩坑记录
### 3.1 循环登录

![20250929154139_rec_.gif](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/10/p4tKnzK.gif)

注意这里的 **Secure** 属性！这个属性告诉浏览器：**"这个 Cookie 只能通过 HTTPS 连接发送"**。

但是您的网站是通过 **HTTP** (`http://182.92.111.187:3000`) 访问的，所以：

1. 服务器设置了带有 `Secure`标志的会话 Cookie
2. 浏览器接收到这个 Cookie，但因为当前是 HTTP 连接，**浏览器拒绝存储这个 Cookie**
3. 下次请求时，浏览器没有发送会话 Cookie
4. 服务器认为用户没有登录，重定向到登录页
5. 循环开始...

![image.png](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/10/RupknzK.png)

换成域名{带SSL证书}就行了 nice~ 2025年09月29日22:22:57



### 3.2 照片上传失败
问题的根本原因是 **CORS（跨源资源共享）** 配置不正确。管理员需要为这个 Cloudflare R2 存储桶配置正确的 CORS 规则。

**管理员需要进行的操作：**

1. 登录到 Cloudflare R2 的控制面板。
2. 找到名为 `chronoframe-album`的存储桶。
3. 进入其 **设置（Settings）** 或 **权限（Permissions）** 部分。
4. 找到 **CORS 配置（CORS Configuration）** 区域。
5. 添加一条新的 CORS 规则，允许你的 `链接1`的域名进行访问。配置通常如下所示：

![image.png](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/10/W4PLnzK.png)

```plain
[
  {
    "allowed_origins": ["https://photo.kalami.icu"],
    "allowed_methods": ["PUT", "GET", "DELETE", "HEAD"],
    "allowed_headers": ["*"],
    "max_age_seconds": 3600
  }
]
```

+ `allowed_origins`: 指定允许跨域访问的源（你的网站域名）。不能是通配符 `*`，必须明确指定，否则签名会失效。
+ `allowed_methods`: 必须包含 `PUT`，因为上传操作需要使用该方法。
+ `allowed_headers`: 通常允许所有头信息。
+ `max_age_seconds`: 浏览器可以缓存预检请求结果的时间，3600秒（1小时）是合理的。

## 四、最终结果
欢迎访问我的图片流：https://photo.kalami.icu/

![image.png](https://pub-8869f57a52ae4837a9b3ca020e0d07fc.r2.dev/2025/10/sk9lnzK.png)