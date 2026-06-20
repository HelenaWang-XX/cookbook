Component({
  properties: {
    placeholder: { type: String, value: '搜索菜谱…' },
    value: { type: String, value: '' },
  },
  methods: {
    onInput(e: WechatMiniprogram.Input) {
      this.triggerEvent('input', { value: e.detail.value });
    },
    onClear() {
      this.triggerEvent('clear');
    },
    onConfirm() {
      this.triggerEvent('confirm');
    },
  },
});
