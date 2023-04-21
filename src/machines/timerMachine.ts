import { createMachine, assign } from 'xstate';
import { fromCallback } from 'xstate/actors';

interface TimerContext {
  elapsedTime: number;
  duration: number;
}

type TimerEvent =
  | {
      type: 'START';
    }
  | {
      type: 'TICK';
    }
  | {
      type: 'STOP';
    }
  | {
      type: 'RESET';
    };

type TimerMachine = typeof timerMachine;

const timerMachine = createMachine<TimerContext, TimerEvent>(
  {
    id: 'timer',
    initial: 'idle',
    context: {
      elapsedTime: 0,
      duration: 999,
    },
    on: {
      RESET: '.idle',
      '*': {
        actions: ({ event }) => console.log(event.type),
      },
    },
    states: {
      idle: {
        entry: ['reset', () => console.log('timer is idle')],
        on: {
          START: 'running',
        },
      },

      running: {
        invoke: {
          src: 'tick',
        },

        on: {
          TICK: {
            actions: 'incrementTime',
          },
        },

        always: [{ target: 'stopped', guard: 'timeExpired' }],
      },

      stopped: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      incrementTime: assign({
        elapsedTime: ({ context }) => context.elapsedTime + 1,
      }),
      reset: assign({ elapsedTime: 0 }),
    },
    actors: {
      tick: fromCallback<TimerEvent>((sendBack) => {
        console.log('call tick');
        const interval = setInterval(() => sendBack({ type: 'TICK' }), 1000);

        return () => clearInterval(interval);
      }),
    },
  }
);

export { timerMachine };

export type { TimerContext, TimerEvent, TimerMachine };
