/** 合并来源查看 */
import { generateShoppingList } from '../../services/shopping-list.service';

Page({
  data: {
    canonicalName: '',
    recipes: [] as { recipeId: string; recipeName: string; originalText: string }[],
  },

  onLoad(options: Record<string, string>) {
    const name = decodeURIComponent(options.name || '');
    const list = generateShoppingList();
    const item = list.find((i) => i.canonicalName === name);
    if (item) {
      this.setData({ canonicalName: item.canonicalName, recipes: item.recipes });
    }
  },
});
