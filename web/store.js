/** 数据存储层 — localStorage + CloudBase 云端同步 */
const CLOUD_ENV = 'helena0123-d6gtjj4upe60b94f8';
const DOC_ID = 'main_data';

var _cloudDb = null; // CloudBase 数据库实例
var _syncEnabled = false;
var _syncReady = false;
var _pendingOps = []; // 离线时的待同步操作

/** 初始化 CloudBase */
function initCloud() {
  try {
    if (typeof cloudbase === 'undefined') return;
    var app = cloudbase.init({ env: CLOUD_ENV });
    // 开启匿名登录（需要云开发控制台启用该能力）
    app.auth({ persistence: 'local' }).signInAnonymously().then(function() {
      _cloudDb = app.database();
      _syncEnabled = true;
      console.log('☁️ CloudBase 已连接（匿名登录）');
      syncFromCloud(); // 连接后自动拉取数据
    }).catch(function(e) {
      console.log('☁️ 匿名登录失败，使用本地存储:', e.message);
    });
  } catch (e) {
    console.log('☁️ CloudBase 不可用，使用本地存储');
    _syncEnabled = false;
  }
}

// 页面加载后自动初始化
setTimeout(initCloud, 500);

// ====== 本地存储（localStorage 兜底） ======
var _cache = {};

function localGet(k) {
  if (_cache[k] !== undefined) return _cache[k];
  try { var v = localStorage.getItem(k); var val = v ? JSON.parse(v) : null; _cache[k] = val; return val }
  catch { return null }
}
function localSet(k, v) {
  _cache[k] = v;
  try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { alert('存储空间不足！请清理数据。') }
  syncToCloud(); // 每次写入触发同步
}
function localRemove(k) {
  delete _cache[k];
  localStorage.removeItem(k);
  syncToCloud();
}

// ====== CloudBase 同步 ======
var _syncTimer = null;
var _isSyncing = false;

/** 将本地数据推送到云端 */
function syncToCloud() {
  if (!_syncEnabled || !_cloudDb) return;
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(doSync, 500); // 防抖
}

function doSync() {
  if (_isSyncing) return;
  _isSyncing = true;
  try {
    var data = {};
    ['recipes', 'shop_ids', 'shop_checked', 'shop_excluded', 'shop_recipe_checked', 'custom_cats', 'custom_subcats']
      .forEach(function(k) {
        var v = localStorage.getItem(k);
        if (v) data[k] = JSON.parse(v);
      });
    _cloudDb.collection('cookbook_data').doc(DOC_ID).set(data)
      .then(function() { _isSyncing = false })
      .catch(function(e) { _isSyncing = false; console.warn('☁️ 推送失败:', e.message) });
  } catch(e) { _isSyncing = false }
}

/** 从云端拉取数据到本地 */
function syncFromCloud() {
  if (!_syncEnabled || !_cloudDb) return Promise.resolve();
  return _cloudDb.collection('cookbook_data').doc(DOC_ID).get()
    .then(function(res) {
      if (res.data && res.data.length > 0) {
        var cloudData = res.data[0];
        var changed = false;
        Object.keys(cloudData).forEach(function(k) {
          if (k === '_id') return;
          var localVal = localStorage.getItem(k);
          var cloudVal = JSON.stringify(cloudData[k]);
          // 本地无数据或本地数据为空时，用云端数据
          if (!localVal || localVal === '[]' || localVal === '{}') {
            localStorage.setItem(k, cloudVal);
            _cache[k] = cloudData[k];
            changed = true;
          }
        });
        if (changed) {
          console.log('☁️ 已从云端同步');
          if (window.renderHome) window.renderHome();
          if (window.renderMine) window.renderMine();
          if (window.renderShopList) window.renderShopList();
        }
      }
    })
    .catch(function(e) {
      console.log('☁️ 拉取失败，使用本地数据:', e.message);
    });
}

// ====== DB 接口（兼容原有调用方式） ======
var DB = {
  get: localGet,
  set: localSet,
  remove: localRemove,
  syncFromCloud: syncFromCloud,
};

// ====== Recipe CRUD ======
function getRecipes(){return DB.get('recipes')||[]}
function getRecipeById(id){return getRecipes().find(function(r){return r.id===id})}
function saveRecipes(arr){DB.set('recipes',arr)}

function createRecipe(input){
  var now=Date.now();
  var r={...input,id:uid(),createdAt:now,updatedAt:now};
  var all=getRecipes();all.unshift(r);saveRecipes(all);return r
}
function updateRecipe(id,input){
  var all=getRecipes();var i=all.findIndex(function(r){return r.id===id});
  if(i===-1)return null;
  all[i]={...all[i],...input,updatedAt:Date.now()};saveRecipes(all);return all[i]
}
function deleteRecipe(id){
  var all=getRecipes();var r=all.find(function(r){return r.id===id});
  if(!r)return!1;
  saveRecipes(all.filter(function(r2){return r2.id!==id}));
  removeFromShopList(id);return!0
}
function searchByName(q){return getRecipes().filter(function(r){return fuzzyMatch(q,r.name)||r.tags.some(function(t){return fuzzyMatch(q,t)})})}
function searchByIngredients(names){
  var ns=names.map(function(n){return n.trim().toLowerCase()});
  return getRecipes().filter(function(r){
    var m=0;
    for(var j=0;j<r.ingredients.length;j++){var ing=r.ingredients[j];if(ns.some(function(n){return ing.canonicalName.toLowerCase().includes(n)||n.includes(ing.canonicalName.toLowerCase())}))m++}
    return m>0
  })
}

// ====== Shopping list IDs ======
function getShopIds(){return DB.get('shop_ids')||[]}
function addToShopList(id){
  var ids=getShopIds();
  if(!ids.includes(id)){ids.push(id);DB.set('shop_ids',ids)}
  var checked=DB.get('shop_recipe_checked');
  if(checked&&!checked.includes(id)){checked.push(id);DB.set('shop_recipe_checked',checked)}
  var recipe=getRecipeById(id);
  if(recipe){
    var excluded=getShopExcluded();
    var changed=false;
    for(var i=excluded.length-1;i>=0;i--){
      if(recipe.ingredients.some(function(ing){return ing.canonicalName===excluded[i]})){
        excluded.splice(i,1);changed=true;
      }
    }
    if(changed)DB.set('shop_excluded',excluded);
  }
}
function removeFromShopList(id){DB.set('shop_ids',getShopIds().filter(function(i){return i!==id}))}
function clearShopList(){DB.set('shop_ids',[]);DB.remove('shop_checked');DB.remove('shop_excluded');DB.remove('shop_recipe_checked')}

// ====== Recipe toggle ======
function getCheckedRecipeIds(){
  var all=getShopIds();
  var checked=DB.get('shop_recipe_checked');
  if(!checked||!checked.length)return[...all];
  return all.filter(function(id){return checked.includes(id)});
}
function toggleRecipeCheck(recipeId){
  var checked=DB.get('shop_recipe_checked');
  var list=checked&&checked.length?[...checked]:[...getShopIds()];
  var idx=list.indexOf(recipeId);
  if(idx>=0){
    list.splice(idx,1);
  }else{
    list.push(recipeId);
    var recipe=getRecipeById(recipeId);
    if(recipe){
      var excluded=getShopExcluded();
      var changed=false;
      for(var ei=excluded.length-1;ei>=0;ei--){
        if(recipe.ingredients.some(function(ing){return ing.canonicalName===excluded[ei]})){
          excluded.splice(ei,1);changed=true;
        }
      }
      if(changed)DB.set('shop_excluded',excluded);
    }
  }
  DB.set('shop_recipe_checked',list);
}
function areAllRecipesChecked(){
  var all=getShopIds();if(!all.length)return!0;
  var checked=DB.get('shop_recipe_checked');
  if(!checked||!checked.length)return!0;
  return all.every(function(id){return checked.includes(id)});
}

// ====== Excluded ingredients ======
function getShopExcluded(){return DB.get('shop_excluded')||[]}
function addShopExcluded(name){var s=getShopExcluded();if(!s.includes(name)){s.push(name);DB.set('shop_excluded',s)}}
function clearShopExcluded(){DB.remove('shop_excluded')}

// ====== Clear all ======
function clearAllLocalData(){
  ['recipes','shop_ids','shop_checked','shop_excluded','shop_recipe_checked','custom_cats','custom_subcats'].forEach(function(k){localStorage.removeItem(k);delete _cache[k]});
  syncToCloud();
}
