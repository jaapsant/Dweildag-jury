import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { juryMembers, stages, bands } from '../data/initialData';
import { useScores } from '../context/ScoreContext';

const JuryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPerformanceScored, isLoading } = useScores();

  // Group jury members by stageId
  const juryByStage = juryMembers.reduce((acc, juryMember) => {
    const stageId = juryMember.stageId;
    if (!acc[stageId]) {
      acc[stageId] = [];
    }
    acc[stageId].push(juryMember);
    return acc;
  }, {} as Record<number, typeof juryMembers>);

  const totalBands = bands.length;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#004380] mb-4">Jury Selectie</h1>
      
      <p className="mb-8 text-gray-700">
        Selecteer hieronder je naam om te beginnen met het beoordelen van bands op jouw podium.
      </p>
      
      <div className="space-y-6">
        {stages.map(stage => (
          (juryByStage[stage.id] && juryByStage[stage.id].length > 0) ? (
            <div key={stage.id} className="bg-white rounded-lg shadow-md">
              <h2 className="text-lg font-semibold p-3 bg-blue-50 rounded-t-md text-blue-800">{stage.name}</h2>
              
              <div className="space-y-2 border border-t-0 rounded-b-md p-3">
                {(juryByStage[stage.id] || []).map(jury => {
                  const scoredCount = bands.filter(band => 
                    !isLoading && isPerformanceScored(band.id, jury.stageId, jury.type)
                  ).length;
                  const isComplete = scoredCount === totalBands;

                  return (
                    <button
                      key={jury.id}
                      role="link"
                      className="w-full p-2 rounded-md bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transition duration-150 cursor-pointer flex justify-between items-center text-left"
                      onClick={() => navigate(`/jury/${jury.id}`)}
                    >
                      <div className="flex items-center">
                        <span className="font-medium text-gray-800">{jury.name}</span>
                        {isComplete ? (
                          <Check size={16} className="ml-2 text-green-600" />
                        ) : (
                          <span className="ml-2 text-xs text-gray-400">
                            ({scoredCount}/{totalBands})
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        jury.type === 'muzikaliteit' 
                          ? 'text-blue-700 bg-blue-100' 
                          : 'text-green-700 bg-green-100'
                      }`}>
                        {jury.type === 'muzikaliteit' ? 'Muzikaliteit' : 'Show'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
};

export default JuryPage;