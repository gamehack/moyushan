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

## 新增布景修复（待 CI 与真实截图复核）
- 增大实测过小的扫描灌木比例，沿池岸散布已经取得 CC0 授权的扫描石材，移除重复白色圆石视觉占位。
- 将严重遮挡主视野的右前方树木移至远景；本轮保持一个临水茶亭样板，不扩充全园。
- 仍不属于最终写实美术，需检查扫描素材重复感、地表贴图与真实 PC 性能。

## Chromium 回归故障修复
- 大量重复 GLTF 扫描模型导致 GitHub 软件渲染无法在原等待窗口内完成初始化；减少扫描实例为 6 组石材、3 组灌木（另有各一组基础模型），等待新 CI 截图验证。
- 浏览器测试显式区分 `sceneReady=true` 和 `sceneReady=error`，在报错时保存截图和错误说明；修复 Playwright `waitForFunction` 超时参数位置。
- 前次 Actions 43215411229 的 Chromium 回归失败已保留，不视为通过。

## 2026-11-12 软件渲染截图超时处理
- Actions 43215994149 显示模型初始化成功，Chromium 软件渲染在 1920×1080 截图环节 30 秒超时；不是 TypeScript 编译错误。
- 引入只用于自动化检查的 `?ci=1` 模式，降至 0.55 DPR 并关闭实时阴影以减轻无 GPU runner 负载；普通用户访问不带此参数，保留完整渲染配置。
- CI 截图记录 `visualFidelity=ci-software-reduced`，不可把这种低质量截图作为最终美术验收或真实 GPU 性能证据。
