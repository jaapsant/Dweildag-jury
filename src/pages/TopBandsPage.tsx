import React from 'react';
import { Check, Award } from 'lucide-react'; // Import necessary icons
import { useScores } from '../context/ScoreContext'; // Import useScores hook
import { bands, juryMembers } from '../data/initialData'; // Import necessary data

const TopBandsPage: React.FC = () => {
  // Fetch necessary data and states from context
  const { getBandTotalScores, isLoading, error, scores } = useScores(); 
  
  // Get ALL band scores first for calculating maxes
  const allBandScores = (!isLoading && !error) ? getBandTotalScores() : [];
  const topBands = allBandScores.slice(0, 3); // Get only the top 3

  // Calculate max scores across all bands (same logic as HomePage)
  let maxMuzScore = 0;
  let maxShowScore = 0;
  if (allBandScores.length > 0) {
      maxMuzScore = Math.max(...allBandScores.map(b => b.totalMuzikaliteit));
      maxShowScore = Math.max(...allBandScores.map(b => b.totalShow));
  }

  // Calculate total expected forms (same logic as HomePage)
  const totalExpectedForms = juryMembers.length; 

  // Handle Loading State
  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Scores laden...</div>;
  }
  
  // Handle Error State
  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">Kon scores niet laden: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-[#004380] mb-6 text-center">
        Top 3 Bands
      </h1>

      {/* Extracted Top Bands Section */}
      <div className="max-w-2xl mx-auto"> {/* Center the content */}
        {topBands.length > 0 ? (
          <div className="space-y-4">
            {topBands.map((band, index) => {
              // --- Calculate progress for this band ---
              const bandSpecificScores = scores.filter(s => s.bandId === band.bandId);
              const uniqueJuryIds = new Set(bandSpecificScores.map(s => s.juryMemberId));
              const actualFormsCount = uniqueJuryIds.size;
              const isComplete = actualFormsCount >= totalExpectedForms;
              // --- End calculation ---

              // --- Check for category wins ---
              const hasMaxMuz = band.totalMuzikaliteit === maxMuzScore && maxMuzScore > 0;
              const hasMaxShow = band.totalShow === maxShowScore && maxShowScore > 0;
              // --- End check ---

              return (
                // Card styling copied from HomePage
                <div 
                  key={band.bandId}
                  className={`p-4 rounded-lg shadow-md ${ // Added shadow-md
                    index === 0 
                      ? 'bg-yellow-100 border border-yellow-300'
                      : index === 1
                        ? 'bg-gray-100 border border-gray-300'
                        : 'bg-orange-100 border border-orange-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    {/* Left side: Rank, Name, Progress */}
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
                      {/* Removed the "Totaal score over alle podia" text */}
                    </div>
                    {/* Right side: Total Score + Award Badges */}
                    <div className="flex flex-col items-end ml-2">
                        <div className="text-2xl font-bold">
                            {band.totalScore}
                        </div>
                        {/* Award Badges container */}
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
          // Message if no scores are available yet
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md p-6">
            <p>Nog geen scores beschikbaar om een top 3 te tonen.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBandsPage; 