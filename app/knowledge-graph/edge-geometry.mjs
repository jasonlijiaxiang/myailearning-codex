/** @param {{x: number; y: number; incoming?: boolean}} point */
export function edgePath(point) {
  const controlX = 500 + (point.x - 500) * .48;
  const controlY = 350 + (point.y - 350) * .35 - 22;
  const center = "500 350";
  const neighbor = `${point.x.toFixed(3)} ${point.y.toFixed(3)}`;
  return `M${point.incoming ? neighbor : center} Q${controlX.toFixed(3)} ${controlY.toFixed(3)} ${point.incoming ? center : neighbor}`;
}
