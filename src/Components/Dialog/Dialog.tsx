import { FC } from 'react';
import './Dialog.css';

interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  isOpen: boolean;
  close: () => void;
}

export const Dialog: FC<DialogProps> = ({ isOpen, close, title, children }) => {
  return (
    <dialog className="dialog" open={isOpen}>
      <header>
        <span>{title}</span>
        <button onClick={close}>✕</button>
      </header>
      <div className="dialog--content">{children}</div>
    </dialog>
  );
};
