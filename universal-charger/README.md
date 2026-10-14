# Universal charger

普通 HTML / CSS / JavaScript 项目。没有框架或打包步骤；本地 Ollama 通过一个 Node.js helper 调用，不使用付费 API。

公开网页：https://yanwugirl.github.io/Universal-charger/universal-charger/charger.html

## Windows 一键打开网页

1. 下载最新版源码包，右键「全部解压」。
2. 打开 Ollama 应用。
3. 进入包含 charger.html 和 server.js 的 universal-charger 文件夹，双击 start.cmd。
4. 启动成功后会尝试打开浏览器，保持黑色启动窗口运行。如果浏览器没有自动打开，复制窗口中 Universal charger: 后面的完整网址，粘贴到 Chrome / Edge 的地址栏，再按 Enter。

启动文件会自动定位项目目录并检查 Node.js。如果 Ollama 正在运行但缺少 gemma3:1b，它会下载模型。端口 8000 被占用时，网页服务器会尝试 8001、8002 等，并打开实际使用的地址。

本地网址指向你自己的电脑；网页服务器成功运行后才能访问。下载 Ollama 是模型程序，网页还需要 server.js 提供页面和 JSON。电脑缺少 Node.js 时，启动窗口会给出明确提示：到 https://nodejs.org/en/download 安装 Windows 的 LTS 版本，再双击 start.cmd。

如果窗口已经显示 Universal charger: http://127.0.0.1:8000/charger.html，说明网页服务已成功启动。浏览器没有弹出时，可以直接把该网址粘贴到浏览器地址栏。端口被占用时复制窗口显示的实际地址。新版先用 PowerShell 的 Start-Process 打开默认浏览器，失败后再用修正参数传递方式的 CMD start；两种方式失败都会明确提示手动网址。Windows 的默认浏览器关联若有问题，仍可在已经打开的 Chrome / Edge 中手动访问。

如果手动访问也失败，保留启动窗口，把浏览器错误和启动窗口最后几行文字发来。

## 在 VS Code 中打开

1. 解压整个文件夹，不要只拿出 HTML。
2. 在 VS Code 选择「文件 → 打开文件夹」。
3. 打开 `charger.html`、`style.css`、`script.js`。
4. 双击 `start.cmd`，或者在「终端 → 新建终端」运行 `node server.js --open`。浏览器会打开实际运行地址；保持服务器窗口运行。JSON 读取与模型调用需要通过这个本地服务器运行。

## 三个文件分别做什么

- `charger.html`：左侧物件、右侧事实卡、充电区域和按钮。
- `style.css`：两列布局、部件位移、像素放大和逐帧动画。
- `script.js`：读取 JSON、点击状态、物品选择、夹持与充电循环，以及 Ollama 连接检查与模型按钮。
- `data/facts.json`：七条研究内容、对应照片、出处与适用范围。
- `server.js`：本地网页服务器，转交 Ollama API 请求。
- `start.cmd`：Windows 一键启动，检查 Node.js、准备模型并打开浏览器。
- `assets/`：自己的像素作品、定格动画与新拍摄的拆解部件照片。

## 怎么玩

点击数字或下方的部件按钮，部件移开，右侧显示对应事实。再点击可以收回。按 Esc 或「Put it back together」可组装全部部件。

5 号 Wires 展开时移到物件左侧，显示在盖子前方。淡色接线增加细暗边便于辨认，数字按钮也随部件移动；再次点击 5 可以收回。

默认的扁平电池已经夹好。点击 Plug in 开始模拟充电，三盏灯亮红色；到 100% 后变绿，停止增加电量，仍插着时会累计 idle steps。点击 Unplug 断电；Use elsewhere 把电池移出夹子并消耗 20%。再点 Clip battery 夹回后可以重新充电。

选择 Flat battery / Small battery 可换另一块电池。切换会自动断开模拟电源、打开夹子，每块电池保留自己的电量。Reset 恢复初始电量。

Earphones 使用你提供的像素耳机素材，按最新参考图作为可充电耳机。选择后打开夹子，点击 Clip earphone 夹住，再点 Plug in 即可模拟充电。它有独立电量，初始为 30%；同样显示红灯充电、绿灯满电，可以拔下、使用和再次充电。照片不能确认耳机型号、触点电压与充电电路，所以页面明确说明：兼容连接是这个实验的假设。

耳机横着放，两片黄色接线片在屏幕上也是横向，一上一下与耳机末端相接；夹好充电时，接线片固定在盖子上。旁边的黄色像素闪电来自你提供的 New Piskel (2).zip 中的 sprite_2.png。两种电池和耳机都在充电期间显示小闪电，满电或断电后隐藏。系统开启「减少动态效果」时，充电中的闪电会保持静止。

正面看着物件时，玻璃夹朝观看者、屏幕外的方向张开。CSS 的 transform-origin 对应原始 32 × 32 图中 (16, 6) 的位置，锚点固定在底座上。rotateZ(90deg) 只负责摆正素材，开合使用 rotateY(0deg → 65deg)，让夹子自由端进入朝观看者的正 Z 方向。perspective(600px) 呈现夹子靠近观看者时的透视，镜头保持正面。三盏方形灯在锚点右侧竖着排列。

玻璃盖子和两个黄色接线片放在同一个 charge-clip 容器中，一起旋转开合。接线片用盖子内部的局部坐标定位，并画在玻璃盖子上方；打开后不会留在底座上。切换耳机时，接线片的位置也在这个容器内调整。

所有充电数字都是设计的交互状态，不是能耗测量。两种尺寸的电池是假设兼容的示意电池，未验证实物的电压或触点。三盏灯同时红色 / 绿色是本页面的简化视觉规则，并非已确认的实物说明书。照片与像素插脚的位置是作品表达，不是电路图。

## Ollama 模型调用：在你的电脑上演示

需要 Node.js 18 或以上，以及你已经安装的 Ollama。这个本地调用不需要付费 API key。网页通过 server.js 转交请求，因此不用设置跨域环境变量。

1. 下载最新源码，解压后在 VS Code 打开整个 universal-charger 文件夹。
2. 打开 Ollama 应用，保持它运行。
3. 在 VS Code 的「终端 → 新建终端」执行：
   ```powershell
   ollama pull gemma3:1b
   ```
   第一次会下载模型。下载完成后可以运行 `ollama list`，确认列表中有 `gemma3:1b`。
4. 在同一个项目终端执行：
   ```powershell
   node server.js --open
   ```
5. 保留终端运行，浏览器会自动打开本地网页。如果没有自动打开，复制终端打印的网址；端口可能是 8000 或下一空闲端口。
6. 右侧显示 “Ollama ready” 后，点击任一部件，再点 **Ask the charger**。如果显示缺少模型或 Ollama 未运行，按提示处理后点 **Check connection**。
7. 真实生成的回答会出现在按钮下方，并标有 “AI-generated reflection · Ollama / gemma3:1b”。第一条回答可能需要约一分钟；报错时会显示错误提示，没有预写的假回答。

按 Ctrl+C 停止网页服务器。端口 8000 被占用时会自动尝试其他本地端口；使用终端打印的实际网址。如果终端不认识 `node`，需要先安装 Node.js；如果不认识 `ollama`，重新打开终端后再试。

公开 GitHub Pages 保留拆解、JSON 事实和充电交互。Ollama 模型按钮在本地网页显示，因为 GitHub Pages 不运行 server.js，也不能连接你的电脑。课堂演示请使用上面的本地网址。

## 给教授展示调用过程

- `data/facts.json`：七条整理过的研究事实，每个可拆部件有一条，保留真实来源和适用范围。
- `script.js` 的 `loadFacts()`：用 fetch 读取 JSON，再填充右侧卡片。
- `script.js` 的模型按钮：POST /api/ask，提交当前部件的 id。
- `server.js`：从同一 JSON 读事实，把事实、出处和限制加入 prompt，然后调用 Ollama 的 /api/generate，使用 stream: false。
- 浏览器 F12 → Network：查看 /api/ask 的请求和真实 response。界面中 “AI-generated reflection” 标记把生成的反思与有来源的事实分开。

prompt 以旧万能充的第一人称说两句简单英文，回应当前事实，并问一个关于照顾、维修或拔电的小问题。它要求模型不编造数据、不确定未知材料、不把其他产品的研究当成这个物件的实测。小模型仍可能答错，研究依据以卡片的来源为准。可以在 server.js 顶部修改 PROMPT，让它成为你自己的物件声音。

接入和错误流程已使用测试接口检查；当前运行环境没有真实 Ollama 模型，**一次真实模型调用仍需在你的电脑上完成**。成功标准是按钮显示模型生成的回答，并且 /api/ask 返回 HTTP 200 和非空的 response。

Ollama 官方说明：https://docs.ollama.com/api/generate  
模型列表接口：https://docs.ollama.com/api/tags  
模型：https://ollama.com/library/gemma3:1b

## 研究与素材

七条事实有四个出处，每条都给出链接及适用范围。2017 年研究针对另一款手机充电器，不能当成这个万能充的实测数据。2024 年电子废弃物报告中的比例和总量针对全球电子废弃物。EPA 说明电子产品材料的提取、制造与回收；Hama 手册中的 0.0582 W 只属于那个型号的适配器。

充电方式参考 Hama 的官方 Delta Ovum LCD 手册第 3–5 页；它区分夹持电池与 USB 输出。指示方式因型号不同：该 LCD 型号用三格显示，另一个 Delta Ovum LED 型号用绿色闪烁 / 常亮区分充电与充满。这些都不能直接当成此万能充的真实灯码。

Hama 官方手册：https://support.hama.com/webresources/article-documents/00081/man/00081380man_cs_de_en_es_fi_fr_it_nl_pl_pt_ru_sv.pdf

耳机接触充电结构参考专利 CN213586214U：https://patents.google.com/patent/CN213586214U/zh 。该设计包含可调充电触点、夹持结构和充电管理电路；不能据此证明照片中这个旧万能充一定匹配该耳机。

像素万能充来自你原来的 Charge / Piskel 图层。耳机来自 New Piskel (3).zip；扁平电池来自 New Piskel (4).zip 的 sprite_1，小电池使用同一绘图缩小显示。定格动画来自自己的拆解视频。

Contacts 图片已经换成新提供的 7022e355-dc25-4879-a23a-60edd05913f5.png。外壳、线路板、插头、后壳照片来自 Untitled-4、6、7、5；5 号 Wires 的配图来自新提供的 4ad9c346-041d-4271-8d37-4b5d7b991ee7.png，去除白色留边后按原比例缩小。耳机参考图更新为 72bc3d88-b029-4d81-99da-4bca75af887d.png；另外两张锚点标注图只用于校正 CSS，不会把标记画进作品。

交互结构参考同学的 `Project0_web_2026-10-09(1).zip` 和教师的 From Blender to Browser 教程。此版本重新编写代码，未复制同学的电子烟素材或研究内容。

## 展示代码时可以讲清楚的三件事

1. HTML 给每个要更新的区域一个 id。
2. JavaScript 用点击事件改变 Set、选中的物品、夹持状态和每块电池的电量。
3. CSS 读 class / data-state，决定部件位置、夹子的开合与灯的颜色。

以后要增加素材，可以替换 assets 里的图片，再改 script.js 里的路径和位移。
