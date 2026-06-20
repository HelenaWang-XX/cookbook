Component({
  properties: {
    value: { type: String, value: 'meat' },
    categories: { type: Array, value: [] },
  },
  methods: {
    onSelect(e: WechatMiniprogram.CustomEvent) {
      this.triggerEvent('change', { value: e.currentTarget.dataset.key });
    },
  },
});
