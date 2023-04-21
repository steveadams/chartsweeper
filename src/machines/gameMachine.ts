import { createMachine, assign, sendTo, StateFrom } from 'xstate';
import { initializeGrid } from '../lib/game';
import { timerMachine } from './timerMachine';
import { flagMachine } from './flagMachine';
import { createCellMachine, CellMachineRef } from './cellMachine';

type GameEvent =
  | { type: 'GAME.CONFIGURE'; config: GameMachineContext['config'] }
  | { type: 'GAME.RESET' }
  | { type: 'GAME.LOSE'; win: boolean }
  | { type: 'GAME.TICK' }
  | { type: 'GAME.TIMES_UP' }
  | { type: 'GAME.MOUSE_DOWN' }
  | { type: 'GAME.MOUSE_UP' }
  // Events sent from cells
  | { type: 'CELL.ADD_FLAG' }
  | { type: 'CELL.REMOVE_FLAG' }
  | { type: 'CELL.TRAVERSE' }
  | { type: 'CELL.EXPLODE' };

interface GameConfig {
  width: number;
  height: number;
  mines: number;
}

interface GameMachineContext {
  config: GameConfig;
  grid: CellMachineRef[][];
  clearedCells: number;
  flagsRemaining: number;
  elapsedTime: number;
  mouseDown: boolean;
}

type GameMachine = typeof createGameMachine;
type GameMachineState = StateFrom<GameMachine>;

const defaultConfig: GameMachineContext['config'] = {
  width: 30,
  height: 20,
  mines: 30,
};

const createGameMachine = (config = defaultConfig) => {
  console.log('creating game machine');
  return createMachine<GameMachineContext, GameEvent>(
    {
      id: 'game',
      context: {
        config,
        grid: [],
        clearedCells: 0,
        flagsRemaining: 0,
        elapsedTime: 0,
        mouseDown: false,
      },
      invoke: [
        {
          id: 'flagger',
          systemId: 'flagger',
          src: 'flagger',
        },
        {
          id: 'timer',
          src: 'timer',
          systemId: 'timer',
        },
      ],
      initial: 'loading',
      on: {
        'GAME.CONFIGURE': {
          actions: ['setConfiguration', 'reset'],
        },
        'CELL.ADD_FLAG': {
          actions: 'addFlag',
        },
        'CELL.REMOVE_FLAG': {
          actions: 'removeFlag',
        },
        'GAME.TICK': {
          actions: 'incrementTime',
        },
        'GAME.TIMES_UP': {
          actions: 'stopTimer',
        },
      },
      states: {
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
            'CELL.EXPLODE': {
              target: 'lose',
              actions: 'showLoseFace',
            },
          },
          always: {
            target: 'win',
            guard: ({ context }) =>
              context.clearedCells ===
              context.config.width * context.config.height -
                context.config.mines,
          },
        },
        win: {
          type: 'final',
          on: {
            'GAME.RESET': 'loading',
          },
          entry: ['showWinFace'],
        },
        lose: {
          type: 'final',
          entry: ['showAllMines', 'showLoseFace'],
          on: {
            'GAME.RESET': 'loading',
          },
        },
      },
    },
    {
      actions: {
        setConfiguration: assign({
          config: ({ context, event }) =>
            event.type === 'GAME.CONFIGURE' ? event.config : context.config,
        }),
        initializeGrid: assign({
          grid: ({ context, spawn }) =>
            initializeGrid(context.config, (cellContext) => {
              // Stop existing cells
              context.grid.forEach((cells) =>
                cells.forEach((cell) => cell.stop())
              );

              return spawn(createCellMachine(cellContext), {
                id: `cell-${cellContext.position.x},${cellContext.position.y}`,
              });
            }),
          flagsRemaining: ({ context }) => context.config.mines,
        }),
        addFlag: assign({
          flagsRemaining: ({ context }) => context.flagsRemaining - 1,
        }),
        removeFlag: assign({
          flagsRemaining: ({ context }) => context.flagsRemaining + 1,
        }),
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
      },
      guards: {
        minesRemaining: ({ context }) =>
          context.clearedCells !==
          context.config.width * context.config.height - context.config.mines,
      },
      actors: {
        timer: timerMachine,
        flagger: flagMachine,
      },
    }
  );
};

export { createGameMachine };

export type { GameMachine, GameMachineState, GameMachineContext, GameEvent };
