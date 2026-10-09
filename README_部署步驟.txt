格致數位閱讀館 V8｜公開前台部署說明

重要：保留目前 V7 已成功的「私人管理後台」部署及程式，不要改成「任何人」。
V8 使用另一個獨立 Apps Script 專案，只有公開讀取功能，安全性比同一專案的兩個部署更清楚。

【A. 取得 V7 Google Sheets ID】
1. 開啟 setupLibrary 建立的「格致數位閱讀館_刊物資料」試算表。
2. 複製網址 /d/ 與 /edit 之間的 ID（不是整段網址）。

【B. 建立獨立公開 API】
1. 到 script.google.com 新增 Apps Script 專案，例如「格致閱讀館_公開唯讀」。
2. 將 PublicReadOnly.gs 的內容貼入新專案 Code.gs，儲存。
3. 專案設定 → 指令碼屬性 → 新增 SHEET_ID，值填上步驟 A 的 ID。
4. 執行 getPublished_ 一次，完成 Google Sheets 存取授權（執行記錄無錯誤）。
5. 部署 → 新增部署 → 網頁應用程式；執行身分「我」，存取權「任何人」，部署。
6. 複製公開 /exec 網址。此專案沒有新增、修改、刪除功能。

【C. 設定公開網站】
1. 開啟 index.html，尋找 PASTE_PUBLIC_WEB_APP_URL_HERE，替換成步驟 B 的公開 /exec 網址。
2. 尋找 PASTE_ADMIN_WEB_APP_URL_HERE，替換成 V7 原本只有你能開啟的後台 /exec 網址。
3. 將 index.html 與 assets 資料夾上傳至 GitHub Pages 或 Vercel 的靜態網站（不要上傳任何 .gs 檔）。
4. 使用無痕視窗開啟公開網站，應看到 V7 發布的「圖書館館訊（測試）」，點擊會開新分頁。
5. 回到私人後台將測試刊物改為「草稿」，重新整理公開網站，該筆應消失；再發布應重新出現。
6. 公開網址 + ?callback=testCallback 可測試回傳 JSONP，確認僅含 published 資料。

【注意】
- V8 的《格致青年》四版是隨站附上的靜態範例，尚非由 Google Sheets 自動上傳 PDF。
- 目前管理後台 V7 只能新增外部網址刊物，PDF 上傳及自動轉頁仍未開發。
- 若公開網站無法讀取，先確認新專案的 SHEET_ID、部署權限、授權及 /exec 網址。
- 學校 Google Workspace 若禁止「任何人」部署，請不要放寬既有私人後台權限；改採其他公開資料服務。
- 建議以非管理員帳號或無痕模式驗證公開前台能閱讀，且無法進入私人後台。
- Google Apps Script 的公開 JSONP 端點僅提供公開資料，請勿在刊物欄位填入敏感個資。
