// import './wdyr';

import ReactDOM from 'react-dom/client';
import { ChartSweeper } from './Components/Chartsweeper';
import './index.css';
import { GameMachineContext } from './Context/GameContext';
import React from 'react';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GameMachineContext.Provider>
      <ChartSweeper />
    </GameMachineContext.Provider>
  </React.StrictMode>
);
