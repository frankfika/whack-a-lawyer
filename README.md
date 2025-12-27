# 打死那个律师 (Smack That Lawyer)

一个趣味打地鼠风格的小游戏，使用 DeepSeek AI 实时生成律师借口。

## 在线体验

[点击这里开始游戏](https://smack-that-lawyer.vercel.app)

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **AI 能力**: Silicon Flow API (DeepSeek-V3)
- **图标库**: Lucide React Icons
- **部署**: Vercel

## 本地运行

**前置条件:** Node.js 18+

1. 克隆项目:
   ```bash
   git clone https://github.com/frankfika/whack-a-lawyer.git
   cd whack-a-lawyer
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 在 `.env.local` 文件中设置你的 Silicon Flow API Key:
   ```
   SILICONFLOW_API_KEY=your_api_key_here
   ```

4. 启动开发服务器:
   ```bash
   npm run dev
   ```

5. 打开浏览器访问 http://localhost:3000

## 游戏说明

用正义的重锤，粉碎那些荒谬的借口！

四种类型的律师会出现：
- **BILLER** (贪婪型): 满脑子都是钱
- **PEDANT** (咬文嚼字型): 用各种规则刁难你
- **STALLER** (拖延型): 永远在走流程
- **AGGRESSOR** (好斗型): 动不动就威胁起诉

## 项目结构

```
├── index.tsx          # 应用入口
├── App.tsx            # 主应用组件
├── types.ts           # TypeScript 类型定义
├── services/
│   └── aiService.ts   # AI 服务调用
├── vite.config.ts     # Vite 配置
└── package.json
```

## 免责声明

本游戏纯属虚构，仅供娱乐发泄，请勿在法庭上模仿。

## License

MIT
