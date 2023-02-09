export function createBlock(options = {}) {
  const result = document.createElement("div");
  options.width && (result.style.width = options.width + "px");
  options.height && (result.style.height = options.height + "px");
  options.border && (result.style.border = options.border);
  options.backgroundColor &&
    (result.style.backgroundColor = options.backgroundColor);
  return result;
}
