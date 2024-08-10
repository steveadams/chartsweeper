import { FC } from 'react';
import { selectElapsedTime, selectTimer } from '../../Context/selectors';
import { GameContext } from '../../Context/GameContext';
import { useSelector } from '@xstate/react';

export const Timer: FC = () => {
  const timerRef = GameContext.useSelector(selectTimer);
  const elapsedTime = useSelector(timerRef, selectElapsedTime);

  return (
    <div className="timer">
      {Math.ceil(elapsedTime).toString().padStart(3, '0')}
    </div>
  );
};
