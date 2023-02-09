export function foreachObject(obj, callback) {
  Object.keys(obj).forEach((key) => {
    callback(key, obj[key]);
  });
}

export function nextTick() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    });
  });
}
