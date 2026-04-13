export interface MountingInput {
  numPanels: number;
  panelLength: number; // mm
  panelWidth: number; // mm
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  columns: number;
  gapX: number; // mm
  gapY: number; // mm
}

export interface MountingOutput {
  totalLength: number; // mm
  totalWidth: number; // mm
  totalArea: number; // m2
  rows: number;
}

export function calculateMountingLayout(input: MountingInput): MountingOutput {
  const { numPanels, panelLength, panelWidth, orientation, columns, gapX, gapY } = input;
  
  const rows = Math.ceil(numPanels / columns);
  
  // Swap length/width if landscape
  const effectiveW = orientation === 'PORTRAIT' ? panelWidth : panelLength;
  const effectiveL = orientation === 'PORTRAIT' ? panelLength : panelWidth;
  
  // Total Width (X axis along columns)
  // W = (col * panelW) + ((col - 1) * gapX)
  const totalW = (columns * effectiveW) + ((columns - 1) * gapX);
  
  // Total Length (Y axis along rows)
  // L = (rows * panelL) + ((rows - 1) * gapY)
  const totalL = (rows * effectiveL) + ((rows - 1) * gapY);
  
  const totalArea = (totalW * totalL) / 1000000; // to m2

  return {
    totalLength: Math.round(totalL),
    totalWidth: Math.round(totalW),
    totalArea: Math.round(totalArea * 100) / 100,
    rows
  };
}
