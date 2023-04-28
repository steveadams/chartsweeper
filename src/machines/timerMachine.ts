import { createMachine, assign, StateFrom } from 'xstate';
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
export type TimerMachineState = StateFrom<TimerMachine>;

export const timerMachine = createMachine<TimerContext, TimerEvent>(
  {
    id: 'timer',
    initial: 'idle',
    context: {
      elapsedTime: 0,
      duration: 999,
    },
    states: {
      idle: {
        entry: ['reset'],
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
            actions: ['incrementTime'],
          },
          RESET: 'idle',
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
    guards: {
      timeExpired: ({ context }) => context.elapsedTime >= context.duration,
    },
    actors: {
      tick: fromCallback<TimerEvent>((sendBack) => {
        const interval = setInterval(() => sendBack({ type: 'TICK' }), 1000);

        return () => clearInterval(interval);
      }),
    },
  }
);
