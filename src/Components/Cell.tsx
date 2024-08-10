import { FC } from 'react';
import { P, match } from 'ts-pattern';
import { CellMachineRef } from '../machines/cellMachine';
import { useSelector } from '@xstate/react';
import classnames from 'classnames';
import { Flag } from './Icons/Flag';
import { Bomb } from './Icons/Bomb';

export interface CellProps {
  cell: CellMachineRef;
}

interface BaseCellProps extends React.HTMLAttributes<HTMLButtonElement> {}

interface LiveCellProps extends BaseCellProps {
  cell: CellMachineRef;
}

interface UncoveredCellProps extends BaseCellProps {
  adjacentMines: number;
}

interface ExplodedCellProps extends BaseCellProps {
  red: boolean;
}

export const Cell: FC<CellProps> = ({ cell }) => {
  const state = useSelector(cell, (state) => state);

  return match(state)
    .with({ value: 'uncovered', context: P.select() }, (context) => (
      <UncoveredCell adjacentMines={context.adjacentMines} />
    ))
    .with({ value: 'revealed' }, () => <ExplodedCell red={false} />)
    .with({ value: 'exploded' }, () => <ExplodedCell red={true} />)
    .otherwise(() => <CoveredCell cell={cell} />);
};

export const BaseCell: FC<BaseCellProps> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={classnames(
      'rounded-full w-8 h-8 font-black ring-2 flex justify-center items-center',
      className,
    )}
    type="button"
    {...props}
  >
    {children}
  </button>
);

export const CoveredCell: FC<LiveCellProps> = ({ cell }) => {
  const state = useSelector(cell, (state) => state);

  const uncover = (e: React.MouseEvent) => cell.send({ type: 'UNCOVER' });

  const requestFlag = (e: React.MouseEvent) => {
    e.preventDefault();
    cell.send({ type: 'REQUEST_FLAG' });
  };
  const returnFlag = (e: React.MouseEvent) => {
    e.preventDefault();
    cell.send({ type: 'RETURN_FLAG' });
  };

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();

    e.metaKey ? requestFlag(e) : uncover(e);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) {
      console.log('onMouseDown cancelled');
      return;
    }

    cell.send({ type: 'UNCOVERING' });
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (e.button !== 0) {
      return;
    }

    cell.send({ type: 'UNCOVERING_STOPPED' });
  };

  const onMouseOut = (e: React.MouseEvent) => {
    if (e.buttons !== 1) {
      return;
    }

    cell.send({ type: 'UNCOVERING_STOPPED' });
  };

  return (
    <BaseCell
      className={classnames(
        'bg-yellow-400 ring-orange-600 ring-inset ring-opacity-20 hover:scale-105 transition-transform duration-100',
        { 'bg-red-600': state.context.isMine },
      )}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOut={onMouseOut}
      onClick={onClick}
      onContextMenu={state.matches('flagged') ? returnFlag : requestFlag}
    >
      {state.matches('flagged') ? <Flag /> : null}
    </BaseCell>
  );
};

export const UncoveredCell: FC<UncoveredCellProps> = ({ adjacentMines }) => {
  const color = match(adjacentMines)
    .with(1, () => 'text-blue-500')
    .with(2, () => 'text-green-600')
    .with(3, () => 'text-red-800')
    .with(4, () => 'text-blue-800')
    .with(5, () => 'text-red-900')
    .with(6, () => 'text-emerald-700')
    .with(8, () => 'text-gray-500')
    .otherwise(() => 'text-gray-900');

  return (
    <BaseCell className={classnames('ring-orange-600 ring-opacity-20', color)}>
      {adjacentMines > 0 ? adjacentMines : ''}
    </BaseCell>
  );
};

export const ExplodedCell: FC<ExplodedCellProps> = ({ red = false }) => (
  <BaseCell
    className={classnames('ring-orange-500 ring-opacity-20', {
      'text-orange-700': red,
    })}
  >
    <Bomb />
  </BaseCell>
);
