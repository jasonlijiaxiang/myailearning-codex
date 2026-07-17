/**
 * Split an arbitrary list into full-width rows whose item counts differ by at
 * most one. The maximum controls readable card width, not the content count.
 *
 * @template T
 * @param {readonly T[]} items
 * @param {number} [maxColumns=4]
 * @returns {T[][]}
 */
export function balanceRows(items, maxColumns = 4) {
  if (!Number.isInteger(maxColumns) || maxColumns < 1) {
    throw new RangeError("maxColumns must be a positive integer");
  }

  if (items.length === 0) return [];

  const rowCount = Math.ceil(items.length / maxColumns);
  const baseSize = Math.floor(items.length / rowCount);
  const widerRows = items.length % rowCount;
  const rows = [];
  let cursor = 0;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const rowSize = baseSize + (rowIndex < widerRows ? 1 : 0);
    rows.push(items.slice(cursor, cursor + rowSize));
    cursor += rowSize;
  }

  return rows;
}
