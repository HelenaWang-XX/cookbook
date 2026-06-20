/** 食材标准化 */
const BUILTIN_ALIASES={
  '盐':['食盐','精盐','海盐'],'白糖':['白砂糖','砂糖','糖'],'生抽':['生抽酱油','酱油'],'老抽':['老抽酱油','红烧酱油'],
  '蚝油':['蚝汁'],'料酒':['黄酒','绍酒','花雕酒','烹饪酒'],'醋':['陈醋','香醋','白醋','米醋'],'味精':['味素'],
  '鸡精':['鸡粉'],'豆瓣酱':['郫县豆瓣酱'],'番茄酱':['番茄沙司','ketchup'],'芝麻油':['香油','麻油'],
  '食用油':['色拉油','菜籽油','花生油','大豆油','玉米油','调和油','油'],'猪油':['荤油','大油'],
  '淀粉':['生粉','玉米淀粉','土豆淀粉','太白粉'],'花椒':['花椒粒','麻椒'],'胡椒粉':['白胡椒粉','黑胡椒粉','胡椒面'],
  '辣椒粉':['辣椒面'],'干辣椒':['干红辣椒'],'八角':['大料'],
  '鸡蛋':['土鸡蛋','柴鸡蛋','鲜鸡蛋','草鸡蛋','鸡子儿','蛋'],'番茄':['西红柿','蕃茄','洋柿子'],
  '土豆':['马铃薯','洋芋','山药蛋'],'青椒':['柿子椒','菜椒','甜椒'],'白菜':['大白菜','娃娃菜'],
  '青菜':['上海青','小油菜','油菜','小白菜'],'菠菜':['菠薐'],'芹菜':['香芹','西芹'],
  '韭菜':['壮阳草'],'茄子':['矮瓜','紫茄'],'黄瓜':['青瓜','胡瓜'],'胡萝卜':['红萝卜','甘荀'],
  '猪肉':['猪瘦肉','猪里脊','猪腿肉','猪肉块'],'五花肉':['猪五花','三层肉'],'排骨':['猪排骨','小排','肋排'],
  '肉末':['猪肉末','肉馅','绞肉'],'牛肉':['牛瘦肉','牛里脊','牛腩','牛腱子'],'羊肉':['羊腿肉','羊瘦肉'],
  '鸡肉':['鸡块','鸡腿肉','鸡胸肉'],'鸡胸肉':['鸡胸','鸡脯肉'],'鸡腿':['鸡小腿','琵琶腿'],'鸡翅':['鸡中翅'],
  '虾':['大虾','鲜虾','基围虾','对虾','明虾','海虾'],'虾仁':['虾肉','开背虾仁'],
  '鱼':['鲜鱼','草鱼','鲤鱼','鲫鱼','鲈鱼'],'螃蟹':['大闸蟹','河蟹','梭子蟹'],
  '牛奶':['鲜牛奶','纯牛奶','鲜奶'],'黄油':['牛油','奶油'],'芝士':['奶酪','马苏里拉'],
  '大米':['米','白米'],'面粉':['中筋面粉','小麦粉','高筋面粉','低筋面粉'],'面条':['挂面','切面','鲜面条'],
  '豆腐':['嫩豆腐','老豆腐','北豆腐','南豆腐'],'木耳':['黑木耳','云耳'],'香菇':['冬菇','花菇'],
  '葱':['大葱','香葱','小葱','青葱'],'生姜':['姜','老姜','鲜姜'],'大蒜':['蒜','蒜头','蒜瓣'],
  '香菜':['芫荽'],'洋葱':['洋葱头','圆葱'],'腐竹':['枝竹'],'粉丝':['粉条','红薯粉','龙口粉丝'],
};
const ALIAS_MAP=new Map();
for(const [can,aliases] of Object.entries(BUILTIN_ALIASES)){
  ALIAS_MAP.set(can,can);
  for(const a of aliases)ALIAS_MAP.set(a,can);
}
// Also add each canonical to itself
for(const can of Object.keys(BUILTIN_ALIASES))ALIAS_MAP.set(can,can);

function normalizeName(raw){
  const cleaned=raw.trim().replace(/[（(][^）)]*[）)]$/, '').trim();
  return ALIAS_MAP.get(cleaned)||cleaned;
}

/**
 * 解析食材文本，分离名称和数量
 * 关键：如果检测不到数量，amount 留空字符串（而非重复名称）
 */
function parseIngredient(raw){
  let w=raw.trim().replace(/[（(][^）)]*[）)]$/, '').trim();
  if(!w)return{name:'',qty:null,unit:null,amount:''};

  // 匹配末尾"数字+单位"模式：鸡蛋 2个 → 鸡蛋 / 2个
  const m=w.match(/([\d./]+)\s*(克|g|千克|kg|斤|两|毫升|ml|升|L|个|颗|只|条|块|片|根|瓣|把|勺|汤匙|大勺|小勺|茶匙|杯|包|盒|罐|张|朵|节|ml|g|kg|l|L)\s*$/);
  if(m){
    const name=normalizeName(w.substring(0,m.index).trim());
    const qty=parseFloat(m[1]);
    const amt=m[0].trim();
    return{name,qty:isNaN(qty)?null:qty,unit:m[2],amount:amt};
  }

  // 匹配末尾纯数字：鸡蛋3 → 鸡蛋 / 3
  const nm=w.match(/([\d./]+)\s*$/);
  if(nm){
    const name=normalizeName(w.substring(0,nm.index).trim());
    const qty=parseFloat(nm[1]);
    return{name,qty:isNaN(qty)?null:qty,unit:null,amount:nm[1]};
  }

  // 适量/少许
  const liang=w.match(/^(.*?)\s*(适量|少许)\s*$/);
  if(liang){
    const name=normalizeName(liang[1].trim());
    return{name,qty:null,unit:liang[2],amount:liang[2]};
  }

  // 纯名称，无数量 → amount 留空
  return{name:normalizeName(w),qty:null,unit:null,amount:''};
}

/** 食材名称 → 分类映射 */
const INGREDIENT_CATEGORY={
  // 调味料 (seasoning) — 不出现在待买清单
  '盐':'seasoning','白糖':'seasoning','冰糖':'seasoning','红糖':'seasoning','生抽':'seasoning','老抽':'seasoning','蚝油':'seasoning',
  '料酒':'seasoning','醋':'seasoning','味精':'seasoning','鸡精':'seasoning','豆瓣酱':'seasoning','黄豆酱':'seasoning','甜面酱':'seasoning',
  '番茄酱':'seasoning','辣椒酱':'seasoning','芝麻油':'seasoning','花椒油':'seasoning','食用油':'seasoning','猪油':'seasoning',
  '淀粉':'seasoning','花椒':'seasoning','花椒粉':'seasoning','胡椒粉':'seasoning','五香粉':'seasoning','辣椒粉':'seasoning','孜然粉':'seasoning',
  '八角':'seasoning','桂皮':'seasoning','香叶':'seasoning','干辣椒':'seasoning',
  '葱':'seasoning','生姜':'seasoning','大蒜':'seasoning','香菜':'seasoning','洋葱':'seasoning',
  // 肉类
  '猪肉':'meat','五花肉':'meat','排骨':'meat','猪蹄':'meat','猪肝':'meat','肉末':'meat',
  '牛肉':'meat','牛腩':'meat','羊肉':'meat',
  '鸡肉':'meat','鸡胸肉':'meat','鸡腿':'meat','鸡翅':'meat','鸡爪':'meat',
  '鸭肉':'meat','腊肉':'meat','腊肠':'meat','火腿肠':'meat','午餐肉':'meat','培根':'meat',
  // 蔬菜
  '番茄':'vegetable','土豆':'vegetable','青椒':'vegetable','红椒':'vegetable','尖椒':'vegetable','小米辣':'vegetable',
  '白菜':'vegetable','青菜':'vegetable','菠菜':'vegetable','生菜':'vegetable','芹菜':'vegetable','韭菜':'vegetable',
  '豆芽':'vegetable','茄子':'vegetable','黄瓜':'vegetable','冬瓜':'vegetable','南瓜':'vegetable',
  '苦瓜':'vegetable','丝瓜':'vegetable','白萝卜':'vegetable','胡萝卜':'vegetable','莲藕':'vegetable','山药':'vegetable',
  '玉米':'vegetable','西兰花':'vegetable','菜花':'vegetable','蘑菇':'vegetable','香菇':'vegetable','金针菇':'vegetable',
  // 水产
  '虾':'seafood','虾仁':'seafood','鱼':'seafood','鱼片':'seafood','三文鱼':'seafood','带鱼':'seafood',
  '螃蟹':'seafood','蛤蜊':'seafood','鱿鱼':'seafood',
  // 乳制品
  '鸡蛋':'dairy','牛奶':'dairy','淡奶油':'dairy','黄油':'dairy','芝士':'dairy','酸奶':'dairy','炼乳':'dairy',
  // 主食
  '大米':'staple','糯米':'staple','面粉':'staple','面条':'staple','方便面':'staple','馒头':'staple',
  '面包':'staple','饺子皮':'staple','小米':'staple','燕麦':'staple','豆腐':'staple','豆皮':'staple',
  // 干货
  '木耳':'dry_goods','腐竹':'dry_goods','粉丝':'dry_goods','红枣':'dry_goods','枸杞':'dry_goods','银耳':'dry_goods',
  '莲子':'dry_goods','紫菜':'dry_goods','海带':'dry_goods','虾皮':'dry_goods','芝麻':'dry_goods',
  '花生':'dry_goods','松花蛋':'dry_goods','咸鸭蛋':'dry_goods',
};

/** 创建 Ingredient 对象（自动分配分类） */
function normalizeIngredient(raw,existId){
  const p=parseIngredient(raw);
  const category=INGREDIENT_CATEGORY[p.name]||'other';
  return{id:existId||uid(),canonicalName:p.name,amount:p.amount,quantity:p.qty,unit:p.unit,category,notes:''};
}

/** 判断是否为调料（供购物清单过滤） */
function isSeasoning(canonicalName,autoCategory){
  return autoCategory==='seasoning'||INGREDIENT_CATEGORY[canonicalName]==='seasoning';
}
