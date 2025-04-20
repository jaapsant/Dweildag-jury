import React from 'react';
import { useNavigate } from 'react-router-dom';
import { juryMembers, stages } from '../data/initialData';
import { useScores } from '../context/ScoreContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { getBandTotalScores, isLoading, error } = useScores();
  
  // Group jury members by stageId
  const juryByStage = juryMembers.reduce((acc, juryMember) => {
    const stageId = juryMember.stageId;
    if (!acc[stageId]) {
      acc[stageId] = [];
    }
    acc[stageId].push(juryMember);
    return acc;
  }, {} as Record<number, typeof juryMembers>);

  // Get the top 3 bands
  const topBands = (!isLoading && !error) ? getBandTotalScores().slice(0, 3) : [];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="bg-gradient-to-b from-[#004380] to-[#003366] text-white py-12 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Bemmelse Dweildag</h1>
            <p className="text-lg sm:text-xl mb-6">Welkom bij de jury-app voor de Bemmelse Dweildag 2025</p>
            <div className="inline-flex space-x-2">
              <button 
                onClick={() => navigate('/jury')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Jury Beoordeling
              </button>
              <button 
                onClick={() => navigate('/scores')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Bekijk Scores
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-[#004380]">
                Juryleden per podium
              </h2>
              <div className="space-y-5">
                {stages.map(stage => (
                  <div key={stage.id}>
                    <h3 className="text-lg font-semibold mb-3 p-2 bg-blue-50 rounded-t-md text-blue-800">{stage.name}</h3>
                    <div className="space-y-2 border border-t-0 rounded-b-md p-3">
                      {(juryByStage[stage.id] || []).map(member => (
                        <button
                          key={member.id}
                          role="link"
                          className="w-full p-2 rounded-md bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transition duration-150 cursor-pointer flex justify-between items-center text-left"
                          onClick={() => navigate(`/jury/${member.id}`)}
                        >
                          <span className="font-medium text-gray-800">{member.name}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            member.type === 'muzikaliteit' 
                              ? 'text-blue-700 bg-blue-100' 
                              : 'text-green-700 bg-green-100'
                          }`}>
                            {member.type === 'muzikaliteit' ? 'Muzikaliteit' : 'Show'}
                          </span>
                        </button>
                      ))}
                      {(juryByStage[stage.id] || []).length === 0 && (
                          <p className="text-sm text-gray-400 italic px-2 py-1">Geen juryleden toegewezen</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-[#004380]">
                Huidige Top Bands
              </h2>
              {isLoading && <p className="text-center text-gray-500">Scores laden...</p>}
              {error && <p className="text-center text-red-600">Kon scores niet laden: {error}</p>}
              {!isLoading && !error && topBands.length > 0 ? (
                <div className="space-y-4">
                  {topBands.map((band, index) => (
                    <div 
                      key={band.bandId}
                      className={`p-4 rounded-lg ${
                        index === 0 
                          ? 'bg-yellow-100 border border-yellow-300'
                          : index === 1
                            ? 'bg-gray-100 border border-gray-300'
                            : 'bg-orange-100 border border-orange-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">{index + 1}. {band.bandName}</p>
                          <p className="text-sm text-gray-600">Totaal score over alle podia</p>
                        </div>
                        <div className="text-2xl font-bold">
                          {band.totalScore}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {!isLoading && !error && topBands.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nog geen scores beschikbaar</p>
                  <p className="text-sm mt-2">Juryleden moeten nog beginnen met het beoordelen van bands</p>
                </div>
              )}
              <div className="mt-4 text-center">
                <button 
                  onClick={() => navigate('/scores')}
                  className="text-[#004380] hover:text-[#003366] font-medium"
                >
                  Bekijk alle scores →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;