# Nyaovo Random Image API

> 中文为主，English follows.

Nyaovo Random Image API 是一个轻量、自托管、无数据库的随机图片 API 与个人图床后台。它适合部署在自己的服务器、NAS、1Panel 或 Docker Compose 环境中，用于管理多图库图片，并按图库与设备类型随机返回图片。

项目定位是“自己可控的图片后台 + 多图库随机图接口”：后台必须登录，不提供匿名上传接口；图片直接保存在目录中，你可以通过后台上传，也可以手动把图片放进服务器目录。

## 功能特性

- Node.js 20 + Express。
- 不使用数据库，启动时扫描图片目录，运行时使用内存缓存。
- 多图库结构：`public/images/{gallery}/pc` 与 `public/images/{gallery}/mobile`。
- `pc` 用于横屏图、电脑壁纸；`mobile` 用于竖屏图、手机壁纸。
- 公开随机图 API，支持返回图片本体、JSON 或 redirect。
- 后台支持登录、创建图库、上传多图、追加选择队列、上传预览、命名前缀、筛选、排序、复制 URL、删除图片和批量管理。
- 上传时读取真实文件头识别图片类型，不依赖浏览器 mimetype；不允许 SVG、HTML、JS、PHP、EXE 等危险文件。
- Cookie Session、CSRF、Helmet、限流、CORS 配置。
- 提供 Dockerfile 和 `docker-compose.yml`，Docker 默认宿主机端口为 `3400`。
- 普通 HTML/CSS/JavaScript 后台，不使用 React/Vue，不需要前端构建步骤。

## 在线路径约定

项目统一挂在 `/image` 子路径下：

- API 首页：`/image`
- 后台：`/image/admin`
- 图片静态访问：`/image/images/...`
- API：`/image/api/...`

根路径 `/` 不放展示页面。

## 目录结构

```text
.
├── src
│   ├── index.js
│   ├── config.js
│   ├── imageStore.js
│   ├── routes
│   ├── middleware
│   └── utils
├── public
│   ├── images
│   │   ├── luotianyi
│   │   │   ├── pc
│   │   │   └── mobile
│   │   ├── miku
│   │   └── anime
│   └── assets
│       ├── style.css
│       └── admin
├── views
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .env.example
├── LICENSE
└── README.md
```

## 本地开发

```bash
npm install
cp .env.example .env
npm start
```

本地默认访问：

- API 首页：`http://localhost:3000/image`
- 后台：`http://localhost:3000/image/admin`
- 默认账号：`admin`
- 默认密码：`changeme`

首次运行后请立即修改 `.env` 中的 `ADMIN_PASSWORD` 和 `SESSION_SECRET`。

## Docker Compose 部署

```bash
docker compose up -d --build
```

Docker Compose 默认访问：

- API 首页：`http://localhost:3400/image`
- 后台：`http://localhost:3400/image/admin`

Compose 默认端口映射：

```yaml
ports:
  - "3400:3000"
```

也就是说容器内应用仍监听 `3000`，宿主机通过 `3400` 访问。

默认 volume：

```yaml
volumes:
  - ./images:/app/public/images
```

后台需要上传和删除图片，所以这个 volume 不能加 `:ro`，并且宿主机 `images` 目录需要可写。

## 1Panel 部署

1. 在 1Panel 新建 Docker Compose 编排。
2. 上传项目文件，或把仓库拉取到服务器目录。
3. 使用项目自带的 `docker-compose.yml`。
4. 修改环境变量：
   - `PUBLIC_BASE_URL` 改为你的公网地址，例如 `https://api.example.com`。
   - `ADMIN_USERNAME`、`ADMIN_PASSWORD`、`SESSION_SECRET` 改为强随机值。
5. 启动编排。
6. 在反向代理中绑定域名。
7. 建议额外给 `/image/admin` 后台路径加 IP 白名单、Basic Auth 或其他访问限制。

## 创建图库

后台进入 `/image/admin` 后，可以在“图库”区域创建图库。

图库名规则：

- 只能使用小写字母、数字、短横线、下划线。
- 不支持中文目录名。
- 不允许路径穿越。

也可以手动创建目录：

```text
public/images/luotianyi/pc
public/images/luotianyi/mobile
```

程序会定期扫描目录并刷新缓存。后台上传、删除、创建图库后会立即刷新缓存。

## 上传图片

后台上传时需要选择：

- 图库：例如 `luotianyi`。
- 类型：`pc` 或 `mobile`。
- 命名方式：自动随机命名、原文件名命名或自定义前缀命名。

支持格式：

```text
jpg, jpeg, png, webp, gif, avif
```

默认限制：

- 单文件最大 `10MB`。
- 单次最多上传 `20` 张。

扩展名写错但真实图片类型安全时，会按服务端识别到的真实类型保存，例如真实 WebP 会保存为 `.webp`。

## API 文档

### `GET /image`

返回 API 首页，展示项目名、图片统计、图库统计、调用示例和随机预览图。

### `GET /image/health`

```json
{
  "status": "ok",
  "imageCount": 0,
  "galleryCount": 3,
  "uptime": 12,
  "timestamp": "2026-05-03T12:00:00.000Z"
}
```

### `GET /image/api/random`

随机返回一张图片。默认返回图片本体。

参数：

- `gallery`：指定图库，例如 `luotianyi`。
- `device`：`pc`、`mobile`、`all`。
- `type`：`image`、`json`、`redirect`。

示例：

```text
/image/api/random
/image/api/random?gallery=luotianyi
/image/api/random?gallery=luotianyi&device=pc
/image/api/random?gallery=luotianyi&device=mobile
/image/api/random?gallery=luotianyi&device=pc&type=json
/image/api/random?gallery=luotianyi&device=mobile&type=redirect
```

JSON 返回示例：

```json
{
  "url": "https://api.example.com/image/images/luotianyi/pc/001.webp",
  "gallery": "luotianyi",
  "device": "pc",
  "filename": "001.webp",
  "size": 123456,
  "width": 1920,
  "height": 1080,
  "type": "webp",
  "total": 12
}
```

### `GET /image/api/:gallery`

指定图库快捷接口：

```text
/image/api/luotianyi
/image/api/luotianyi?device=pc
/image/api/luotianyi?device=mobile&type=json
```

### `GET /image/api/galleries`

返回所有图库统计：

```json
{
  "galleries": [
    {
      "name": "luotianyi",
      "total": 20,
      "pc": 12,
      "mobile": 8
    }
  ]
}
```

### `GET /image/api/list`

返回图片列表，不返回服务器绝对路径。

参数：

- `gallery=luotianyi`
- `device=pc`
- `limit=100`

### `GET /image/api/stats`

返回完整统计信息。

## 后台管理

- 后台路径默认是 `/image/admin`。
- `ADMIN_PATH` 可修改后台路径，但建议继续放在 `/image/xxx` 下。
- 后台必须登录。
- 不提供公开上传接口。
- 所有后台 POST 操作都有 CSRF 防护。
- 登录失败有限流。
- 图片管理支持多选、批量删除、批量移动图库、批量切换 `pc/mobile`。
- 图片卡片显示文件大小和分辨率。

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3000` | 容器内服务监听端口 |
| `PUBLIC_BASE_URL` | `http://localhost:3000` | JSON 中返回的公开 URL 前缀；Docker Compose 默认写为 `http://localhost:3400` |
| `IMAGE_ROOT` | `public/images` | 图片根目录 |
| `CACHE_TTL_SECONDS` | `60` | 图片缓存刷新间隔 |
| `RATE_LIMIT_WINDOW_MS` | `60000` | 通用限流窗口 |
| `RATE_LIMIT_MAX` | `120` | 通用限流最大请求数 |
| `ADMIN_USERNAME` | `admin` | 管理员用户名 |
| `ADMIN_PASSWORD` | `changeme` | 管理员密码 |
| `SESSION_SECRET` | `please-change-this` | Session 密钥 |
| `ADMIN_PATH` | `/image/admin` | 后台路径 |
| `MAX_FILE_SIZE_MB` | `10` | 单文件最大大小 |
| `MAX_UPLOAD_FILES` | `20` | 单次最大上传数量 |
| `CORS_ORIGIN` | `*` | CORS 来源，多个来源用逗号分隔 |

## 安全建议

- 部署前必须修改 `ADMIN_PASSWORD` 和 `SESSION_SECRET`。
- 建议把 `ADMIN_PATH` 改成不明显路径。
- 反向代理时建议给后台路径额外加访问限制。
- 不要开放匿名上传入口。
- 不要把图片目录挂载为只读。
- 定期备份 `images` 目录。

## 版权提醒

不要上传未授权图片用于公开服务。推荐使用自己拥有版权、AI 自生成、官方允许使用或已经获得授权的图片。

## 开源协议

本项目使用 MIT License。你可以自由使用、修改和分发，但请保留许可证声明。

欢迎提交 Issue、Pull Request 或改进建议。

---

# English

Nyaovo Random Image API is a lightweight, self-hosted random image API with a private admin panel. It is designed for personal image hosting, multi-gallery random image endpoints, and Docker / 1Panel deployment.

It does not use a database. Images are stored directly under `public/images`, and can be managed through the admin panel or copied manually into the server directory.

## Features

- Node.js 20 + Express.
- No database; images are scanned into an in-memory cache.
- Gallery layout: `public/images/{gallery}/pc` and `public/images/{gallery}/mobile`.
- Public random image API with `image`, `json`, and `redirect` response modes.
- Private admin panel with login, upload, preview, filtering, sorting, copy URL, delete, and batch operations.
- Real file header validation for uploads.
- Cookie Session, CSRF protection, Helmet, rate limiting, and configurable CORS.
- Dockerfile and Docker Compose included.
- Docker Compose exposes the service on host port `3400` by default.
- Plain HTML/CSS/JavaScript admin UI. No React, Vue, or build step.

## Routes

The app is mounted under `/image`:

- Home: `/image`
- Admin: `/image/admin`
- Static images: `/image/images/...`
- API: `/image/api/...`

## Quick Start

Local development:

```bash
npm install
cp .env.example .env
npm start
```

Open:

- `http://localhost:3000/image`
- `http://localhost:3000/image/admin`

Default credentials:

- Username: `admin`
- Password: `changeme`

Change `ADMIN_PASSWORD` and `SESSION_SECRET` before deployment.

## Docker Compose

```bash
docker compose up -d --build
```

Default Docker access:

- `http://localhost:3400/image`
- `http://localhost:3400/image/admin`

Default port mapping:

```yaml
ports:
  - "3400:3000"
```

The app listens on port `3000` inside the container, while the host exposes port `3400`.

Images are stored through:

```yaml
volumes:
  - ./images:/app/public/images
```

This volume must be writable because the admin panel uploads and deletes files.

## API

Random image:

```text
/image/api/random
/image/api/random?gallery=luotianyi
/image/api/random?gallery=luotianyi&device=pc
/image/api/random?gallery=luotianyi&device=mobile&type=json
```

Gallery shortcut:

```text
/image/api/luotianyi
/image/api/luotianyi?device=mobile&type=json
```

Stats and list:

```text
/image/api/galleries
/image/api/list
/image/api/stats
/image/health
```

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | Internal server port |
| `PUBLIC_BASE_URL` | `http://localhost:3000` | Public URL prefix; Docker Compose uses `http://localhost:3400` by default |
| `IMAGE_ROOT` | `public/images` | Image root directory |
| `CACHE_TTL_SECONDS` | `60` | Cache refresh interval |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window |
| `RATE_LIMIT_MAX` | `120` | Max requests per window |
| `ADMIN_USERNAME` | `admin` | Admin username |
| `ADMIN_PASSWORD` | `changeme` | Admin password |
| `SESSION_SECRET` | `please-change-this` | Session secret |
| `ADMIN_PATH` | `/image/admin` | Admin path |
| `MAX_FILE_SIZE_MB` | `10` | Max file size |
| `MAX_UPLOAD_FILES` | `20` | Max files per upload |
| `CORS_ORIGIN` | `*` | CORS origin |

## Security Notes

- Change `ADMIN_PASSWORD` and `SESSION_SECRET` before deployment.
- Consider adding extra reverse proxy restrictions for `/image/admin`.
- Do not expose anonymous upload endpoints.
- Keep the image volume writable for admin operations.
- Back up your `images` directory regularly.

## Copyright Notice

Do not upload unauthorized images for public services. Use images you own, AI-generated assets, officially permitted content, or properly licensed images.

## License

MIT License. Contributions, issues, and pull requests are welcome.
