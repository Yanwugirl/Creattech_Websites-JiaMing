# Universal charger

普通 HTML / CSS / JavaScript 项目。没有框架、打包步骤或付费 API。

公开网页：https://yanwugirl.github.io/creattech_websites-JiaMing/universal-charger/charger.html

## 在 VS Code 中打开

1. 解压整个文件夹，不要只拿出 HTML。
2. 在 VS Code 选择「文件 → 打开文件夹」。
3. 打开 `charger.html`、`style.css`、`script.js`。
4. 基本网页可以直接双击 `charger.html` 打开。也可以右键 HTML → Open with Live Server。

## 三个文件分别做什么

- `charger.html`：左侧物件、右侧事实卡、充电区域和按钮。
- `style.css`：两列布局、部件位移、像素放大和逐帧动画。
- `script.js`：四条研究内容、点击状态、充电循环和可选本地模型调用。
- `assets/`：自己的像素作品、定格动画与新拍摄的拆解部件照片。

## 怎么玩

点击数字或下方的部件按钮，部件移开，右侧显示对应事实。再点击可以收回。按 Esc 或「Put it back together」可组装全部部件。

点击 Plug in，模拟电量从 20% 上升。到 100% 后仍插着时，会累计 idle steps。点击 Unplug 停止；Use some charge 消耗 20%，可以再充。Reset 从头开始。

所有充电数字都是设计的交互状态，不是能耗测量。照片与像素插脚的位置只是作品表达，不是电路图或维修操作说明。

## 教师例子中的模型调用

本地运行时，选中事实后会出现 Ask the charger。它调用你自己电脑的 Ollama：

1. 已有 Ollama 时，在终端运行 `ollama pull gemma3:1b` 并启动 Ollama。
2. 在本项目文件夹中运行 `python -m http.server 8000`。
3. 打开 `http://localhost:8000/charger.html`，选部件，再点 Ask the charger。

公开 GitHub Pages 网站不运行你的本地 Ollama，所以公开页面会隐藏模型按钮。真实模型回答需在你的电脑上验证；源码不包含任何 API key，也不会把错误消息当模型回答。

## 研究与素材

四条事实有两个研究出处，每条都给出链接及适用范围。2017 年研究针对另一款手机充电器，不能当成这个万能充的实测数据。2024 年电子废弃物报告中的比例针对全球电子废弃物。

像素万能充来自你原来的 Charge / Piskel 图层。右侧三个图形来自新上传的 New Piskel (1).zip。照片来自 Untitled-4、6、7、15。定格动画来自自己的拆解视频。

交互结构参考同学的 `Project0_web_2026-10-09(1).zip` 和教师的 From Blender to Browser 教程。此版本重新编写代码，未复制同学的电子烟素材或研究内容。

## 展示代码时可以讲清楚的三件事

1. HTML 给每个要更新的区域一个 id。
2. JavaScript 用点击事件改变 Set、battery 和 pluggedIn 的状态。
3. CSS 读 class / data-state，决定部件位置和闪电动画。

以后要增加素材，可以替换 assets 里的图片，再改 script.js 里的路径和位移。
