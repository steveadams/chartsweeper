import {
  ActorRefFrom,
  actions,
  assign,
  createMachine,
  sendParent,
  sendTo,
} from 'xstate';
import { Coordinates, makeCellKey } from '../lib/game';

type FlagEvent =
  | { type: 'REQUEST_FLAG' }
  | { type: 'RETURN_FLAG' }
  | { type: 'PLANT_FLAG' }
  | { type: 'REMOVE_FLAG' };

type MineEvent =
  | { type: 'SET_MINE' }
  | { type: 'ADD_ADJACENT_MINE' }
  | { type: 'EXPLODE' }
  | { type: 'REMOTE_DETONATE' };

export type CellEvent =
  | FlagEvent
  | MineEvent
  | { type: 'SCAN' }
  | { type: 'SCAN_REQUEST'; cell: CellMachineRef }
  | { type: 'REVEAL' }
  | { type: 'START_REVEALING' }
  | { type: 'STOP_REVEALING' }
  | { type: 'RESET' };

export type CellContext = {
  coordinates: Coordinates;
  isMine: boolean;
  wasScanned: boolean;
  adjacentMines: number;
};

export type CellMachine = ReturnType<typeof createCellMachine>;
export type CellMachineRef = ActorRefFrom<CellMachine>;

export const createCellMachine = ({
  coordinates,
  adjacentMines,
  isMine,
}: CellContext) =>
  createMachine<CellContext, CellEvent>(
    {
      id: 'cell',
      context: {
        coordinates,
        isMine,
        wasScanned: false,
        adjacentMines,
      },
      initial: 'covered',
      on: {
        SCAN_REQUEST: {
          actions: [
            () => actions.log('SCAN_REQUEST'),
            'externalScan',
            'markScanned',
            actions.log(() => 'externalScan'),
          ],
        },
        ADD_ADJACENT_MINE: {
          actions: ['addAdjacentMine', actions.log(() => 'addAdjacentMine')],
        },
        REMOTE_DETONATE: {
          target: '.exploded',
          guard: 'isMine',
        },
      },
      states: {
        covered: {
          on: {
            REQUEST_FLAG: {
              actions: ['requestFlag'],
            },
            PLANT_FLAG: 'flagged',
            REVEAL: 'revealing',
            SET_MINE: {
              actions: 'setMine',
            },
          },
        },
        flagged: {
          on: {
            RETURN_FLAG: {
              actions: 'returnFlag',
            },
            REMOVE_FLAG: 'covered',
          },
        },
        revealing: {
          always: [
            { target: ['exploded'], actions: 'explode', guard: 'isMine' },
            { target: ['clear'], actions: 'clear' },
          ],
        },
        clear: {
          entry: ['internalScan', 'markScanned'],
          type: 'final',
        },
        exploded: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        markScanned: assign({
          wasScanned: true,
        }),
        internalScan: actions.pure(({ context, event }) => {
          const sends: ReturnType<typeof sendTo>[] = [];

          if (event.type === 'REVEAL') {
            const directions = [
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [0, -1],
              [0, 1],
              [1, -1],
              [1, 0],
              [1, 1],
            ];

            for (const [dx, dy] of directions) {
              const row = context.coordinates.row + dy;
              const column = context.coordinates.column + dx;

              // There are no negative coordinates on the board
              if (row < 0 || column < 0) {
                continue;
              }

              console.log(
                `send from ${makeCellKey(context.coordinates)} to ${makeCellKey(
                  { row, column }
                )}`
              );

              sends.push(
                sendTo(makeCellKey({ row, column }), { type: 'SCAN_REQUEST' })
              );
            }
          }

          return sends;
        }),
        externalScan: actions.pure(({ context, event }) => {
          console.log('externalScan at ', context.coordinates);
          // Notify scan neighbour initiator that this cell contains a mine
          if (event.type === 'SCAN_REQUEST' && event.cell && context.isMine) {
            event.cell.send({ type: 'ADD_ADJACENT_MINE' });

            return [];
          }

          if (context.isMine || context.wasScanned) {
            console.log(
              'return early, isMine or wasScanned',
              context.isMine,
              context.wasScanned
            );

            return [];
          }

          if (event.type === 'SCAN_REQUEST') {
            const sends: ReturnType<typeof sendTo>[] = [];
            const directions = [
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [0, -1],
              [0, 1],
              [1, -1],
              [1, 0],
              [1, 1],
            ];

            for (const [dx, dy] of directions) {
              const neighbourKey = makeCellKey({
                row: context.coordinates.row + dy,
                column: context.coordinates.column + dx,
              });

              console.log('send SCAN_REQUEST', neighbourKey);
              sends.push(
                sendTo(neighbourKey, {
                  type: 'SCAN_REQUEST',
                })
              );
            }

            return sends;
          }
        }),
        addAdjacentMine: assign({
          adjacentMines: ({ context }) => context.adjacentMines + 1,
        }),

        requestFlag: sendTo(
          ({ system }) => system.get('flagger'),
          ({ self }) => ({ type: 'REQUEST_FLAG', cell: self })
        ),

        returnFlag: sendTo(
          ({ system }) => system.get('flagger'),
          ({ self }) => ({
            type: 'RETURN_FLAG',
            cell: self,
          })
        ),

        setMine: assign({ isMine: true }),

        clear: sendParent(({ self }) => ({
          type: 'CELL_CLEARED',
          cellKey: self.id,
        })),
        explode: sendParent({ type: 'MINE_REVEALED' }),
      },
      guards: {
        isMine: ({ context }) => context.isMine,
      },
    }
  );
