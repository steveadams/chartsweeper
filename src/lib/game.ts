import { CellProps } from '../Components/Cell/Cell';
import { GameConfig, GameState } from '../Components/Chartsweeper';

// TODO: Improve mine placement algorithm
export const initializeGrid = (config: GameConfig): CellProps[][] => {
  const grid: CellProps[][] = [];
  const totalCells = config.height * config.width;
  let remainingMines = config.mines;

  for (let row = 0; row < config.height; row++) {
    const cells: CellProps[] = [];

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

      // Use helper function to create a cell
      cells.push({ mine: isMine, row, column });
    }

    grid.push(cells);
  }

  return grid;
};
