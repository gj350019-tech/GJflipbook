/** 格致數位閱讀館 V12.2：獨立、公開、唯讀 JSONP API
 * 只安裝在「公開 API」的 Apps Script 專案，不要貼進私人管理後台。
 * 執行身分：我；存取者：任何人。指令碼屬性 SHEET_ID 必須保留。
 * 為避免公開整個 Drive，圖片由本 API 在確認 published 後才讀取。
 * 注意：已下載到讀者裝置的圖片無法透過下架收回；不要發布機密刊物。
 */
const SHEET_NAME='Publications';
function jsonp_(callback,payload){
  return ContentService.createTextOutput(callback+'('+JSON.stringify(payload).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')+');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function doGet(e){
  const p=(e&&e.parameter)||{};
  const callback=String(p.callback||'');
  if(!/^[A-Za-z_$][\w$]{0,80}$/.test(callback))return ContentService.createTextOutput('Invalid callback').setMimeType(ContentService.MimeType.TEXT);
  try{
    const rows=published_();
    if(p.action==='page'){
      const id=String(p.id||''); const index=Number(p.page);
      if(!/^[0-9a-f-]{36}$/i.test(id)||!Number.isInteger(index)||index<0||index>100)throw Error('參數無效');
      const rec=rows.find(x=>x.item.id===id&&x.item.mode==='pdf');
      if(!rec)throw Error('刊物尚未發布或不存在');
      const raw=String(rec.row[rec.head.indexOf('pageFileIds')]||'');
      const ids=JSON.parse(raw);
      if(!Array.isArray(ids)||index>=ids.length||!ids.every(x=>typeof x==='string'&&/^[\w-]{10,}$/.test(x)))throw Error('頁面清單有誤');
      // 僅依刊物資料列中已發布的頁面 ID 讀取；不接受使用者任意指定 Drive ID。
      const blob=DriveApp.getFileById(ids[index]).getBlob();
      const bytes=blob.getBytes();
      if(bytes.length>1100000)throw Error('單張圖片超過 1.1 MB，請在管理後台重新轉換為較小圖片');
      return jsonp_(callback,{ok:true,mime:'image/jpeg',base64:Utilities.base64Encode(bytes),index:index});
    }
    return jsonp_(callback,{ok:true,items:rows.map(x=>x.item).reverse()});
  }catch(err){console.error(err);return jsonp_(callback,{ok:false,error:String(err.message||'資料暫時無法讀取').slice(0,150)})}
}
function published_(){
  const id=PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if(!id)throw Error('尚未設定 SHEET_ID');
  const sh=SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
  if(!sh)throw Error('找不到 Publications');
  const data=sh.getDataRange().getValues(); if(data.length<2)return [];
  const head=data[0].map(String);const pos=k=>head.indexOf(k);
  if(['id','title','status','mode','url'].some(k=>pos(k)<0))throw Error('欄位不符');
  return data.slice(1).filter(r=>String(r[pos('status')])==='published'&&r[pos('id')]).map(r=>{
    const item={};
    ['id','title','category','issue','description','mode','url','coverUrl','createdAt','updatedAt'].forEach(k=>{
      const v=pos(k)<0?'':r[pos(k)];item[k]=v instanceof Date?v.toISOString():String(v==null?'':v);
    });
    item.status='published';
    if(item.mode==='pdf'){
      // 暴露頁數，不暴露 Drive 檔案 ID 或私人資料夾 ID
      let count=0;try{count=JSON.parse(String(r[pos('pageFileIds')]||'[]')).length}catch(e){}
      item.pageCount=count;
      item.url='';item.coverUrl='';
    }
    return {item,row:r,head};
  });
}
