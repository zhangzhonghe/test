/**
 * 由于 js-dom 没有真正渲染，所以需要 mock getBoundingClientRect 方法
 */
HTMLElement.prototype.getBoundingClientRect = function () {
  return {
    width: parseFloat(this.style.width) || 0,
    height: parseFloat(this.style.height) || 0,
    top: parseFloat(this.style.top) || 0,
    bottom: parseFloat(this.style.top) + parseFloat(this.style.height) || 0,
    left: parseFloat(this.style.left) || 0,
    right: parseFloat(this.style.left) + parseFloat(this.style.width) || 0,
  };
};
