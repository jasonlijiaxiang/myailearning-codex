/**
 * 递归冻结纯数据对象（要求无环引用），用于 manifest 内联的字面量配置，
 * 与注册表此前的深度冻结语义保持一致。
 *
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze(/** @type {any} */ (value)[key]);
    }
  }
  return value;
}
