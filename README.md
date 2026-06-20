# 志愿服务平台

基于 Vue 3 的志愿者服务平台，提供志愿活动浏览、报名审核、服务时长记录、证书生成、风采展示、排行榜等功能。

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3（组合式 API） |
| 路由 | Vue Router 4 |
| 状态管理 | Vuex 4 |
| HTTP 请求 | Axios |
| UI 组件库 | Element Plus |
| 后端模拟 | json-server（RESTful API） |

## 功能模块

- **首页** — 最新活动速览、排行 TOP5、服务统计
- **志愿活动** — 按地区/日期/类别筛选，活动详情与报名
- **报名管理** — 我的报名、管理员审核（通过/拒绝）
- **服务时长** — 服务记录查看与添加，累计时统计
- **志愿证书** — 基于服务记录一键生成证书，可打印
- **活动风采** — 活动精彩图片与报道展示
- **排行榜** — 按累计服务时长排名，星级志愿者等级
- **登录注册** — 手机号+密码登录，表单校验

## 项目结构

```
src/
├── api/              # Axios 封装及 API 接口
│   └── index.js
├── mock/             # json-server 模拟数据
│   └── db.json
├── router/           # Vue Router 路由配置（13 条，5 条带参数）
│   └── index.js
├── store/            # Vuex 状态管理
│   └── index.js
├── views/            # 页面视图
│   ├── Auth/         # 登录 & 注册
│   ├── Home/         # 首页
│   ├── Activity/     # 活动列表 & 详情
│   ├── Register/     # 报名管理 & 服务时长
│   ├── Certificate/  # 证书列表 & 详情
│   ├── Style/        # 活动风采
│   └── Ranking/      # 排行榜
├── App.vue
└── main.js
```

## 路由表

| 路径 | 名称 | 参数 | 权限 |
|------|------|------|------|
| `/login` | Login | — | 公开 |
| `/` | Home | — | 公开 |
| `/activities` | ActivityList | — | 公开 |
| `/activity/:id` | ActivityDetail | params: id | 公开 |
| `/activity/region/:region` | ActivityByRegion | params: region | 公开 |
| `/register` | Register | — | 需登录 |
| `/register/:activityId` | ActivityRegister | params: activityId | 需登录 |
| `/service-records` | ServiceRecords | — | 需登录 |
| `/certificates` | Certificates | — | 需登录 |
| `/certificate/:id` | CertificateDetail | params: id | 公开 |
| `/styles` | Style | — | 公开 |
| `/style/:id` | StyleDetail | params: id | 公开 |
| `/ranking` | Ranking | — | 公开 |

## RESTful API 端点 (json-server :3001)

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/activities` | 活动列表 |
| GET | `/activities/:id` | 活动详情 |
| GET | `/users` | 用户列表 |
| POST | `/users` | 注册 |
| GET/POST | `/registrations` | 报名查询/提交 |
| PATCH | `/registrations/:id` | 审核报名 |
| GET/POST | `/serviceRecords` | 服务记录 |
| GET/POST | `/certificates` | 证书 |
| GET | `/certificates/:id` | 证书详情 |
| GET | `/rankings` | 排行榜 |
| GET | `/styles` | 活动风采 |
| GET | `/styles/:id` | 风采详情 |

## UI 组件使用 (Element Plus)

`el-container` `el-header` `el-menu` `el-card` `el-table` `el-form` `el-input` `el-button` `el-tag` `el-select` `el-date-picker` `el-tabs` `el-dialog` `el-progress` `el-statistic` `el-descriptions` `el-icon` `el-empty` `el-alert` `el-dropdown` `el-link` `el-image`

## 快速开始

```bash
# 安装依赖
npm install

# 启动 json-server（端口 3001）
npx json-server --watch src/mock/db.json --port 3001

# 启动前端开发服务器（另一个终端）
npm run serve
```

浏览器访问 `http://localhost:8080`

## 测试账号

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 志愿者小王 | 13900000001 | 123456 |
| 志愿者小李 | 13900000002 | 123456 |
| 志愿者小张 | 13900000003 | 123456 |
