import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { stages } from '../data/initialData';
import { useScores } from '../context/ScoreContext';
import { useJury } from '../context/JuryContext';
import { useBands } from '../context/BandContext';

const JuryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading: scoresLoading, scores, isPerformanceScored } = useScores();
  const { juryMembers, isLoading: juryLoading, error: juryError } = useJury();
  const { bands, isLoading: bandsLoading, error: bandsError } = useBands();

  const isLoading = scoresLoading || juryLoading || bandsLoading;
  const error = juryError || bandsError;

  const juryByStage = !isLoading && !error ? juryMembers.reduce((acc, juryMember) => {
    const stageId = juryMember.stageId;
    if (!acc[stageId]) {
      acc[stageId] = [];
    }
    acc[stageId].push(juryMember);
    return acc;
  }, {} as Record<string, typeof juryMembers>) : {};

  const totalBands = !isLoading && !error ? bands.length : 0;
  const expectedScoresPerBandForm = 6;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#004380] mb-4">Jury Selectie</h1>
      
      <p className="mb-8 text-gray-700">
        Selecteer hieronder je naam om te beginnen met het beoordelen van bands op jouw podium.
      </p>
      
      {isLoading && <p className="text-center text-gray-500 py-10">Gegevens laden...</p>}
      {error && <p className="text-center text-red-600 py-10">Fout bij laden: {error}</p>}

      {!isLoading && !error && (
        <div className="space-y-6">
          {stages.map(stage => {
            const membersForStage = juryByStage[String(stage.id)] || [];
            
            const sortedMembers = [...membersForStage].sort((a, b) => {
              if (a.type === 'muzikaliteit' && b.type === 'show') return -1;
              if (a.type === 'show' && b.type === 'muzikaliteit') return 1;
              return a.name.localeCompare(b.name);
            });

            return sortedMembers.length > 0 ? (
              <div key={stage.id} className="bg-white rounded-lg shadow-md">
                <h2 className="text-lg font-semibold p-3 bg-blue-50 rounded-t-md text-blue-800">{stage.name}</h2>
                
                <div className="space-y-2 border border-t-0 rounded-b-md p-3">
                  {sortedMembers.map(jury => {
                    let completedBandCount = 0;
                    if (scores && scores.length > 0 && bands.length > 0) {
                      bands.forEach(band => {
                        const memberBandScores = scores.filter(s => 
                          String(s.juryMemberId) === String(jury.id) &&
                          s.bandId === band.id &&
                          s.stageId === jury.stageId
                        );
                        if (memberBandScores.length >= expectedScoresPerBandForm) {
                          completedBandCount++;
                        }
                      });
                    }

                    const isComplete = totalBands > 0 && completedBandCount === totalBands;

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
                            <span className="ml-2 text-xs text-gray-400" title={`${completedBandCount} van ${totalBands} bands beoordeeld`}>({completedBandCount}/{totalBands})</span>
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
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default JuryPage;