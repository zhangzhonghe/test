/**
 * 由于 js-dom 没有真正渲染，所以需要 mock getBoundingClientRect 方法
 */
HTMLElement.prototype.getBoundingClientRect = function () {
  const width =
    parseFloat(this.style.width) +
      (parseFloat(this.style.borderLeftWidth) || 0) +
      (parseFloat(this.style.borderRightWidth) || 0) || 0;
  const height =
    parseFloat(this.style.height) +
      (parseFloat(this.style.borderTopWidth) || 0) +
      (parseFloat(this.style.borderBottomWidth) || 0) || 0;
  return {
    width,
    height,
    top: parseFloat(this.style.top) || 0,
    bottom: parseFloat(this.style.top) + height || 0,
    left: parseFloat(this.style.left) || 0,
    right: parseFloat(this.style.left) + width || 0,
  };
};
