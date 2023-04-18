import { FC, useState } from 'react';
import './Cell.css';
import { match, P } from 'ts-pattern';
import classnames from 'classnames';

export interface CellProps {
  mine: boolean;
  row: number;
  column: number;
}

type BaseCell = {
  position: [x: number, y: number];
};

type UntouchedCell = BaseCell & {
  adjacentMines: null;
  traversed: false;
  flagged: false;
};

type TraversedCell = BaseCell & {
  adjacentMines: number;
  traversed: true;
  flagged: false;
};

type FlaggedCell = BaseCell & {
  adjacentMines: null;
  traversed: false;
  flagged: true;
};

type CellState = UntouchedCell | TraversedCell | FlaggedCell;

const defaultState: UntouchedCell = {
  position: [0, 0],
  adjacentMines: null,
  traversed: false,
  flagged: false,
};

const Cell: FC<CellProps> = ({ mine, row, column }) => {
  const [state, setState] = useState<CellState>(defaultState);

  const content = match([state, mine])
    .with([{ traversed: true }, true], () => '*')
    .with([{ flagged: true }, P._], () => '>')
    .with(
      [{ adjacentMines: P.nullish }, P._],
      [{ adjacentMines: 0 }, P._],
      () => <>&nbsp;</>
    )
    .with([{ adjacentMines: P.number }, P._], ([cell]) =>
      String(cell.adjacentMines)
    )
    .exhaustive();

  const onClick = () => {
    if (state.traversed) {
      return;
    }

    if (mine) {
      alert('You lose!');
    } else {
      setState({
        ...state,
        adjacentMines: Math.floor(Math.random() * 8),
        traversed: true,
      } as TraversedCell);
    }
  };

  // TODO: bake classnames into state-based components so they can't be erroneously combined
  return (
    <button
      className={classnames('cell', {
        'cell--traversed': state.traversed,
        'cell--flagged': state.flagged,
        'cell--untouched': !state.traversed && !state.flagged,
        'cell--mine': mine,
        'cell--clear': !mine && state.adjacentMines === 0,
        [`cell--adjacent-${state.adjacentMines}`]:
          !mine && state.adjacentMines && state.adjacentMines > 0,
      })}
      type="button"
      onClick={onClick}
    >
      {content}
    </button>
  );
};

export { Cell };
