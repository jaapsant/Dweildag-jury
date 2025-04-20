import React, { useState } from 'react';
import { Band } from '../types';

interface BandSelectorProps {
  bands: Band[];
  selectedBandId: number | null;
  onSelectBand: (bandId: number) => void;
}

const BandSelector: React.FC<BandSelectorProps> = ({ 
  bands, 
  selectedBandId, 
  onSelectBand 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedBand = selectedBandId 
    ? bands.find(band => band.id === selectedBandId) 
    : null;

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#004380] focus:border-[#004380]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedBand ? selectedBand.name : 'Selecteer een band'}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          <ul className="max-h-60 overflow-y-auto py-1">
            {bands.map((band) => (
              <li
                key={band.id}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                  selectedBandId === band.id ? 'bg-blue-50 font-semibold' : ''
                }`}
                onClick={() => {
                  onSelectBand(band.id);
                  setIsOpen(false);
                }}
              >
                {band.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BandSelector;