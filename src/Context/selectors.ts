import type { ActorRefFrom } from 'xstate';
import type { FlagMachine } from '../machines/flagMachine';
import type { GameMachineState } from '../machines/gameMachine';
import type { TimerMachine } from '../machines/timerMachine';

const selectState = (state: GameMachineState) => state;
const selectGrid = (state: GameMachineState) => state.context.grid;

const selectFlagsRemaining = (state: GameMachineState) => {
  const mines = state.context.config.mines;
  let flags = 0;

  if (state.value === 'playing') {
    const flagger = state.children.flagger as ActorRefFrom<FlagMachine>;

    if (flagger) {
      const flagState = flagger.getSnapshot();

      if (flagState?.context?.flags) {
        flags = flagState.context.flags;
      }
    }
  }

  return mines - flags;
};

const selectElapsedTime = (state: GameMachineState) => {
  let elapsed = 0;

  if (state.value === 'playing') {
    const timer = state.children.timer as ActorRefFrom<TimerMachine>;

    if (timer) {
      const timerState = timer.getSnapshot();

      if (timerState?.context?.elapsedTime) {
        elapsed = timerState.context.elapsedTime;
      }
    }
  }

  return elapsed;
};

export { selectState, selectGrid, selectFlagsRemaining, selectElapsedTime };
