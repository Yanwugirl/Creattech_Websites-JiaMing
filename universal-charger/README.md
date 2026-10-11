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
- `script.js`：七条研究内容、点击状态、物品选择、夹持与充电循环，以及可选本地模型调用。
- `assets/`：自己的像素作品、定格动画与新拍摄的拆解部件照片。

## 怎么玩

点击数字或下方的部件按钮，部件移开，右侧显示对应事实。再点击可以收回。按 Esc 或「Put it back together」可组装全部部件。

默认的扁平电池已经夹好。点击 Plug in 开始模拟充电，三盏灯亮红色；到 100% 后变绿，停止增加电量，仍插着时会累计 idle steps。点击 Unplug 断电；Use elsewhere 把电池移出夹子并消耗 20%。再点 Clip battery 夹回后可以重新充电。

选择 Flat battery / Small battery 可换另一块电池。切换会自动断开模拟电源、打开夹子，每块电池保留自己的电量。Reset 恢复初始电量。

Earphones 使用你提供的像素耳机素材。参考照片属于有线耳机，没有待充电电池，所以选中后不提供假充电；页面显示为什么不能充电。这让访客发现“万能充”的兼容边界。

所有充电数字都是设计的交互状态，不是能耗测量。两种尺寸的电池是假设兼容的示意电池，未验证实物的电压或触点。三盏灯同时红色 / 绿色是本页面的简化视觉规则，并非已确认的实物说明书。照片与像素插脚的位置是作品表达，不是电路图。

## 教师例子中的模型调用

本地运行时，选中事实后会出现 Ask the charger。它调用你自己电脑的 Ollama：

1. 已有 Ollama 时，在终端运行 `ollama pull gemma3:1b` 并启动 Ollama。
2. 在本项目文件夹中运行 `python -m http.server 8000`。
3. 打开 `http://localhost:8000/charger.html`，选部件，再点 Ask the charger。

公开 GitHub Pages 网站不运行你的本地 Ollama，所以公开页面会隐藏模型按钮。真实模型回答需在你的电脑上验证；源码不包含任何 API key，也不会把错误消息当模型回答。

## 研究与素材

七条事实有四个出处，每条都给出链接及适用范围。2017 年研究针对另一款手机充电器，不能当成这个万能充的实测数据。2024 年电子废弃物报告中的比例和总量针对全球电子废弃物。EPA 说明电子产品材料的提取、制造与回收；Hama 手册中的 0.0582 W 只属于那个型号的适配器。

充电方式参考 Hama 的官方 Delta Ovum LCD 手册第 3–5 页；它区分夹持电池与 USB 输出。指示方式因型号不同：该 LCD 型号用三格显示，另一个 Delta Ovum LED 型号用绿色闪烁 / 常亮区分充电与充满。这些都不能直接当成此万能充的真实灯码。

Hama 官方手册：https://support.hama.com/webresources/article-documents/00081/man/00081380man_cs_de_en_es_fi_fr_it_nl_pl_pt_ru_sv.pdf

有线耳机参考 Apple 的官方说明：https://support.apple.com/en-us/108042

像素万能充来自你原来的 Charge / Piskel 图层。耳机来自 New Piskel (3).zip；扁平电池来自 New Piskel (4).zip 的 sprite_1，小电池使用同一绘图缩小显示。定格动画来自自己的拆解视频。

Contacts 图片已经换成新提供的 7022e355-dc25-4879-a23a-60edd05913f5.png。外壳、线路板、插头、后壳照片来自 Untitled-4、6、7、5；Wires 展示线路板上的连线照片。灯和充电参考使用你本次上传的三张参考图。

交互结构参考同学的 `Project0_web_2026-10-09(1).zip` 和教师的 From Blender to Browser 教程。此版本重新编写代码，未复制同学的电子烟素材或研究内容。

## 展示代码时可以讲清楚的三件事

1. HTML 给每个要更新的区域一个 id。
2. JavaScript 用点击事件改变 Set、选中的物品、夹持状态和每块电池的电量。
3. CSS 读 class / data-state，决定部件位置、夹子的开合与灯的颜色。

以后要增加素材，可以替换 assets 里的图片，再改 script.js 里的路径和位移。
