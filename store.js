/** 数据存储层 — 支持本地 localStorage 和共享服务器双模式 */
const DB = {
  _cache: {}, // 内存缓存，避免频繁读 localStorage

  /** 读取 */
  get(k) {
    // 优先内存
    if (this._cache[k] !== undefined) return this._cache[k];
    try {
      const v = localStorage.getItem(k);
      const val = v ? JSON.parse(v) : null;
      this._cache[k] = val;
      return val;
    } catch { return null }
  },

  /** 写入 */
  set(k, v) {
    this._cache[k] = v;
    try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { alert('存储空间不足！请清理数据。') }
    // 如果有共享服务器，异步推送
    if (window.__SERVER_SYNC__) this._syncToServer();
  },

  /** 删除 */
  remove(k) {
    delete this._cache[k];
    localStorage.removeItem(k);
    if (window.__SERVER_SYNC__) this._syncToServer();
  },

  /** 全量同步到服务器 */
  async _syncToServer() {
    try {
      const data = {};
      // 收集所有本小程序用到的 key
      for (const key of ['recipes', 'shop_ids', 'shop_checked', 'shop_excluded', 'custom_cats', 'custom_subcats']) {
        const val = localStorage.getItem(key);
        if (val) data[key] = JSON.parse(val);
      }
      await fetch(window.__SERVER_URL__ + '/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      // 服务器不可用时静默降级到 localStorage
      console.warn('同步到服务器失败，使用本地存储:', e.message);
    }
  },

  /** 从服务器拉取初始数据（首次加载时调用） */
  async syncFromServer() {
    if (!window.__SERVER_SYNC__) return;
    try {
      const resp = await fetch(window.__SERVER_URL__ + '/api/data');
      const data = await resp.json();
      let changed = false;
      for (const [key, val] of Object.entries(data)) {
        // 只在本地没有时取服务器数据，或以后者为准（可改为合并逻辑）
        const local = localStorage.getItem(key);
        if (!local || JSON.parse(local).length === 0) {
          localStorage.setItem(key, JSON.stringify(val));
          this._cache[key] = val;
          changed = true;
        }
      }
      if (changed) {
        console.log('📡 已从服务器同步数据');
        // 通知 UI 刷新
        if (window.renderHome) window.renderHome();
        if (window.renderMine) window.renderMine();
      }
    } catch (e) {
      console.log('📡 服务器同步不可用，使用本地存储');
    }
  }
};

// ====== Recipe CRUD ======
function getRecipes(){return DB.get('recipes')||[]}
function getRecipeById(id){return getRecipes().find(r=>r.id===id)}
function saveRecipes(arr){DB.set('recipes',arr)}

function createRecipe(input){
  const now=Date.now();
  const r={...input,id:uid(),createdAt:now,updatedAt:now};
  const all=getRecipes();all.unshift(r);saveRecipes(all);return r
}
function updateRecipe(id,input){
  const all=getRecipes();const i=all.findIndex(r=>r.id===id);
  if(i===-1)return null;
  all[i]={...all[i],...input,updatedAt:Date.now()};saveRecipes(all);return all[i]
}
function deleteRecipe(id){
  const all=getRecipes();const r=all.find(r=>r.id===id);
  if(!r)return!1;
  saveRecipes(all.filter(r=>r.id!==id));
  removeFromShopList(id);return!0
}
function searchByName(q){return getRecipes().filter(r=>fuzzyMatch(q,r.name)||r.tags.some(t=>fuzzyMatch(q,t)))}
function searchByIngredients(names){
  const ns=names.map(n=>n.trim().toLowerCase());
  return getRecipes().filter(r=>{
    let m=0;
    for(const ing of r.ingredients){if(ns.some(n=>ing.canonicalName.toLowerCase().includes(n)||n.includes(ing.canonicalName.toLowerCase())))m++}
    return m>0
  })
}

// ====== Shopping list IDs ======
function getShopIds(){return DB.get('shop_ids')||[]}
function addToShopList(id){const ids=getShopIds();if(!ids.includes(id)){ids.push(id);DB.set('shop_ids',ids)}}
function removeFromShopList(id){DB.set('shop_ids',getShopIds().filter(i=>i!==id))}
function clearShopList(){DB.set('shop_ids',[]);DB.remove('shop_checked');DB.remove('shop_excluded');DB.remove('shop_recipe_checked')}

// ====== Per-recipe toggle (在购物清单中临时勾选/取消) ======
function getCheckedRecipeIds(){
  const all=getShopIds();
  const checked=DB.get('shop_recipe_checked');
  // 默认全部选中
  if(!checked||!checked.length)return[...all];
  return all.filter(id=>checked.includes(id));
}
function toggleRecipeCheck(recipeId){
  const checked=DB.get('shop_recipe_checked');
  let list=checked&&checked.length?[...checked]:[...getShopIds()];
  const idx=list.indexOf(recipeId);
  if(idx>=0)list.splice(idx,1);else list.push(recipeId);
  DB.set('shop_recipe_checked',list);
}
function areAllRecipesChecked(){
  const all=getShopIds();
  if(!all.length)return!0;
  const checked=DB.get('shop_recipe_checked');
  if(!checked||!checked.length)return!0;
  return all.every(id=>checked.includes(id));
}

// ====== Excluded ingredients ======
function getShopExcluded(){return DB.get('shop_excluded')||[]}
function addShopExcluded(name){const s=getShopExcluded();if(!s.includes(name)){s.push(name);DB.set('shop_excluded',s)}}
function clearShopExcluded(){DB.remove('shop_excluded')}

// ====== Clear all data ======
function clearAllLocalData(){
  ['recipes','shop_ids','shop_checked','shop_excluded','custom_cats','custom_subcats'].forEach(k=>{localStorage.removeItem(k);delete DB._cache[k]});
  if(window.__SERVER_SYNC__) DB._syncToServer();
}
