import ReactDOM from 'react-dom/client';
import { ChartSweeper } from './Components/Chartsweeper';
import './index.css';
import { GameContext } from './Context/GameContext';
import React from 'react';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GameContext.Provider>
      <ChartSweeper />
    </GameContext.Provider>
  </React.StrictMode>
);
