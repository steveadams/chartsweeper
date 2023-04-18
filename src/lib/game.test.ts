import { describe, expect, it } from 'vitest';
import { initializeGrid } from './game';
import { GameConfig } from '../Components/Chartsweeper';

describe('initializeGrid', () => {
  const tests: GameConfig[] = [
    { height: 10, width: 12, mines: 1 },
    { height: 20, width: 20, mines: 100 },
    { height: 300, width: 500, mines: 50_000 },
    { height: 500, width: 10_000, mines: 200_000 },
    { height: 50, width: 5, mines: 200 },
    { height: 2, width: 2, mines: 4 },
    { height: 2, width: 20_000, mines: 30_000 },
  ];

  it('initializeGrid', () => {
    tests.forEach((config) => {
      const grid = initializeGrid(config);

      expect(grid.length).toEqual(config.height);
      expect(grid[0].length).toEqual(config.width);
      expect(grid.flat().filter((c) => c.mine).length).toEqual(config.mines);
    });
  });
});
