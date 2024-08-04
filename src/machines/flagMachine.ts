import {
  assign,
  StateFrom,
  sendTo,
  ActorRefFrom,
  setup,
  assertEvent,
  enqueueActions,
} from 'xstate';
import { CellMachineRef } from './cellMachine';

interface FlagContext {
  flags: number;
  usedFlags: number;
}

export type FlagMachine = typeof flagMachine;
export type FlagMachineState = StateFrom<FlagMachine>;
export type FlagMachineRef = ActorRefFrom<FlagMachine>;

export type FlagEvent =
  | { type: 'RESET'; flags: number }
  | { type: 'REQUEST_FLAG'; cell: CellMachineRef }
  | { type: 'RETURN_FLAG'; cell: CellMachineRef };

export const flagMachine = setup({
  types: {
    context: {} as FlagContext,
    events: {} as FlagEvent,
  },

  actions: {
    provideFlag: enqueueActions(({ context, event, enqueue }) => {
      assertEvent(event, 'REQUEST_FLAG');
      console.log('provide flag');

      enqueue.sendTo(event.cell, { type: 'PLANT_FLAG' });
      enqueue.assign({ usedFlags: context.usedFlags + 1 });
    }),
    retrieveFlag: enqueueActions(({ context, event, enqueue }) => {
      assertEvent(event, 'RETURN_FLAG');
      console.log('return flag');

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
  },
}).createMachine({
  id: 'flagger',
  context: ({ input }) => ({
    flags: 0,
    usedFlags: 0,
    ...input,
  }),
  initial: 'idle',
  states: {
    idle: {
      entry: [() => console.log('flagger idle')],
    },
  },
  on: {
    REQUEST_FLAG: {
      actions: ['provideFlag'],
      guard: 'canProvideFlags',
    },
    RETURN_FLAG: { actions: 'retrieveFlag' },
    RESET: { actions: 'reset' },
  },
});
