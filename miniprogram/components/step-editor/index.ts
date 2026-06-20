Component({
  properties: {
    step: { type: Object, value: {} },
    index: { type: Number, value: 0 },
    total: { type: Number, value: 1 },
  },
  methods: {
    onInput(e: WechatMiniprogram.Input) {
      this.triggerEvent('change', { index: this.properties.index, value: e.detail.value });
    },
    onImage() { this.triggerEvent('image', { index: this.properties.index }); },
    onRemove() { this.triggerEvent('remove', { index: this.properties.index }); },
    onMoveUp() { this.triggerEvent('moveup', { index: this.properties.index }); },
    onMoveDown() { this.triggerEvent('movedown', { index: this.properties.index }); },
  },
});
