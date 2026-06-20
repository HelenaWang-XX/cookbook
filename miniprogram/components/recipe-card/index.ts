Component({
  properties: {
    recipe: { type: Object, value: {} },
    mode: { type: String, value: 'grid' }, // 'grid' | 'list'
  },
  data: {
    categoryLabel: '',
    categoryColor: '',
  },
  observers: {
    'recipe.category': function (cat: string) {
      const map: Record<string, { label: string; color: string }> = {
        meat: { label: '荤菜', color: '#E85D3F' },
        vegetarian: { label: '素菜', color: '#4CAF50' },
        seafood: { label: '海鲜', color: '#2196F3' },
        soup: { label: '汤羹', color: '#FF9800' },
        staple: { label: '主食', color: '#8D6E63' },
        dessert: { label: '甜品', color: '#E91E63' },
      };
      const info = map[cat] || { label: cat, color: '#999' };
      this.setData({ categoryLabel: info.label, categoryColor: info.color });
    },
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.properties.recipe.id });
    },
  },
});
