/** UI 渲染与交互 */
let currentPage='home',previousPage='home',searchMode='name',searchIngrTags=[];
let editingRecipeId=null,editCoverDataUrl=null,editIngredientRows=[],editStepRows=[];
let browseActiveCat='all';

// ====== CUSTOM CATEGORIES ======
let customCats=null,customSubcats=null;
function getCats(){
  if(!customCats) customCats=DB.get('custom_cats')||[...CATS];
  return customCats;
}
function getSubcats(){
  if(!customSubcats) customSubcats=DB.get('custom_subcats')||{
    meat:['猪肉','牛肉','羊肉','鸡肉','鸭肉'],vegetarian:['叶菜','根茎','菌菇','豆制品','茄果'],
    seafood:['鱼类','虾类','蟹类','贝类'],soup:['清汤','浓汤','炖品','甜汤'],
    staple:['米饭','面食','饺子','饼类'],dessert:['蛋糕','饼干','糖水','冰淇淋']
  };
  return customSubcats;
}

// ====== PAGE SWITCHING ======
function switchTab(page){
  previousPage=currentPage;currentPage=page;
  document.querySelectorAll('#app > .page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('#tab-bar .tab-item').forEach(t=>t.classList.toggle('active',t.dataset.page===page));
  closeFabMenu();
  if(page==='home')renderHome();if(page==='browse')renderBrowse();
  if(page==='mine')renderMine();if(page==='shopping-list')renderShopList();
  window.scrollTo(0,0);
}
function page(name){
  previousPage=currentPage;currentPage=name;
  document.querySelectorAll('#app > .page').forEach(p=>p.classList.remove('active'));
  const el=document.getElementById('page-'+name);
  if(el){el.classList.add('active');el.scrollTop=0}
  closeFabMenu();
  window.scrollTo(0,0);
  if(name==='edit')renderEditForm();
  if(name==='import')renderImport();
  if(name==='edit-cats')renderEditCats();
  if(name==='shopping-list')renderShopList();
}
function goBack(){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  let pg=previousPage||'home';
  if(!['home','browse','search','mine','shopping-list'].includes(pg))pg='home';
  document.getElementById('page-'+pg).classList.add('active');
  document.querySelectorAll('#tab-bar .tab-item').forEach(t=>t.classList.toggle('active',t.dataset.page===pg));
  previousPage='home';currentPage=pg;
  if(pg==='home')renderHome();if(pg==='browse')renderBrowse();
  if(pg==='mine')renderMine();if(pg==='shopping-list')renderShopList();
  window.scrollTo(0,0);
}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}

// ====== FAB (底端新增菜谱) ======
function toggleFabMenu(){
  const m=document.getElementById('fab-menu'),o=document.getElementById('fab-overlay');
  const show=m.style.display!=='block';
  m.style.display=show?'block':'none';o.style.display=show?'block':'none';
  if(show===false)document.getElementById('fab-add').textContent='+';
}
function closeFabMenu(){document.getElementById('fab-menu').style.display='none';document.getElementById('fab-overlay').style.display='none'}
function fabAction(action){
  closeFabMenu();
  if(action==='edit')editRecipe(null);
  else if(action==='import')page('import');
}

// ====== HOME ======
function renderHome(){
  const rs=getRecipes();const shop=getShopIds();
  document.getElementById('stat-shop').textContent=shop.length;
  document.getElementById('stat-total').textContent=rs.length;
  document.getElementById('home-subtitle').textContent=rs.length+' 道菜';
  const cats=getCats();const stats={};cats.forEach(c=>{stats[c.k]=0});
  rs.forEach(r=>{stats[r.category]=(stats[r.category]||0)+1});
  document.getElementById('home-cats').innerHTML=cats.map(c=>
    `<span class="cat-chip" onclick="switchTab('browse');setTimeout(()=>selectBrowseCategory('${c.k}'),150)">${c.e} ${c.l} <span class="n">${stats[c.k]||0}道</span></span>`
  ).join('');
  const recent=rs.slice(0,6);
  document.getElementById('home-recent').innerHTML=recent.length?recent.map(r=>`
    <div class="recipe-row" onclick="openDetail('${r.id}')">
      ${r.coverImagePath?`<img class="recipe-thumb" src="${r.coverImagePath}">`:`<div class="recipe-thumb" style="display:flex;align-items:center;justify-content:center;font-size:32px">🍳</div>`}
      <div class="recipe-info"><span class="recipe-name">${esc(r.name)}</span>
        <div class="recipe-meta"><span>${getCatLabel(r.category)}</span>${r.subcategory?` · ${r.subcategory}`:''}${r.prepTime?` · ⏱${r.prepTime}min`:''}</div>
      </div>
      <span style="color:var(--c-t4);font-size:16px;padding-right:4px">›</span>
    </div>`).join(''):'<div style="text-align:center;padding:40px;color:var(--c-t3);font-size:14px">还没有菜谱</div>';
}
function getCatLabel(k){const c=getCats().find(c=>c.k===k);return c?c.l:k}

// ====== BROWSE ======
function renderBrowse(){
  const cats=getCats();
  document.getElementById('sidebar-inner').innerHTML=
    `<div class="sidebar-tab ${browseActiveCat==='all'?'active':''}" data-cat="all" onclick="selectBrowseCategory('all')"><span class="tab-emoji">📋</span><span class="tab-label">全部</span></div>`+
    cats.map(c=>`<div class="sidebar-tab ${browseActiveCat===c.k?'active':''}" data-cat="${c.k}" onclick="selectBrowseCategory('${c.k}')"><span class="tab-emoji">${c.e}</span><span class="tab-label">${c.l}</span></div>`).join('');
  renderBrowseCards(browseActiveCat);
  setTimeout(()=>{const a=document.querySelector('.sidebar-tab.active');if(a)a.scrollIntoView({block:'nearest'})},100);
}
function selectBrowseCategory(cat){
  browseActiveCat=cat;
  document.querySelectorAll('.sidebar-tab').forEach(t=>t.classList.toggle('active',t.dataset.cat===cat));
  document.getElementById('browse-main-title').textContent=cat==='all'?'全部菜谱':getCatLabel(cat);
  closeBrowseSearch();
  setTimeout(()=>{const a=document.querySelector('.sidebar-tab.active');if(a)a.scrollIntoView({block:'nearest'})},50);
  renderBrowseCards(cat);
}
function renderBrowseCards(cat){
  const rs=cat==='all'?getRecipes():getRecipes().filter(r=>r.category===cat);
  const shopIds=getShopIds();
  document.getElementById('browse-cards').innerHTML=rs.length?rs.map(r=>`
    <div class="browse-card" onclick="openDetail('${r.id}')">
      ${r.coverImagePath?`<img class="browse-card-img" src="${r.coverImagePath}">`:`<div class="browse-card-img">🍳</div>`}
      <div class="browse-card-info">
        <div class="browse-card-name">${esc(r.name)}</div>
        <div class="browse-card-meta">${r.subcategory?r.subcategory+' · ':''}${r.prepTime?r.prepTime+'min · ':''}${r.ingredients.length}种食材</div>
      </div>
      <div class="browse-card-add ${shopIds.includes(r.id)?'in-shop':''}" onclick="event.stopPropagation();toggleShopCard('${r.id}',this)">${shopIds.includes(r.id)?'':'+'}</div>
    </div>
  `).join(''):`<div style="text-align:center;padding:60px 20px;color:var(--c-t3);font-size:14px">此分类暂无菜谱</div>`;
}
function toggleShopCard(id,el){
  const ids=getShopIds();
  if(ids.includes(id)){removeFromShopList(id);el.classList.remove('in-shop');el.textContent='+';toast('已移出待买清单')}
  else{addToShopList(id);el.classList.add('in-shop');el.textContent='';toast('已加入待买清单')}
}
function addBrowseCategory(){
  const k=prompt('新分类 key（英文）：');if(!k||!k.trim())return;
  const l=prompt('分类名称：');if(!l||!l.trim())return;
  const e=prompt('图标 emoji：','🍽️');if(!e||!e.trim())return;
  const cats=getCats();
  if(cats.find(c=>c.k===k.trim())){toast('key 已存在');return}
  cats.push({k:k.trim(),l:l.trim(),e:e.trim(),c:'#666'});DB.set('custom_cats',cats);customCats=cats;
  renderBrowse();
}

// ====== BROWSE SEARCH (moved from tab) ======
function openBrowseSearch(){
  document.getElementById('browse-search-box').style.display='flex';
  document.getElementById('browse-cards').style.display='none';
  document.getElementById('browse-search-input').focus();
  document.getElementById('browse-search-input').value='';
  document.getElementById('browse-search-input').placeholder='搜索所有菜谱…';
}
function closeBrowseSearch(){
  document.getElementById('browse-search-box').style.display='none';
  document.getElementById('browse-cards').style.display='block';
  renderBrowseCards(browseActiveCat);
}
function doBrowseSearch(){
  const q=document.getElementById('browse-search-input').value.trim();
  if(!q){renderBrowseCards(browseActiveCat);return}
  const rs=searchByName(q);
  const shopIds=getShopIds();
  document.getElementById('browse-cards').innerHTML=rs.length?rs.map(r=>`
    <div class="browse-card" onclick="openDetail('${r.id}')">
      ${r.coverImagePath?`<img class="browse-card-img" src="${r.coverImagePath}">`:`<div class="browse-card-img">🍳</div>`}
      <div class="browse-card-info">
        <div class="browse-card-name">${esc(r.name)}</div>
        <div class="browse-card-meta">${r.subcategory?r.subcategory+' · ':''}${r.prepTime?r.prepTime+'min · ':''}${r.ingredients.length}种食材</div>
      </div>
      <div class="browse-card-add ${shopIds.includes(r.id)?'in-shop':''}" onclick="event.stopPropagation();toggleShopCard('${r.id}',this)">${shopIds.includes(r.id)?'':'+'}</div>
    </div>
  `).join(''):`<div style="text-align:center;padding:60px 20px;color:var(--c-t3);font-size:14px">没有找到匹配的菜谱</div>`;
}

// ====== SEARCH (sub-page) ======
function renderSearch(){}
function switchSearchMode(mode){
  searchMode=mode;
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  document.getElementById('search-name-box').style.display=mode==='name'?'block':'none';
  document.getElementById('search-ingr-box').style.display=mode==='ingr'?'block':'none';
  clearSearch();
}
function doSearchName(){
  const q=document.getElementById('search-name-input').value.trim();
  if(!q){document.getElementById('search-results').innerHTML='';return}
  const rs=searchByName(q);
  document.getElementById('search-results').innerHTML=`<div style="font-size:12px;color:var(--c-t3);margin-bottom:8px;font-weight:500">找到 ${rs.length} 道</div>`+
    rs.map(r=>`<div class="result-item" onclick="openDetail('${r.id}')">
      ${r.coverImagePath?`<img class="recipe-thumb" src="${r.coverImagePath}">`:`<div class="recipe-thumb" style="display:flex;align-items:center;justify-content:center;font-size:28px">🍳</div>`}
      <div class="recipe-info"><span class="recipe-name">${esc(r.name)}</span><div style="font-size:11px;color:var(--c-t3);margin-top:2px">${r.ingredients.map(i=>i.canonicalName).join(' ')}</div></div></div>`).join('');
}
function addIngrTag(){
  const inp=document.getElementById('search-ingr-input');const v=inp.value.trim();
  if(!v||searchIngrTags.includes(v)){inp.value='';return}
  searchIngrTags.push(v);inp.value='';renderIngrTags();doSearchIngr();
}
function renderIngrTags(){document.getElementById('ingr-tags').innerHTML=searchIngrTags.map((t,i)=>`<span class="ingr-tag" onclick="searchIngrTags.splice(${i},1);renderIngrTags();doSearchIngr()">${t} ✕</span>`).join('')}
function doSearchIngr(){
  if(!searchIngrTags.length){document.getElementById('search-results').innerHTML='';return}
  const rs=searchByIngredients(searchIngrTags);
  document.getElementById('search-results').innerHTML=`<div style="font-size:12px;color:var(--c-t3);margin-bottom:8px;font-weight:500">找到 ${rs.length} 道可做的菜</div>`+
    rs.map(r=>`<div class="result-item" onclick="openDetail('${r.id}')">
      ${r.coverImagePath?`<img class="recipe-thumb" src="${r.coverImagePath}">`:`<div class="recipe-thumb" style="display:flex;align-items:center;justify-content:center;font-size:28px">🍳</div>`}
      <div class="recipe-info"><span class="recipe-name">${esc(r.name)}</span><div style="font-size:11px;color:var(--c-t3);margin-top:2px">${r.ingredients.map(i=>i.canonicalName).join(' ')}</div></div></div>`).join('');
}
function clearSearch(){document.getElementById('search-name-input').value='';searchIngrTags=[];document.getElementById('ingr-tags').innerHTML='';document.getElementById('search-results').innerHTML=''}

// ====== DETAIL ======
function openDetail(id){
  const r=getRecipeById(id);if(!r)return;
  page('detail');
  const shopIds=getShopIds();const inShop=shopIds.includes(r.id);
  document.getElementById('detail-content').innerHTML=`
    ${r.coverImagePath?`<img class="cover-img" src="${r.coverImagePath}">`:''}
    <div class="info-card">
      <div class="dish-name">${esc(r.name)}</div>
      <div class="dish-meta">
        <span class="dish-chip">${getCatLabel(r.category)}</span>
        ${r.subcategory?`<span class="dish-chip">${r.subcategory}</span>`:''}
      </div>
      ${r.tags&&r.tags.length?`<div style="margin-top:8px">${r.tags.map(t=>`<span style="font-size:11px;color:var(--c-blue);margin-right:8px">#${t}</span>`).join('')}</div>`:''}
    </div>
    <div class="ing-section"><div style="font-weight:600;margin-bottom:10px;font-size:15px">🥬 食材清单</div>
      ${r.ingredients&&r.ingredients.length?r.ingredients.map(i=>`<div class="ing-row"><span>${i.canonicalName}</span>${i.amount?`<span style="color:var(--c-t2)">${i.amount}</span>`:''}</div>`).join(''):'<div style="font-size:13px;color:var(--c-t3);padding:12px 0;text-align:center">暂无食材信息</div>'}
    </div>
    ${r.notes?`<div class="ing-section"><div style="font-weight:600;margin-bottom:4px;font-size:15px">📌 备注</div><div style="font-size:14px;color:var(--c-t2);line-height:1.8">${esc(r.notes)}</div></div>`:''}
  `;
  document.getElementById('detail-bar').innerHTML=`
    <button class="btn ${inShop?'btn-ios-outl':'btn-prim'}" onclick="toggleShop('${r.id}')">${inShop?'移出待买清单':'🛒 加入待买清单'}</button>
    <button class="btn btn-ios-outl" onclick="editRecipe('${r.id}')">✏️ 编辑</button>
    <button class="btn btn-dang" onclick="delRecipe('${r.id}')">🗑</button>
  `;
}
function toggleShop(id){const ids=getShopIds();if(ids.includes(id)){removeFromShopList(id);toast('已移出')}else{addToShopList(id);toast('已加入待买清单')};openDetail(id)}
function delRecipe(id){if(confirm('确定删除？')){deleteRecipe(id);toast('已删除');goBack()}}

// ====== EDIT FORM (fix #2: editing preserves data, #4: removed fields) ======
function editRecipe(id){
  editingRecipeId=id||null;
  document.getElementById('edit-title').textContent=id?'编辑菜谱':'添加菜谱';
  // 无论新增还是编辑，先清空 DOM 残留
  document.getElementById('edit-form')&&(document.getElementById('edit-form').innerHTML='');
  if(editingRecipeId){
    const r=getRecipeById(editingRecipeId);
    editCoverDataUrl=r?.coverImagePath||'';
    editIngredientRows=r?.ingredients?.length?r.ingredients.map(i=>({id:i.id,val:(i.canonicalName||'')+(i.amount?' '+i.amount:'')})):[{id:uid(),val:''}];
    editStepRows=[];
  }else{
    editCoverDataUrl='';
    editIngredientRows=[{id:uid(),val:''}];
    editStepRows=[];
  }
  page('edit');
}
function renderEditForm(){
  // ★ 关键修复：先保存当前表单的已输入值，re-render 后恢复
  function getFld(id){var e=document.getElementById(id);return e?e.value:''}
  var curName=getFld('ef-name'),curSub=getFld('ef-subcat'),curServ=getFld('ef-serv'),curTags=getFld('ef-tags'),curSource=getFld('ef-source'),curNotes=getFld('ef-notes');

  const r=editingRecipeId?getRecipeById(editingRecipeId):null;
  // 优先用 DOM 中的输入值（编辑时用户已输入的），否则用已有数据
  var name=curName||(r?r.name:'')||'';
  var subcat=curSub||(r?r.subcategory:'')||'';
  var serv=curServ||(r?String(r.servings):'')||'2';
  var tags=curTags||(r?r.tags.join(','):'')||'';
  var source=curSource||(r?r.sourceUrl:'')||'';
  var notes=curNotes||(r?r.notes:'')||'';

  document.getElementById('edit-form').innerHTML=`
    <div class="form-group"><label class="form-label">封面图</label>
      <div class="cover-upload" id="cover-zone" tabindex="0">
        ${editCoverDataUrl?`<img src="${editCoverDataUrl}">`:'<div>📷<br><span class="hint">点击上传 / Ctrl+V 粘贴截图</span></div>'}
      </div>
      <input type="file" id="cover-input" accept="image/*" style="display:none" onchange="onCoverChange(this)">
      ${editCoverDataUrl?`<span style="font-size:11px;color:var(--c-red);cursor:pointer;margin-top:4px;display:inline-block" onclick="editCoverDataUrl='';renderEditForm()">移除图片</span>`:''}
    </div>
    <div class="form-group"><label class="form-label">菜名 <span class="required">*</span></label><input class="form-input" id="ef-name" value="${esc(name)}" placeholder="如：番茄炒蛋"></div>
    <div class="form-group"><label class="form-label">子分类</label><input class="form-input" id="ef-subcat" value="${esc(subcat)}" placeholder="如：家常菜、川菜"></div>
    <div class="form-group"><label class="form-label">食材 <span class="add-row" onclick="addIngRow()">+ 添加</span></label>
      ${editIngredientRows.map((ir,i)=>`<div class="ing-row-edit"><span style="font-size:11px;color:var(--c-t3);width:20px">${i+1}</span>
        <input class="form-input ing-input" value="${esc(ir.val)}" placeholder="如：鸡蛋 2个（回车新增）"
          oninput="saveIngVal(${i},this)" oncut="setTimeout(function(){saveIngVal(${i},document.querySelectorAll('.ing-input')[${i}])},10)"
          onkeydown="if(event.key==='Enter'){event.preventDefault();saveIngVal(${i},this);addIngRow();setTimeout(()=>{const el=document.querySelectorAll('.ing-input')[${i+1}];if(el)el.focus()},50)}">
        <span class="row-del" onclick="editIngredientRows.splice(${i},1);renderEditForm()">✕</span></div>`).join('')}
    </div>
    <div class="form-group"><label class="form-label">标签（逗号分隔）</label><input class="form-input" id="ef-tags" value="${esc(tags)}" placeholder="如：家常菜,快手菜"></div>
    <div class="form-group"><label class="form-label">备注</label><textarea class="form-textarea" id="ef-notes" placeholder="个人心得、注意事项…">${esc(notes)}</textarea></div>
  `;
  setTimeout(()=>{
    const zone=document.getElementById('cover-zone');
    if(zone){zone.onclick=()=>document.getElementById('cover-input').click();zone.addEventListener('paste',onCoverPaste)}
  },50);
}
function saveIngVal(i,el){if(editIngredientRows[i])editIngredientRows[i].val=el.value;}
function saveStepVal(i,el){if(editStepRows[i])editStepRows[i].desc=el.value;}
function addIngRow(){editIngredientRows.push({id:uid(),val:''});renderEditForm()}
function addStepRow(){editStepRows.push({id:uid(),desc:'',img:''});renderEditForm()}
/** 居中裁剪图片到目标宽高，最大宽度800px */
function centerCropImage(img, maxW=800, aspectRatio=3/2){
  const c=document.createElement('canvas');
  // 缩放比例
  const scale=Math.min(1, maxW/img.width);
  const sw=img.width*scale, sh=img.height*scale;
  // 裁剪尺寸（保持比例）
  let cw=sw, ch=sh;
  if(cw/ch>aspectRatio){cw=ch*aspectRatio} // 太宽 → 截取中间
  else{ch=cw/aspectRatio} // 太高 → 截取中间
  // 居中偏移
  const sx=(sw-cw)/2, sy=(sh-ch)/2;
  c.width=cw; c.height=ch;
  // 先在 canvas 中画缩放后的全图，再截取中心
  c.getContext('2d').drawImage(img, sx, sy, cw, ch, 0, 0, cw, ch);
  return c.toDataURL('image/jpeg',0.7);
}
function onCoverPaste(e){
  const items=e.clipboardData?.items;if(!items)return;
  for(const item of items){
    if(item.type.startsWith('image/')){
      const blob=item.getAsFile();const r=new FileReader();
      r.onload=function(ev){const img=new Image();img.onload=function(){editCoverDataUrl=centerCropImage(img);renderEditForm()};img.src=ev.target.result};
      r.readAsDataURL(blob);e.preventDefault();return;
    }
  }
}
function onCoverChange(input){
  const file=input.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=function(e){const img=new Image();img.onload=function(){editCoverDataUrl=centerCropImage(img);renderEditForm()};img.src=e.target.result};
  r.readAsDataURL(file);
}
function saveRecipe(){
  document.querySelectorAll('.ing-input').forEach((el,i)=>{if(editIngredientRows[i])editIngredientRows[i].val=el.value});
  const name=document.getElementById('ef-name').value.trim();
  if(!name){toast('请输入菜名');return}
  const ingredients=editIngredientRows.filter(r=>r.val.trim()).map(r=>normalizeIngredient(r.val.trim(),r.id));
  // 仅保留需要的字段，清空其他旧字段
  const input={
    name,category:'meat',subcategory:document.getElementById('ef-subcat').value.trim()||'',
    ingredients:ingredients,
    tags:document.getElementById('ef-tags').value.split(/[,，]/).map(t=>t.trim()).filter(Boolean),
    notes:document.getElementById('ef-notes').value.trim(),
    coverImagePath:editCoverDataUrl||null,steps:[],prepTime:null,servings:2,difficulty:2,sourceUrl:null,sourceName:null,
  };
  if(editingRecipeId){updateRecipe(editingRecipeId,input);toast('已保存')}else{createRecipe(input);toast('已添加')}
  editingRecipeId=null;goBack();
}

// ====== SHOPPING LIST (recipe-first layout) ======
function renderShopList(){
  const shopIds=getShopIds();
  const recipesInList=getRecipes().filter(r=>shopIds.includes(r.id));
  const checkedRecipeIds=getCheckedRecipeIds();
  const mergedList=generateShopList(checkedRecipeIds);
  const allIngChecked=mergedList.length>0&&mergedList.every(i=>i.checked);
  var h='';

  if(!shopIds.length){
    h='<div style="text-align:center;padding:60px;color:var(--c-t3)">🛒<br>待买清单是空的<br><span style="font-size:12px">在分类页点击 + 添加</span></div>';
  }else{
    // 已选菜谱
    if(recipesInList.length){
      h+='<div class="shop-recipes-header">📋 已选菜谱 <span style="font-size:11px;font-weight:400;color:var(--c-t4)">勾选以计入合并清单</span></div>';
      h+='<div class="shop-recipes">';
      for(var i=0;i<recipesInList.length;i++){
        var r=recipesInList[i],checked=checkedRecipeIds.includes(r.id),thumb=r.coverImagePath?'<img class="recipe-thumb" src="'+esc(r.coverImagePath)+'">':'<div class="recipe-thumb" style="display:flex;align-items:center;justify-content:center;font-size:24px;background:var(--c-bg)">🍳</div>';
        h+='<div class="shop-recipe-card '+(checked?'':'shop-recipe-dim')+'">'+
          '<span class="shop-rec-cb '+(checked?'checked':'')+'" onclick="toggleRecipeCheck(\''+r.id+'\');renderShopList()">'+(checked?'✓':'')+'</span>'+
          thumb+
          '<div class="shop-rec-info" onclick="openDetail(\''+r.id+'\')">'+
            '<div class="shop-rec-name">'+esc(r.name)+'</div>'+
            '<div class="shop-rec-meta">'+getCatLabel(r.category)+(r.subcategory?(' · '+r.subcategory):'')+' · 食材'+r.ingredients.length+'种</div>'+
          '</div>'+
          '<span class="shop-rec-remove" onclick="event.stopPropagation();removeFromShopList(\''+r.id+'\');renderShopList()">✕</span>'+
        '</div>';
      }
      h+='</div>';
    }

    // 合并食材
    if(mergedList.length){
      h+='<div class="shop-toolbar">'+
        '<span style="cursor:pointer" onclick="toggleAllShop()"><span class="cb '+(allIngChecked?'checked':'')+'" style="display:inline-flex;vertical-align:middle;margin-right:6px">'+(allIngChecked?'✓':'')+'</span>全选食材</span>'+
        '<span>'+mergedList.filter(function(i){return i.checked}).length+'/'+mergedList.length+' 项</span>'+
      '</div>';
      for(var j=0;j<mergedList.length;j++){
        var it=mergedList[j];
        var amt=(it.qty!=null&&it.unit)?('<span style="color:var(--c-blue);font-weight:600">'+it.qty+it.unit+'</span>'):(it.raws.length?'<span>'+it.raws.join(' / ')+'</span>':'');
        h+='<div class="shop-item '+(it.checked?'done':'')+'">'+
          '<span class="cb '+(it.checked?'checked':'')+'" onclick="toggleShopItem(\''+it.name+'\','+(!it.checked)+')">'+(it.checked?'✓':'')+'</span>'+
          '<div class="shop-info" onclick="showShopSource(\''+it.name+'\')">'+
            '<div class="shop-name">'+it.name+'</div>'+
            '<div style="font-size:11px;color:var(--c-t3);margin-top:2px">'+(it.recipes.length>1?'<span style="font-weight:600;color:var(--c-blue);margin-right:4px">×'+it.recipes.length+'</span>':'')+amt+' <span style="margin-left:6px">'+it.recipes.map(function(rr){return rr.rname}).join('、')+'</span></div>'+
          '</div>'+
        '</div>';
      }
    }else{
      h+='<div style="text-align:center;padding:30px;color:var(--c-t3);font-size:13px">👆 勾选菜谱以生成合并清单</div>';
    }
  }
  document.getElementById('shop-content').innerHTML=h;
  document.getElementById('shop-bar').style.display=shopIds.length?'flex':'none';
}
function toggleShopItem(name,checked){toggleShopCheck(name,checked);renderShopList()}
function toggleAllShop(){var list=generateShopList(getCheckedRecipeIds());var all=list.every(function(i){return i.checked});list.forEach(function(i){toggleShopCheck(i.name,!all)});renderShopList()}
function showShopSource(name){var item=generateShopList(getCheckedRecipeIds()).filter(function(i){return i.name===name});if(!item.length)return;alert('🛒 '+item[0].name+'\n来自以下菜谱：\n'+item[0].recipes.map(function(r){return '  · '+r.rname+' ('+r.txt+')'}).join('\n'))}
function clearShopChecked(){DB.remove('shop_checked');renderShopList();toast('已清空勾选')}
function clearShopAll(){if(confirm('确定清空整个待买清单吗？')){clearShopList();renderShopList();toast('已清空')}}
function deleteCheckedIngredients(){var list=generateShopList(getCheckedRecipeIds());var checked=list.filter(function(i){return i.checked});if(!checked.length){toast('请先勾选要删除的食材');return}if(confirm('确定从清单移出 '+checked.length+' 项食材吗？重新勾选菜谱即可恢复。')){checked.forEach(function(i){addShopExcluded(i.name);toggleShopCheck(i.name,false)});if(!generateShopList(getCheckedRecipeIds()).length)clearShopList();renderShopList();toast('已移出 '+checked.length+' 项')}}

// ====== IMPORT (complete rewrite: single recipe, main/seasoning split, auto steps) ======
const STEP_ACTION_KEYWORDS=['处理','煸','爆香','爆炒','大火','小火','转','加入','倒入','翻炒','焯水','炖','蒸','煮','煎','炸','烤','焖','熬','炒','搅','拌','揉','切','调味','出锅','装盘','撒','淋','浇','摆','点缀','合盖','盖盖'];

function renderImport(){
  document.getElementById('import-results').innerHTML='';
  document.getElementById('import-error').textContent='';
  // 每次进入导入页清空输入框
  document.getElementById('import-text').value='';
}

async function doUnifiedImport(){
  const text=document.getElementById('import-text').value.trim();
  if(!text){document.getElementById('import-error').textContent='请输入内容';return}
  document.getElementById('import-error').textContent='';

  if(text.startsWith('http://')||text.startsWith('https://')){
    toast('正在解析链接…');
    try{
      const resp=await fetch('https://api.allorigins.win/raw?url='+encodeURIComponent(text));
      const html=await resp.text();const doc=new DOMParser().parseFromString(html,'text/html');
      let items=[];doc.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{try{const d=JSON.parse(s.textContent);(d['@graph']||[d]).forEach(i=>{if(i['@type']==='Recipe'){const ings=(i.recipeIngredient||[]).map(raw=>{const m=raw.match(/^(.+?)\s*([\d.].*)$/);return{name:m?m[1].trim():raw.trim(),amount:m?m[2].trim():''}});items.push({name:i.name||'未命名',mainIngredients:ings.filter(r=>!isSeasoning(r.name)).map(r=>r.name+(r.amount?' '+r.amount:'')),seasonings:ings.filter(r=>isSeasoning(r.name)).map(r=>r.name+(r.amount?' '+r.amount:'')),steps:(i.recipeInstructions||[]).map((inst,i)=>'步骤'+(i+1)+'：'+(typeof inst==='string'?inst:inst.text||''))})}})}catch{}});
      if(!items.length){items.push({name:doc.title||'网页导入',mainIngredients:[],seasonings:[],steps:[]})}
      if(items.length){showImportResult(items[0])}
      else document.getElementById('import-error').textContent='未解析到菜谱';
    }catch(e){document.getElementById('import-error').textContent='解析失败：'+e.message}
  }else{
    toast('正在分析文字…');
    const result=parseSingleRecipe(text);
    if(result&&result.name){
      showImportResult(result);
    }else{
      document.getElementById('import-error').textContent='无法识别菜谱格式，请手动录入';
    }
  }
}

/** 解析单条菜谱文本 */
function parseSingleRecipe(text){
  // 过滤掉空行和节标题行（【】包裹的或纯章节词）
  const lines=text.split('\n').map(l=>l.trim()).filter(Boolean).filter(l=>!/^[【\[][^】\]]*[】\]]$/.test(l)&&!/^(制作过程|制作方法|烹饪步骤|准备食材)[：:]?\s*$/.test(l));
  if(!lines.length)return null;

  // 1. 提取菜名：找到第一个有意义的行作为菜品名称
  let titleIdx=0;
  for(let i=0;i<lines.length;i++){
    const l=lines[i];
    if(/^\d+$/.test(l)||/^http/.test(l))continue;
    if(/^[【\[]/.test(l)||/^制作过程|^制作方法|^烹饪步骤|^准备食材/.test(l))continue;
    if(/^[主配辅材]?[食调]?[材料]/.test(l)||/步/.test(l)||/做/.test(l)||/料/.test(l)||/^[0-9]+[.、．]/.test(l))break;
    // 取第一个有意义的行（2-40字，不含逗号、顿号等分隔符的短句）
    if(l.length>=2&&l.length<=40&&!/[，,、]/.test(l)&&!/^(适量|少许|若干)$/.test(l)){
      titleIdx=i;break;
    }
  }
  // 取第一个匹配的行或第一行作为标题
  var name=lines[titleIdx]||'未知菜谱';

  // 2. 遍历后续行，分离主料/调料/步骤，记录每项是否来自明确分段
  const mainIngredients=[],seasonings=[],steps=[];
  let currentSection='',explicitMarker=!1; // explicitMarker: 遇到"主料："或"调料："前缀则为 true

  for(let i=titleIdx+1;i<lines.length;i++){
    const l=lines[i];
    // 识别分段标题（带明确标记）
    if(/^主[料材]/.test(l)||/^[食材材料]/.test(l)){currentSection='main';explicitMarker=!0;const parts=l.replace(/^[^：:]*[：:]/,'').trim();if(parts)splitIngredients(parts).forEach(s=>mainIngredients.push({text:s,explicit:!0}));continue}
    if(/^[调辅]料/.test(l)){currentSection='seasoning';explicitMarker=!0;const parts=l.replace(/^[^：:]*[：:]/,'').trim();if(parts)splitIngredients(parts).forEach(s=>seasonings.push(s));continue}
    if(/^步骤|^做法|^制作/.test(l)||/^[0-9]+[.、．]/.test(l)){
      currentSection='step';
      const st=l.replace(/^步骤|^做法|^制作|^制作过程|^制作方法|[：:]/,'').replace(/^[0-9]+[.、．]?\s*/,'').trim();
      // 跳过纯章节标题（无动作关键词、长度短、含【】的）
      if(st&&st.length>3&&!/^[【\[].*[】\]]$/.test(st)&&!/^(过程|方法|步骤|做法|方式)$/.test(st))steps.push(st);
      continue
    }

    // 无分段标签，按关键词自动判断
    if(!currentSection){
      if(STEP_ACTION_KEYWORDS.some(k=>l.startsWith(k))){currentSection='step';if(l.length>3)steps.push(l);continue}
      if(/[、，,;；]/.test(l)&&!/[。！]/.test(l)){splitIngredients(l).forEach(s=>mainIngredients.push({text:s,explicit:!1}));currentSection='main';explicitMarker=!1;continue}
      mainIngredients.push({text:l,explicit:!1});currentSection='main';explicitMarker=!1;
    }else if(currentSection==='main'){
      if(STEP_ACTION_KEYWORDS.some(k=>l.startsWith(k))){currentSection='step';if(l.length>3)steps.push(l);continue}
      if(/^[调辅]料/.test(l)){currentSection='seasoning';explicitMarker=!0;const parts=l.replace(/^[^：:]*[：:]/,'').trim();if(parts)splitIngredients(parts).forEach(s=>seasonings.push(s));continue}
      if(l.includes('、')||l.includes('，')){splitIngredients(l).forEach(s=>mainIngredients.push({text:s,explicit:explicitMarker}));continue}
      if(l.length>3)mainIngredients.push({text:l,explicit:explicitMarker});
    }else if(currentSection==='step'){
      if(/^主[料材]/.test(l)||/^[调辅]料/.test(l)){currentSection='main';i--;continue}
      if(l.length>3&&!/^[0-9]/.test(l))steps.push(l);
    }
  }

  // 3. 对自动判断（非显式标记）的"主料"行做调料过滤
  const seasonKeySet=new Set(Object.entries(INGREDIENT_CATEGORY).filter(([k,v])=>v==='seasoning').map(([k])=>k));
  const filteredMain=[],filteredSeason=[...seasonings];
  for(const ing of mainIngredients){
    const pureName=(ing.text||ing).replace(/[\d./]+.*$/,'').trim();
    const isExplicit=ing.explicit!==void 0?ing.explicit:!1;
    if(!isExplicit&&(seasonKeySet.has(pureName)||[...seasonKeySet].some(s=>pureName.includes(s)||s.includes(pureName)))){filteredSeason.push(ing.text||ing);continue}
    filteredMain.push(ing.text||ing);
  }

  // 4. 步骤按动作拆分（如果一条步骤过长）
  const finalSteps=[];
  for(const s of steps){
    if(s.length>60){
      // 尝试按 。！；拆分多动作
      const parts=s.split(/[。！；]/).filter(p=>p.trim().length>5);
      if(parts.length>1){parts.forEach(p=>finalSteps.push(p.trim()));continue}
    }
    // 尝试按动作关键词拆分
    if(s.length>80){
      const parts=[];
      let remaining=s;
      for(const kw of STEP_ACTION_KEYWORDS){
        const idx=remaining.indexOf(kw,2);
        if(idx>0&&idx<remaining.length-5){
          parts.push(remaining.substring(0,idx).trim());
          remaining=remaining.substring(idx);
        }
      }
      if(parts.length){parts.push(remaining.trim());parts.forEach(p=>{if(p.length>3)finalSteps.push(p)});continue}
    }
    finalSteps.push(s);
  }

  // 去重
  const uniqueMain=[...new Set(filteredMain)];
  const uniqueSeason=[...new Set(filteredSeason)];
  const uniqueSteps=finalSteps.filter((s,i)=>finalSteps.indexOf(s)===i).map((s,i)=>'步骤'+(i+1)+'：'+s);

  return {name,mainIngredients:uniqueMain,seasonings:uniqueSeason,steps:uniqueSteps};
}

/** 按分隔符拆分一行食材文本 */
function splitIngredients(text){
  return text.split(/[、，,；;]/).map(s=>s.replace(/^[①-⑩①②③④⑤⑥⑦⑧⑨⑩\d]+[.、．]?\s*/,'').trim()).filter(Boolean);
}

function showImportResult(rc){
  if(!rc)return;
  window._importedRecipe=rc;
  function guessCategoryName(name){
    const n=name.toLowerCase();
    if(/红烧|排骨|肉|猪|牛|羊|鸡|鸭/.test(n))return getCats().find(c=>c.k==='meat')?.l||'荤菜';
    if(/鱼|虾|蟹|海鲜|贝/.test(n))return getCats().find(c=>c.k==='seafood')?.l||'海鲜';
    if(/番茄|青菜|白菜|素|豆腐|菌菇/.test(n))return getCats().find(c=>c.k==='vegetarian')?.l||'素菜';
    if(/汤|羹/.test(n))return getCats().find(c=>c.k==='soup')?.l||'汤羹';
    if(/饭|面|饺子|馒头|饼|粥/.test(n))return getCats().find(c=>c.k==='staple')?.l||'主食';
    if(/甜品|蛋糕|饼干|糖水/.test(n))return getCats().find(c=>c.k==='dessert')?.l||'甜品';
    return getCats()[0]?.l||'荤菜'
  }
  document.getElementById('import-results').innerHTML=`
    <div class="card-tl">📖 ${esc(rc.name)}</div>
    <div style="font-size:12px;color:var(--c-t3);margin-bottom:10px">分类：${guessCategoryName(rc.name)}</div>
    ${rc.mainIngredients&&rc.mainIngredients.length?`
      <div class="import-parse-result"><strong>🥬 主料</strong>
      <div class="detail">${rc.mainIngredients.join('、')}</div></div>`:''}
    ${rc.seasonings&&rc.seasonings.length?`
      <div class="import-parse-result"><strong>🧂 调料</strong>
      <div class="detail">${rc.seasonings.join('、')}</div></div>`:''}
    ${rc.steps&&rc.steps.length?`
      <div class="import-parse-result"><strong>📝 步骤</strong>
      ${rc.steps.map((s,i)=>`<div style="font-size:13px;color:var(--c-t2);padding:3px 0;border-bottom:0.5px solid var(--c-sep)"><span style="color:var(--c-blue);font-weight:600;margin-right:6px">${i+1}.</span>${s.replace(/^步骤\d+[：:]/,'')}</div>`).join('')}</div>`:''}
    <div class="btns" style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-prim" onclick="importParsedRecipe()" style="flex:1">导入此菜</button>
      <button class="btn btn-ios-outl" onclick="editImportedRecipe()" style="flex:1">编辑解析内容</button>
    </div>
  `;
}

/** 导入当前解析的菜谱（所有数据），强制清除输入框 */
function importParsedRecipe(){
  const rc=window._importedRecipe;
  try{
    if(!rc){toast('请先解析菜谱');return}
    const allTexts=[...new Set([...(rc.mainIngredients||[]),...(rc.seasonings||[])])];
    if(!rc.name){toast('菜名不能为空');return}
    if(!allTexts.length){toast('食材不能为空，请编辑解析内容');return}
    const ingredients=allTexts.map(t=>normalizeIngredient(t));
    const steps=(rc.steps||[]).map((s,i)=>({order:i+1,description:s.replace(/^步骤\d+[：:]/,'').trim(),imagePath:null,duration:null}));
    createRecipe({
      name:rc.name,category:'meat',subcategory:'',coverImagePath:null,
      ingredients,steps,
      prepTime:null,servings:2,difficulty:2,sourceUrl:null,sourceName:'导入',tags:[],notes:''
    });
    toast('已导入「'+rc.name+'」');
    document.getElementById('import-results').innerHTML='<div style="font-size:14px;color:var(--c-green);font-weight:600">✓ 导入成功</div>';
  }catch(e){
    console.error('导入失败:',e);
    toast('导入失败：'+e.message);
  }finally{
    // 无论成功失败都清空输入框
    document.getElementById('import-text').value='';
  }
}

/** 跳转编辑页预填解析的数据 */
function editImportedRecipe(){
  const rc=window._importedRecipe;if(!rc){toast('请先解析菜谱');return}
  const allTexts=[...new Set([...(rc.mainIngredients||[]),...(rc.seasonings||[])])];
  document.getElementById('edit-form')&&(document.getElementById('edit-form').innerHTML='');
  editCoverDataUrl='';editingRecipeId=null;
  editIngredientRows=allTexts.length?allTexts.map(t=>({id:uid(),val:t})):[{id:uid(),val:''}];
  editStepRows=(rc.steps||[]).length?rc.steps.map(s=>({id:uid(),desc:s.replace(/^步骤\d+[：:]/,'').trim(),img:''})):[{id:uid(),desc:'',img:''}];
  page('edit');
  setTimeout(()=>document.getElementById('ef-name').value=rc.name,50);
}

// ====== EDIT CATEGORIES ======
function renderEditCats(){
  const cats=getCats();const subcats=getSubcats();
  document.getElementById('edit-cats-form').innerHTML=`
    <div class="form-group"><label class="form-label">主分类</label></div>
    ${cats.map((c,i)=>`<div class="edit-cat-row"><span class="cat-label">${c.e}</span><input class="form-input" value="${c.k}" style="width:60px" data-cat-idx="${i}" data-cat-field="k"><input class="form-input" value="${c.l}" style="width:60px" data-cat-idx="${i}" data-cat-field="l"><input class="form-input" value="${c.e}" style="width:44px" data-cat-idx="${i}" data-cat-field="e"><span class="row-del" onclick="deleteCat(${i})">✕</span></div>`).join('')}
    <div class="add-row" onclick="addCat()">+ 添加主分类</div>
    <div style="margin-top:20px"><label class="form-label">各分类的子类别（逗号分隔）</label></div>
    ${cats.map(c=>`<div class="form-group"><label class="form-label">${c.e} ${c.l}</label><input class="form-input subcat-input" value="${(subcats[c.k]||[]).join(',')}" data-cat="${c.k}" placeholder="如：猪肉,牛肉,鸡肉"></div>`).join('')}
  `
}
function deleteCat(idx){const cats=getCats();if(cats.length<=1){toast('至少保留一个分类');return};cats.splice(idx,1);DB.set('custom_cats',cats);customCats=cats;renderEditCats()}
function addCat(){const cats=getCats();const k=prompt('分类 key：');if(!k||!k.trim())return;const l=prompt('名称：');if(!l||!l.trim())return;const e=prompt('图标：','🍽️');cats.push({k:k.trim(),l:l.trim(),e:e||'🍽️',c:'#666'});DB.set('custom_cats',cats);customCats=cats;renderEditCats()}
function saveCategories(){
  const cats=getCats();
  document.querySelectorAll('[data-cat-idx]').forEach(inp=>{const idx=parseInt(inp.dataset.catIdx),field=inp.dataset.catField;if(cats[idx])cats[idx][field]=inp.value});
  DB.set('custom_cats',cats);customCats=cats;
  const subcats={};document.querySelectorAll('.subcat-input').forEach(inp=>{subcats[inp.dataset.cat]=inp.value.split(/[,，]/).map(s=>s.trim()).filter(Boolean)});
  DB.set('custom_subcats',subcats);customSubcats=subcats;toast('分类已保存');goBack()
}

// ====== MINE ======
function renderMine(){
  const rs=getRecipes();const shop=getShopIds();
  document.getElementById('mine-count').textContent=rs.length;
  document.getElementById('mine-shop').textContent=shop.length;
  document.getElementById('menu-badge').textContent=shop.length;
  const used=new Blob([JSON.stringify(rs)]).size;const total=10*1024*1024;const ratio=Math.round(used/total*100);
  document.getElementById('storage-bar').innerHTML=`<div style="font-weight:600;margin-bottom:6px;font-size:14px">存储用量</div><div class="storage-fill"><div style="width:${ratio}%" class="${ratio>80?'warn':''}"></div></div><div style="font-size:11px;color:var(--c-t3);margin-top:4px">${(used/1024/1024).toFixed(2)} MB / 10 MB (${ratio}%)</div>`
}
function exportData(){navigator.clipboard.writeText(JSON.stringify(getRecipes(),null,2)).then(()=>toast('已复制到剪贴板')).catch(()=>toast('复制失败'))}
function importData(){
  if(!confirm('将从剪贴板读取合并导入。继续？'))return;
  navigator.clipboard.readText().then(t=>{try{const data=JSON.parse(t);if(!Array.isArray(data))throw new Error('格式错误');const exist=getRecipes(),existNames=new Set(exist.map(r=>r.name));const news=data.filter(r=>r.name&&!existNames.has(r.name));saveRecipes([...exist,...news]);toast('导入了 '+news.length+' 道')}catch{toast('格式不正确')}}).catch(()=>toast('读取失败'))
}
function clearAllData(){if(!confirm('确定清空所有数据？'))return;clearAllLocalData();customCats=null;customSubcats=null;toast('已清空');renderHome();renderMine()}

function esc(s){if(!s)return'';const d=document.createElement('div');d.textContent=s;return d.innerHTML}
