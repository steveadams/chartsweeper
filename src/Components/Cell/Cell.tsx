import { FC } from 'react';
import './Cell.css';
import { P, match } from 'ts-pattern';
import { useActor } from '@xstate/react';
import classnames from 'classnames';
import { CellMachineRef } from '../../machines/cellMachine';

export interface CellProps {
  cell: CellMachineRef;
}

export const Cell: FC<CellProps> = ({ cell }) => {
  const [cellState, send] = useActor(cell);

  const toggleFlag = (e: React.MouseEvent) => {
    e.preventDefault();

    match(cellState.value)
      .with('covered', () => send({ type: 'REQUEST_FLAG' }))
      .with('flagged', () => send({ type: 'RETURN_FLAG' }))
      .otherwise(() => {});
  };

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // https://minesweeperonline.com/ uses e.ctrlKey, but I don't want to prevent context menus from opening
    if (e.metaKey) {
      toggleFlag(e);
    } else {
      if (cellState.can({ type: 'REVEAL' })) {
        send({ type: 'REVEAL' });
      }
    }
  };

  const startReveal = (e: React.MouseEvent) => {
    e.preventDefault();

    if (e.button === 0) {
      send({ type: 'START_REVEALING' });
    }
  };

  const endReveal = (e: React.MouseEvent) => {
    e.preventDefault();

    send({ type: 'STOP_REVEALING' });
  };

  const content = match(cellState)
    .with({ value: 'exploded' }, () => '*')
    .with({ value: 'flagged' }, () => '>')
    .with({ value: 'covered' }, { context: { adjacentMines: 0 } }, () => ' ')
    .with({ context: { adjacentMines: P.select() } }, (mines) => String(mines))
    .exhaustive();

  return (
    <button
      className={classnames('cell', {
        'cell--mine': cellState.context.isMine,
        ['cell--flagged']: cellState.matches('flagged'),
        ['cell--clear']: cellState.matches({ status: 'clear' }),
        [`cell--adjacent-${cellState.context.adjacentMines} cell--scanned`]:
          cellState.matches({ scan: 'complete' }),
      })}
      disabled={cellState.done}
      type="button"
      onMouseDown={startReveal}
      onMouseUp={endReveal}
      onClick={onClick}
      onContextMenu={toggleFlag}
    >
      {content}
    </button>
  );
};
