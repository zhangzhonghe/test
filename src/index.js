import {
  createBlock as _createBlock,
  moveBlock,
  mount,
  isBlock,
  getBlockType,
  updateBlockStyleWhenOverlapping,
  getNearestOverlappingBlock,
  insetWhenOverlapping,
} from "./block";

const toolbarStyle = {
  height: 120,
  margin: 8,
};
const toolbar = document.querySelector(".tool-bar");
const position = {
  slot: { x: "14px", y: "14px" },
  block: { x: "130px", y: "18px" },
};
const zIndex = {
  slot: 0,
  block: 1,
};
// 过度动画时长
const duration = 200;
let activeBlock = null;
let offsetX = 0;
let offsetY = 0;

const slot = createSlot();
const block = createBlock();

mount(document.body, slot, position.slot);
mount(document.body, block, position.block);

toolbar.style.height = toolbarStyle.height + "px";
toolbar.style.margin = toolbarStyle.margin + "px";

function createSlot() {
  const slot = _createBlock({
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
  const block = _createBlock({
    type: "block",
    width: "100px",
    height: "100px",
    zIndex: 1,
    backgroundColor: "orange",
  });
  block.addEventListener("mousedown", onMouseKeyDown);
  block.addEventListener("mouseup", onMouseKeyUp);
  return block;
}

function onMouseKeyDown(e) {
  if (isBlock(e.target)) {
    const nearestBlock = getNearestOverlappingBlock(e.target);
    activeBlock = e.target;
    activeBlock.style.transition = ``;
    activeBlock._inserted = false;
    if (
      nearestBlock &&
      getNearestOverlappingBlock(nearestBlock) === activeBlock
    )
      nearestBlock._inserted = false;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    activeBlock.style.zIndex = 100;
    e.target._clickInToolbarArea = isInToolbarArea(e.target);
  }
}

function onMouseKeyUp(e) {
  if (isBlock(e.target) && activeBlock) {
    if (e.target._clickInToolbarArea && !isInToolbarArea(e.target)) {
      const type = getBlockType(e.target);
      const map = {
        slot: createSlot,
        block: createBlock,
      };
      const newBlock = map[type]();
      mount(document.body, newBlock);
      moveBlock(newBlock, position[type]);
    } else if (e.target._clickInToolbarArea) {
      activeBlock.style.left = position[getBlockType(activeBlock)].x;
      activeBlock.style.top = position[getBlockType(activeBlock)].y;
    }
    if (getNearestOverlappingBlock(activeBlock)) {
      const nearestBlock = getNearestOverlappingBlock(activeBlock);
      if (!nearestBlock._inserted) {
        activeBlock.style.transition = `all ${duration}ms`;
        insetWhenOverlapping(activeBlock, nearestBlock);
        nearestBlock._inserted = true;
        activeBlock._inserted = true;
      }
    }
    activeBlock.style.zIndex = zIndex[getBlockType(activeBlock)];
    activeBlock = null;
    offsetX = 0;
    offsetY = 0;
  }
}

document.addEventListener("mousemove", (e) => {
  if (activeBlock) {
    moveBlock(activeBlock, {
      x: e.clientX - offsetX + "px",
      y:
        Math.max(
          e.clientY - offsetY,
          activeBlock._clickInToolbarArea
            ? 0
            : toolbarStyle.height + toolbarStyle.margin * 2
        ) + "px",
    });
    if (!isInToolbarArea(activeBlock)) {
      updateBlockStyleWhenOverlapping(
        activeBlock,
        getBlockType(activeBlock) === "slot" ? { borderColor: "red" } : {},
        { borderColor: "red" },
        (block, targetBlock) => !block._inserted && !targetBlock?._inserted
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
