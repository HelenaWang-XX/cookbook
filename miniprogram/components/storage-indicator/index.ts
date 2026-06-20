Component({
  properties: {
    ratio: { type: Number, value: 0 },
  },
  data: {
    showWarning: false,
  },
  observers: {
    'ratio': function (r: number) {
      this.setData({ showWarning: r > 80 });
    },
  },
});
