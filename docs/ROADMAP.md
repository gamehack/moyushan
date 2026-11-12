# 摸鱼山 V2｜免费重建路线图

新仓库 `gamehack/moyushan`；旧站点和 `gamehack/yunshang-xiaosi` 保留。
Three.js + TypeScript + Vite；ChatGPT 直接负责 GitHub 开发；不使用 Codex，不采购收费美术工具。

## R0 3D 工程底座
- [x] GitHub 写入、WebGL/PBR/GLB glTF 加载器、PC 镜头
- [x] 自动测试和 TypeScript/Vite CI 成功
- [x] Chromium 1920x1080 与 1366x768 场景技术检查成功

## R1 临水茶亭
- [x] 曲檐瓦面、柱梁台基、月洞门、动态池水与园路的结构样板
- [x] 晨光/薄暮灯光、真实 Chromium 两档截图；**审美复核未通过**
- [x] 从 Poly Haven 官方 API 实际导入两项 CC0 扫描石材/灌木；核验作者、MD5/SHA256 和资源体积
- [ ] 核实导入模型实际 GLTF 渲染、坐标和遮挡，生成第二轮截图
- [ ] 高清 PBR 墙瓦木石、水岸光照和真实树木资产代替程序化占位
- [ ] 12–20 张苏州园林设计参考链接，明确照片只用于参考、不打包
- [ ] 用户审美验收后，才可开始全园扩展

## R2 交互及发布（R1 达标后）
- [ ] 第三人称漫游、碰撞导航、座椅和音景
- [ ] PC 真实 GPU 60 FPS 目标及持续运行验证
- [ ] 另行申请生产发布授权

## 闸门
当前一切开发在草稿 PR #1，禁止自动合并 `main`、禁止触发 `banrixian.pages.dev`。
