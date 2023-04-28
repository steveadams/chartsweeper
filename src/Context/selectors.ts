import { FlagMachineState } from '../machines/flagMachine';
import type { GameMachineState } from '../machines/gameMachine';
import type { TimerMachineState } from '../machines/timerMachine';

export const selectGrid = (state: GameMachineState) => state.context.grid;

export const selectAvailableFlags = (state: FlagMachineState) =>
  state.context.flags - state.context.usedFlags;

export const selectElapsedTime = (state: TimerMachineState) =>
  state.context.elapsedTime;
