import { createMachine } from 'xstate';

type FaceEvent =
  | {
      type: 'MOUSE_UP';
    }
  | {
      type: 'MOUSE_DOWN';
    }
  | {
      type: 'GAME_LOST';
    }
  | {
      type: 'GAME_WON';
    };

type FaceMachine = typeof faceMachine;

const faceMachine = createMachine<{}, FaceEvent>({
  id: 'face',
  initial: 'ready',
  states: {
    ready: {
      on: {
        MOUSE_DOWN: 'worried',
        GAME_WON: 'win',
        GAME_LOST: 'lose',
      },
    },
    worried: {
      on: { MOUSE_UP: 'ready' },
    },
    win: { type: 'final' },
    lose: { type: 'final' },
  },
});

export { faceMachine };
export type { FaceMachine };
