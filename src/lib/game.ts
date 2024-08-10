import type { GameMachineContext } from '../machines/gameMachine';
import { CellContext, CellMachineRef } from '../machines/cellMachine';
import { FC } from 'react';
import { Dizzy, Scared, Smile, Stars } from '../Components/Icons/Faces';

export const presets: (GameMachineContext['config'] & {
  name: string;
  Face: FC;
})[] = [
  {
    name: 'Default',
    Face: Stars,
    mines: 10,
    width: 10,
    height: 10,
  },
  {
    name: 'Miner Difficulty',
    Face: Smile,
    mines: 10,
    width: 6,
    height: 6,
  },
  {
    name: 'Turn Up The Heat',
    Face: Scared,
    mines: 50,
    width: 12,
    height: 12,
  },
  {
    name: "That's Unpossible",
    Face: Dizzy,
    mines: 150,
    width: 15,
    height: 15,
  },
];

// TODO: Improve mine placement algorithm
export const generateGrid = (
  config: GameMachineContext['config'],
  cellSpawner: (cellContext: CellContext) => CellMachineRef,
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
          coordinates: { row, column },
          adjacentMines: 0,
          alreadyScanned: false,
        }),
      );
    }

    grid.push(cells);
  }

  return grid;
};
