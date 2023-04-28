import {
  createMachine,
  assign,
  StateFrom,
  EventFrom,
  ContextFrom,
  actions,
} from 'xstate';
import { CellMachineRef } from './cellMachine';

interface FlagContext {
  flags: number;
  usedFlags: number;
}

export type FlagMachine = typeof flagMachine;
export type FlagMachineState = StateFrom<FlagMachine>;
export type FlagEvent =
  | { type: 'RESET' }
  | { type: 'REQUEST_FLAG'; cell: CellMachineRef }
  | { type: 'RETURN_FLAG'; cell: CellMachineRef };

export const flagMachine = createMachine<FlagContext, FlagEvent>(
  {
    id: 'flagger',
    context: ({ input }: { input: Partial<FlagContext> }) => ({
      flags: 0,
      usedFlags: 0,
      ...input,
    }),
    on: {
      REQUEST_FLAG: {
        actions: ['provideFlag', actions.log(() => 'provideFlag')],
        guard: 'canProvideFlags',
      },
      RETURN_FLAG: { actions: 'retrieveFlag' },
      RESET: { actions: 'reset' },
      '*': {
        actions: actions.log(({ context, event }) => ({ context, event })),
      },
    },
  },
  {
    actions: {
      provideFlag: actions.pure(({ context, event }) => {
        if (event.type === 'REQUEST_FLAG') {
          event.cell.send({ type: 'PLANT_FLAG' });

          return assign({ usedFlags: context.usedFlags + 1 });
        }

        // TODO: Worth sending an event here?
        return;
      }),
      retrieveFlag: actions.pure(({ context, event }) => {
        if (event.type === 'RETURN_FLAG') {
          event.cell.send({ type: 'REMOVE_FLAG' });

          return assign({ usedFlags: context.usedFlags - 1 });
        }

        return;
      }),
      reset: assign({ usedFlags: 0 }),
    },
    guards: {
      canProvideFlags: ({ context }) => context.usedFlags < context.flags,
    },
  }
);
