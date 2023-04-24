import type { GameMachineContext } from '../machines/gameMachine';
import type { CellContext, CellMachineRef } from '../machines/cellMachine';

// TODO: Improve mine placement algorithm
export const initializeGrid = (
  config: GameMachineContext['config'],
  cellSpawner: (cellContext: CellContext) => CellMachineRef
): GameMachineContext['grid'] => {
  const grid: GameMachineContext['grid'] = [];
  const totalCells = config.height * config.width;
  let remainingMines = config.mines;

  for (let row = 0; row < config.height; row++) {
    const cells: CellMachineRef[] = [];

    for (let column = 0; column < config.width; column++) {
      // Calculate the remaining cells
      const remainingCells = totalCells - (row * config.width + column);

      // Calculate the probability of the current cell being a mine
      const mineProbability = remainingMines / remainingCells;

      // Determine if the current cell should be a mine
      const isMine = Math.random() < mineProbability;

      if (isMine) {
        remainingMines--;
      }

      cells.push(
        cellSpawner({
          isMine,
          position: { y: row, x: column },
          adjacentMines: 0,
        })
      );
    }

    grid.push(cells);
  }

  return grid;
};
