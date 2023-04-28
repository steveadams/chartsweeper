import { createMachine, assign, sendTo, StateFrom, actions } from 'xstate';
import {
  CellKey,
  determineMineCoordinates,
  initializeGrid,
  makeCellKey,
} from '../lib/game';
import { timerMachine } from './timerMachine';
import { createCellMachine, CellMachineRef } from './cellMachine';
import { flagMachine } from './flagMachine';

type GameEvent =
  | { type: 'GAME.CONFIGURE'; config: GameMachineContext['config'] }
  | { type: 'GAME.RESET' }
  | { type: 'GAME.LOSE'; win: boolean }
  | { type: 'GAME.TICK' }
  | { type: 'GAME.TIMES_UP' }
  // Events sent from cells
  | { type: 'STARTED_REVEALING' }
  | { type: 'STOPPED_REVEALING' }
  | { type: 'CELL_CLEARED'; cellKey: CellKey }
  | { type: 'MINES_PLACED' }
  | { type: 'MINE_REVEALED' };

interface GameConfig {
  width: number;
  height: number;
  mines: number;
}

export interface GameMachineContext {
  config: GameConfig;
  grid: CellMachineRef[][];
  clearedCells: number;
  revealing: boolean;
}

export type GameMachine = typeof createGameMachine;
export type GameMachineState = StateFrom<GameMachine>;

const defaultConfig: GameMachineContext['config'] = {
  width: 3,
  height: 3,
  mines: 3,
};

export const createGameMachine = (config = defaultConfig) =>
  createMachine<GameMachineContext, GameEvent>(
    {
      id: 'game',
      context: {
        config,
        grid: [],
        clearedCells: 0,
        revealing: false,
      },
      invoke: [
        { id: 'timer', systemId: 'timer', src: 'timer' },
        {
          id: 'flagger',
          systemId: 'flagger',
          src: 'flagger',
          input: { flags: config.mines },
        },
      ],
      initial: 'loading',
      on: {
        'GAME.RESET': {
          target: '.reset',
        },
        'GAME.CONFIGURE': {
          actions: ['setConfiguration', 'reset'],
        },
        CELL_CLEARED: {
          actions: 'incrementClearedCells',
        },
        STARTED_REVEALING: {
          actions: 'startRevealing',
        },
        STOPPED_REVEALING: {
          actions: 'stopRevealing',
        },
      },
      states: {
        reset: {
          entry: ['resetClearedCells', 'resetTimer', 'resetFlags'],
          always: 'loading',
        },
        loading: {
          entry: ['initializeGrid'],
          always: 'ready',
        },
        ready: {
          on: {
            CELL_CLEARED: {
              target: 'playing',
              actions: ['setMines', 'incrementClearedCells'],
            },
          },
        },
        playing: {
          entry: ['startTimer'],
          on: {
            MINE_REVEALED: { target: 'lose' },
          },
          always: {
            target: 'win',
            guard: 'allCellsCleared',
          },
        },
        win: {
          entry: ['', () => console.log('you win!')],
        },
        lose: {
          entry: ['showAllMines', () => console.log('you lose!')],
        },
      },
    },
    {
      actions: {
        setConfiguration: assign({
          config: ({ context, event }) =>
            event.type === 'GAME.CONFIGURE' ? event.config : context.config,
        }),

        incrementClearedCells: assign({
          clearedCells: ({ context }) => context.clearedCells + 1,
        }),
        resetClearedCells: assign({ clearedCells: 0 }),

        initializeGrid: assign({
          grid: ({ context, spawn }) =>
            initializeGrid(context.config, (cellContext) =>
              spawn(createCellMachine(cellContext), {
                id: makeCellKey(cellContext.coordinates),
              })
            ),
        }),

        startRevealing: assign({ revealing: true }),
        stopRevealing: assign({ revealing: false }),

        setMines: actions.pure(({ context, event }) => {
          if (event.type === 'CELL_CLEARED') {
            const coordinates = determineMineCoordinates(
              context.config,
              context.config.mines,
              event.cellKey
            );

            return [...coordinates].map((key) =>
              sendTo(() => key, { type: 'SET_MINE' })
            );
          }

          return [];
        }),
        showAllMines: actions.pure(({ context }) => {
          const events: ReturnType<typeof sendTo>[] = [];

          context.grid.forEach((cells) =>
            cells.forEach((cell) =>
              events.push(sendTo(cell, { type: 'REMOTE_DETONATE' }))
            )
          );

          return events;
        }),

        startTimer: sendTo('timer', { type: 'START' }),
        stopTimer: sendTo('timer', { type: 'STOP' }),
        resetTimer: sendTo('timer', { type: 'RESET' }),

        resetFlags: sendTo('flagger', { type: 'RESET' }),
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
      },
    }
  );
