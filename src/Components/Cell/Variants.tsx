import { FC } from 'react';
import { CellMachineRef } from '../../machines/cellMachine';
import classnames from 'classnames';
import { match } from 'ts-pattern';
import { Bomb } from '../Icons/Bomb';
import { Flag } from '../Icons/Flag';
import { useSelector } from '@xstate/react';

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

    console.log('onClick', cell.getSnapshot());

    if (e.metaKey) {
      requestFlag(e);
    } else {
      uncover(e);
    }
  };

  return (
    <BaseCell
      className={classnames(
        'bg-yellow-400 ring-orange-600 ring-inset ring-opacity-20 hover:scale-105 transition-transform duration-100',
        { 'bg-red-600': state.context.isMine },
      )}
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
