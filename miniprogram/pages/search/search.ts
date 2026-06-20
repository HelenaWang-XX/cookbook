/** 搜索页 — 双向搜索 */
import { searchByName, searchByIngredients } from '../../services/recipe.service';
import type { Recipe } from '../../types/recipe';
import { debounce } from '../../utils/debounce';

type SearchMode = 'byName' | 'byIngredient';

Page({
  data: {
    mode: 'byName' as SearchMode,
    query: '',
    ingredientInput: '',
    ingredientTags: [] as string[],
    results: [] as Recipe[],
    searched: false,
    loading: false,
  },

  /** 切换搜索模式 */
  switchMode(e: WechatMiniprogram.CustomEvent) {
    const mode = e.currentTarget.dataset.mode as SearchMode;
    this.setData({ mode, results: [], searched: false, query: '', ingredientInput: '', ingredientTags: [] });
  },

  /** 按菜名搜索输入 */
  onQueryInput(e: WechatMiniprogram.Input) {
    const query = e.detail.value;
    this.setData({ query });
    this.debouncedSearch();
  },

  debouncedSearch: debounce(function (this: any) {
    const query = (this.data as { query: string }).query.trim();
    if (!query) {
      this.setData({ results: [], searched: false });
      return;
    }
    const results = searchByName(query);
    this.setData({ results, searched: true });
  }, 300),

  /** 按食材搜索：添加食材标签 */
  onIngredientInput(e: WechatMiniprogram.Input) {
    this.setData({ ingredientInput: e.detail.value });
  },

  addIngredientTag() {
    const input = this.data.ingredientInput.trim();
    if (!input) return;
    const tags = this.data.ingredientTags;
    if (!tags.includes(input)) {
      tags.push(input);
      this.setData({ ingredientTags: tags, ingredientInput: '' });
      this.doIngredientSearch();
    }
  },

  removeIngredientTag(e: WechatMiniprogram.CustomEvent) {
    const idx = e.currentTarget.dataset.index;
    const tags = this.data.ingredientTags;
    tags.splice(idx, 1);
    this.setData({ ingredientTags: tags });
    this.doIngredientSearch();
  },

  /** 按标签搜索（输入回车时触发） */
  onIngredientConfirm() {
    this.addIngredientTag();
  },

  doIngredientSearch() {
    const tags = this.data.ingredientTags;
    if (tags.length === 0) {
      this.setData({ results: [], searched: false });
      return;
    }
    const results = searchByIngredients(tags);
    this.setData({ results, searched: true });
  },

  /** 跳转详情 */
  goToDetail(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/recipe/detail?id=${id}` });
  },

  /** 清空搜索 */
  clearSearch() {
    this.setData({
      query: '',
      ingredientInput: '',
      ingredientTags: [],
      results: [],
      searched: false,
    });
  },
});
