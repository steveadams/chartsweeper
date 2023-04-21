import { createActorContext } from '@xstate/react';
import { createGameMachine, GameMachine } from '../machines/gameMachine';
import type { InterpreterFrom } from 'xstate';

type GameContext = typeof GameMachineContext;

const machine = createGameMachine();
const GameMachineContext = createActorContext(machine, {
  id: 'game-machine',
  devTools: (service: InterpreterFrom<GameMachine>) => {
    console.log('devTools', service.id);
    service.subscribe((state) => console.log(service.id, state.value));
  },
});

export { GameMachineContext };

export type { GameContext };
