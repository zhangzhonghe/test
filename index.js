import { foreachObject } from "./utils";

export function createBlock(options = {}) {
  const result = document.createElement("div");
  foreachObject(options, (key, value) => {
    result.style[key] = value;
  });
  return result;
}
