import React, { useState } from 'react';
import { useScores } from '../context/ScoreContext';
import { stages } from '../data/initialData';
import { Award, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const ScoresPage: React.FC = () => {
  const { getBandTotalScores, getBandScoreByStage } = useScores();
  const [expandedBands, setExpandedBands] = useState<Record<number, boolean>>({});
  
  const bandScores = getBandTotalScores();
  
  const toggleBand = (bandId: number) => {
    setExpandedBands(prev => ({
      ...prev,
      [bandId]: !prev[bandId]
    }));
  };
  
  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#004380] flex items-center">
          Festival Ranglijst
        </h1>
        
        <div className="text-sm text-gray-500">
          <p>{bandScores.length} bands | 4 podia</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 bg-[#004380] text-white font-semibold p-3">
          <div className="col-span-1">#</div>
          <div className="col-span-7">Band</div>
          <div className="col-span-3 text-right">Score</div>
          <div className="col-span-1"></div>
        </div>
        
        {bandScores.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {bandScores.map((band, index) => (
              <div key={band.bandId} className="hover:bg-blue-50">
                <div 
                  className="grid grid-cols-12 p-3 cursor-pointer"
                  onClick={() => toggleBand(band.bandId)}
                >
                  <div className="col-span-1 font-semibold text-gray-600">
                    {index + 1}
                  </div>
                  <div className="col-span-7 font-medium">
                    {band.bandName}
                  </div>
                  <div className="col-span-3 text-right font-bold text-[#004380]">
                    {band.totalScore}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {expandedBands[band.bandId] ? (
                      <ChevronUp size={20} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </div>
                </div>
                
                {expandedBands[band.bandId] && (
                  <div className="bg-gray-50 p-3 pb-4 pt-0">
                    <div className="mt-2 border-t border-gray-200 pt-3">
                      <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                        <TrendingUp size={16} className="mr-1" />
                        Scores per podium
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {stages.map(stage => {
                          const stageScore = getBandScoreByStage(band.bandId, stage.id);
                          return (
                            <div 
                              key={stage.id}
                              className="bg-white rounded border border-gray-200 p-3"
                            >
                              <div className="flex justify-between">
                                <h4 className="font-medium">{stage.name}</h4>
                                <span className="font-semibold">
                                  {stageScore ? stageScore.total : 'Niet beoordeeld'}
                                </span>
                              </div>
                              
                              {stageScore && (
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Muzikaliteit:</span>
                                    <span className="font-medium">{stageScore.muzikaliteit}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Show:</span>
                                    <span className="font-medium">{stageScore.show}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nog geen scores beschikbaar</p>
            <p className="text-sm mt-2">Jury leden moeten nog beginnen met het beoordelen van bands</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoresPage;