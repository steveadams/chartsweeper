import { FC } from 'react';
import { Timer } from './Timer/Timer';
import { Flagger } from './Flagger';
import { Face } from './Face';
import { Grid } from './Grid';
import { SettingsDialog } from './Dialog/SettingsDialog';

const ChartSweeper: FC = () => (
  <div className="w-full h-full bg-slate-50">
    <div className="flex flex-col gap-y-4 max-w-fit mx-auto text-center text-gray-700">
      <div className="text-left">
        <h1 className="text-4xl font-black text-gray-800">Chartsweeper</h1>
        <SettingsDialog />
      </div>

      <div className="flex justify-between font-mono font-bold text-3xl">
        <Flagger />
        <Face />
        <Timer />
      </div>

      <main>
        <Grid />
      </main>
    </div>
  </div>
);

export { ChartSweeper };
