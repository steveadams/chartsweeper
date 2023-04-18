import './ChartSweeper.css';
import { useState } from 'react';
import { Cell, CellProps } from './Cell/Cell';
import { initializeGrid } from '../lib/game';
import { Dialog } from './Dialog/Dialog';
import { RenderCount } from './RenderCount';

export interface GameConfig {
  width: number;
  height: number;
  mines: number;
}

export interface GameState {
  config: GameConfig;
  grid: CellProps[][];
}

const defaultConfig: GameConfig = {
  width: 30,
  height: 20,
  mines: 30,
};

function ChartSweeper() {
  const [config, setConfig] = useState<GameConfig>(defaultConfig);
  const [grid, setGrid] = useState(() => {
    console.log('init grid');
    return initializeGrid(defaultConfig);
  });
  const [showConfigOverlay, setShowConfigOverlay] = useState(false);

  const reset = (withConfig: GameConfig) => {
    setConfig(withConfig);
    setGrid(initializeGrid(withConfig));
  };
  const resetWithCurrentSettings = () => setGrid(initializeGrid(config));

  const openConfigOverlay = () => setShowConfigOverlay(true);
  const closeConfigOverlay = () => setShowConfigOverlay(false);

  // TODO: Do some sanity checks here
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const width = parseInt(e.currentTarget.width.value);
    const height = parseInt(e.currentTarget.height.value);
    const mines = parseInt(e.currentTarget.mines.value);

    reset({ width, height, mines });
    setShowConfigOverlay(false);
  };

  return (
    <div className="chart-sweeper">
      <h1>ChartSweeper</h1>
      <RenderCount />
      <div className="tools">
        <button onClick={openConfigOverlay}>Game</button>
      </div>
      <main className="game">
        <div className="top-bar">
          <div className="flag-counter">999</div>
          <button className="emoji" onClick={resetWithCurrentSettings}>
            😎
          </button>
          <div className="timer">000</div>
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

        <main
          className="grid"
          onMouseDown={() => console.log('down')}
          onMouseUp={() => console.log('up')}
        >
          {grid.map((row) => (
            <div key={row[0].row}>
              {row.map((cell) => (
                <Cell key={`${cell.row},${cell.column}`} {...cell} />
              ))}
            </div>
          ))}
        </main>
      </main>
    </div>
  );
}

export { ChartSweeper };
