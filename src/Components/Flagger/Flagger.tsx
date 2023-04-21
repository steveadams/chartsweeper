import { FC } from 'react';
import { selectFlagsRemaining } from '../../Context/selectors';
import { GameMachineContext } from '../../Context/GameContext';

export const Flagger: FC = () => {
  const flagsRemaining = GameMachineContext.useSelector(selectFlagsRemaining);

  return (
    <div className="flagger">
      {Math.ceil(flagsRemaining).toString().padStart(3, '0')}
    </div>
  );
};
