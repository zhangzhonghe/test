import {
  createBlock,
  mount,
  moveBlock,
  getOverlappingBlocks,
  initList,
  updateBlockStyle,
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
    const block1 = createBlock({ width: "100px", height: "100px" });
    const block2 = createBlock({ width: "100px", height: "100px" });
    mount(document.body, block1, { x: "0px", y: "0px" });
    mount(document.body, block2, { x: "200px", y: "200px" });
    expect(getOverlappingBlocks(block1).length).toBe(0);
    expect(getOverlappingBlocks(block2).length).toBe(0);
  });

  test("overlapping", () => {
    const block1 = createBlock({ width: "100px", height: "100px" });
    const block2 = createBlock({ width: "100px", height: "100px" });
    mount(document.body, block1, { x: "0px", y: "0px" });
    mount(document.body, block2, { x: "50px", y: "50px" });
    expect(getOverlappingBlocks(block1).length).toBe(1);
    expect(getOverlappingBlocks(block2).length).toBe(1);
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
      type: "slot",
      width: "100px",
      height: "100px",
      backgroundColor: "orange",
    });
    mount(document.body, slot, { x: "0px", y: "0px" });
    mount(document.body, block, { x: "200px", y: "200px" });
    expect(getComputedStyle(slot).borderColor).toBe("black");

    moveBlock(block, { x: "50px", y: "50px" });
    updateBlockStyle(block, {}, { borderColor: "red" });
    expect(getComputedStyle(slot).borderColor).toBe("red");

    // reset border color to black when not overlapping
    moveBlock(block, { x: "200px", y: "200px" });
    updateBlockStyle(block, {}, { borderColor: "red" });
  });
});

describe.skip("inset to other block", () => {});