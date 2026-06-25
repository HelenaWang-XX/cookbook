/** 数据存储层 — localStorage + GitHub Gist 云同步 */
var GIST_ID = ''; // 首次同步时创建
var _syncTimer = null;
var _isSyncing = false;
var _cache = {};

// ====== 本地存储 ======
function localGet(k) {
  if (_cache[k] !== undefined) return _cache[k];
  try { var v = localStorage.getItem(k); var val = v ? JSON.parse(v) : null; _cache[k] = val; return val; }
  catch { return null; }
}

function localSet(k, v) {
  _cache[k] = v;
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { alert('存储空间不足！请清理数据。'); }
  syncToCloud();
}

function localRemove(k) {
  delete _cache[k];
  localStorage.removeItem(k);
  syncToCloud();
}

// ====== 云端同步（通过 GitHub Gist API） ======
function getGithubToken() {
  var token = localStorage.getItem('github_token');
  if (!token) {
    token = prompt('请输入 GitHub Token（在 github.com/settings/tokens 创建）\n需要勾选 repo + gist 权限：');
    if (token) localStorage.setItem('github_token', token);
  }
  return token;
}
function ghHeaders() {
  var token = getGithubToken();
  return token ? { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json' } : null;
}

function syncToCloud() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(doSync, 500);
}

function collectSyncData() {
  var data = {};
  var keys = ['recipes', 'shop_ids', 'shop_checked', 'shop_excluded', 'shop_recipe_checked', 'custom_cats', 'custom_subcats'];
  for (var i = 0; i < keys.length; i++) {
    var v = localStorage.getItem(keys[i]);
    if (v) data[keys[i]] = JSON.parse(v);
  }
  return data;
}

function getGistId() {
  if (GIST_ID) return Promise.resolve(GIST_ID);
  var h = ghHeaders(); if (!h) return Promise.resolve(null);
  return fetch('https://api.github.com/gists', { headers: h }).then(function(r) { return r.json(); }).then(function(gists) {
    if (!Array.isArray(gists)) return null;
    for (var i = 0; i < gists.length; i++) {
      if (gists[i].description === 'cookbook-sync') { GIST_ID = gists[i].id; return GIST_ID; }
    }
    return fetch('https://api.github.com/gists', {
      method: 'POST', headers: h,
      body: JSON.stringify({ description: 'cookbook-sync', public: false, files: { 'data.json': { content: '{}' } } })
    }).then(function(r) { return r.json(); }).then(function(g) { if (g.id) { GIST_ID = g.id; return GIST_ID; } return null; });
  });
}

function doSync() {
  if (_isSyncing) return;
  _isSyncing = true;
  var data = collectSyncData();
  if (Object.keys(data).length === 0) { _isSyncing = false; return; }
  var h = ghHeaders(); if (!h) { _isSyncing = false; return; }
  var content = JSON.stringify(data, null, 2);

  getGistId().then(function(gistId) {
    if (!gistId) { _isSyncing = false; return; }
    return fetch('https://api.github.com/gists/' + gistId, {
      method: 'PATCH', headers: h,
      body: JSON.stringify({ files: { 'data.json': { content: content } } })
    });
  }).then(function(r) { return r ? r.json() : null; }).then(function(res) {
    if (res && !res.message) console.log('☁️ 已同步到云端');
    else if (res) console.warn('☁️ 同步失败:', res.message);
    _isSyncing = false;
  }).catch(function(e) {
    console.log('☁️ 云端不可达，本地存储正常使用');
    _isSyncing = false;
  });
}

function syncFromCloud() {
  var h = ghHeaders(); if (!h) return Promise.resolve();
  return getGistId().then(function(gistId) {
    if (!gistId) return null;
    return fetch('https://api.github.com/gists/' + gistId, { headers: h });
  }).then(function(r) { return r ? r.json() : null; }).then(function(gist) {
    if (!gist || !gist.files || !gist.files['data.json']) return;
    var cloudData = JSON.parse(gist.files['data.json'].content);
    var changed = false;
    for (var k in cloudData) {
      localStorage.setItem(k, JSON.stringify(cloudData[k]));
      _cache[k] = cloudData[k];
      changed = true;
    }
    if (changed) {
      console.log('☁️ 已从云端同步');
      if (window.renderHome) window.renderHome();
      if (window.renderMine) window.renderMine();
      if (window.renderShopList) window.renderShopList();
    }
  }).catch(function(e) {
    console.log('☁️ 云端拉取失败，使用本地数据');
  });
}

function pushToCloud() {
  doSync();
  return Promise.resolve(true);
}

// 每 15 秒拉取云端更新
setInterval(function() { syncFromCloud(); }, 15000);

// ====== DB 接口 ======
var DB = {
  get: localGet, set: localSet, remove: localRemove,
  syncFromCloud: syncFromCloud, pushToCloud: pushToCloud
};

// ====== Recipe CRUD ======
function getRecipes() { return DB.get('recipes') || []; }
function getRecipeById(id) { var rs = getRecipes(); for (var i = 0; i < rs.length; i++) { if (rs[i].id === id) return rs[i]; } return null; }
function saveRecipes(arr) { DB.set('recipes', arr); }

function createRecipe(input) {
  var now = Date.now();
  var r = { ...input, id: uid(), createdAt: now, updatedAt: now };
  var all = getRecipes(); all.unshift(r); saveRecipes(all); return r;
}

function updateRecipe(id, input) {
  var all = getRecipes();
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id) {
      all[i] = { ...all[i], ...input, updatedAt: Date.now() };
      saveRecipes(all);
      return all[i];
    }
  }
  return null;
}

function deleteRecipe(id) {
  var all = getRecipes();
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id) { all.splice(i, 1); saveRecipes(all); removeFromShopList(id); return true; }
  }
  return false;
}

function searchByName(q) {
  var rs = getRecipes(); var result = [];
  for (var i = 0; i < rs.length; i++) {
    if (fuzzyMatch(q, rs[i].name) || rs[i].tags.some(function(t) { return fuzzyMatch(q, t); })) result.push(rs[i]);
  }
  return result;
}

function searchByIngredients(names) {
  var rs = getRecipes(); var result = [];
  for (var i = 0; i < rs.length; i++) {
    var r = rs[i]; var matchCount = 0;
    for (var j = 0; j < r.ingredients.length; j++) {
      var ingName = r.ingredients[j].canonicalName.toLowerCase();
      for (var ni = 0; ni < names.length; ni++) {
        if (ingName.includes(names[ni].trim().toLowerCase()) || names[ni].trim().toLowerCase().includes(ingName)) { matchCount++; break; }
      }
    }
    if (matchCount > 0) result.push(r);
  }
  return result;
}

// ====== Shopping list ======
function getShopIds() { return DB.get('shop_ids') || []; }
function addToShopList(id) {
  var ids = getShopIds();
  if (!ids.includes(id)) { ids.push(id); DB.set('shop_ids', ids); }
  var checked = DB.get('shop_recipe_checked');
  if (checked && !checked.includes(id)) { checked.push(id); DB.set('shop_recipe_checked', checked); }
  var recipe = getRecipeById(id);
  if (recipe) {
    var excluded = getShopExcluded(); var changed = false;
    for (var i = excluded.length - 1; i >= 0; i--) {
      for (var j = 0; j < recipe.ingredients.length; j++) {
        if (recipe.ingredients[j].canonicalName === excluded[i]) { excluded.splice(i, 1); changed = true; break; }
      }
    }
    if (changed) DB.set('shop_excluded', excluded);
  }
}
function removeFromShopList(id) { DB.set('shop_ids', getShopIds().filter(function(i) { return i !== id; })); }
function clearShopList() { DB.set('shop_ids', []); DB.remove('shop_checked'); DB.remove('shop_excluded'); DB.remove('shop_recipe_checked'); }

function getCheckedRecipeIds() {
  var all = getShopIds(); var checked = DB.get('shop_recipe_checked');
  if (!checked || !checked.length) return all.slice();
  return all.filter(function(id) { return checked.includes(id); });
}

function toggleRecipeCheck(recipeId) {
  var checked = DB.get('shop_recipe_checked');
  var list = checked && checked.length ? checked.slice() : getShopIds().slice();
  var idx = list.indexOf(recipeId);
  if (idx >= 0) { list.splice(idx, 1); }
  else {
    list.push(recipeId); var recipe = getRecipeById(recipeId);
    if (recipe) {
      var excluded = getShopExcluded(); var changed = false;
      for (var ei = excluded.length - 1; ei >= 0; ei--) {
        for (var ji = 0; ji < recipe.ingredients.length; ji++) {
          if (recipe.ingredients[ji].canonicalName === excluded[ei]) { excluded.splice(ei, 1); changed = true; break; }
        }
      }
      if (changed) DB.set('shop_excluded', excluded);
    }
  }
  DB.set('shop_recipe_checked', list);
}

function areAllRecipesChecked() {
  var all = getShopIds(); if (!all.length) return true;
  var checked = DB.get('shop_recipe_checked');
  if (!checked || !checked.length) return true;
  return all.every(function(id) { return checked.includes(id); });
}

function getShopExcluded() { return DB.get('shop_excluded') || []; }
function addShopExcluded(name) { var s = getShopExcluded(); if (!s.includes(name)) { s.push(name); DB.set('shop_excluded', s); } }
function clearShopExcluded() { DB.remove('shop_excluded'); }

function clearAllLocalData() {
  var keys = ['recipes', 'shop_ids', 'shop_checked', 'shop_excluded', 'shop_recipe_checked', 'custom_cats', 'custom_subcats'];
  for (var i = 0; i < keys.length; i++) { localStorage.removeItem(keys[i]); delete _cache[keys[i]]; }
  doSync();
}
