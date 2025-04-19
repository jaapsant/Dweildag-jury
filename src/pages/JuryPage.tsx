import React from 'react';
import { useNavigate } from 'react-router-dom';
import { juryMembers } from '../data/initialData';
import { Music, Eye } from 'lucide-react';

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
      
      {Object.entries(juryByStage).map(([stageId, juryList]) => (
        <div key={stageId} className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-[#004380]">
            Podium {stageId}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {juryList.map(jury => (
              <div
                key={jury.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="bg-blue-100 px-4 py-2 border-b">
                  <h3 className="font-medium">
                    {jury.type === 'muzikaliteit' ? (
                      <span className="flex items-center">
                        <Music size={18} className="mr-1 text-[#004380]" />
                        Muzikaliteit
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Eye size={18} className="mr-1 text-orange-500" />
                        Show
                      </span>
                    )}
                  </h3>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{jury.name}</h3>
                  <button
                    onClick={() => navigate(`/jury/${jury.id}`)}
                    className="mt-2 w-full bg-[#004380] hover:bg-[#003366] text-white py-2 px-4 rounded-md transition-colors duration-300"
                  >
                    Start Beoordeling
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JuryPage;