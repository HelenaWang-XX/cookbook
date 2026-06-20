Component({
  properties: {
    tags: { type: Array, value: [] },
  },
  data: {
    inputValue: '',
  },
  methods: {
    onInput(e: WechatMiniprogram.Input) {
      this.setData({ inputValue: e.detail.value });
    },
    addTag() {
      const text = this.data.inputValue.trim();
      if (!text) return;
      const tags = [...this.properties.tags];
      if (!tags.includes(text)) {
        tags.push(text);
        this.triggerEvent('change', { tags });
      }
      this.setData({ inputValue: '' });
    },
    removeTag(e: WechatMiniprogram.CustomEvent) {
      const idx = e.currentTarget.dataset.index;
      const tags = [...this.properties.tags];
      tags.splice(idx, 1);
      this.triggerEvent('change', { tags });
    },
  },
});
