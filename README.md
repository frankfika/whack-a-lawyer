# 打死那个律师 (Smack That Lawyer)

一个趣味打地鼠风格的小游戏，使用 DeepSeek AI 实时生成律师借口。

## 技术栈

- React 19 + TypeScript
- Vite
- Silicon Flow API (DeepSeek-V3)
- Lucide React Icons

## 本地运行

**前置条件:** Node.js

1. 安装依赖:
   ```bash
   npm install
   ```

2. 在 `.env.local` 文件中设置你的 Silicon Flow API Key:
   ```
   SILICONFLOW_API_KEY=your_api_key_here
   ```

3. 启动开发服务器:
   ```bash
   npm run dev
   ```

4. 打开浏览器访问 http://localhost:3000

## 游戏说明

用正义的重锤，粉碎那些荒谬的借口！

四种类型的律师会出现：
- **BILLER** (贪婪型): 满脑子都是钱
- **PEDANT** (咬文嚼字型): 用各种规则刁难你
- **STALLER** (拖延型): 永远在走流程
- **AGGRESSOR** (好斗型): 动不动就威胁起诉

## 免责声明

本游戏纯属虚构，仅供娱乐发泄，请勿在法庭上模仿。
