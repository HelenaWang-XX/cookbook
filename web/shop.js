/** 购物清单合并 — 过滤调料 + 排除已删除食材
 *  @param recipeIds - 可选，只合并指定菜谱的食材（默认用 shop_ids）
 */
function generateShopList(recipeIds){
  const ids=recipeIds||getShopIds();if(!ids.length)return[];
  const recipes=getRecipes().filter(r=>ids.includes(r.id));
  const excluded=getShopExcluded();
  const map=new Map();
  for(const r of recipes){
    for(const ing of r.ingredients){
      // 跳过调料
      if(ing.category==='seasoning'||isSeasoning(ing.canonicalName,ing.category))continue;
      // 跳过高亮排除的食材
      if(excluded.includes(ing.canonicalName))continue;
      const key=ing.canonicalName+'|'+(ing.unit||'none');
      if(map.has(key)){
        const ex=map.get(key);
        ex.recipes.push({rid:r.id,rname:r.name,txt:ing.canonicalName+' '+ing.amount});
        if(ing.quantity!=null&&ex.qty!=null)ex.qty+=ing.quantity;else ex.qty=null;
        ex.raws.push(ing.amount);
      }else{
        map.set(key,{name:ing.canonicalName,unit:ing.unit,qty:ing.quantity,raws:[ing.amount],cat:ing.category,
          recipes:[{rid:r.id,rname:r.name,txt:ing.canonicalName+' '+ing.amount}],checked:!1});
      }
    }
  }
  const checked=getCheckedSet();
  const order=['meat','vegetable','seafood','dairy','staple','dry_goods','other'];
  return [...map.values()].map(m=>({...m,checked:checked.has(m.name)})).sort((a,b)=>order.indexOf(a.cat)-order.indexOf(b.cat))
}
function getCheckedSet(){return new Set(DB.get('shop_checked')||[])}
function toggleShopCheck(name,checked){const s=getCheckedSet();checked?s.add(name):s.delete(name);DB.set('shop_checked',[...s])}
function clearShopChecked(){DB.remove('shop_checked')}
