import { foreachObject } from "./utils";

const blockList = [];
const prefix = "__originalStyle_";

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

export function isBlock(block) {
  return !!block._blockType;
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
 * 获取与当前元素重叠的 block，不包括相同类型的 block
 */
export function getOverlappingBlocks(block, filter = (block, index) => true) {
  const result = [];
  const elementRect = block.getBoundingClientRect();
  blockList.filter(filter).forEach((item) => {
    if (getBlockType(item) === getBlockType(block)) {
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
 * 获取与当前块重叠并距离最近的 block
 */
export function getNearestOverlappingBlock(block, filter) {
  const overlappingBlocks = getOverlappingBlocks(block, filter);
  if (overlappingBlocks.length === 0) {
    return null;
  }
  const blockX = parseFloat(block.style.left);
  const blockY = parseFloat(block.style.top);
  const map = {};
  const distanceList = overlappingBlocks.map((item, index) => {
    const itemX = parseFloat(item.style.left);
    const itemY = parseFloat(item.style.top);
    const result = Math.sqrt(
      Math.pow(itemX - blockX, 2) + Math.pow(itemY - blockY, 2)
    );
    map[result] = index;
    return result;
  });

  return overlappingBlocks[map[Math.min(...distanceList)]];
}

/**
 * 当块之间重叠或者分离时，更新块的样式
 * @param {Element} movingBlock 移动中的块
 * @param {CSSStyleDeclaration} movingBlockStyle 当重叠时，移动的块的样式
 * @param {CSSStyleDeclaration} staticBlockStyle 当重叠时，静止的块的样式
 */
export function updateBlockStyleWhenOverlapping(
  movingBlock,
  movingBlockStyle,
  staticBlockStyle,
  shouldChange = () => true,
  filter
) {
  const nearestOverlappingBlock = getNearestOverlappingBlock(
    movingBlock,
    filter
  );
  if (!shouldChange(movingBlock, nearestOverlappingBlock)) return;
  // 有重叠
  if (nearestOverlappingBlock) {
    if (
      movingBlock._nearestOverlappingBlock &&
      movingBlock._nearestOverlappingBlock !== nearestOverlappingBlock
    ) {
      restStyle();
    }

    foreachObject(movingBlockStyle, (key, value) => {
      if (!movingBlock[`${prefix}${key}`]) {
        movingBlock[`${prefix}${key}`] = movingBlock.style[key];
        movingBlock.style[key] = value;
      }
    });
    foreachObject(staticBlockStyle, (key, value) => {
      if (!nearestOverlappingBlock[`${prefix}${key}`]) {
        nearestOverlappingBlock[`${prefix}${key}`] =
          nearestOverlappingBlock.style[key];
        nearestOverlappingBlock.style[key] = value;
      }
    });
    // 用于块之间分离时，恢复原来的样式
    movingBlock._nearestOverlappingBlock = nearestOverlappingBlock;

    // 没有重叠
  } else if (movingBlock._nearestOverlappingBlock) {
    restStyle();
    movingBlock._nearestOverlappingBlock = null;
  }

  function restStyle() {
    foreachObject(movingBlockStyle, (key) => {
      if (movingBlock[`${prefix}${key}`]) {
        movingBlock.style[key] = movingBlock[`${prefix}${key}`];
        movingBlock[`${prefix}${key}`] = null;
      }
    });
    foreachObject(staticBlockStyle, (key) => {
      if (movingBlock._nearestOverlappingBlock[`${prefix}${key}`]) {
        movingBlock._nearestOverlappingBlock.style[key] =
          movingBlock._nearestOverlappingBlock[`${prefix}${key}`];
        movingBlock._nearestOverlappingBlock[`${prefix}${key}`] = null;
      }
    });
  }
}

/**
 * 将 block 插入到 targetBlock 中
 */
export function insetWhenOverlapping(block, targetBlock) {
  if (getBlockType(block) === getBlockType(targetBlock)) {
    console.error("不能插入到相同类型的块里面");
    return;
  }
  if (getBlockType(targetBlock) === "slot") {
    block.style.left =
      parseFloat(targetBlock.style.left) +
      parseFloat(targetBlock.style.borderWidth) +
      "px";
    block.style.top =
      parseFloat(targetBlock.style.top) +
      parseFloat(targetBlock.style.borderWidth) +
      "px";
  }
  if (getBlockType(targetBlock) === "block") {
    block.style.left =
      parseFloat(targetBlock.style.left) -
      parseFloat(block.style.borderWidth) +
      "px";
    block.style.top =
      parseFloat(targetBlock.style.top) -
      parseFloat(block.style.borderWidth) +
      "px";
  }
}
