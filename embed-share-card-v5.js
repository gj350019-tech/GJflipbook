/* 格致數位閱讀館 V13.5 — 刊物書卡嵌入分享（獨立外掛）
 * 僅為「已發布且可站內閱讀」的刊物加入按鈕，不修改原有 API 或翻頁邏輯。
 * 若本外掛載入失敗，原本的閱讀館仍可正常使用。
 */
(()=>{
  'use strict';
  const shelf=document.getElementById('shelf');
  if(!shelf)return;
  const EMBED_PAGE='embed-v5.html';
  function injectShareButtons(){
    shelf.querySelectorAll('.publication').forEach(card=>{
      if(card.querySelector('.gj-embed-share-v5'))return;
      const read=card.querySelector('button.readBtn[data-id]');
      if(!read)return;
      const id=read.getAttribute('data-id');
      if(!id||id==='sample')return; // 示範刊物不是公開 API 刊物
      if(/前往原處室網站|外部連結/.test(read.textContent||''))return;
      const button=document.createElement('button');
      button.type='button';
      button.className='gj-embed-share-v5';
      button.dataset.embedId=id;
      button.textContent='</> 嵌入分享';
      button.title='選擇閱讀器顏色、複製單本 HTML 嵌入碼';
      button.setAttribute('aria-label','設定這本刊物的 HTML 嵌入分享');
      button.style.cssText='width:100%;margin-top:8px;padding:9px 12px;border:1px solid #c9cfd2;border-radius:5px;background:#f8f7f3;color:#445967;font-size:12px;font-weight:650;cursor:pointer;';
      read.insertAdjacentElement('afterend',button);
    });
  }
  shelf.addEventListener('click',e=>{
    const button=e.target.closest('.gj-embed-share-v5');
    if(!button||!shelf.contains(button))return;
    e.preventDefault();e.stopPropagation();
    const url=new URL(EMBED_PAGE,location.href);
    url.searchParams.set('select',button.dataset.embedId);
    // 儘量以新分頁呈現，避免閱讀館頁面與已載入資料被刷新。
    window.open(url.href,'_blank','noopener,noreferrer');
  });
  const observer=new MutationObserver(injectShareButtons);
  observer.observe(shelf,{childList:true});
  injectShareButtons();
})();
