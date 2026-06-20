/** 应用初始化 */
(async function(){
  // 1. 先尝试从共享服务器拉取数据
  await DB.syncFromServer();

  // 2. 首次使用才创建示例数据
  if(!DB.get('recipes')){
    const samples=[
      {id:uid(),name:'番茄炒蛋',category:'vegetarian',subcategory:'茄果',coverImagePath:null,
        ingredients:[{id:uid(),canonicalName:'番茄',amount:'2个',quantity:2,unit:'个',category:'vegetable',notes:''},{id:uid(),canonicalName:'鸡蛋',amount:'3个',quantity:3,unit:'个',category:'dairy',notes:''},{id:uid(),canonicalName:'盐',amount:'适量',quantity:null,unit:'适量',category:'seasoning',notes:''},{id:uid(),canonicalName:'白糖',amount:'少许',quantity:null,unit:'少许',category:'seasoning',notes:''},{id:uid(),canonicalName:'葱',amount:'1根',quantity:1,unit:'根',category:'seasoning',notes:'切葱花'}],
        steps:[{order:1,description:'番茄洗净切块，鸡蛋打散加少许盐搅匀。',imagePath:null,duration:null},{order:2,description:'热锅冷油，倒入蛋液划散，凝固后盛出。',imagePath:null,duration:null},{order:3,description:'锅中加油，放番茄块中火翻炒出汁水。',imagePath:null,duration:null},{order:4,description:'加白糖提鲜，倒回鸡蛋翻炒，加盐调味。',imagePath:null,duration:null},{order:5,description:'撒葱花出锅装盘。',imagePath:null,duration:null}],
        prepTime:15,servings:2,difficulty:1,sourceUrl:null,sourceName:null,tags:['家常菜','快手菜','下饭菜'],createdAt:Date.now()-86400000,updatedAt:Date.now()-86400000,notes:'番茄要炒出汁才好吃'},
      {id:uid(),name:'红烧排骨',category:'meat',subcategory:'猪肉',coverImagePath:null,
        ingredients:[{id:uid(),canonicalName:'排骨',amount:'500g',quantity:500,unit:'g',category:'meat',notes:''},{id:uid(),canonicalName:'生抽',amount:'2勺',quantity:2,unit:'勺',category:'seasoning',notes:''},{id:uid(),canonicalName:'老抽',amount:'1勺',quantity:1,unit:'勺',category:'seasoning',notes:'上色'},{id:uid(),canonicalName:'料酒',amount:'2勺',quantity:2,unit:'勺',category:'seasoning',notes:''},{id:uid(),canonicalName:'冰糖',amount:'15g',quantity:15,unit:'g',category:'seasoning',notes:''},{id:uid(),canonicalName:'生姜',amount:'3片',quantity:3,unit:'片',category:'seasoning',notes:''},{id:uid(),canonicalName:'八角',amount:'2个',quantity:2,unit:'个',category:'seasoning',notes:''}],
        steps:[{order:1,description:'排骨冷水下锅，加姜片料酒焯水，撇沫捞出。',imagePath:null,duration:null},{order:2,description:'少许油，放冰糖小火炒至琥珀色。',imagePath:null,duration:null},{order:3,description:'倒排骨翻炒上色，加姜片八角炒香。',imagePath:null,duration:null},{order:4,description:'加生抽、老抽、料酒，加开水没过排骨。',imagePath:null,duration:null},{order:5,description:'大火烧开转小火炖40分钟，收汁即可。',imagePath:null,duration:null}],
        prepTime:60,servings:3,difficulty:2,sourceUrl:null,sourceName:null,tags:['硬菜','下饭菜'],createdAt:Date.now()-172800000,updatedAt:Date.now()-172800000,notes:'炒糖色用小火，别炒糊'},
      {id:uid(),name:'葱爆牛肉',category:'meat',subcategory:'牛肉',coverImagePath:null,
        ingredients:[{id:uid(),canonicalName:'牛肉',amount:'300g',quantity:300,unit:'g',category:'meat',notes:'牛里脊切片'},{id:uid(),canonicalName:'葱',amount:'3根',quantity:3,unit:'根',category:'vegetable',notes:'大葱切段'},{id:uid(),canonicalName:'生姜',amount:'3片',quantity:3,unit:'片',category:'seasoning',notes:''},{id:uid(),canonicalName:'生抽',amount:'1勺',quantity:1,unit:'勺',category:'seasoning',notes:''},{id:uid(),canonicalName:'料酒',amount:'1勺',quantity:1,unit:'勺',category:'seasoning',notes:''},{id:uid(),canonicalName:'淀粉',amount:'1勺',quantity:1,unit:'勺',category:'seasoning',notes:'腌肉用'}],
        steps:[{order:1,description:'牛肉切薄片，加料酒、生抽、淀粉抓匀腌10分钟。',imagePath:null,duration:null},{order:2,description:'大葱斜切成段，姜蒜切片。',imagePath:null,duration:null},{order:3,description:'大火热油，下牛肉快速滑炒变色立即盛出。',imagePath:null,duration:null},{order:4,description:'锅中留底油，爆香姜蒜，下葱段大火翻炒至软。',imagePath:null,duration:null},{order:5,description:'倒回牛肉翻炒均匀，加少许生抽调味出锅。',imagePath:null,duration:null}],
        prepTime:20,servings:2,difficulty:2,sourceUrl:null,sourceName:null,tags:['下饭菜','快手菜'],createdAt:Date.now()-129600000,updatedAt:Date.now()-129600000,notes:'牛肉要大火快炒'},
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
