import { createActorContext } from '@xstate/react';
import { createGameMachine, GameMachine } from '../machines/gameMachine';
import type { InterpreterFrom } from 'xstate';

const machine = createGameMachine();

export const GameMachineContext = createActorContext(machine, {
  id: 'game-machine',
  devTools: (service: InterpreterFrom<GameMachine>) =>
    service.subscribe((state) => console.log(service.id, state.value)),
});
