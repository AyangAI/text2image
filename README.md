# 文字转图片小程序

一个基于微信小程序的文字转图片应用，支持用户注册、登录和AI图片生成功能。

## 功能特性

- 用户注册和登录系统
- 文字转图片AI生成
- 图片保存到相册
- 用户数据管理
- 进度显示和错误处理

## 环境配置

### 1. 豆包AI API配置

本项目使用豆包AI的图片生成API，需要配置以下环境变量：

#### 云函数环境变量配置

在微信开发者工具中，为 `text2image` 云函数配置环境变量：

1. 打开微信开发者工具
2. 进入云开发控制台
3. 选择"云函数" -> "text2image"
4. 点击"版本管理" -> "环境变量"
5. 添加以下环境变量：

```
DOUBAO_API_KEY=your_doubao_api_key_here
```

#### 获取豆包AI API密钥

1. 访问豆包AI官网：https://www.volcengine.com/product/doubao
2. 注册并登录账号
3. 创建应用并获取API密钥
4. 将密钥配置到云函数环境变量中

### 2. 微信小程序配置

1. 在微信公众平台注册小程序
2. 获取小程序的AppID
3. 在 `project.config.json` 中配置AppID
4. 开启云开发功能

### 3. 本地开发环境

#### 安装依赖

```bash
# 为各个云函数安装依赖
cd cloudfunctions/checkUser && npm install
cd ../clearUserData && npm install  
cd ../register && npm install
cd ../text2image && npm install
```

#### 云函数依赖说明

- `checkUser`: 用户验证云函数
- `clearUserData`: 清除用户数据云函数
- `register`: 用户注册云函数
- `text2image`: 图片生成云函数（需要 `request-promise` 依赖）

## 项目结构

```
miniprogram-2/
├── cloudfunctions/          # 云函数目录
│   ├── checkUser/          # 用户验证
│   ├── clearUserData/      # 清除用户数据
│   ├── register/           # 用户注册
│   └── text2image/         # 图片生成
├── miniprogram/            # 小程序前端代码
│   ├── pages/             # 页面文件
│   │   ├── index/         # 首页（注册/登录）
│   │   └── imageGen/      # 图片生成页面
│   └── utils/             # 工具函数
└── project.config.json    # 项目配置文件
```

## 部署说明

1. 确保已配置所有必要的环境变量
2. 上传并部署所有云函数
3. 在微信开发者工具中预览或发布小程序

## 注意事项

- 请勿将API密钥等敏感信息提交到版本控制系统
- 环境变量必须在云函数控制台中配置
- 确保小程序已开启云开发功能
- 图片生成功能需要网络连接

## 隐私保护

- 所有敏感信息（API密钥、用户数据）均通过环境变量或云数据库管理
- 不在代码中硬编码任何密钥信息
- 用户数据存储在微信云数据库中，符合微信隐私政策

## 云开发基础能力

本项目基于微信云开发构建，使用了以下基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

