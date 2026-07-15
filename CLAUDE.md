# [项目名称] - Claude Code配置

## 1. 项目概览
- **项目描述**：[一句话描述项目用途]
- **技术栈**：[主要技术栈列表]
- **当前阶段**：[开发/测试/生产]

## 2. 代码规范
### 通用规则
- 所有代码必须有类型注解
- 函数不超过50行，类不超过300行
- 禁止使用any类型（特殊情况需注释说明）

### 命名约定
- 文件名：kebab-case（如 user-service.ts）
- 类名：PascalCase（如 UserService）
- 函数/变量：camelCase（如 getUserById）
- 常量：UPPER_SNAKE_CASE（如 MAX_RETRY_COUNT）

### 文档要求
- 所有公共API必须有JSDoc/TSDoc注释
- 复杂业务逻辑必须有流程说明
- 使用中文注释，代码用英文

## 3. 安全规则
### 禁止行为
- 禁止在代码中硬编码敏感信息
- 禁止提交.env文件到仓库
- 禁止在日志中输出用户隐私数据

### 必须行为
- 所有输入必须验证和消毒
- 数据库查询必须使用参数化
- API必须有速率限制

## 4. 测试要求
- 新功能必须有单元测试
- 核心逻辑测试覆盖率>80%
- 集成测试必须覆盖主要用户流程

## 5. Git规范
### 分支命名
- feature/xxx：新功能
- fix/xxx：bug修复
- refactor/xxx：重构
- docs/xxx：文档更新

### 提交信息
格式：`<type>(<scope>): <description>`

类型：feat、fix、docs、style、refactor、test、chore

## 6. 项目特殊说明
[项目特有的规则和注意事项]