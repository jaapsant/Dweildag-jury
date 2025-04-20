import React from 'react';

interface RadioButtonGroupProps {
  name: string;
  value: number | null;
  onChange: (value: number) => void;
  max?: number;
  scores?: number[];
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({ 
  name, 
  value, 
  onChange,
  max = 7,
  scores 
}) => {
  const scoreOptions = scores 
    ? scores 
    : Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="flex justify-between items-center space-x-1 my-2">
      {scoreOptions.map((rating) => (
        <div 
          key={`${name}-${rating}`} 
          className="flex flex-col items-center"
        >
          <button
            type="button"
            onClick={() => onChange(rating)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base 
              ${value === rating 
                ? 'bg-[#004380] text-white border-2 border-[#004380]'
                : 'bg-white border-2 border-gray-300 text-gray-500 hover:bg-blue-100'} 
              transition-all duration-200 ease-in-out`}
            aria-label={`Score ${rating}`}
          >
            {rating}
          </button>
        </div>
      ))}
    </div>
  );
};

export default RadioButtonGroup;