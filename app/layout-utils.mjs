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

/**
 * Balance card rows for a fixed-track CSS Grid. Every returned row length is a
 * divisor of trackCount, so `grid-column: span …` always receives an integer.
 * This keeps arbitrary content counts dynamic without allowing invalid values
 * such as `span 2.4` when five cards are placed on a 12-track grid.
 *
 * @template T
 * @param {readonly T[]} items
 * @param {number} [maxColumns=4]
 * @param {number} [trackCount=12]
 * @returns {T[][]}
 */
export function balanceGridRows(items, maxColumns = 4, trackCount = 12) {
  if (!Number.isInteger(maxColumns) || maxColumns < 1) {
    throw new RangeError("maxColumns must be a positive integer");
  }
  if (!Number.isInteger(trackCount) || trackCount < 1) {
    throw new RangeError("trackCount must be a positive integer");
  }
  if (items.length === 0) return [];

  const allowedSizes = Array.from(
    { length: Math.min(maxColumns, trackCount) },
    (_, index) => index + 1,
  ).filter((size) => trackCount % size === 0);
  const largestAllowedSize = allowedSizes.at(-1);

  if (!largestAllowedSize) {
    throw new RangeError("No valid row size for the requested CSS Grid");
  }

  for (let rowCount = Math.ceil(items.length / largestAllowedSize); rowCount <= items.length; rowCount += 1) {
    const smallerRowSize = Math.floor(items.length / rowCount);
    const largerRowSize = Math.ceil(items.length / rowCount);

    if (!allowedSizes.includes(smallerRowSize) || !allowedSizes.includes(largerRowSize)) continue;

    const widerRows = items.length % rowCount;
    const rows = [];
    let cursor = 0;

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      const rowSize = smallerRowSize + (rowIndex < widerRows ? 1 : 0);
      rows.push(items.slice(cursor, cursor + rowSize));
      cursor += rowSize;
    }

    return rows;
  }

  throw new RangeError("Unable to balance items into valid CSS Grid rows");
}

/**
 * Return a valid integer span for a fixed-track CSS Grid row.
 *
 * @param {number} rowSize
 * @param {number} [trackCount=12]
 */
export function gridSpan(rowSize, trackCount = 12) {
  if (!Number.isInteger(rowSize) || rowSize < 1 || !Number.isInteger(trackCount) || trackCount < 1 || trackCount % rowSize !== 0) {
    throw new RangeError(`rowSize ${rowSize} must divide trackCount ${trackCount}`);
  }

  return trackCount / rowSize;
}
