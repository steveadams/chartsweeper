import { FC } from 'react';
import './Cell.css';
import { P, match } from 'ts-pattern';
import { useActor } from '@xstate/react';
import classnames from 'classnames';
import { CellMachineRef } from '../../machines/cellMachine';

export interface CellProps {
  cell: CellMachineRef;
}

const Cell: FC<CellProps> = ({ cell }) => {
  const [cellState, send] = useActor(cell);

  const toggleFlag = (e: React.MouseEvent) => {
    e.preventDefault();
    send({ type: 'TOGGLE_FLAG' });
  };

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // https://minesweeperonline.com/ uses e.ctrlKey, but I don't want to prevent context menus from opening
    if (e.metaKey) {
      toggleFlag(e);
    } else {
      send({ type: 'TRAVERSE' });
    }
  };

  const content = match(cellState.context)
    .with({ traversed: true, isMine: true }, () => '*')
    .with({ traversed: false, flagged: true }, () => '>')
    .with({ traversed: true, flagged: false }, { adjacentMines: 0 }, () => ' ')
    .with({ adjacentMines: P.select() }, (mines) => String(mines))
    .exhaustive();

  return (
    <button
      className={classnames('cell', `cell--${cellState.value}`, {
        'cell--mine': cellState.context.isMine,
        [`cell--adjacent-${cellState.context.adjacentMines}`]:
          !cellState.context.isMine && cellState.context.adjacentMines,
      })}
      type="button"
      onClick={onClick}
      onContextMenu={toggleFlag}
    >
      {content}
    </button>
  );
};

export { Cell };
