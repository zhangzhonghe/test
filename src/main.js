import {
  createBlock as _createBlock,
  moveBlock,
  mount,
  isBlock,
  getBlockType,
  updateBlockStyleWhenOverlapping,
  getNearestOverlappingBlock,
  insetBlockToTarget,
} from "./block";

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
  const slot = _createBlock({
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
  const block = _createBlock({
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
