import { match } from 'ts-pattern';
import { ContextFrom, fromTransition } from 'xstate';

type Expression = 'neutral' | 'happy' | 'dead' | 'scared';

export type FaceState = {
  expression: Expression;
};

type Events = 'CLICK' | 'WIN' | 'LOSE' | 'RESET';

export type FaceEvent = { [E in Events]: { type: E } }[Events];

const faceLogic = fromTransition<FaceState, FaceEvent, any, unknown>(
  (_, event) => {
    const expression = match(event.type)
      .returnType<Expression>()
      .with('CLICK', () => 'scared')
      .with('WIN', () => 'happy')
      .with('LOSE', () => 'dead')
      .with('RESET', () => 'neutral')
      .exhaustive();

    return { expression };
  },
  { expression: 'neutral' },
);

export default faceLogic;
