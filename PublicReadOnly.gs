/** 格致數位閱讀館 V8：獨立公開唯讀 API
 * 請建立「另一個」Apps Script 專案，切勿在此專案加入任何寫入/刪除方法。
 * 指令碼屬性 SHEET_ID 設為 V7 setupLibrary 所建立的 Google Sheets ID。
 * 以擁有者身分執行，部署為任何人可存取；只回傳 published 資料。
 */
const SHEET_NAME = 'Publications';
const FIELDS = ['id','title','category','issue','description','mode','url','coverUrl','fileId','status','createdAt','updatedAt'];
function doGet(e) {
  const callback = String((e && e.parameter && e.parameter.callback) || '');
  if (!/^[A-Za-z_$][\w$]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput('Invalid callback').setMimeType(ContentService.MimeType.TEXT);
  }
  let payload;
  try { payload = {ok:true,items:getPublished_()}; }
  catch (err) { console.error(err); payload = {ok:false,error:'目前無法取得刊物資料'}; }
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(payload).replace(/</g,'\\u003c') + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function getPublished_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw Error('尚未設定 SHEET_ID');
  const sh = SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
  if (!sh) throw Error('找不到 Publications 工作表');
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  const head = data[0].map(String);
  const pos = Object.fromEntries(FIELDS.map(k=>[k,head.indexOf(k)]));
  if (['id','title','status','mode','url'].some(k=>pos[k]<0)) throw Error('欄位不符');
  return data.slice(1).filter(row=>String(row[pos.status])==='published' && row[pos.id]).map(row=>{
    const item={};
    ['id','title','category','issue','description','mode','url','coverUrl','createdAt','updatedAt'].forEach(k=>{
      const v=pos[k]<0?'':row[pos[k]];
      item[k]=v instanceof Date?v.toISOString():String(v==null?'':v);
    });
    item.status='published';
    return item;
  }).reverse();
}
