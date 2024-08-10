import {
  assign,
  StateFrom,
  ActorRefFrom,
  setup,
  assertEvent,
  enqueueActions,
} from 'xstate';
import { CellMachineRef } from './cellMachine';

interface FlagTypes {
  context: {
    flags: number;
    usedFlags: number;
  };
  events:
    | { type: 'RESET'; flags: number }
    | { type: 'REQUEST_FLAG'; cell: CellMachineRef }
    | { type: 'RETURN_FLAG'; cell: CellMachineRef };
  input: { flags: number };
}

export type FlagMachine = typeof flagMachine;
export type FlagMachineRef = ActorRefFrom<FlagMachine>;

export const flagMachine = setup({
  types: {} as FlagTypes,

  actions: {
    provideFlag: enqueueActions(({ context, event, enqueue }) => {
      assertEvent(event, 'REQUEST_FLAG');
      enqueue.sendTo(event.cell, { type: 'PLANT_FLAG' });
      enqueue.assign({ usedFlags: context.usedFlags + 1 });
    }),
    retrieveFlag: enqueueActions(({ context, event, enqueue }) => {
      assertEvent(event, 'RETURN_FLAG');
      enqueue.sendTo(event.cell, { type: 'REMOVE_FLAG' });
      enqueue.assign({ usedFlags: context.usedFlags - 1 });
    }),
    reset: assign({
      flags: ({ event }) => {
        assertEvent(event, 'RESET');

        return event.flags;
      },
      usedFlags: 0,
    }),
  },

  guards: {
    canProvideFlags: ({ context }) => context.usedFlags < context.flags,
    canRetrieveFlags: ({ context }) => context.flags > context.usedFlags,
  },
}).createMachine({
  id: 'flagger',
  context: ({ input }) => ({
    flags: input.flags,
    usedFlags: 0,
  }),
  initial: 'idle',
  states: {
    idle: {
      entry: [() => console.log('flagger idle'), 'reset'],
    },
  },
  on: {
    REQUEST_FLAG: {
      actions: ['provideFlag'],
      guard: 'canProvideFlags',
    },
    RETURN_FLAG: { actions: 'retrieveFlag', guard: 'canRetrieveFlags' },
    RESET: { actions: 'reset' },
  },
});
