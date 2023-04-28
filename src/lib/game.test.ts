import { describe, expect, it, vi } from 'vitest';
import {
  CellKey,
  determineMineCoordinates,
  initializeGrid,
  makeCellKey,
} from './game';
import type { CellContext } from '../machines/cellMachine';
import type { GameMachineContext } from '../machines/gameMachine';

describe('game', () => {
  const tests: (GameMachineContext['config'] & {
    excludedKey: CellKey;
    expectedCoords: number;
  })[] = [
    {
      height: 10,
      width: 12,
      mines: 1,
      excludedKey: makeCellKey({ row: 2, column: 5 }),
      expectedCoords: 1,
    },
    {
      height: 20,
      width: 20,
      mines: 100,
      excludedKey: makeCellKey({ row: 15, column: 3 }),
      expectedCoords: 100,
    },
    {
      height: 300,
      width: 500,
      mines: 50_000,
      excludedKey: makeCellKey({ row: 290, column: 9 }),
      expectedCoords: 50_000,
    },
    {
      height: 50,
      width: 5,
      mines: 200,
      excludedKey: makeCellKey({ row: 25, column: 3 }),
      expectedCoords: 200,
    },
    {
      height: 2,
      width: 2,
      mines: 4,
      excludedKey: makeCellKey({ row: 0, column: 1 }),
      expectedCoords: 3,
    },
    {
      height: 2,
      width: 20_000,
      mines: 30_000,
      excludedKey: makeCellKey({ row: 1, column: 19_000 }),
      expectedCoords: 30_000,
    },
  ];

  it.concurrent('initializeGrid', () =>
    Promise.all(
      tests.map(async (test) => {
        const grid = initializeGrid(
          test,
          vi.fn().mockImplementation(({ isMine }: CellContext) => ({
            getSnapshot: () => ({ context: { isMine } }),
          }))
        );

        expect(grid.length).toEqual(test.height);
        expect(grid[0].length).toEqual(test.width);

        const coords = determineMineCoordinates(
          test,
          test.mines,
          test.excludedKey
        );

        expect(coords.size).toEqual(test.expectedCoords);
        expect(coords.has(test.excludedKey)).toEqual(false);
      })
    )
  );
});
