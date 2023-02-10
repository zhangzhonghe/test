import {
  createBlock as _createBlock,
  moveBlock,
  mount,
  isBlock,
  getBlockType,
  updateBlockStyleWhenOverlapping,
  getOverlappingBlocks,
} from "./block";

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
