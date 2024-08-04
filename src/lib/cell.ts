import { ActorRefFrom, ActorSystem } from 'xstate';
import { CellMachine, CellMachineRef } from '../machines/cellMachine';

export type Coordinates = Readonly<{ column: number; row: number }>;
export type CellKey = `cell-${Coordinates['column']},${Coordinates['row']}`;

export const makeCellKey = (coordinates: Coordinates): CellKey =>
  `cell-${coordinates.column},${coordinates.row}`;

export const iterateAdjacentCells = (
  coordinates: Coordinates,
  system: ActorSystem<any>,
  callback: (snapshot: ActorRefFrom<CellMachine>) => void,
) => {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dx, dy] of directions) {
    const row = coordinates.row + dy;
    const column = coordinates.column + dx;

    // Skip non-existent cells
    if (row < 0 || column < 0) {
      continue;
    }

    const adjacentCell = system.get(makeCellKey({ row, column })) as
      | CellMachineRef
      | undefined;

    if (adjacentCell) {
      callback(adjacentCell);
    }
  }
};
