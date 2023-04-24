import { createMachine, assign, StateFrom } from 'xstate';
import { CellMachineRef } from './cellMachine';

interface FlagContext {
  availableFlags: number;
}

type FlagEvent =
  | { type: 'RESET' }
  | { type: 'CELL.REQUEST_FLAG'; cell: CellMachineRef }
  | { type: 'CELL.RETURN_FLAG'; cell: CellMachineRef };

export type FlagMachine = typeof flagMachine;
export type FlagMachineState = StateFrom<FlagMachine>;

export const flagMachine = createMachine<FlagContext, FlagEvent>(
  {
    id: 'flagger',
    context: ({ input }) => ({
      availableFlags: 0,
      ...input,
    }),
    on: {
      'CELL.REQUEST_FLAG': { actions: 'provideFlag', guard: 'hasFlags' },
      'CELL.RETURN_FLAG': { actions: 'retrieveFlag' },
      RESET: { actions: 'reset' },
      '*': {
        actions: ({ event }) => console.log('flag event', event),
      },
    },
  },
  {
    actions: {
      provideFlag: assign({
        availableFlags: ({ context, event }) => {
          if (event.type === 'CELL.REQUEST_FLAG') {
            const { cell } = event;
            const cellState = event.cell.getSnapshot();

            if (cellState) {
              console.log('flagger: REQUEST_FLAG – ADD_FLAG');
              cell.send({ type: 'PLANT_FLAG' });

              return context.availableFlags - 1;
            } else {
              console.log('flagger: REQUEST_FLAG');
            }
          }

          return context.availableFlags;
        },
      }),
      retrieveFlag: assign({
        availableFlags: ({ context, event }) => {
          if (event.type === 'CELL.RETURN_FLAG') {
            const { cell } = event;
            console.log('flagger: RETURN_FLAG');
            cell.send({ type: 'REMOVE_FLAG' });

            return context.availableFlags + 1;
          }

          return context.availableFlags;
        },
      }),
      reset: assign({
        availableFlags: 0,
      }),
    },
    guards: {
      hasFlags: ({ context }) => context.availableFlags > 0,
    },
  }
);
