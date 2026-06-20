Component({
  properties: {
    src: { type: String, value: '' },
    width: { type: Number, value: 200 },
    height: { type: Number, value: 200 },
  },
  methods: {
    onChoose() {
      this.triggerEvent('upload');
    },
    onRemove() {
      this.triggerEvent('remove');
    },
  },
});
