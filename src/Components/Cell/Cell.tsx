import { FC } from 'react';
import './Cell.css';
import { P, match } from 'ts-pattern';
import { useActor } from '@xstate/react';
import classnames from 'classnames';
import { CellMachine, CellMachineRef } from '../../machines/cellMachine';
import { StateFrom } from 'xstate';

export interface CellProps {
  cell: CellMachineRef;
}

export const Cell: FC<CellProps> = ({ cell }) => {
  const [cellState, send] = useActor(cell);

  const toggleFlag = (e: React.MouseEvent) => {
    e.preventDefault();

    if (cellState.can({ type: 'REQUEST_FLAG' })) {
      send({ type: 'REQUEST_FLAG', cell });
    }

    if (cellState.can({ type: 'RETURN_FLAG' })) {
      send({ type: 'RETURN_FLAG', cell });
    }
  };

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // https://minesweeperonline.com/ uses e.ctrlKey, but I don't want to prevent context menus from opening
    if (e.metaKey) {
      toggleFlag(e);
    } else {
      if (cellState.can({ type: 'TRAVERSE' })) {
        send({ type: 'TRAVERSE' });
      }
    }
  };

  const startReveal = (e: React.MouseEvent) => {
    e.preventDefault();

    if (e.button === 0) {
      send({ type: 'START_REVEAL' });
    }
  };

  const endReveal = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cellState.matches({ value: 'revealing' })) {
      send({ type: 'END_REVEAL' });
    }
  };

  const content = match(cellState)
    .with({ value: 'exploded' }, () => '*')
    .with({ value: 'flagged' }, () => '>')
    .with(
      { value: 'traversed' },
      { value: 'untouched' },
      { context: { adjacentMines: 0 } },
      () => ' '
    )
    .with({ context: { adjacentMines: P.select() } }, (mines) => String(mines))
    .exhaustive();

  return (
    <button
      className={classnames('cell', `cell--${cellState.value}`, {
        'cell--mine': cellState.context.isMine,
        [`cell--adjacent-${cellState.context.adjacentMines}`]:
          cellState.matches('traversed'),
      })}
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
