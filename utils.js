export function foreachObject(obj, callback) {
  Object.keys(obj).forEach((key) => {
    callback(key, obj[key]);
  });
}
