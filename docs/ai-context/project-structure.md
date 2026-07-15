# docs/ai-context/project-structure.md 示例

## 项目技术栈
- 前端：React 18 + TypeScript 5.0 + Vite 5
- 后端：Node.js 20 + Fastify 4
- 数据库：PostgreSQL 15 + Prisma ORM
- 缓存：Redis 7
- 部署：Docker + Kubernetes

## 核心模块
### 用户模块 (src/modules/user/)
- 负责用户注册、登录、权限管理
- 依赖：JWT认证、bcrypt加密

### 订单模块 (src/modules/order/)
- 负责订单创建、支付、状态管理
- 依赖：用户模块、支付网关

## 代码生成约定
- 所有API响应使用统一格式：{ data, error, meta }
- 数据库操作必须使用Prisma Client
- 所有日期时间使用UTC时区