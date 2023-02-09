import { foreachObject } from "./utils";

const blockList = [];

export function initList() {
  blockList.length = 0;
}

/**
 * 创建一个 block 元素
 * @param {style} options 元素的样式
 * @returns div 元素
 */
export function createBlock(options = {}) {
  const result = document.createElement("div");
  foreachObject(options, (key, value) => {
    result.style[key] = value;
  });
  return result;
}

/**
 * 将元素挂载到容器中
 */
export function mount(container, element, position) {
  position = Object.assign({ x: "0px", y: "0px" }, position);
  container.appendChild(element);
  element.style.position = "absolute";
  element.style.left = position.x;
  element.style.top = position.y;
  blockList.push(element);
}

/**
 * 更新 block 的位置
 */
export function moveBlock(element, position) {
  position = Object.assign({ x: "0px", y: "0px" }, position);
  element.style.left = position.x;
  element.style.top = position.y;
}

/**
 * 获取与当前元素重叠的元素
 */
export function getOverlappingElements(element) {
  const result = [];
  const elementRect = element.getBoundingClientRect();
  blockList.forEach((item) => {
    if (item === element) {
      return;
    }
    const itemRect = item.getBoundingClientRect();
    if (
      elementRect.left < itemRect.right &&
      elementRect.right > itemRect.left &&
      elementRect.top < itemRect.bottom &&
      elementRect.bottom > itemRect.top
    ) {
      result.push(item);
    }
  });
  return result;
}
