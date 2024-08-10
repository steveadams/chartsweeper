import { FC } from 'react';
import { GameContext } from '../Context/GameContext';
import { match } from 'ts-pattern';
import { selectFace } from '../Context/selectors';
import { Dizzy, Scared, Smile, Stars } from './Icons/Faces';

export const Face: FC = () => {
  const gameRef = GameContext.useActorRef();
  const face = GameContext.useSelector(selectFace);

  const expression = face?.getSnapshot()?.context.expression;

  const reset = () => gameRef.send({ type: 'GAME.RESET' });

  const FaceIcon = match(expression)
    .with('neutral', () => Smile)
    .with('scared', () => Scared)
    .with('happy', () => Stars)
    .with('dead', () => Dizzy)
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
