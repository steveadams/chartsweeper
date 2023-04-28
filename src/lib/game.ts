import type { GameMachineContext } from '../machines/gameMachine';
import type { CellContext, CellMachineRef } from '../machines/cellMachine';
import { AnyStateMachine, InterpreterFrom, StateMachine } from 'xstate';

export type Coordinates = Readonly<{ column: number; row: number }>;
export type CellKey = `cell-${Coordinates['column']},${Coordinates['row']}`;

export const makeCellKey = (coordinates: Coordinates): CellKey =>
  `cell-${coordinates.column},${coordinates.row}`;

export const determineMineCoordinates = (
  config: GameMachineContext['config'],
  remainingMines: number,
  excludedKey: CellKey
): Set<CellKey> => {
  const rows = config.height;
  const columns = config.width;
  const totalCells = rows * columns;

  if (remainingMines > totalCells) {
    remainingMines = totalCells - 1;
  }

  const allCoords: CellKey[] = [];

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const key = makeCellKey({ row, column: column });

      if (key !== excludedKey) {
        allCoords.push(key);
      }
    }
  }

  for (let i = allCoords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCoords[i], allCoords[j]] = [allCoords[j], allCoords[i]];
  }

  return new Set(allCoords.slice(0, remainingMines));
};

// TODO: Improve mine placement algorithm
export const initializeGrid = (
  config: GameMachineContext['config'],
  cellSpawner: (cellContext: CellContext) => CellMachineRef
): GameMachineContext['grid'] => {
  const grid: GameMachineContext['grid'] = [];

  for (let row = 0; row < config.height; row++) {
    const cells: CellMachineRef[] = [];

    for (let column = 0; column < config.width; column++) {
      cells.push(
        cellSpawner({
          coordinates: { row, column },
          isMine: false,
          wasScanned: false,
          adjacentMines: 0,
        })
      );
    }

    grid.push(cells);
  }

  return grid;
};
