import { FC } from 'react';
import { Cell } from '../Cell/Cell';
import { RenderCount } from '../RenderCount';
import { GameMachineContext } from '../../Context/GameContext';
import { selectGrid } from '../../Context/selectors';
import { useWhatChanged } from '@simbathesailor/use-what-changed';

const Grid: FC = () => {
  const [gameState, send] = GameMachineContext.useActor();
  const grid = GameMachineContext.useSelector(selectGrid);

  // useWhatChanged([grid], 'grid');

  return (
    <main
      className="grid"
      onMouseDown={(event: React.MouseEvent) => {
        if (event.button === 0) {
          send({ type: 'GAME.MOUSE_DOWN' });
        }
      }}
      onMouseUp={() => {
        if (gameState.matches('playing')) {
          send({ type: 'GAME.MOUSE_UP' });
        }
      }}
    >
      <RenderCount label="grid" />
      {grid.map((row) => (
        <>
          {row.map((cell) => (
            <Cell key={cell.id} cell={cell} />
          ))}
        </>
      ))}
    </main>
  );
};

export { Grid };
