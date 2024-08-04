import { FC } from 'react';
import { P, match } from 'ts-pattern';
import { CellMachineRef } from '../../machines/cellMachine';
import { CoveredCell, ExplodedCell, UncoveredCell } from './Variants';
import { useSelector } from '@xstate/react';

export interface CellProps {
  cell: CellMachineRef;
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
