/** 应用初始化 */
(async function(){
  // 从云端拉取数据（覆盖本地）
  DB.syncFromCloud();
  // 推送本地数据到云端
  setTimeout(function() { DB.pushToCloud(); }, 1000);

  // 1b. 迁移旧数据：清除已废弃的字段
  var allRecipes=getRecipes();
  if(allRecipes.length){
    var changed=false;
    for(var ri=0;ri<allRecipes.length;ri++){
      var r=allRecipes[ri];
      if(r.steps||r.prepTime||r.servings!==undefined||r.difficulty||r.sourceUrl||r.sourceName){
        delete r.steps;delete r.prepTime;delete r.servings;delete r.difficulty;delete r.sourceUrl;delete r.sourceName;
        changed=true;
      }
    }
    if(changed)saveRecipes(allRecipes);
  }

  // 2. 首次使用才创建示例数据
  if(!DB.get('recipes')){
    const samples=[
      {id:uid(),name:'番茄炒蛋',category:'vegetarian',subcategory:'茄果',
        ingredients:[{id:uid(),canonicalName:'番茄',amount:'2个',quantity:2,unit:'个',category:'vegetable',notes:''},{id:uid(),canonicalName:'鸡蛋',amount:'3个',quantity:3,unit:'个',category:'dairy',notes:''},{id:uid(),canonicalName:'葱',amount:'1根',quantity:1,unit:'根',category:'seasoning',notes:'切葱花'}],
        tags:['家常菜','快手菜','下饭菜'],createdAt:Date.now()-86400000,updatedAt:Date.now()-86400000,notes:'番茄要炒出汁才好吃'},
      {id:uid(),name:'红烧排骨',category:'meat',subcategory:'猪肉',
        ingredients:[{id:uid(),canonicalName:'排骨',amount:'500g',quantity:500,unit:'g',category:'meat',notes:''},{id:uid(),canonicalName:'生抽',amount:'2勺',quantity:2,unit:'勺',category:'seasoning',notes:''},{id:uid(),canonicalName:'老抽',amount:'1勺',quantity:1,unit:'勺',category:'seasoning',notes:'上色'},{id:uid(),canonicalName:'冰糖',amount:'15g',quantity:15,unit:'g',category:'seasoning',notes:''},{id:uid(),canonicalName:'生姜',amount:'3片',quantity:3,unit:'片',category:'seasoning',notes:''}],
        tags:['硬菜','下饭菜'],createdAt:Date.now()-172800000,updatedAt:Date.now()-172800000,notes:'炒糖色用小火，别炒糊'},
      {id:uid(),name:'葱爆牛肉',category:'meat',subcategory:'牛肉',
        ingredients:[{id:uid(),canonicalName:'牛肉',amount:'300g',quantity:300,unit:'g',category:'meat',notes:'牛里脊切片'},{id:uid(),canonicalName:'葱',amount:'3根',quantity:3,unit:'根',category:'vegetable',notes:'大葱切段'},{id:uid(),canonicalName:'生抽',amount:'1勺',quantity:1,unit:'勺',category:'seasoning',notes:''},{id:uid(),canonicalName:'料酒',amount:'1勺',quantity:1,unit:'勺',category:'seasoning',notes:''}],
        tags:['下饭菜','快手菜'],createdAt:Date.now()-129600000,updatedAt:Date.now()-129600000,notes:'牛肉要大火快炒'},
    ];
    saveRecipes(samples);
  }

  // 3. 绑定 Tab 栏
  document.querySelectorAll('#tab-bar .tab-item').forEach(item=>{
    item.addEventListener('click',function(){switchTab(this.dataset.page)});
  });

  // 4. 首页渲染
  renderHome();
})();
