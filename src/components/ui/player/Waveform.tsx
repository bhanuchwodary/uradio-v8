
import React from 'react';

const Waveform: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-4 h-4 space-x-0.5">
      <span className="w-0.5 h-full bg-current animate-waveform [animation-delay:-0.4s]" />
      <span className="w-0.5 h-full bg-current animate-waveform [animation-delay:-0.2s]" />
      <span className="w-0.5 h-full bg-current animate-waveform" />
    </div>
  );
};

export default Waveform;
