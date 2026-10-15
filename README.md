# Universal charger and course showcase

万能充交互作品的代码在 [universal-charger/](universal-charger/) 中

- 万能充网页：https://yanwugirl.github.io/Creattech_Websites-JiaMing/universal-charger/charger.html
- 课程博客：https://yanwugirl.github.io/Creattech_Websites-JiaMing/

在 VS Code 打开整个仓库后，可直接在根目录终端运行：

```powershell
node universal-charger/server.js --open
```

也可以打开 `universal-charger` 文件夹，双击其中的 `start.cmd`。展示真实模型回答时保持 Ollama 运行。

本仓库保留迁移前的完整 Git 提交历史。后续修改均在此仓库进行。

---

# Creative Technologies MSc: showcase site template

Your weekly blog and project showcase for Creative Tech 1, Ideas in Art & Tech, and
Creative Industry Research.

## Get your own copy

1. Click **Use this template → Create a new repository**.
2. Owner: your GitHub account. Name: `creattech_websites`. Visibility: **Public**
   (free GitHub Pages needs a public repo). Click **Create repository**.
3. In your new repo: **Settings → Pages → Build and deployment**. Set Source to
   **Deploy from a branch**, Branch to **main** and **/ (root)**, then click **Save**.

Your site will be at `https://<your-username>.github.io/creattech_websites/`.

## Write posts locally

```
npm install
npm run cms
```

Open `index.html` with VS Code's Live Server, then go to `http://127.0.0.1:<port>/admin/`.
The editor saves to files on your laptop. `git add .`, `git commit -m "…"` and `git push`
publish them. The full walkthrough is in the module's *From Shell to Sprites* tutorial.

`/admin/` only works on your laptop. On the published site it can't sign in, so ignore it there.
