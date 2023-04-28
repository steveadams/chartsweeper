import './ChartSweeper.css';
import { FC, memo, useState } from 'react';
import { Dialog } from './Dialog/Dialog';
import { RenderCount } from './RenderCount';
import { Timer } from './Timer/Timer';
import { Flagger } from './Flagger/Flagger';
import { GameMachineContext } from '../machines/gameMachine';
import { GameMachineContext as GameContext } from '../Context/GameMachineContext';
import { Face } from './Face/Face';
import { Grid } from './Grid/Grid';

const ChartSweeper: FC = memo(() => {
  const gameRef = GameContext.useActorRef();

  // Hook into gameMachine events
  // TODO: Move down the tree
  const configure = (config: GameMachineContext['config']) =>
    gameRef.send({ type: 'GAME.CONFIGURE', config });

  // Config overlay
  const [showConfigOverlay, setShowConfigOverlay] = useState(false);
  const openConfigOverlay = () => setShowConfigOverlay(true);
  const closeConfigOverlay = () => setShowConfigOverlay(false);

  // TODO: Do some sanity checks here
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const width = parseInt(e.currentTarget.width.value);
    const height = parseInt(e.currentTarget.height.value);
    const mines = parseInt(e.currentTarget.mines.value);

    configure({ width, height, mines });
    setShowConfigOverlay(false);
  };

  return (
    <div className="chart-sweeper">
      <h1>ChartSweeper</h1>

      <RenderCount label={'chartsweeper'} />
      <div className="tools">
        <button onClick={openConfigOverlay}>Game</button>
      </div>
      <main className="game">
        <div className="top-bar">
          <Flagger />
          <Face />
          <Timer />
        </div>

        <Dialog isOpen={showConfigOverlay} close={closeConfigOverlay}>
          <form method="dialog" className="configure-game" onSubmit={onSubmit}>
            <div className="dialog--fields">
              <label htmlFor="width">Width</label>
              <input type="number" id="width" />

              <label htmlFor="height">Height</label>
              <input type="number" id="height" />

              <label htmlFor="mines">Mines</label>
              <input type="number" id="mines" />
            </div>
            <footer>
              <button type="submit">New Game</button>
            </footer>
          </form>
        </Dialog>
        <Grid />
      </main>
    </div>
  );
});

export { ChartSweeper };
