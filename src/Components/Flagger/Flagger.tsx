import { FC } from 'react';
import { selectAvailableFlags } from '../../Context/selectors';
import { GameMachineContext } from '../../Context/GameMachineContext';
import { useSelector } from '@xstate/react';

export const Flagger: FC = () => {
  const [gameState] = GameMachineContext.useActor();
  const availableFlags = useSelector(
    gameState.children.flagger,
    selectAvailableFlags
  );

  return (
    <div className="flagger">
      {Math.ceil(availableFlags).toString().padStart(3, '0')}
    </div>
  );
};
