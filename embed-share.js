/* 格致數位閱讀館：單本嵌入與 HTML 一鍵複製（增量功能；不更動 API） */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const embedId = params.get('embed');
  const isEmbed = Boolean(embedId);
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const buildUrl = id => new URL('embed.html?id=' + encodeURIComponent(id), location.href).href;
  const copyText = async value => {
    try { await navigator.clipboard.writeText(value); }
    catch (_) {
      const t=document.createElement('textarea');t.value=value;t.style.cssText='position:fixed;left:-9999px';document.body.appendChild(t);t.select();
      const ok=document.execCommand('copy');t.remove();if(!ok)throw new Error('請選取文字後按 Ctrl+C');
    }
  };
  const style=document.createElement('style');
  style.textContent=`
    .gj-share-btn{width:100%;margin-top:8px;padding:9px 12px;background:#f6f8f7;border:1px solid #d8dfe0;border-radius:6px;color:#38566b;cursor:pointer;font-size:12px;font-weight:650}
    .gj-share-btn:hover{background:#eaf1f0}
    .gj-share-backdrop{position:fixed;inset:0;z-index:500;background:#0d2235b8;display:grid;place-items:center;padding:18px}
    .gj-share-card{background:white;color:#243747;border-radius:14px;padding:26px;width:min(620px,100%);max-height:90dvh;overflow:auto;box-shadow:0 18px 70px #0005}
    .gj-share-card h2{font-size:22px;margin:0 0 8px}
    .gj-share-card p{font-size:13px;color:#687b89;line-height:1.6;margin:0 0 16px}
    .gj-share-card label{display:block;font-size:13px;font-weight:750;margin:17px 0 7px}
    .gj-share-card textarea{display:block;width:100%;border:1px solid #cad4d7;border-radius:8px;padding:10px;font-size:12px;line-height:1.5;resize:vertical;background:#f9fbfc;color:#31475c;word-break:break-all}
    .gj-share-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}
    .gj-share-actions button,.gj-share-done{border:0;border-radius:6px;background:#233f55;color:#fff;padding:10px 14px;cursor:pointer;font-weight:700}
    .gj-share-done{background:#edf2f4;color:#385063}
    .gj-share-note{font-size:12px!important;margin-top:16px!important}
    body.gj-embed-mode{margin:0;overflow:hidden;background:#101b27}
    body.gj-embed-mode>header,body.gj-embed-mode>.hero,body.gj-embed-mode>main,body.gj-embed-mode>footer{display:none!important}
    body.gj-embed-mode .overlay{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;z-index:200!important}
    body.gj-embed-mode .documentOverlay{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;z-index:200!important}
    body.gj-embed-mode .readerToggle{z-index:250}
    .gj-embed-msg{position:fixed;inset:0;z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#101b27;color:#e4ecf2;padding:20px;text-align:center;font-family:system-ui,sans-serif}
    .gj-embed-msg a,.gj-embed-msg button{background:#d5b48b;color:#23384b;border:0;border-radius:5px;padding:10px 15px;text-decoration:none;cursor:pointer}
  `;
  document.head.appendChild(style);
  let dialog=null;
  function openShare(id,title,mode){
    if(dialog)dialog.remove();
    const url=buildUrl(id);
    const snippet='<div style="width:100%;max-width:900px;margin:0 auto">\n  <iframe src="'+url.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'" title="'+String(title||'格致電子刊物').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')+'" style="display:block;width:100%;height:720px;border:0;border-radius:10px;background:#172738" loading="lazy" allow="fullscreen" allowfullscreen></iframe>\n</div>';
    dialog=document.createElement('div');dialog.className='gj-share-backdrop';dialog.setAttribute('role','presentation');
    dialog.innerHTML=`<div class="gj-share-card" role="dialog" aria-modal="true" aria-label="嵌入分享"><h2>嵌入分享</h2><p>《${esc(title)}》<br>複製網址或 HTML，貼到校網後台即可顯示單本閱讀器。</p><label for="gj-book-url">單本閱讀網址</label><textarea id="gj-book-url" rows="2" readonly></textarea><div class="gj-share-actions"><button type="button" data-copy="url">複製網址</button><button type="button" data-open="true">預覽單本頁面 ↗</button></div><label for="gj-book-code">校網 HTML 嵌入碼（寬度自適應、最高 900px）</label><textarea id="gj-book-code" rows="5" readonly></textarea><div class="gj-share-actions"><button type="button" data-copy="html">複製 HTML</button><button type="button" class="gj-share-done" data-close="true">關閉</button></div><p class="gj-share-note">${mode==='link'?'提醒：此刊物為外部連結，不支援站內翻頁；請改用原處室網址。':'提醒：校網後台須允許 iframe；PDF 頁面仍由原本的公開閱讀 API 提供。'}</p></div>`;
    dialog.querySelector('#gj-book-url').value=url;
    dialog.querySelector('#gj-book-code').value=snippet;
    dialog.addEventListener('click',async e=>{
      if(e.target===dialog||e.target.closest('[data-close]')){dialog.remove();dialog=null;return;}
      if(e.target.closest('[data-open]')){window.open(url,'_blank','noopener,noreferrer');return;}
      const btn=e.target.closest('[data-copy]');if(!btn)return;
      try{await copyText(btn.dataset.copy==='url'?url:snippet);const old=btn.textContent;btn.textContent='✓ 已複製';setTimeout(()=>{if(btn.isConnected)btn.textContent=old},1700)}
      catch(err){alert('無法自動複製，請選取文字後按 Ctrl+C。')}
    });
    document.body.appendChild(dialog);
    dialog.querySelector('[data-close]').focus();
  }
  function decorateShelf(){
    if(isEmbed)return;
    const shelf=document.getElementById('shelf');if(!shelf)return;
    shelf.querySelectorAll('button.readBtn[data-id]').forEach(read=>{
      if(read.parentElement.querySelector('.gj-share-btn'))return;
      const id=read.dataset.id;
      const title=read.parentElement.querySelector('h3')?.textContent||'格致電子刊物';
      const mode=read.textContent.includes('原處室網站')?'link':'pdf';
      if(mode==='link')return; // 無法在站內翻頁的外連刊物不提供嵌入碼
      const btn=document.createElement('button');btn.type='button';btn.className='gj-share-btn';btn.textContent='</> 嵌入分享';
      btn.addEventListener('click',()=>openShare(id,title,mode));read.insertAdjacentElement('afterend',btn);
    });
  }
  const shelf=document.getElementById('shelf');
  if(shelf){new MutationObserver(()=>{if(isEmbed)attemptEmbed();else decorateShelf()}).observe(shelf,{childList:true,subtree:false});}
  if(!isEmbed){decorateShelf();return;}
  document.body.classList.add('gj-embed-mode');
  let opened=false;
  let timeout=null;
  const toast=(message,retry)=>{
    document.querySelector('.gj-embed-msg')?.remove();
    const box=document.createElement('div');box.className='gj-embed-msg';
    const p=document.createElement('p');p.textContent=message;box.appendChild(p);
    const button=document.createElement('button');button.textContent=retry?'重新嘗試':'返回閱讀館';
    button.addEventListener('click',()=>retry?location.reload():location.assign('index.html'));
    box.appendChild(button);document.body.appendChild(box);
  };
  function attemptEmbed(){
    if(opened)return;
    const button=[...document.querySelectorAll('#shelf button.readBtn[data-id]')].find(b=>b.dataset.id===embedId);
    if(!button)return;
    opened=true;clearTimeout(timeout);
    button.click();
    // 閱讀器提供返回閱讀館方式；避免嵌入畫面關閉後空白。
    const overlays=[document.getElementById('overlay'),document.getElementById('documentOverlay')].filter(Boolean);
    for(const root of overlays){
      const close=root.querySelector('#close, #documentClose');
      if(close){close.addEventListener('click',()=>toast('已結束閱讀，您可以重新開啟刊物。',true));}
    }
  }
  attemptEmbed();
  timeout=setTimeout(()=>{if(!opened)toast('找不到這本刊物，或公開閱讀 API 尚未成功載入。請確認刊物已發布及網址中的 ID。',true)},18000);
})();
