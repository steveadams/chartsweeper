import { FC } from 'react';
import { GameContext } from '../../Context/GameContext';
import { useSelector } from '@xstate/react';

export const Flagger: FC = () => {
  const flagger = GameContext.useSelector((state) => state.children.flagger);
  const availableFlags = useSelector(
    flagger,
    (state) => (state?.context?.flags || 0) - (state?.context?.usedFlags || 0),
  );

  return (
    <div className="flagger">
      {Math.ceil(availableFlags).toString().padStart(3, '0')}
    </div>
  );
};
