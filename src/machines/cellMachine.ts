import { ActorRefFrom, createMachine, assign, sendParent } from 'xstate';

type CellEvents =
  | {
      type: 'TOGGLE_FLAG';
    }
  | {
      type: 'TRAVERSE';
    }
  | {
      type: 'EXPLODE';
    }
  | {
      type: 'ADJACENT_MINES';
    }
  | {
      type: 'RESET';
    };

type BaseCell = {
  position: Readonly<{ x: number; y: number }>;
  isMine: boolean;
  adjacentMines: number;
};

type UntouchedCell = BaseCell & {
  traversed: false;
  flagged: false;
};

type TraversedCell = BaseCell & {
  traversed: true;
  flagged: false;
};

type FlaggedCell = BaseCell & {
  traversed: false;
  flagged: true;
};

type CellContext = UntouchedCell | TraversedCell | FlaggedCell;
type CellMachine = ReturnType<typeof createCellMachine>;
type CellMachineRef = ActorRefFrom<CellMachine>;

const createCellMachine = ({
  position,
  adjacentMines,
  isMine,
  traversed,
  flagged,
}: CellContext) =>
  createMachine(
    {
      id: 'cell',
      initial: 'untouched',
      context: {
        position,
        isMine,
        adjacentMines,
        traversed,
        flagged,
      },
      on: {
        EXPLODE: {
          actions: 'explode',
          target: '.exploded',
        },
      },
      states: {
        untouched: {
          on: {
            TOGGLE_FLAG: {
              target: 'flagged',
              actions: 'toggleFlag',
            },
            TRAVERSE: {
              actions: 'traverse',
              target: 'traversed',
            },
          },
        },
        traversed: {
          entry: 'markAsTraversed',
        },
        flagged: {
          on: {
            TOGGLE_FLAG: {
              target: 'untouched',
              actions: 'toggleFlag',
            },
          },
        },
        exploded: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        traverse: sendParent(() => ({ type: 'CELL.TRAVERSE' })),
        markAsTraversed: assign({
          traversed: true,
        }),
        toggleFlag: ({ context }) => {
          context.flagged = !context.flagged;
          console.log('flaggin');
          sendParent({
            type: context.flagged ? 'CELL.ADD_FLAG' : 'CELL.REMOVE_FLAG',
          });
        },
        explode: sendParent({ type: 'CELL.EXPLODE' }),
      },
    }
  );

export { createCellMachine };

export type { CellContext, CellEvents, CellMachine, CellMachineRef };
