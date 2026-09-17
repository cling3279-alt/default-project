# <center>

| Key     | Value     |
| ------- | --------- |
| Canvas  | `#1a1a2e` |
| Primary | `#e94560` |
| Accent  | `#0f3460` |
| Text    | `#eaeaea` |

# <center>

# Default Project

> 一個使用 Vanilla JavaScript + HTML5 Canvas 打造的網頁小遊戲，以 Vite 為開發伺服器、Vitest 進行單元測試、ESLint + Prettier 統一程式碼風格，並以 Python 輔助測試與自動化腳本。

## 功能特色

- HTML5 Canvas 遊戲迴圈（`requestAnimationFrame` + 固定 FPS）
- 模組化架構：`core` / `entities` / `systems`
- 透過 Vite dev server 提供熱重載開發體驗
- 單元測試（Vitest）與端對端測試測試框架
- 支援多種環境設定（`.env`）
- GitHub Actions CI 自動化測試

## 專案結構

```
├── .github/workflows/   # CI/CD workflow
├── config/              # 執行期設定
├── docs/                # 文件
├── public/              # 靜態資源（直接進到 build 根目錄）
├── scripts/             # 開發/部署腳本
├── src/
│   ├── assets/          # 圖片、音效、字型
│   ├── game/
│   │   ├── core/        # 遊戲迴圈、Input、Render
│   │   ├── entities/    # 玩家、敵人、道具等
│   │   └── systems/     # 碰撞、粒子、音效系統
│   └── utils/           # 工具函式
├── tests/
│   ├── unit/            # 單元測試
│   └── e2e/             # 端對端測試
├── index.html
├── package.json
└── vite.config.js
```

## 安裝

### 前置需求

| 工具    | 最低版本 | 建議版本 |
| ------- | -------- | -------- |
| Node.js | 20       | 24       |
| npm     | 10       | 11       |
| Python  | 3.11     | 3.13     |
| Git     | 2.40     | 2.55     |

### 安裝相依套件

```bash
npm install
```

Python 測試/腳本相依：

```bash
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements-dev.txt
```

## 使用方式

```bash
npm run dev        # 啟動開發伺服器 (預設 http://localhost:5173)
npm run test       # 執行單元測試
npm run lint       # 程式碼檢查
npm run build      # 建置 production
npm run preview    # 預覽 production build
```

## 環境變數

複製 `.env.example` 為 `.env` 並依需求修改。所有 `VITE_` 前綴的變數會注入前端程式碼（透過 `import.meta.env`）。

```bash
cp .env.example .env
```

## 測試

- 單元測試（Vitest）：`npm run test`
- 類型/風格檢查（ESLint）：`npm run lint`
- 格式（Prettier）：`npm run format`

## 部署

GitHub Actions 會在每次 push 到 `main` 或開啟 PR 時自動執行 lint 與測試，流程定義於 `.github/workflows/ci.yml`。

## License

MIT
