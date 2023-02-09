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
    if (key === "type") {
      result._blockType = value;
      return;
    }
    result.style[key] = value;
  });
  return result;
}

export function getBlockType(block) {
  return block._blockType;
}

/**
 * 将元素挂载到容器中
 */
export function mount(container, block, position) {
  position = Object.assign({ x: "0px", y: "0px" }, position);
  container.appendChild(block);
  block.style.position = "absolute";
  block.style.left = position.x;
  block.style.top = position.y;
  blockList.push(block);
}

/**
 * 更新 block 的位置
 */
export function moveBlock(block, position) {
  position = Object.assign({ x: "0px", y: "0px" }, position);
  block.style.left = position.x;
  block.style.top = position.y;
}

/**
 * 获取与当前元素重叠的块
 */
export function getOverlappingBlocks(block) {
  const result = [];
  const elementRect = block.getBoundingClientRect();
  blockList.forEach((item) => {
    if (item === block) {
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

/**
 *  当块之间重叠或者分离时，更新块的样式
 * @param {Element} movingBlock 移动中的块
 * @param {CSSStyleDeclaration} movingBlockStyle 当重叠时，移动的块的样式
 * @param {CSSStyleDeclaration} staticBlockStyle 当重叠时，静止的块的样式
 */
export function updateBlockStyle(
  movingBlock,
  movingBlockStyle,
  staticBlockStyle
) {
  const overlappingBlocks = getOverlappingBlocks(movingBlock);
  // 有重叠
  if (overlappingBlocks.length > 0) {
    foreachObject(movingBlockStyle, (key, value) => {
      movingBlock[`__originalStyle_${key}`] = movingBlock.style[key];
      movingBlock.style[key] = value;
    });
    overlappingBlocks.forEach((item) => {
      foreachObject(staticBlockStyle, (key, value) => {
        item[`__originalStyle_${key}`] = item.style[key];
        item.style[key] = value;
      });
    });
    // 用于块之间分离时，恢复原来的样式
    movingBlock._overlappingBlocks = overlappingBlocks;

    // 没有重叠
  } else {
    foreachObject(movingBlockStyle, (key) => {
      if (movingBlock[`__originalStyle_${key}`])
        movingBlock.style[key] = movingBlock[`__originalStyle_${key}`];
    });
    movingBlock._overlappingBlocks.forEach((item) => {
      foreachObject(staticBlockStyle, (key) => {
        if (item[`__originalStyle_${key}`])
          item.style[key] = item[`__originalStyle_${key}`];
      });
    });
  }
}