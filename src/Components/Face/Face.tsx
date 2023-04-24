import { FC, useCallback } from 'react';
import { GameMachineContext } from '../../Context/GameMachineContext';
import { match } from 'ts-pattern';

export const Face: FC = () => {
  const [state, send] = GameMachineContext.useActor();
  const reset = useCallback(() => send({ type: 'GAME.RESET' }), [send]);

  return (
    <button className="emoji" onClick={reset}>
      <>
        {match(state)
          .with({ value: '' }, () => '😫')
          .with({ context: { revealing: true } }, () => '😫')
          .otherwise(() => '😃')}
      </>
    </button>
  );
};
