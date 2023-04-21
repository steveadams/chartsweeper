import { FC, useCallback } from 'react';
import { GameMachineContext } from '../../Context/GameContext';
import { match } from 'ts-pattern';

const Face: FC = () => {
  const [state, send] = GameMachineContext.useActor();
  const reset = useCallback(() => send({ type: 'GAME.RESET' }), [send]);

  return (
    <button className="emoji" onClick={reset}>
      <>
        {match(state)
          .with({ value: '' }, () => '😫')
          .otherwise(() => '😃')}
      </>
    </button>
  );
};

export { Face };
