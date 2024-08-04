import {
  assertEvent,
  assign,
  enqueueActions,
  sendTo,
  setup,
  StateFrom,
} from 'xstate';
import { CellMachine, cellMachine, CellMachineRef } from './cellMachine';
import { generateGrid } from '../lib/game';
import { timerMachine } from './timerMachine';
import { flagMachine } from './flagMachine';
import faceLogic from './faceMachine';
import { makeCellKey } from '../lib/cell';

export type GameEvent =
  | { type: 'GAME.CONFIGURE'; config: GameMachineContext['config'] }
  | { type: 'GAME.RESET' }
  | { type: 'GAME.LOSE'; win: boolean }
  | { type: 'GAME.TICK' }
  | { type: 'GAME.TIMES_UP' }
  // Events sent from cells
  | { type: 'CELL_CLEARED' }
  | { type: 'MINE_SCANNED'; cell: CellMachineRef };

interface GameConfig {
  width: number;
  height: number;
  mines: number;
}

const defaultConfig: GameConfig = {
  width: 10,
  height: 10,
  mines: 10,
};

type FaceEmotion = 'neutral' | 'win' | 'lose' | 'scared';

export interface GameMachineContext {
  config: GameConfig;
  grid: CellMachineRef[][];
  clearedCells: number;
  face: FaceEmotion;
}

export type GameMachine = typeof gameMachine;
export type GameMachineState = StateFrom<GameMachine>;

export const gameMachine = setup({
  types: {
    context: {} as GameMachineContext,
    input: {} as GameConfig,
    events: {} as GameEvent,
    children: {} as {
      timer: 'timer';
      flagger: 'flagger';
      face: 'face';
    },
  },
  actions: {
    setConfiguration: assign({
      config: ({ event }) => {
        assertEvent(event, 'GAME.CONFIGURE');

        return event.config;
      },
    }),

    incrementClearedCells: assign({
      clearedCells: ({ context }) => context.clearedCells + 1,
    }),
    resetClearedCells: assign({ clearedCells: 0 }),

    generateGrid: assign({
      grid: ({ context, spawn }) =>
        generateGrid(context.config, (cellContext) => {
          const id = makeCellKey(cellContext.coordinates);
          const cell = spawn(cellMachine, {
            systemId: id,
            input: cellContext,
          });

          return cell;
        }),
    }),

    swapMineCoordinates: enqueueActions(({ context, event, enqueue }) => {
      if (event.type !== 'MINE_SCANNED') {
        return;
      }

      const { cell } = event;
      const { config } = context;
      const snapshot = cell.getSnapshot();

      if (!snapshot) {
        throw Error('Cell snapshot is undefined');
      }

      if (config.width * config.height - config.mines === 0) {
        // No swap is possible, just defuse the mine and the player wins.
        // TODO: Actually need to update game config as well to allow a win.
        enqueue(sendTo(event.cell, { type: 'DEFUSE' }));
        return;
      }

      // Find any cell in the grid that hasn't been scanned yet and isn't a mine.
      // Make it a mine and defuse the current cell.
      while (true) {
        const row = Math.floor(Math.random() * config.height);
        const column = Math.floor(Math.random() * config.width);

        const otherCell = context.grid[row][column];
        const otherCellState = otherCell.getSnapshot();

        if (!otherCellState) {
          throw Error('Missing cell in grid');
        }

        if (
          otherCellState.matches('covered') &&
          !otherCellState.context.isMine
        ) {
          enqueue(sendTo(otherCell, { type: 'ARM' }));
          return;
        }
      }
    }),

    showAllMines: ({ context }) => {
      context.grid.forEach((cells) =>
        cells.forEach((cell) => cell.send({ type: 'REVEAL' })),
      );
    },

    startTimer: sendTo(({ system }) => system.get('timer'), {
      type: 'START',
    }),
    stopTimer: sendTo(({ system }) => system.get('timer'), { type: 'STOP' }),
    resetTimer: sendTo(({ system }) => system.get('timer'), {
      type: 'RESET',
    }),

    resetFlags: sendTo(
      ({ system }) => system.get('flagger'),
      ({ context }) => ({
        type: 'RESET',
        flags: context.config.mines,
      }),
    ),
  },
  guards: {
    clearedACell: ({ context }) => context.clearedCells > 0,
    allCellsCleared: ({ context }) =>
      context.clearedCells ===
      context.config.width * context.config.height - context.config.mines,
  },
  actors: {
    timer: timerMachine,
    flagger: flagMachine,
    face: faceLogic,
  },
}).createMachine({
  id: 'game',
  context: ({ input }) => ({
    grid: [],
    clearedCells: 0,
    config: { defaultConfig, ...input },
    face: 'neutral',
  }),
  invoke: [
    { id: 'timer', systemId: 'timer', src: 'timer' },
    {
      id: 'flagger',
      systemId: 'flagger',
      src: 'flagger',
    },
    {
      id: 'face',
      systemId: 'face',
      src: 'face',
    },
  ],
  initial: 'loading',
  on: {
    'GAME.RESET': {
      target: '.reset',
    },
    'GAME.CONFIGURE': {
      entry: ['setConfiguration', 'reset'],
      target: '.ready',
    },
  },
  states: {
    loading: {
      entry: ['resetFlags', 'generateGrid'],
      always: 'ready',
    },
    reset: {
      entry: ['resetClearedCells', 'resetTimer', 'generateGrid', 'resetFlags'],
      always: 'ready',
    },
    ready: {
      on: {
        // Ensure a first click on a mine doesn't cause an immediate loss
        MINE_SCANNED: {
          actions: 'swapMineCoordinates',
        },
        CELL_CLEARED: {
          target: 'playing',
          actions: 'incrementClearedCells',
        },
      },
    },
    playing: {
      entry: 'startTimer',
      on: {
        CELL_CLEARED: {
          actions: 'incrementClearedCells',
        },
        MINE_SCANNED: { target: 'lose' },
      },
      always: {
        target: 'win',
        guard: 'allCellsCleared',
      },
      exit: 'stopTimer',
    },
    win: {},
    lose: {
      entry: 'showAllMines',
    },
  },
});
