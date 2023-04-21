import { FC } from 'react';
import { selectElapsedTime } from '../../Context/selectors';
import { GameMachineContext } from '../../Context/GameContext';

const Timer: FC = () => {
  const elapsedTime = GameMachineContext.useSelector(selectElapsedTime);

  return (
    <div className="timer">
      {Math.ceil(elapsedTime).toString().padStart(3, '0')}
    </div>
  );
};

export { Timer };
