import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Award, Users } from 'lucide-react';
import { juryMembers } from '../data/initialData';
import { useScores } from '../context/ScoreContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { getBandTotalScores } = useScores();
  
  // Get the top 3 bands
  const topBands = getBandTotalScores().slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="bg-gradient-to-b from-[#004380] to-[#003366] text-white py-12 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Bemmelse Dweildag</h1>
            <p className="text-lg sm:text-xl mb-6">Welkom bij de jury-app voor de bandcompetitie</p>
            <div className="inline-flex space-x-2">
              <button 
                onClick={() => navigate('/jury')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center"
              >
                Jury Beoordeling
              </button>
              <button 
                onClick={() => navigate('/scores')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center"
              >
                Bekijk Scores
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-[#004380] flex items-center">
                <Users className="mr-2" size={24} />
                Jury Leden
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {juryMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="p-4 border rounded-lg hover:bg-blue-50 transition duration-200 cursor-pointer"
                    onClick={() => navigate(`/jury/${member.id}`)}
                  >
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-gray-600">
                      {member.type === 'muzikaliteit' ? 'Muzikaliteit' : 'Show'} - Podium {member.stageId}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-[#004380] flex items-center">
                <Award className="mr-2" size={24} />
                Huidige Top Bands
              </h2>
              {topBands.length > 0 ? (
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nog geen scores beschikbaar</p>
                  <p className="text-sm mt-2">Jury leden moeten nog beginnen met het beoordelen van bands</p>
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