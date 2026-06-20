/** 内置食材别名映射表（约200条常见中餐食材） */
import type { IngredientAlias } from '../types/ingredient';

export const BUILTIN_ALIASES: IngredientAlias[] = [
  // ===== 调味料 =====
  { canonicalName: '盐', aliases: ['食盐', '食用盐', '精盐', '海盐', '粗盐'], unit: 'g', category: 'seasoning' },
  { canonicalName: '白糖', aliases: ['白砂糖', '砂糖', '绵白糖', '糖'], unit: 'g', category: 'seasoning' },
  { canonicalName: '冰糖', aliases: ['老冰糖', '黄冰糖', '单晶冰糖'], unit: 'g', category: 'seasoning' },
  { canonicalName: '红糖', aliases: ['赤砂糖', '黑糖'], unit: 'g', category: 'seasoning' },
  { canonicalName: '生抽', aliases: ['生抽酱油', '酱油'], unit: 'ml', category: 'seasoning' },
  { canonicalName: '老抽', aliases: ['老抽酱油', '红烧酱油'], unit: 'ml', category: 'seasoning' },
  { canonicalName: '蚝油', aliases: ['蚝汁'], unit: 'ml', category: 'seasoning' },
  { canonicalName: '料酒', aliases: ['黄酒', '烹饪酒', '绍酒', '花雕酒'], unit: 'ml', category: 'seasoning' },
  { canonicalName: '醋', aliases: ['陈醋', '香醋', '白醋', '米醋', '老陈醋', '镇江香醋'], unit: 'ml', category: 'seasoning' },
  { canonicalName: '味精', aliases: ['味素', '谷氨酸钠'], unit: 'g', category: 'seasoning' },
  { canonicalName: '鸡精', aliases: ['鸡粉', '鸡味调味料'], unit: 'g', category: 'seasoning' },
  { canonicalName: '豆瓣酱', aliases: ['郫县豆瓣酱', '豆瓣'], unit: '勺', category: 'seasoning' },
  { canonicalName: '黄豆酱', aliases: ['大豆酱', '黄酱'], unit: '勺', category: 'seasoning' },
  { canonicalName: '甜面酱', aliases: ['面酱'], unit: '勺', category: 'seasoning' },
  { canonicalName: '番茄酱', aliases: ['番茄沙司', 'ketchup', '番茄膏'], unit: '勺', category: 'seasoning' },
  { canonicalName: '辣椒酱', aliases: ['辣酱', '蒜蓉辣酱', '剁椒酱'], unit: '勺', category: 'seasoning' },
  { canonicalName: '芝麻油', aliases: ['香油', '麻油'], unit: 'ml', category: 'seasoning' },
  { canonicalName: '花椒油', aliases: ['藤椒油'], unit: 'ml', category: 'seasoning' },
  { canonicalName: '食用油', aliases: ['色拉油', '菜籽油', '花生油', '大豆油', '玉米油', '葵花籽油', '调和油', '油'], unit: 'ml', category: 'seasoning' },
  { canonicalName: '猪油', aliases: ['荤油', '大油'], unit: 'g', category: 'seasoning' },
  { canonicalName: '淀粉', aliases: ['生粉', '玉米淀粉', '土豆淀粉', '红薯淀粉', '太白粉'], unit: 'g', category: 'seasoning' },
  { canonicalName: '花椒', aliases: ['花椒粒', '麻椒', '大红袍花椒'], unit: 'g', category: 'seasoning' },
  { canonicalName: '花椒粉', aliases: ['花椒面'], unit: 'g', category: 'seasoning' },
  { canonicalName: '胡椒粉', aliases: ['白胡椒粉', '黑胡椒粉', '胡椒面'], unit: 'g', category: 'seasoning' },
  { canonicalName: '五香粉', aliases: ['十三香'], unit: 'g', category: 'seasoning' },
  { canonicalName: '辣椒粉', aliases: ['辣椒面', '细辣椒面', '粗辣椒面'], unit: 'g', category: 'seasoning' },
  { canonicalName: '孜然粉', aliases: ['孜然面', '小茴香粉'], unit: 'g', category: 'seasoning' },
  { canonicalName: '八角', aliases: ['大料', '大茴香'], unit: '个', category: 'seasoning' },
  { canonicalName: '桂皮', aliases: ['肉桂', '肉桂皮'], unit: '块', category: 'seasoning' },
  { canonicalName: '香叶', aliases: ['月桂叶'], unit: '片', category: 'seasoning' },
  { canonicalName: '干辣椒', aliases: ['干红辣椒', '干朝天椒', '干小米辣'], unit: '个', category: 'seasoning' },
  { canonicalName: '生姜', aliases: ['姜', '老姜', '鲜姜', '姜块'], unit: '块', category: 'seasoning' },
  { canonicalName: '大蒜', aliases: ['蒜', '蒜头', '大蒜瓣', '蒜瓣'], unit: '瓣', category: 'seasoning' },
  { canonicalName: '葱', aliases: ['大葱', '香葱', '小葱', '青葱', '葱花'], unit: '根', category: 'seasoning' },
  { canonicalName: '香菜', aliases: ['芫荽', '香荽'], unit: '把', category: 'seasoning' },
  { canonicalName: '洋葱', aliases: ['洋葱头', '圆葱', '皮芽子'], unit: '个', category: 'seasoning' },

  // ===== 肉类 =====
  { canonicalName: '猪肉', aliases: ['猪瘦肉', '猪里脊', '猪后腿肉', '猪前腿肉', '猪肉块'], unit: 'g', category: 'meat' },
  { canonicalName: '五花肉', aliases: ['猪五花', '五花', '三层肉'], unit: 'g', category: 'meat' },
  { canonicalName: '排骨', aliases: ['猪排骨', '小排', '肋排', '子排'], unit: 'g', category: 'meat' },
  { canonicalName: '猪蹄', aliases: ['猪脚', '猪手', '前蹄'], unit: '只', category: 'meat' },
  { canonicalName: '猪肝', aliases: ['猪肝片'], unit: 'g', category: 'meat' },
  { canonicalName: '肉末', aliases: ['猪肉末', '肉馅', '猪肉馅', '绞肉'], unit: 'g', category: 'meat' },
  { canonicalName: '牛肉', aliases: ['牛瘦肉', '牛里脊', '牛腩', '牛腱子', '牛腿肉'], unit: 'g', category: 'meat' },
  { canonicalName: '牛腩', aliases: ['牛肋条'], unit: 'g', category: 'meat' },
  { canonicalName: '羊肉', aliases: ['羊腿肉', '羊里脊', '羊瘦肉'], unit: 'g', category: 'meat' },
  { canonicalName: '鸡肉', aliases: ['鸡块', '鸡腿肉', '鸡胸肉', '鸡丁'], unit: 'g', category: 'meat' },
  { canonicalName: '鸡胸肉', aliases: ['鸡胸', '鸡脯肉'], unit: 'g', category: 'meat' },
  { canonicalName: '鸡腿', aliases: ['鸡大腿', '鸡小腿', '琵琶腿'], unit: '个', category: 'meat' },
  { canonicalName: '鸡翅', aliases: ['鸡中翅', '鸡翅中', '鸡全翅'], unit: '个', category: 'meat' },
  { canonicalName: '鸡爪', aliases: ['凤爪', '鸡脚'], unit: '个', category: 'meat' },
  { canonicalName: '鸭肉', aliases: ['鸭块', '鸭腿'], unit: 'g', category: 'meat' },
  { canonicalName: '腊肉', aliases: ['烟熏腊肉'], unit: 'g', category: 'meat' },
  { canonicalName: '腊肠', aliases: ['香肠', '广式腊肠', '川味腊肠'], unit: '根', category: 'meat' },
  { canonicalName: '火腿肠', aliases: ['火腿'], unit: '根', category: 'meat' },
  { canonicalName: '午餐肉', aliases: ['罐头午餐肉'], unit: 'g', category: 'meat' },
  { canonicalName: '培根', aliases: ['烟肉'], unit: '片', category: 'meat' },

  // ===== 蔬菜 =====
  { canonicalName: '土豆', aliases: ['马铃薯', '洋芋', '山药蛋'], unit: '个', category: 'vegetable' },
  { canonicalName: '番茄', aliases: ['西红柿', '蕃茄', '洋柿子'], unit: '个', category: 'vegetable' },
  { canonicalName: '鸡蛋', aliases: ['土鸡蛋', '柴鸡蛋', '鲜鸡蛋', '草鸡蛋', '鸡子儿', '蛋'], unit: '个', category: 'dairy' },
  { canonicalName: '青椒', aliases: ['柿子椒', '菜椒', '圆椒', '甜椒'], unit: '个', category: 'vegetable' },
  { canonicalName: '红椒', aliases: ['红柿子椒', '红色甜椒'], unit: '个', category: 'vegetable' },
  { canonicalName: '尖椒', aliases: ['辣椒', '青尖椒', '二荆条'], unit: '个', category: 'vegetable' },
  { canonicalName: '小米辣', aliases: ['小米椒', '朝天椒', '指天椒'], unit: '个', category: 'vegetable' },
  { canonicalName: '白菜', aliases: ['大白菜', '黄芽菜', '娃娃菜'], unit: '颗', category: 'vegetable' },
  { canonicalName: '青菜', aliases: ['上海青', '小油菜', '油菜', '小白菜', '瓢儿白'], unit: '颗', category: 'vegetable' },
  { canonicalName: '菠菜', aliases: ['菠薐', '赤根菜'], unit: '把', category: 'vegetable' },
  { canonicalName: '生菜', aliases: ['叶用莴苣', '团生菜'], unit: '颗', category: 'vegetable' },
  { canonicalName: '芹菜', aliases: ['香芹', '旱芹', '西芹'], unit: '根', category: 'vegetable' },
  { canonicalName: '韭菜', aliases: ['壮阳草', '起阳草'], unit: '把', category: 'vegetable' },
  { canonicalName: '豆芽', aliases: ['绿豆芽', '黄豆芽', '芽菜'], unit: 'g', category: 'vegetable' },
  { canonicalName: '茄子', aliases: ['矮瓜', '紫茄', '长茄子', '圆茄子'], unit: '根', category: 'vegetable' },
  { canonicalName: '黄瓜', aliases: ['青瓜', '胡瓜'], unit: '根', category: 'vegetable' },
  { canonicalName: '冬瓜', aliases: ['白瓜'], unit: 'g', category: 'vegetable' },
  { canonicalName: '南瓜', aliases: ['倭瓜', '金瓜', '老南瓜'], unit: 'g', category: 'vegetable' },
  { canonicalName: '苦瓜', aliases: ['凉瓜', '癞瓜'], unit: '根', category: 'vegetable' },
  { canonicalName: '丝瓜', aliases: ['胜瓜', '菜瓜'], unit: '根', category: 'vegetable' },
  { canonicalName: '白萝卜', aliases: ['萝卜', '菜头', '大根'], unit: '根', category: 'vegetable' },
  { canonicalName: '胡萝卜', aliases: ['红萝卜', '甘荀', '金笋'], unit: '根', category: 'vegetable' },
  { canonicalName: '莲藕', aliases: ['藕', '莲菜', '藕片'], unit: '节', category: 'vegetable' },
  { canonicalName: '山药', aliases: ['淮山', '薯蓣', '铁棍山药'], unit: '根', category: 'vegetable' },
  { canonicalName: '玉米', aliases: ['玉蜀黍', '苞米', '珍珠米', '甜玉米', '糯玉米'], unit: '根', category: 'vegetable' },
  { canonicalName: '西兰花', aliases: ['花椰菜', '青花菜', '绿菜花', '西蓝花'], unit: '颗', category: 'vegetable' },
  { canonicalName: '菜花', aliases: ['花菜', '白花菜'], unit: '颗', category: 'vegetable' },
  { canonicalName: '蘑菇', aliases: ['鲜蘑菇', '口蘑', '双孢菇'], unit: 'g', category: 'vegetable' },
  { canonicalName: '香菇', aliases: ['冬菇', '花菇', '干香菇', '鲜香菇'], unit: '个', category: 'vegetable' },
  { canonicalName: '金针菇', aliases: ['金针蘑', '毛柄金钱菌'], unit: '把', category: 'vegetable' },
  { canonicalName: '木耳', aliases: ['黑木耳', '干木耳', '云耳'], unit: 'g', category: 'dry_goods' },
  { canonicalName: '豆腐', aliases: ['嫩豆腐', '老豆腐', '北豆腐', '南豆腐', '卤水豆腐'], unit: '块', category: 'staple' },
  { canonicalName: '豆皮', aliases: ['豆腐皮', '千张', '干豆腐', '百页'], unit: '张', category: 'staple' },
  { canonicalName: '腐竹', aliases: ['枝竹'], unit: '根', category: 'dry_goods' },
  { canonicalName: '粉丝', aliases: ['粉条', '红薯粉', '龙口粉丝', '绿豆粉丝'], unit: '把', category: 'dry_goods' },

  // ===== 水产 =====
  { canonicalName: '虾', aliases: ['大虾', '鲜虾', '基围虾', '对虾', '明虾', '海虾', '青虾'], unit: '只', category: 'seafood' },
  { canonicalName: '虾仁', aliases: ['虾肉', '开背虾仁', '冻虾仁'], unit: 'g', category: 'seafood' },
  { canonicalName: '鱼', aliases: ['鲜鱼', '草鱼', '鲤鱼', '鲫鱼', '鲈鱼', '鲳鱼', '鳊鱼', '黄鱼'], unit: '条', category: 'seafood' },
  { canonicalName: '鱼片', aliases: ['鱼柳', '鱼排'], unit: 'g', category: 'seafood' },
  { canonicalName: '三文鱼', aliases: ['鲑鱼'], unit: 'g', category: 'seafood' },
  { canonicalName: '带鱼', aliases: ['刀鱼'], unit: '条', category: 'seafood' },
  { canonicalName: '螃蟹', aliases: ['大闸蟹', '河蟹', '梭子蟹', '海蟹'], unit: '只', category: 'seafood' },
  { canonicalName: '蛤蜊', aliases: ['花蛤', '文蛤', '花甲'], unit: 'g', category: 'seafood' },
  { canonicalName: '鱿鱼', aliases: ['鲜鱿', '鱿鱼筒'], unit: '条', category: 'seafood' },

  // ===== 乳制品 =====
  { canonicalName: '牛奶', aliases: ['鲜牛奶', '纯牛奶', '鲜奶', '牛乳'], unit: 'ml', category: 'dairy' },
  { canonicalName: '淡奶油', aliases: ['稀奶油', '淡忌廉'], unit: 'ml', category: 'dairy' },
  { canonicalName: '黄油', aliases: ['牛油', '奶油', '无盐黄油', '有盐黄油'], unit: 'g', category: 'dairy' },
  { canonicalName: '芝士', aliases: ['奶酪', '芝士片', '马苏里拉芝士', '奶酪碎'], unit: 'g', category: 'dairy' },
  { canonicalName: '酸奶', aliases: ['酸牛奶', '优酪乳'], unit: 'ml', category: 'dairy' },
  { canonicalName: '炼乳', aliases: ['炼奶', '甜炼乳'], unit: 'g', category: 'dairy' },

  // ===== 主食 =====
  { canonicalName: '大米', aliases: ['米', '白米', '精米', '粳米', '籼米'], unit: 'g', category: 'staple' },
  { canonicalName: '糯米', aliases: ['江米', '圆糯米', '长糯米'], unit: 'g', category: 'staple' },
  { canonicalName: '面粉', aliases: ['中筋面粉', '普通面粉', '小麦粉', '高筋面粉', '低筋面粉', '面包粉', '蛋糕粉'], unit: 'g', category: 'staple' },
  { canonicalName: '面条', aliases: ['挂面', '切面', '鲜面条', '手擀面', '拉面', '刀削面'], unit: 'g', category: 'staple' },
  { canonicalName: '方便面', aliases: ['泡面', '即食面'], unit: '包', category: 'staple' },
  { canonicalName: '馒头', aliases: ['白馒头', '刀切馒头'], unit: '个', category: 'staple' },
  { canonicalName: '面包', aliases: ['吐司', '面包片', '白面包', '全麦面包'], unit: '片', category: 'staple' },
  { canonicalName: '饺子皮', aliases: ['馄饨皮', '抄手皮'], unit: '张', category: 'staple' },
  { canonicalName: '小米', aliases: ['粟米', '黄小米'], unit: 'g', category: 'staple' },
  { canonicalName: '燕麦', aliases: ['燕麦片', '即食燕麦'], unit: 'g', category: 'staple' },

  // ===== 干货 =====
  { canonicalName: '红枣', aliases: ['大枣', '干红枣', '蜜枣'], unit: '颗', category: 'dry_goods' },
  { canonicalName: '枸杞', aliases: ['枸杞子', '宁夏枸杞'], unit: 'g', category: 'dry_goods' },
  { canonicalName: '银耳', aliases: ['白木耳', '雪耳'], unit: '朵', category: 'dry_goods' },
  { canonicalName: '莲子', aliases: ['白莲子', '干莲子'], unit: 'g', category: 'dry_goods' },
  { canonicalName: '紫菜', aliases: ['海苔'], unit: '张', category: 'dry_goods' },
  { canonicalName: '海带', aliases: ['昆布', '干海带'], unit: 'g', category: 'dry_goods' },
  { canonicalName: '虾皮', aliases: ['虾米皮', '海米皮'], unit: 'g', category: 'dry_goods' },
  { canonicalName: '芝麻', aliases: ['白芝麻', '黑芝麻', '熟芝麻'], unit: 'g', category: 'dry_goods' },
  { canonicalName: '花生', aliases: ['花生米', '生花生', '红衣花生'], unit: 'g', category: 'dry_goods' },
  { canonicalName: '松花蛋', aliases: ['皮蛋', '变蛋'], unit: '个', category: 'dry_goods' },
  { canonicalName: '咸鸭蛋', aliases: ['咸蛋'], unit: '个', category: 'dry_goods' },

  // ===== 其他 =====
  { canonicalName: '豆腐乳', aliases: ['腐乳', '红腐乳', '白腐乳'], unit: '块', category: 'other' },
  { canonicalName: '豆豉', aliases: ['豆什', '干豆豉'], unit: 'g', category: 'other' },
  { canonicalName: '椰浆', aliases: ['椰奶', '椰子奶'], unit: 'ml', category: 'other' },
  { canonicalName: '柠檬', aliases: ['鲜柠檬', '黄柠檬', '青柠'], unit: '个', category: 'other' },
  { canonicalName: '蜂蜜', aliases: ['蜜糖', '百花蜜'], unit: 'ml', category: 'other' },
  { canonicalName: '巧克力', aliases: ['朱古力', '可可脂'], unit: 'g', category: 'other' },
  { canonicalName: '咖喱', aliases: ['咖喱块', '咖喱粉', '咖喱酱'], unit: '块', category: 'other' },
];

/** 别名到标准名的快速查找 Map，初始化时构建 */
export function buildAliasMap(aliases: IngredientAlias[]): Map<string, { canonicalName: string; unit: string; category: string }> {
  const map = new Map<string, { canonicalName: string; unit: string; category: string }>();
  for (const entry of aliases) {
    map.set(entry.canonicalName, { canonicalName: entry.canonicalName, unit: entry.unit, category: entry.category });
    for (const alias of entry.aliases) {
      if (!map.has(alias)) {
        map.set(alias, { canonicalName: entry.canonicalName, unit: entry.unit, category: entry.category });
      }
    }
  }
  return map;
}
