import { createActorContext } from '@xstate/react';
import { gameMachine } from '../machines/gameMachine';
import { presets } from '../lib/game';
import { timerMachine } from '../machines/timerMachine';
import { flagMachine } from '../machines/flagMachine';
import faceLogic from '../machines/faceLogic';

export const GameContext = createActorContext(
  gameMachine.provide({
    actors: {
      timer: timerMachine,
      flagger: flagMachine,
      face: faceLogic,
    },
  }),
  {
    id: 'game',
    input: {
      mines: presets[0].mines,
      width: presets[0].width,
      height: presets[0].height,
    },
  },
);
