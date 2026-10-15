# Course showcase

课程博客：https://yanwugirl.github.io/Creattech_Websites-JiaMing/

万能充交互作品已迁移至独立仓库：[Project-0-](https://github.com/Yanwugirl/Project-0-)。

在 VS Code 打开新仓库文件夹后，在终端运行：

```powershell
node server.js --open
```

也可以双击新仓库中的 `start.cmd`。展示真实模型回答时保持 Ollama 运行。

课程博客继续在本仓库更新，万能充作品后续在新仓库更新。本仓库保留原有 Git 提交历史。

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
