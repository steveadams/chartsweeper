import { match } from 'ts-pattern';
import { fromTransition } from 'xstate';

type Face = 'neutral' | 'win' | 'lose' | 'scared';

type FaceState = {
  face: Face;
};

export type FaceEvent =
  | { type: 'CLICK' }
  | { type: 'WIN' }
  | { type: 'LOSE' }
  | { type: 'RESET' };

const faceLogic = fromTransition<FaceState, FaceEvent, any, unknown>(
  (state, event) => {
    return match<FaceEvent['type'], FaceState>(event.type)
      .with('CLICK', () => ({ face: 'scared' }))
      .with('WIN', () => ({ face: 'win' }))
      .with('LOSE', () => ({ face: 'lose' }))
      .with('RESET', () => ({ face: 'neutral' }))
      .otherwise(() => state);
  },
  { face: 'neutral' },
);

export default faceLogic;
