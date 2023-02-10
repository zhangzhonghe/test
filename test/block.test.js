import {
  createBlock,
  mount,
  moveBlock,
  getOverlappingBlocks,
  initList,
  updateBlockStyleWhenOverlapping,
  insetWhenOverlapping,
} from "../src/block";

beforeEach(() => {
  initList();
});

describe("create a new block", () => {
  test("black border", () => {
    const blackBorderBlock = createBlock({
      width: "100px",
      height: "100px",
      border: "black solid 3px",
    });
    const style = getComputedStyle(blackBorderBlock);
    expect(style.width).toBe("100px");
    expect(style.height).toBe("100px");
    expect(style.border).toBe("3px solid black");
  });

  test("orange background", () => {
    const origenBackgroundBlock = createBlock({
      width: "100px",
      height: "100px",
      backgroundColor: "orange",
    });
    const style = getComputedStyle(origenBackgroundBlock);
    expect(style.width).toBe("100px");
    expect(style.height).toBe("100px");
    expect(style.backgroundColor).toBe("orange");
  });
});

describe("mount a block to container", () => {
  test("initial position", () => {
    const container = document.createElement("div");
    const block = createBlock();
    mount(container, block);
    const style = getComputedStyle(block);
    expect(style.left).toBe("0px");
    expect(style.top).toBe("0px");
  });

  test("only set x", () => {
    const container = document.createElement("div");
    const block = createBlock();
    mount(container, block, { x: "100px" });
    const style = getComputedStyle(block);
    expect(style.left).toBe("100px");
    expect(style.top).toBe("0px");
  });
});

describe("update block position", () => {
  test("update x", () => {
    const block = createBlock();
    moveBlock(block, { x: "100px" });
    const style = getComputedStyle(block);
    expect(style.left).toBe("100px");
    expect(style.top).toBe("0px");
  });

  test("update y", () => {
    const block = createBlock();
    moveBlock(block, { y: "100px" });
    const style = getComputedStyle(block);
    expect(style.left).toBe("0px");
    expect(style.top).toBe("100px");
  });
});

describe("get overlapping elements", () => {
  test("no overlapping", () => {
    const slot = createBlock({ type: "slot", width: "100px", height: "100px" });
    const block = createBlock({
      type: "block",
      width: "100px",
      height: "100px",
    });
    mount(document.body, slot, { x: "0px", y: "0px" });
    mount(document.body, block, { x: "200px", y: "200px" });
    expect(getOverlappingBlocks(slot).length).toBe(0);
    expect(getOverlappingBlocks(block).length).toBe(0);
  });

  test("overlapping", () => {
    const slot = createBlock({ type: "slot", width: "100px", height: "100px" });
    const block = createBlock({
      type: "block",
      width: "100px",
      height: "100px",
    });
    mount(document.body, slot, { x: "0px", y: "0px" });
    mount(document.body, block, { x: "50px", y: "50px" });
    expect(getOverlappingBlocks(slot).length).toBe(1);
    expect(getOverlappingBlocks(block).length).toBe(1);
  });

  test("overlapping with same type block", () => {
    const slot1 = createBlock({
      type: "slot",
      width: "100px",
      height: "100px",
    });
    const slot2 = createBlock({
      type: "slot",
      width: "100px",
      height: "100px",
    });
    mount(document.body, slot1, { x: "0px", y: "0px" });
    mount(document.body, slot2, { x: "200px", y: "200px" });

    moveBlock(slot2, { x: "50px", y: "50px" });
    expect(getOverlappingBlocks(slot1).length).toBe(0);
    expect(getOverlappingBlocks(slot2).length).toBe(0);
  });
});

describe("update block style when overlapping", () => {
  test("update border color when overlapping", () => {
    const slot = createBlock({
      type: "slot",
      width: "100px",
      height: "100px",
      border: "black solid 3px",
    });
    const block = createBlock({
      type: "block",
      width: "100px",
      height: "100px",
      backgroundColor: "orange",
    });
    mount(document.body, slot, { x: "0px", y: "0px" });
    mount(document.body, block, { x: "200px", y: "200px" });
    expect(getComputedStyle(slot).borderColor).toBe("black");

    moveBlock(block, { x: "50px", y: "50px" });
    updateBlockStyleWhenOverlapping(block, {}, { borderColor: "red" });
    expect(getComputedStyle(slot).borderColor).toBe("red");

    // just move a little bit, still overlapping
    moveBlock(block, { x: "60px", y: "60px" });
    updateBlockStyleWhenOverlapping(block, {}, { borderColor: "red" });
    expect(getComputedStyle(slot).borderColor).toBe("red");

    // reset border color to black when not overlapping
    moveBlock(block, { x: "200px", y: "200px" });
    updateBlockStyleWhenOverlapping(block, {}, { borderColor: "red" });
    expect(getComputedStyle(slot).borderColor).toBe("black");
  });

  test("should not throw error when not overlapping", () => {
    const slot = createBlock({
      type: "slot",
      width: "100px",
      height: "100px",
      border: "black solid 3px",
    });
    const block = createBlock({
      type: "block",
      width: "100px",
      height: "100px",
      backgroundColor: "orange",
    });
    mount(document.body, slot, { x: "0px", y: "0px" });
    mount(document.body, block, { x: "200px", y: "200px" });
    expect(getComputedStyle(slot).borderColor).toBe("black");
    // move to not overlapping position
    moveBlock(block, { x: "210px", y: "210px" });
    expect(() =>
      updateBlockStyleWhenOverlapping(block, {}, { borderColor: "red" })
    ).not.toThrowError();
  });

  test("should not change style when tow slots are overlapping", () => {
    const slot1 = createBlock({
      type: "slot",
      width: "100px",
      height: "100px",
      border: "black solid 3px",
    });
    const slot2 = createBlock({
      type: "slot",
      width: "100px",
      height: "100px",
      border: "black solid 3px",
    });
    mount(document.body, slot1, { x: "0px", y: "0px" });
    mount(document.body, slot2, { x: "200px", y: "200px" });
    moveBlock(slot2, { x: "50px", y: "50px" });
    updateBlockStyleWhenOverlapping(
      slot2,
      { borderColor: "red" },
      { borderColor: "red" }
    );
    expect(getComputedStyle(slot1).borderColor).toBe("black");
    expect(getComputedStyle(slot2).borderColor).toBe("black");
  });
});

describe("inset to other block", () => {
  test("move block to slot", () => {
    const slot = createBlock({
      type: "slot",
      width: "100px",
      height: "100px",
      border: "black solid 3px",
    });
    const block = createBlock({
      type: "block",
      width: "100px",
      height: "100px",
      backgroundColor: "orange",
    });
    mount(document.body, slot, { x: "0px", y: "0px" });
    mount(document.body, block, { x: "200px", y: "200px" });

    moveBlock(block, { x: "50px", y: "50px" });
    insetWhenOverlapping(block, slot);
    const blockRect = block.getBoundingClientRect();
    expect(blockRect.left).toBe(3);
    expect(blockRect.top).toBe(3);
  });

  test("move slot to block", () => {
    const slot = createBlock({
      type: "slot",
      width: "100px",
      height: "100px",
      border: "black solid 3px",
    });
    const block = createBlock({
      type: "block",
      width: "100px",
      height: "100px",
      backgroundColor: "orange",
    });
    mount(document.body, slot, { x: "0px", y: "0px" });
    mount(document.body, block, { x: "200px", y: "200px" });

    moveBlock(slot, { x: "150px", y: "150px" });
    insetWhenOverlapping(slot, block);
    const slotRect = slot.getBoundingClientRect();
    expect(slotRect.left).toBe(197);
    expect(slotRect.top).toBe(197);
  });
});
