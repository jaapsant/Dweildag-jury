import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Award } from 'lucide-react';
import { stages, bands } from '../data/initialData';
import { useScores } from '../context/ScoreContext';
import { useJury } from '../context/JuryContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { getBandTotalScores, isLoading: scoresLoading, error: scoresError, isPerformanceScored, scores } = useScores();
  const { juryMembers, isLoading: juryLoading, error: juryError } = useJury();
  
  // Combine potential loading states
  const isLoading = scoresLoading || juryLoading;
  // Combine potential errors
  const error = scoresError || juryError;

  // Group jury members by stageId
  const juryByStage = !isLoading && !error ? juryMembers.reduce((acc, juryMember) => {
    const stageId = juryMember.stageId;
    if (!acc[stageId]) {
      acc[stageId] = [];
    }
    acc[stageId].push(juryMember);
    return acc;
  }, {} as Record<string, typeof juryMembers>) : {};

  // Get ALL band scores first for calculating maxes
  const allBandScores = (!isLoading && !error) ? getBandTotalScores() : [];
  const topBands = allBandScores.slice(0, 3); // Then slice for display

  // Calculate max scores across all bands
  let maxMuzScore = 0;
  let maxShowScore = 0;
  if (allBandScores.length > 0) {
      maxMuzScore = Math.max(...allBandScores.map(b => b.totalMuzikaliteit));
      maxShowScore = Math.max(...allBandScores.map(b => b.totalShow));
  }

  const totalBands = bands.length; // Get total number of bands
  const totalExpectedForms = !isLoading && !error ? juryMembers.length : 0; // Calculate expected forms based on fetched jury members

  // Define expected scores per band form (usually 6 categories)
  const expectedScoresPerBandForm = 6;

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
          {isLoading && <p className="text-center text-gray-500 py-10">Gegevens laden...</p>}
          {error && <p className="text-center text-red-600 py-10">Fout bij laden: {error}</p>}

          {!isLoading && !error && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-[#004380]">
                  Juryleden per podium
                </h2>
                <div className="space-y-5">
                  {stages.map(stage => {
                    const membersForStage = juryByStage[String(stage.id)] || [];
                    
                    // --- Sort members within the stage ---
                    const sortedMembers = [...membersForStage].sort((a, b) => {
                        if (a.type === 'muzikaliteit' && b.type === 'show') return -1;
                        if (a.type === 'show' && b.type === 'muzikaliteit') return 1;
                        return a.name.localeCompare(b.name); // Secondary sort by name
                    });
                    // --- End Sort ---

                    return (
                      <div key={stage.id}>
                        <h3 className="text-lg font-semibold mb-3 p-2 bg-blue-50 rounded-t-md text-blue-800">{stage.name}</h3>
                        <div className="space-y-2 border border-t-0 rounded-b-md p-3">
                          {sortedMembers.length > 0 ? sortedMembers.map(member => {
                            // --- Recalculate completedBandCount specifically for 'member' ---
                            let completedBandCount = 0;
                            if (scores && scores.length > 0 && bands.length > 0) { 
                                // Iterate through each band to check completion status *for this member*
                                bands.forEach(band => {
                                    // Filter scores for *this specific member* AND *this specific band*
                                    const memberBandScores = scores.filter(s => 
                                        String(s.juryMemberId) === String(member.id) &&
                                        s.bandId === band.id &&
                                        s.stageId === member.stageId // Also ensure stage matches
                                    );
                                    // If count meets expectation for this band, increment counter
                                    if (memberBandScores.length >= expectedScoresPerBandForm) {
                                        completedBandCount++;
                                    }
                                });
                            }
                            // --- End Calculation ---

                            const isComplete = totalBands > 0 && completedBandCount === totalBands;

                            return (
                              <button
                                key={member.id}
                                role="link"
                                className="w-full p-2 rounded-md bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transition duration-150 cursor-pointer flex justify-between items-center text-left"
                                onClick={() => navigate(`/jury/${member.id}`)}
                              >
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-800">{member.name}</span>
                                  {isComplete ? (
                                    <Check size={16} className="ml-2 text-green-600" />
                                  ) : (
                                    <span className="ml-2 text-xs text-gray-400" title={`${completedBandCount} van ${totalBands} bands beoordeeld`}>
                                      ({completedBandCount}/{totalBands})
                                    </span>
                                  )}
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  member.type === 'muzikaliteit' 
                                    ? 'text-blue-700 bg-blue-100' 
                                    : 'text-green-700 bg-green-100'
                                }`}>
                                  {member.type === 'muzikaliteit' ? 'Muzikaliteit' : 'Show'}
                                </span>
                              </button>
                            );
                          }) : (
                            <p className="text-sm text-gray-400 italic px-2 py-1">Geen juryleden toegewezen</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-[#004380]">
                  Huidige Top Bands
                </h2>
                {topBands.length > 0 ? (
                  <div className="space-y-4">
                    {topBands.map((band, index) => {
                      const bandSpecificScores = scores.filter(s => s.bandId === band.bandId);
                      const uniqueJuryIds = new Set(bandSpecificScores.map(s => s.juryMemberId));
                      const actualFormsCount = uniqueJuryIds.size;
                      const isComplete = totalExpectedForms > 0 && actualFormsCount >= totalExpectedForms;

                      const hasMaxMuz = band.totalMuzikaliteit === maxMuzScore && maxMuzScore > 0;
                      const hasMaxShow = band.totalShow === maxShowScore && maxShowScore > 0;

                      return (
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
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center mb-1">
                                <p className="font-bold">{index + 1}. {band.bandName}</p>
                                <span className="ml-2"> 
                                  {isComplete ? (
                                    <Check size={14} className="text-green-600" title={`Alle ${totalExpectedForms} juryformulieren ingevoerd`} />
                                  ) : (
                                    <span className="text-xs text-gray-500" title={`${actualFormsCount} van ${totalExpectedForms} juryformulieren ingevoerd`}>
                                      ({actualFormsCount}/{totalExpectedForms})
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end ml-2">
                              <div className="text-2xl font-bold">
                                {band.totalScore}
                              </div>
                              <div className="flex items-center mt-0.5 space-x-1.5">
                                {hasMaxMuz && (
                                  <span 
                                    className="flex items-center bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded text-xs font-medium" 
                                    title="Winnaar Muzikaliteit"
                                  >
                                    <Award size={12} className="mr-0.5 flex-shrink-0" />
                                    Muz.
                                  </span>
                                )}
                                {hasMaxShow && (
                                  <span 
                                    className="flex items-center bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded text-xs font-medium" 
                                    title="Winnaar Show"
                                  >
                                    <Award size={12} className="mr-0.5 flex-shrink-0" />
                                    Show
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
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
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;