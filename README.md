# FinalSuspect 网站项目

FinalSuspect 是一个专注于提供游戏模组指南与功能展示的网站项目，适用于 Among Us 玩家群体，尤其是对模组有兴趣的用户。本项目通过清晰的界面与结构化的内容，帮助用户快速了解模组的功能、安装方式以及相关配置。

## 站点结构

站点为纯静态页面（HTML + CSS + 原生 JavaScript，无框架、无构建步骤）：

- **主页** `/` —— 驾驶舱式入口：满屏 hero + Bento 磁贴导航 + 版本速览
- **文档区** `/FinalSuspect/` —— 简介、疑难解答、快捷键、14 项选项、7 项功能、安装教程、完整更新日志
- **统一样式** `Resource/CSS/` —— 设计令牌 / 机械感组件库 / 外壳 / 页面模板 / 动效
- **统一脚本** `Resource/JS/Nav.js` —— 一处维护全站导航、面包屑、目录、搜索与页脚

每个页面只需在 `<body>` 上声明 `data-shell` 与 `data-page`，外壳由 `Nav.js` 自动装配；
新增页面只要在 `Nav.js` 的站点树里加一条记录即可。

详细的架构说明、页面模板与维护脚本用法见 [docs/DESIGN.md](docs/DESIGN.md)。

## 本地预览

```bash
python -m http.server 8000    # 然后访问 http://127.0.0.1:8000
```

改动后建议先跑一次全站自检：

```bash
node tools/verify-site.mjs    # 检查资源引用、标签配对、死链与遗留标记
```

## 贡献者

本项目由开发者 [LezaiYa](https://github.com/NewLezaiYa) 开发。\
基于 [FinalSuspect](https://github.com/Slok7565/FinalSuspect) 模组开发。

## 开源许可

本项目遵循 AGPL-3.0 License。\
详细内容请查看 [LICENSE](LICENSE) 文件。

## 问题

如有建议或问题，请提交 [issue](https://github.com/NewLezaiYa/FinalSuspectWebsite/issues)。