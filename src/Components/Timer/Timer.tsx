import { FC } from 'react';
import { selectElapsedTime } from '../../Context/selectors';
import { GameMachineContext } from '../../Context/GameMachineContext';
import { useSelector } from '@xstate/react';

export const Timer: FC = () => {
  const [gameState] = GameMachineContext.useActor();
  const elapsedTime = useSelector(gameState.children.timer, selectElapsedTime);

  return (
    <div className="timer">
      {Math.ceil(elapsedTime).toString().padStart(3, '0')}
    </div>
  );
};
