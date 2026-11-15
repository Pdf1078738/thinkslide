ThinkSlide v0.1.0

输入想法或大纲，生成并编辑幻灯片与逐页讲稿，支持网页放映、本地保存、JSON 备份和原生可编辑 PPTX 导出。

## 运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000。

```bash
npm run typecheck
npm run build
```

## 功能

- 想法／按行大纲输入，设置听众、场合、时长和页数；
- 大纲、章节和要点编辑；
- 页面内容、讲稿、提示、版式、主题和强调色编辑；
- 页面新增、复制、删除和排序；
- reveal.js 放映与浏览器全屏；
- PptxGenJS 原生文本导出及逐页演讲者备注；
- 浏览器本地自动保存、JSON 导入和备份。

默认使用 `local` 生成器，无密钥也能完成完整流程。其输出仅用于原型交付，不代表真实模型质量。

## AI 配置

复制 `.env.example` 为 `.env.local`，在服务端配置：

```text
AI_PROVIDER=kimi
MOONSHOT_API_KEY=你的服务端密钥
MOONSHOT_BASE_URL=https://api.moonshot.cn/v1
MOONSHOT_MODEL=实际可用的模型名
```

不要提交 `.env.local`，不要在客户端暴露密钥。AI 适配层位于 `src/llm/`，Prompt 位于 `src/prompts/`，数据结构位于 `src/schema/`。真实模型接入后仍需单独验证模型名、输出质量和超时表现。

## API

| 接口                  | 用途                                 |
| --------------------- | ------------------------------------ |
| `POST /api/outline` | 输入演讲要求，返回结构化大纲         |
| `POST /api/decks`   | 根据定稿大纲返回完整幻灯片数据       |
| `GET /api/health`   | 返回当前生成器及配置状态，不返回密钥 |

前端通过 `src/lib/api.ts` 调用接口；页面组件不直接访问模型 Provider。
=====================================================

# thinkslide

小组课程设计，在这提交PR

>>>>>>> origin/main
>>>>>>>
>>>>>>
>>>>>
>>>>
>>>
>>
