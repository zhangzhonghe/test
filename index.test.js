import { createBlock, mount } from "./index";

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
