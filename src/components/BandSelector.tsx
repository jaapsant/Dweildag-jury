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
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedBand = selectedBandId 
    ? bands.find(band => band.id === selectedBandId) 
    : null;

  const filteredBands = bands.filter(band => 
    band.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="p-2">
            <input
              type="text"
              placeholder="Zoek een band..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filteredBands.map((band) => (
              <li
                key={band.id}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                  selectedBandId === band.id ? 'bg-blue-50 font-semibold' : ''
                }`}
                onClick={() => {
                  onSelectBand(band.id);
                  setIsOpen(false);
                  setSearchTerm('');
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