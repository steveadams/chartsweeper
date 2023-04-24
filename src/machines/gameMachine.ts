import { createMachine, assign, sendTo, StateFrom, forwardTo } from 'xstate';
import { initializeGrid } from '../lib/game';
import { timerMachine } from './timerMachine';
import { createCellMachine, CellMachineRef } from './cellMachine';
import { flagMachine } from './flagMachine';

type GameEvent =
  | { type: 'GAME.CONFIGURE'; config: GameMachineContext['config'] }
  | { type: 'GAME.RESET' }
  | { type: 'GAME.LOSE'; win: boolean }
  | { type: 'GAME.TICK' }
  | { type: 'GAME.TIMES_UP' }
  // | { type: 'GAME.MOUSE_DOWN' }
  // | { type: 'GAME.MOUSE_UP' }
  // Events sent from cells
  | { type: 'CELL.STARTED_REVEALING' }
  | { type: 'CELL.STOPPED_REVEALING' }
  | { type: 'CELL.TRAVERSE' }
  | { type: 'CELL.EXPLODE' }
  | { type: 'CELL.REQUEST_FLAG' }
  | { type: 'CELL.RETURN_FLAG' }
  | { type: 'PLANT_FLAG' };

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
  width: 30,
  height: 20,
  mines: 5,
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
          input: { availableFlags: config.mines },
        },
      ],
      initial: 'loading',
      on: {
        'GAME.RESET': {
          target: '.loading',
        },
        'GAME.CONFIGURE': {
          actions: ['setConfiguration', 'reset'],
        },
        'GAME.TICK': {
          actions: 'incrementTime',
        },
        'GAME.TIMES_UP': {
          actions: 'stopTimer',
        },
        'CELL.STARTED_REVEALING': {
          actions: 'startRevealing',
        },
        'CELL.STOPPED_REVEALING': {
          actions: 'stopRevealing',
        },
        'CELL.REQUEST_FLAG': {
          actions: forwardTo('flagger'),
        },
        'CELL.RETURN_FLAG': {
          actions: forwardTo('flagger'),
        },
        PLANT_FLAG: {
          actions: () => console.log('plant flag'),
        },
        '*': {
          actions: ({ event }) => console.log('game event', event),
        },
      },
      states: {
        reset: {
          entry: ['clearGrid', 'resetProgress', 'resetTimer'],
          always: 'loading',
        },
        loading: {
          entry: ['initializeGrid'],
          always: 'ready',
        },
        ready: {
          on: {
            'CELL.TRAVERSE': {
              target: 'playing',
              actions: 'startTimer',
            },
          },
        },
        playing: {
          entry: ['startTimer'],
          on: {
            'CELL.EXPLODE': { target: 'lose' },
            'CELL.TRAVERSE': {
              actions: () => console.log('traverse'),
            },
          },
          exit: ({ event }) => console.log('playing exit', event),
          always: {
            target: 'win',
            guard: 'allCellsCleared',
          },
        },
        win: {
          entry: [() => console.log('you win!')],
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

        resetProgress: assign({ clearedCells: 0 }),
        clearGrid: ({ context }) => {
          // Stop existing cells
          context.grid.forEach((cells) => cells.forEach((cell) => cell.stop()));
          context.grid = [];
        },

        initializeGrid: assign({
          grid: ({ context, spawn }) =>
            initializeGrid(context.config, (cellContext) =>
              spawn(createCellMachine(cellContext), {
                id: `cell-${cellContext.position.x},${cellContext.position.y}`,
              })
            ),
        }),

        startRevealing: assign({ revealing: true }),
        stopRevealing: assign({ revealing: false }),

        showAllMines: ({ context }) => {
          let actions: ReturnType<typeof sendTo>[] = [];

          context.grid.forEach((cells) =>
            cells.forEach((cell) =>
              actions.push(sendTo(cell, { type: 'CELL.SHOW_MINE' }))
            )
          );

          return actions;
        },

        startTimer: sendTo('timer', { type: 'START' }),
        stopTimer: sendTo('timer', { type: 'STOP' }),
        resetTimer: () => {
          console.log('reset timer');
          return sendTo('timer', { type: 'RESET' });
        },
      },
      guards: {
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
