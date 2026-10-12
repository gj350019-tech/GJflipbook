# 格致數位閱讀館 V13.5｜書卡「嵌入分享」安全整合

此套件以你提供的「目前運作正常的 index.html」為底，保留個人 Gmail 的 PUBLIC_API_URL，不更動任何刊物資料或 GAS。

## 安裝前：先備份
在 GitHub 開啟現有的 index.html，保留一份備份（或確認 GitHub 的 Commit history 可回復）。

## 安裝：僅 3 個檔案
將 ZIP 裡以下檔案，全部上傳到 GitHub 儲存庫 GJflipbook **根目錄**（同一層）：

- index.html：這份只比你提供的正式版增加 1 行 `<script src="embed-share-card-v5.js?v=1351" defer></script>`，其他程式不變。
- embed-share-card-v5.js：獨立書卡按鈕外掛。
- embed-v5.html：由你已測試成功的 V4 擴充；新增 `?select=刊物ID`，預選一冊並顯示色彩工具列。

**不要刪除**原本的 embed-v4.html，以便回退。不要上傳整包 ZIP 到 GitHub。

## 驗收
1. 打開 https://gj350019-tech.github.io/GJflipbook/ ，確認已發布刊物仍在。
2. 每張雲端 PDF／文件書卡下方應有「</> 嵌入分享」；外部網站連結刊物不會有。
3. 點按鈕開啟 `embed-v5.html?select=...`，看得到該刊物的名稱、色彩選擇、複製 HTML。
4. 複製 HTML 至校網測試頁，確認可翻頁及可全螢幕。
5. 測試原本「開啟翻頁電子書」仍正常。

## 還原
最簡單只要在 index.html 刪掉以下一行，儲存 Commit，外掛即停用，原本書櫃完全維持原狀：
`<script src="embed-share-card-v5.js?v=1351" defer></script>`

## 注意
- 閱讀館首頁依然透過 GAS 公開 API 取得刊物；此套件不解決 Chrome 登入／Cookie 造成的 GAS 偶發存取問題。
- `embed-v5.html` 直接嵌入模式：`?id=刊物ID&color=%23f5f3ed`；配色工具模式：`?select=刊物ID`。
- 本套件可進行語法靜態檢查，但正式 GitHub Pages、Google API 與校網嵌入需要你部署後驗收。
