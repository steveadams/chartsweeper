import { FC } from 'react';
import { GameContext } from '../../Context/GameContext';
import { P, match } from 'ts-pattern';
import { selectFace } from '../../Context/selectors';
import { Dizzy, Scared, Smile, Stars } from '../Icons/Faces';

export const Face: FC = () => {
  const gameRef = GameContext.useActorRef();
  const reset = () => gameRef.send({ type: 'GAME.RESET' });
  const state = GameContext.useSelector(selectFace);

  const FaceIcon = match(state)
    .with('neutral', () => Smile)
    .with('scared', () => Scared)
    .with('win', () => Stars)
    .with('lose', () => Dizzy)
    .exhaustive();

  return (
    <button onClick={reset}>
      <FaceIcon
        className="p-1 h-8 w-8 bg-yellow-100 ring-2 ring-yellow-300 rounded-xl box-content text-yellow-900"
        fill="currentColor"
      />
    </button>
  );
};
