# R1 临水茶亭样板 · 当前状态

2026-11-12 · 开发分支 `feature/r1-tea-pavilion` · 草稿 PR #1 · **未部署**

## 已完成
- 亭榭台基、柱梁、格扇、四坡曲檐瓦面、白墙与月洞门，池水、园路、花木占位和晨光/薄暮交互。
- 首轮真实 Chromium 截图：1920×1080、1366×768 两档晨光/薄暮，参见 [Actions 43212419337](https://github.com/gamehack/moyushan/actions/runs/43212419337) 的 `r1-chromium-visual-evidence`；WebGL 正常、按钮可交互、脚本异常数 0。
- 首轮云端 SwiftShader 仅有约 1–2 FPS，216 Draw Calls、117k 三角形。**该软件渲染数据不能代表真实 PC 的 GPU 帧率。**
- 人工审美复核：当前树叶纸片感、白色岸石重复、地表空洞，画质明显未达标。
- 通过 Poly Haven 官方 API 成功导入 CC0 1k glTF 资产：`rock_moss_set_01`（Kless Gyzen）、`shrub_03`（Rico Cilliers）；合计约 3.57 MB，来源、作者、原始下载链接、SHA256 和文件大小在 `docs/CC0-IMPORTS.json`。

## 仍需完成
- **导入后的浏览器渲染与图片审核**；不能仅凭导入成功认定画质进步。
- 引入真正的白墙、青瓦、木构、岸石 PBR 材质；替换重复程序化树木与假山。
- 使用真实 PC GPU 测 FPS/P95、优化资源体积与 Draw Calls；再评估用户审美。
- 美术仍不达标前不扩展全园，不合并 main，不触发正式生产部署。

## 授权与成本
Poly Haven 官方资产 CC0，允许免费商用及再分发：https://polyhaven.com/license ；API 下载脚本采用唯一 User-Agent，并保留 Poly Haven 来源署名。没有引入任何付费素材/服务。
