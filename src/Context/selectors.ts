import { FaceState } from '../machines/faceLogic';
import { FlagMachineRef } from '../machines/flagMachine';
import type { GameMachineState } from '../machines/gameMachine';
import type {
  TimerMachineRef,
  TimerMachineState,
} from '../machines/timerMachine';

export const selectGrid = (state: GameMachineState) => state.context.grid;

export const selectStateValue = (state: GameMachineState) => state.value;

export const selectFace = (s: GameMachineState) => s.children.face;
export const selectExpression = (s: FaceState) => s.expression;

export const selectAvailableFlags = (state: GameMachineState) => {
  const flagger = state.children.flagger as FlagMachineRef;
  const flaggerState = flagger.getSnapshot();

  return flaggerState.context.flags - flaggerState.context.usedFlags;
};

export const selectTotalFlags = (state: GameMachineState) => {
  const flagger = state.children.flagger as FlagMachineRef;
  const flaggerState = flagger.getSnapshot();

  return flaggerState.context.flags;
};

export const selectUsedFlags = (state: GameMachineState) => {
  const flagger = state.children.flagger as FlagMachineRef;
  const flaggerState = flagger.getSnapshot();

  return flaggerState.context.usedFlags;
};

export const selectTimer = (state: GameMachineState) =>
  state.children.timer as TimerMachineRef;

export const selectElapsedTime = (state: TimerMachineState) =>
  state.context.elapsedTime;
