import { createMachine, assign } from 'xstate';

interface FlagContext {
  flags: number;
}

type FlagEvent = { type: 'ADD' } | { type: 'REMOVE' } | { type: 'RESET' };

type FlagMachine = typeof flagMachine;

const flagMachine = createMachine<FlagContext, FlagEvent>(
  {
    id: 'flagger',
    context: {
      flags: 0,
    },
    on: {
      ADD: { actions: 'add' },
      REMOVE: { actions: 'remove' },
      RESET: { actions: 'reset' },
    },
  },
  {
    actions: {
      add: assign({
        flags: ({ context }) => context.flags + 1,
      }),
      remove: assign({
        flags: ({ context }) => context.flags - 1,
      }),
      reset: assign({
        flags: 0,
      }),
    },
  }
);

export { flagMachine };
export type { FlagContext, FlagEvent, FlagMachine };
