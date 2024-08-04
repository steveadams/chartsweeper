import { FC } from 'react';
import { Cell } from '../Cell/Cell';
import { GameContext } from '../../Context/GameContext';
import { selectGrid } from '../../Context/selectors';

export const Grid: FC = () => {
  // const { send } = GameContext.useActorRef();
  const grid = GameContext.useSelector(selectGrid);

  // const setUncovering = () => send({ type: 'STARTED_UNCOVERING' });
  // const unsetUncovering = () => send({ type: 'STOPPED_UNCOVERING' });

  return (
    <main
      className="flex flex-col gap-2"
      // onMouseDown={setUncovering}
      // onMouseLeave={unsetUncovering}
      // onMouseUp={unsetUncovering}
    >
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
