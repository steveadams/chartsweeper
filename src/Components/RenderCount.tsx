import { useRef } from 'react';

export const RenderCount = () => {
  const renderCounter = useRef(0);
  renderCounter.current = renderCounter.current + 1;
  return <span className="render-badge">{renderCounter.current}</span>;
};
