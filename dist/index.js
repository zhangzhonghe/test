(function () {
  'use strict';

  function foreachObject(obj, callback) {
    Object.keys(obj).forEach((key) => {
      callback(key, obj[key]);
    });
  }

  const blockList = [];
  const prefix = "__originalStyle_";

  /**
   * 创建一个 block 元素
   * @param {style} options 元素的样式
   * @returns div 元素
   */
  function createBlock$1(options = {}) {
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

  function getBlockType(block) {
    return block._blockType;
  }

  function isBlock(block) {
    return !!block._blockType;
  }

  /**
   * 将元素挂载到容器中
   */
  function mount(container, block, position) {
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
  function moveBlock(block, position) {
    position = Object.assign({ x: "0px", y: "0px" }, position);
    block.style.left = position.x;
    block.style.top = position.y;
  }

  /**
   * 获取与当前元素重叠的 block，不包括相同类型的 block
   */
  function getOverlappingBlocks(block) {
    const result = [];
    const elementRect = block.getBoundingClientRect();
    blockList.forEach((item) => {
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
  function getNearestOverlappingBlock(block) {
    const overlappingBlocks = getOverlappingBlocks(block);
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
  function updateBlockStyleWhenOverlapping(
    movingBlock,
    movingBlockStyle,
    staticBlockStyle
  ) {
    const nearestOverlappingBlock = getNearestOverlappingBlock(movingBlock);
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

  const position = {
    slot: { x: "10px", y: "10px" },
    block: { x: "125px", y: "10px" },
  };
  let activeBlock = null;
  let offsetX = 0;
  let offsetY = 0;

  const slot = createSlot();
  const block = createBlock();

  mount(document.body, slot);
  mount(document.body, block);
  moveBlock(slot, position.slot);
  moveBlock(block, position.block);

  function createSlot() {
    const slot = createBlock$1({
      type: "slot",
      width: "100px",
      height: "100px",
      border: "4px solid black",
    });
    slot.addEventListener("mousedown", onMouseKeyDown);
    slot.addEventListener("mouseup", onMouseKeyUp);
    return slot;
  }

  function createBlock() {
    const block = createBlock$1({
      type: "block",
      width: "100px",
      height: "100px",
      backgroundColor: "orange",
    });
    block.addEventListener("mousedown", onMouseKeyDown);
    block.addEventListener("mouseup", onMouseKeyUp);
    return block;
  }

  function onMouseKeyDown(e) {
    if (isBlock(e.target)) {
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      activeBlock = e.target;
      activeBlock.style.zIndex = 100;
      e.target._clickInToolbarArea = isInToolbarArea(e.target);
    }
  }

  function onMouseKeyUp(e) {
    if (isBlock(e.target)) {
      if (e.target._clickInToolbarArea && !isInToolbarArea(e.target)) {
        const type = getBlockType(e.target);
        const map = {
          slot: createSlot,
          block: createBlock,
        };
        const newBlock = map[type]();
        mount(document.body, newBlock);
        moveBlock(newBlock, position[type]);
      }
      activeBlock.style.zIndex = 0;
      activeBlock = null;
      offsetX = 0;
      offsetY = 0;
    }
  }

  document.addEventListener("mousemove", (e) => {
    if (activeBlock) {
      moveBlock(activeBlock, {
        x: e.clientX - offsetX + "px",
        y: e.clientY - offsetY + "px",
      });
      if (!isInToolbarArea(activeBlock)) {
        updateBlockStyleWhenOverlapping(
          activeBlock,
          getBlockType(activeBlock) === "slot" ? { borderColor: "red" } : {},
          { borderColor: "red" }
        );
      }
    }
  });

  /**
   * 是否在工具栏区域，顶部区域为工具栏区域
   */
  function isInToolbarArea(block) {
    const top = parseFloat(block.style.top);
    return top <= 120;
  }

})();
