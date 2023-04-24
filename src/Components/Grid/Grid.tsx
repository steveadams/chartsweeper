import { FC } from 'react';
import { Cell } from '../Cell/Cell';
import { RenderCount } from '../RenderCount';
import { GameMachineContext } from '../../Context/GameMachineContext';
import { selectGrid } from '../../Context/selectors';
import { useWhatChanged } from '@simbathesailor/use-what-changed';

export const Grid: FC = () => {
  const grid = GameMachineContext.useSelector(selectGrid);

  return (
    <main className="grid">
      <RenderCount label="grid" />
      {grid.map((row, idx) => (
        <div key={`row-${idx}`}>
          {row.map((cell) => (
            <Cell key={cell.id} cell={cell} />
          ))}
        </div>
      ))}
    </main>
  );
};
