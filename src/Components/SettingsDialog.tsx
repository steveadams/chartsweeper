import { FC, Fragment, HTMLAttributes, useState } from 'react';
import { Dialog, RadioGroup, Transition } from '@headlessui/react';
import { GameContext } from '../../Context/GameContext';
import { GameMachineContext } from '../../machines/gameMachine';
import { presets } from '../../lib/game';
import classNames from 'classnames';
import { Bomb } from '../Icons/Bomb';

const Presets = () => {
  const [selected, setSelected] = useState(presets[0]);

  return (
    <div className="w-full py-4">
      <div className="mx-auto w-full max-w-md">
        <RadioGroup value={selected} onChange={setSelected}>
          <RadioGroup.Label className="sr-only">Grid Size</RadioGroup.Label>
          <div className="space-y-2">
            {presets.map((preset) => (
              <RadioGroup.Option
                key={preset.name}
                value={preset}
                className={({ active, checked }) =>
                  classNames(
                    'relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none',
                    {
                      'ring-4 ring-blue-500 ring-opacity-20': active,

                      'bg-blue-500 text-white': checked,
                      'bg-white': !checked,
                    }
                  )
                }
              >
                {({ checked }) => (
                  <div className="flex w-full items-center justify-between">
                    <div className="flex flex-col">
                      <RadioGroup.Label
                        as="p"
                        className={classNames('font-bold text-lg', {
                          'text-white': checked,
                          'text-gray-900': !checked,
                        })}
                      >
                        {preset.name}
                      </RadioGroup.Label>

                      <div className="flex">
                        {/* <preset.Face /> */}

                        <RadioGroup.Description
                          as="span"
                          className={classNames(
                            'flex gap-4 items-center justify-between',
                            {
                              'text-sky-100': checked,
                              'text-gray-600': !checked,
                            }
                          )}
                        >
                          <div className="flex gap-2">
                            <span className="flex gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-6 h-6"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {preset.width} &#10005; {preset.height}
                            </span>
                            <span className="flex gap-2">
                              <Bomb /> {preset.mines}
                            </span>
                          </div>
                        </RadioGroup.Description>
                      </div>
                    </div>

                    <div className="h-8 w-8 text-white end">
                      {checked && <CheckIcon className="h-full w-full" />}
                    </div>
                  </div>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

function CheckIcon(props: HTMLAttributes<SVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const SettingsDialog: FC = () => {
  const gameRef = GameContext.useActorRef();
  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const configure = (config: GameMachineContext['config']) =>
    gameRef.send({ type: 'GAME.CONFIGURE', config });

  // TODO: Do some sanity checks here
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const width = parseInt(e.currentTarget.width.value);
    const height = parseInt(e.currentTarget.height.value);
    const mines = parseInt(e.currentTarget.mines.value);

    configure({ width, height, mines });
    closeModal();
  };

  return (
    <>
      <button onClick={openModal}>Settings</button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Game Settings
                  </Dialog.Title>

                  <Presets />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
