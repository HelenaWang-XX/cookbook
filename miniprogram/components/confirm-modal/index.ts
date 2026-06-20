Component({
  properties: {
    visible: { type: Boolean, value: false },
    title: { type: String, value: '确认' },
    content: { type: String, value: '' },
    confirmText: { type: String, value: '确认' },
    cancelText: { type: String, value: '取消' },
  },
  methods: {
    onConfirm() { this.triggerEvent('confirm'); },
    onCancel() { this.triggerEvent('cancel'); },
  },
});
