Component({
  properties: {
    recipes: { type: Array, value: [] },
  },
  methods: {
    onTap(e: WechatMiniprogram.CustomEvent) {
      this.triggerEvent('select', e.detail);
    },
  },
});
