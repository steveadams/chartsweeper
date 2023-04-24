import {
  ActorRefFrom,
  createMachine,
  assign,
  sendParent,
  sendTo,
} from 'xstate';
import { fromCallback, fromPromise } from 'xstate/actors';
import { FlagMachine, flagMachine } from './flagMachine';

export type CellEvent =
  | {
      type: 'REQUEST_FLAG';
      cell: CellMachineRef;
    }
  | {
      type: 'RETURN_FLAG';
      cell: CellMachineRef;
    }
  | {
      type: 'PLANT_FLAG';
    }
  | {
      type: 'REMOVE_FLAG';
    }
  | {
      type: 'START_REVEALING';
    }
  | {
      type: 'STOP_REVEALING';
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

export type CellContext = {
  position: Readonly<{ x: number; y: number }>;
  isMine: boolean;
  adjacentMines: number;
};

export type CellMachine = ReturnType<typeof createCellMachine>;
export type CellMachineRef = ActorRefFrom<CellMachine>;

export const createCellMachine = ({
  position,
  adjacentMines,
  isMine,
}: CellContext) =>
  createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QGMwBs0GICiANACgDIDyAItgNoAMAuoqAA4D2sAlgC6tMB29IAHogDsQgHRCATBIBsAVjmyALAA5FATiGyANCACeiWVTGzlstRokBGWZemTZAXwc7UGTACpqdJCGZtOPHyCCBJqAMyiymqKshKqYYqWymFUYTr6CNJh0qKpapahEtnK0lQSTi7oaKIArtzsTDXIABaQmABK2ACKAKrYAMoAKgD6AGKEAIIA4l58fhxcvD7BALSGomESilbKmlT7+xLpiEkSG1u2stlC22rlziCu1XUNTa0QmEQTAHIj49OzHzzAJLUDBGSycTKAqKRKWKjQ2TaPQnIRqURqK7wxLqaR4xwPJ61eqNFptQbtCYANWw7X6lFocxYC0Cy0QEKhMLhCOsyIy2wiYTMYWUpi2cmk0QqjyqxNeZI+g2IUymhGww06NImhAAkt8ZoygcyQUF2aVOVtuYi+YhNjk1FRpBJ5IZQtJFNKiQAnMAANzAAEM0KxuFBMEqVWqNdgtbr9YDGMbFqaQuahNDLZZ4dbjiEUqIYmEuRmhFn7pUMKIAGZoANQGAfTqDHrtb5jSYG7yJ-zJtkIRSlyLCoRGIolay56GiQwHWez6Se2U1usNjrYACyxBp7YBhu7LNBAltqQx5nMpiS+TM0lzBXRhYRIqSjqSYScD24TAgcD4TyZPdZMFEBWNRlHObYkj2Wc0hRBA1lPM9EMQxQ30JWUXlJd5-wPFMVkse9nXTKhohsV05FzEVITHIoVCiAorEXSsfX9IMQygbCTT7dR0Q0BRMWI918Io2FxHMFDVCyMJJFsRjqmXetIA43sgP7cwMSEPjDDUQS1FvZQzkxItNjKWw7g0WTRHYL0A39L1YEUo0AMPYIBzEdMHVKIQwiLFQjlg2FIRMa9NHPO5FAXNDKzAfgGDQL8HP3TiVI5dMuSzHkkVzWJ0QzWIqCULJ1GUd8HCAA */
      id: 'cell',
      initial: 'untouched',
      context: {
        position,
        isMine,
        adjacentMines,
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
            REQUEST_FLAG: {
              actions: 'requestFlag',
            },
            PLANT_FLAG: 'flagged',
            TRAVERSE: {
              actions: 'traverse',
              target: 'traversed',
            },
            TOGGLE_REVEALING: {
              target: 'revealing',
              actions: 'startRevealing',
            },
          },
        },
        revealing: {
          on: {
            TOGGLE_REVEALING: {
              target: 'untouched',
              actions: 'stopRevealing',
            },
          },
        },
        flagged: {
          on: {
            RETURN_FLAG: {
              actions: 'returnFlag',
            },
            REMOVE_FLAG: 'untouched',
          },
        },
        traversed: {
          type: 'final',
        },
        exploded: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        startRevealing: sendParent({ type: 'CELL.STARTED_REVEALING' }),
        stopRevealing: sendParent({ type: 'CELL.STOPPED_REVEALING' }),
        traverse: sendParent(() => ({ type: 'CELL.TRAVERSE' })),
        explode: sendParent({ type: 'CELL.EXPLODE' }),
        requestFlag: sendParent(({ self }) => ({
          type: 'CELL.REQUEST_FLAG',
          cell: self,
        })),
        returnFlag: sendParent(({ self }) => ({
          type: 'CELL.RETURN_FLAG',
          cell: self,
        })),
      },
    }
  );
