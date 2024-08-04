import {
  ActorRefFrom,
  assign,
  log,
  not,
  sendParent,
  sendTo,
  setup,
} from 'xstate';
import { Coordinates, iterateAdjacentCells } from '../lib/cell';

type FlagEvent =
  | { type: 'REQUEST_FLAG' }
  | { type: 'RETURN_FLAG' }
  | { type: 'PLANT_FLAG' }
  | { type: 'REMOVE_FLAG' };

type MineEvent =
  | { type: 'EXPLODE' }
  | { type: 'DEFUSE' }
  | { type: 'REVEAL' }
  | { type: 'ARM' };

export type CellEvent =
  | FlagEvent
  | MineEvent
  | { type: 'SCAN' }
  | { type: 'UNCOVER' }
  | { type: 'RESET' };

export type CellContext = {
  coordinates: Coordinates;
  isMine: boolean;
  alreadyScanned: boolean;
  adjacentMines: number;
};

export type CellMachine = typeof cellMachine;
export type CellMachineRef = ActorRefFrom<CellMachine>;

const defaultContext: CellContext = {
  coordinates: { column: 0, row: 0 },
  isMine: false,
  alreadyScanned: false,
  adjacentMines: 0,
};

export const cellMachine = setup({
  types: {
    context: {} as CellContext,
    input: {} as CellContext,
    events: {} as CellEvent,
  },
  actions: {
    countAdjacentMines: assign({
      adjacentMines: ({ context, system }) => {
        let count = 0;
        iterateAdjacentCells(context.coordinates, system, (cell) => {
          const snapshot = cell.getSnapshot();
          if (snapshot && snapshot.context.isMine) {
            count += 1;
          }
        });

        return count;
      },
    }),

    markAsScanned: assign({ alreadyScanned: true }),

    scanAdjacentCells: ({ context, system }) => {
      iterateAdjacentCells(context.coordinates, system, (cell) => {
        cell.send({ type: 'SCAN' });
      });
    },

    requestFlag: sendTo(
      ({ system }) => system.get('flagger'),
      ({ self }) => ({
        type: 'REQUEST_FLAG',
        cell: self,
      }),
    ),

    returnFlag: sendTo(
      ({ system }) => system.get('flagger'),
      ({ self }) => ({
        type: 'RETURN_FLAG',
        cell: self,
      }),
    ),

    arm: assign({ isMine: true }),
    defuse: assign({ isMine: false }),

    reportClearedCell: sendParent({ type: 'CELL_CLEARED' }),
    reportExplodedCell: sendParent(({ self }) => ({
      type: 'MINE_SCANNED',
      cell: self,
    })),
  },
  guards: {
    alreadyScanned: ({ context }) => context.alreadyScanned,
    hasAdjacentMines: ({ context }) => context.adjacentMines > 0,
    isMine: ({ context }) => context.isMine,
  },
}).createMachine({
  id: 'cell',
  context: ({ input }) => ({
    ...defaultContext,
    ...input,
  }),
  initial: 'covered',
  on: {
    REVEAL: {
      target: '.revealed',
      guard: 'isMine',
    },
  },
  states: {
    covered: {
      on: {
        REQUEST_FLAG: {
          actions: 'requestFlag',
        },
        PLANT_FLAG: 'flagged',
        UNCOVER: 'scanning',
        SCAN: {
          target: 'scanning',
          guard: not('alreadyScanned'),
        },
        ARM: {
          target: 'covered',
          actions: 'arm',
        },
      },
    },
    flagged: {
      on: {
        RETURN_FLAG: {
          actions: 'returnFlag',
        },
        REMOVE_FLAG: 'covered',
      },
    },
    scanning: {
      entry: ['countAdjacentMines', 'markAsScanned'],
      always: [
        {
          target: 'exploded',
          guard: 'isMine',
        },
        {
          target: 'uncovered',
          actions: 'scanAdjacentCells',
          guard: not('hasAdjacentMines'),
        },
        { target: 'uncovered' },
      ],
    },
    uncovered: {
      entry: 'reportClearedCell',
    },
    exploded: {
      entry: 'reportExplodedCell',
      on: {
        DEFUSE: {
          target: 'scanning',
          actions: 'defuse',
        },
      },
    },
    revealed: {
      type: 'final',
    },
  },
});
