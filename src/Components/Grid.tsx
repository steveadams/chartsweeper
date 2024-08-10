import { FC } from 'react';
import { Cell } from './Cell';
import { GameContext } from '../Context/GameContext';
import { selectGrid } from '../Context/selectors';

export const Grid: FC = () => {
  const grid = GameContext.useSelector(selectGrid);

  return (
    <main className="flex flex-col gap-2">
      {grid.map((row, idx) => (
        <div className={`flex flex-row gap-2 row-${idx}`} key={`row-${idx}`}>
          {row.map((cell) => (
            <Cell key={cell.id} cell={cell} />
          ))}
        </div>
      ))}
    </main>
  );
};
