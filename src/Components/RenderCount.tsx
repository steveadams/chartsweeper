import { useRef } from 'react';

export const RenderCount = ({
  label,
}: { label: string } & React.HTMLAttributes<HTMLDivElement>) => {
  const renderCounter = useRef(0);
  renderCounter.current = renderCounter.current + 1;
  return (
    <span className="render-badge">
      {label}: {renderCounter.current}
    </span>
  );
};
