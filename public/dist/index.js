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
  function getOverlappingBlocks(block, filter = (block, index) => true) {
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
  function getNearestOverlappingBlock(block, filter) {
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
  function updateBlockStyleWhenOverlapping(
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
  function insetBlockToTarget(block, targetBlock) {
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

  const TOOLBAR_STYLE = {
    height: 120,
    margin: 8,
  };
  const toolbar = document.querySelector(".tool-bar");
  const POSITION = {
    slot: { x: "14px", y: "14px" },
    block: { x: "130px", y: "18px" },
  };
  const Z_INDEX = {
    slot: 0,
    block: 1,
  };
  // 过度动画时长
  const DURATION = 200;

  let activeBlock = null;
  let offsetX = 0;
  let offsetY = 0;

  const slot = createSlot();
  const block = createBlock();

  mount(document.body, slot, POSITION.slot);
  mount(document.body, block, POSITION.block);

  toolbar.style.height = TOOLBAR_STYLE.height + "px";
  toolbar.style.margin = TOOLBAR_STYLE.margin + "px";

  function createSlot() {
    const slot = createBlock$1({
      type: "slot",
      width: "100px",
      height: "100px",
      border: "4px solid black",
      cursor: "grab",
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
      zIndex: 1,
      backgroundColor: "orange",
      cursor: "grab",
    });
    block.addEventListener("mousedown", onMouseKeyDown);
    block.addEventListener("mouseup", onMouseKeyUp);
    return block;
  }

  function onMouseKeyDown(e) {
    if (!isBlock(e.target)) {
      return;
    }
    e.target.style.cursor = "grabbing";
    const nearestBlock = getNearestOverlappingBlock(e.target);
    activeBlock = e.target;
    activeBlock.style.transition = ``;
    // 当前 block 是否已被插入其它 block 中
    activeBlock._inserted = false;
    if (
      nearestBlock &&
      getNearestOverlappingBlock(nearestBlock) === activeBlock
    ) {
      nearestBlock._inserted = false;
    }
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    activeBlock.style.zIndex = 100;
    e.target._clickInToolbarArea = isInToolbarArea(e.target);
  }

  function onMouseKeyUp(e) {
    if (isBlock(e.target)) e.target.style.cursor = "grab";
    if (!isBlock(e.target) || !activeBlock) {
      return;
    }
    if (e.target._clickInToolbarArea && !isInToolbarArea(e.target)) {
      const type = getBlockType(e.target);
      const map = {
        slot: createSlot,
        block: createBlock,
      };
      const newBlock = map[type]();
      mount(document.body, newBlock);
      moveBlock(newBlock, POSITION[type]);
    } else if (e.target._clickInToolbarArea) {
      activeBlock.style.left = POSITION[getBlockType(activeBlock)].x;
      activeBlock.style.top = POSITION[getBlockType(activeBlock)].y;
    }
    if (getNearestOverlappingBlock(activeBlock, (block) => !block._inserted)) {
      const nearestBlock = getNearestOverlappingBlock(
        activeBlock,
        (block) => !block._inserted
      );
      activeBlock.style.transition = `all ${DURATION}ms`;
      insetBlockToTarget(activeBlock, nearestBlock);
      nearestBlock._inserted = true;
      activeBlock._inserted = true;
    }
    activeBlock.style.zIndex = Z_INDEX[getBlockType(activeBlock)];
    activeBlock = null;
    offsetX = 0;
    offsetY = 0;
  }

  document.addEventListener("mousemove", (e) => {
    if (!activeBlock) {
      return;
    }
    moveBlock(activeBlock, {
      x: e.clientX - offsetX + "px",
      y:
        Math.max(
          e.clientY - offsetY,
          activeBlock._clickInToolbarArea
            ? 0
            : TOOLBAR_STYLE.height + TOOLBAR_STYLE.margin * 2
        ) + "px",
    });
    if (!isInToolbarArea(activeBlock)) {
      updateBlockStyleWhenOverlapping(
        activeBlock,
        getBlockType(activeBlock) === "slot" ? { borderColor: "red" } : {},
        { borderColor: "red" },
        (block, targetBlock) => !block._inserted && !targetBlock?._inserted,
        (block) => !block._inserted
      );
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
