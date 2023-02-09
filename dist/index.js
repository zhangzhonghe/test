(function () {
  'use strict';

  function foreachObject(obj, callback) {
    Object.keys(obj).forEach((key) => {
      callback(key, obj[key]);
    });
  }

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
  }

  /**
   * 更新 block 的位置
   */
  function moveBlock(block, position) {
    position = Object.assign({ x: "0px", y: "0px" }, position);
    block.style.left = position.x;
    block.style.top = position.y;
  }

  const position = {
    slot: { x: "10px", y: "10px" },
    block: { x: "125px", y: "10px" },
  };
  let activeBlock = null;

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
      const type = getBlockType(e.target);
      const map = {
        slot: createSlot,
        block: createBlock,
      };
      const newBlock = map[type]();
      mount(document.body, newBlock);
      moveBlock(newBlock, position[type]);
      activeBlock = e.target;
      activeBlock.style.zIndex = 100;
    }
  }

  function onMouseKeyUp() {
    activeBlock.style.zIndex = 0;
    activeBlock = null;
  }

  document.addEventListener("mousemove", (e) => {
    if (activeBlock) {
      moveBlock(activeBlock, { x: e.clientX + "px", y: e.clientY + "px" });
    }
  });

})();
