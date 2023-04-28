import { FC, useCallback } from 'react';
import { GameMachineContext } from '../../Context/GameMachineContext';
import { match } from 'ts-pattern';

export const Face: FC = () => {
  const [state, send] = GameMachineContext.useActor();
  // TODO: I don't think useCallback is necessary here
  const reset = useCallback(() => send({ type: 'GAME.RESET' }), [send]);

  return (
    <button className="emoji" onClick={reset}>
      <>
        {match(state)
          .with({ value: 'win' }, () => '😎')
          .with({ value: 'lose' }, () => '😵')
          .with({ context: { revealing: true } }, () => '😫')
          .otherwise(() => '😃')}
      </>
    </button>
  );
};
