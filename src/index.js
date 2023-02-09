import {
  createBlock as _createBlock,
  moveBlock,
  mount,
  isBlock,
  getBlockType,
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
  offsetX = e.offsetX;
  offsetY = e.offsetY;
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
  offsetX = 0;
  offsetY = 0;
}

document.addEventListener("mousemove", (e) => {
  if (activeBlock) {
    moveBlock(activeBlock, {
      x: e.clientX - offsetX + "px",
      y: e.clientY - offsetY + "px",
    });
  }
});
