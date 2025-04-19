import React from 'react';
import { useNavigate } from 'react-router-dom';
import { juryMembers } from '../data/initialData';

const JuryPage: React.FC = () => {
  const navigate = useNavigate();

  // Group jury members by stage
  const juryByStage = juryMembers.reduce((acc, juryMember) => {
    if (!acc[juryMember.stageId]) {
      acc[juryMember.stageId] = [];
    }
    acc[juryMember.stageId].push(juryMember);
    return acc;
  }, {} as Record<number, typeof juryMembers>);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#004380] mb-6">Jury Selectie</h1>
      
      <p className="mb-6 text-gray-700">
        Selecteer hieronder je naam om te beginnen met het beoordelen van bands op jouw podium.
      </p>
      
      <div className="max-w-lg mx-auto">
        {Object.entries(juryByStage).map(([stageId, juryList]) => (
          <div key={stageId} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[#004380]">
              Podium {stageId}
            </h2>
            
            <div className="space-y-3"> 
              {juryList.map(jury => (
                <div key={jury.id} className="flex items-center space-x-4"> 
                  <span className="w-24 text-sm font-medium text-gray-600 shrink-0">
                    {jury.type === 'muzikaliteit' ? 'Muzikaliteit' : 'Show'}
                  </span>
                  <button
                    onClick={() => navigate(`/jury/${jury.id}`)}
                    className="flex-grow bg-[#004380] hover:bg-[#003366] text-white py-2 px-4 rounded-md transition-colors duration-300 text-left"
                  >
                    {jury.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JuryPage;