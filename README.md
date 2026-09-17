# 釣魚樂園 Fishing Paradise

> 一個在瀏覽器上玩的釣魚小遊戲：拋竿、等魚咬餌、敏捷收竿，收集不同大小與稀有度的魚。100% 前端（Vanilla JS + HTML5 Canvas），**永久免費部署於 GitHub Pages**。

## 遊戲玩法

1. 點擊水面**拋竿**
2. 觀察浮標旁的**魚影接近**，魚即將來咬餌
3. 魚**咬餌**時浮標劇烈抖動、水面出現波紋與「！！」— 快點擊收竿！
4. 中鉤後收線，釣起魚隻並結算
5. 魚有 **大小、重量、稀有度、分數**：
   - 稀有度：普通 → 稀有 → 珍貴 → 史詩 → 傳說（愈稀有，咬餌窗口愈短、愈難中鉤、分數倍率愈高）
   - 大小與重量影響分數；傳說魚有金色光暈
6. 每次釣獲都會存入 **圖鑑**（按稀有度排列），進度自動儲存於瀏覽器 (localStorage)

## 立即遊玩

- 本地開發：`npm run dev` → 開啟 http://localhost:5173
- 線上版本：`https://cling3279-alt.github.io/default-project/`（GitHub Pages）

## 專案結構

```
├── .github/workflows/   # CI + GitHub Pages 部署
├── src/
│   ├── game/
│   │   ├── fishData.js      # 魚種與稀有度資料（分數公式）
│   │   ├── fishing.js       # 釣魚狀態機（拋竿/咬餌/收竿/結算）
│   │   └── waterScene.js    # Canvas 水場景渲染
│   ├── main.js              # 輸入、HUD、圖鑑 UI
│   └── style.css
├── tests/unit/fishing.test.js
├── index.html
└── vite.config.js
```

## 開發指令

```bash
npm run dev          # 本地開發伺服器
npm run test         # 單元測試（Vitest）
npm run lint         # ESLint 檢查
npm run format       # Prettier 格式化
npm run build        # production build
npm run preview      # 預覽 build 結果
```

## 部署到 GitHub Pages（永久免費）

每次 push 到 `main`，`.github/workflows/deploy.yml` 會自動：
1. `npm ci && npm run build`
2. 以 `VITE_BASE_URL=/default-project/` 組出正確路徑
3. 透過 `actions/deploy-pages` 上傳到 GitHub Pages

後續只要 `git push` 就會自動更新線上版本。

## 環境變數

複製 `.env.example` 為 `.env`：

- `VITE_BASE_URL`：部署路徑（本地維持 `/`，Pages 用 `/default-project/`）
- `VITE_PORT`：開發伺服器埠號

## 技術棧

- Vite 6 + Vanilla JavaScript（模組化 ES Modules）
- Vitest 5（單元測試）
- ESLint + Prettier（程式碼品質）
- GitHub Actions + GitHub Pages（CI + 免費託管）

## License

MIT