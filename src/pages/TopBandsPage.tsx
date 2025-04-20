import React from 'react';
import { Award, Info, CheckCircle2, Check } from 'lucide-react'; // Import necessary icons
import { useScores } from '../context/ScoreContext'; // Import useScores hook
import { bands, juryMembers } from '../data/initialData'; // Import necessary data

const TopBandsPage: React.FC = () => {
  // Fetch necessary data and states from context
  const { getBandTotalScores, isLoading, error, scores } = useScores(); 
  
  // Get ALL band scores first for calculating maxes
  const allBandScores = (!isLoading && !error) ? getBandTotalScores() : [];
  // Change slice to get top 10
  const topTenBands = allBandScores.slice(0, 10); 

  // Calculate max scores across all bands (same logic as HomePage)
  let maxMuzScore = 0;
  let maxShowScore = 0;
  if (allBandScores.length > 0) {
      maxMuzScore = Math.max(...allBandScores.map(b => b.totalMuzikaliteit));
      maxShowScore = Math.max(...allBandScores.map(b => b.totalShow));
  }

  // Calculate total expected forms (same logic as HomePage)
  const totalExpectedForms = juryMembers.length; 

  // --- Calculate Overall Completion Status ---
  let isOverallComplete = false;
  let incompleteBandsCount = 0;
  if (!isLoading && !error && bands.length > 0) { // Check if bands array has data
      let allComplete = true;
      for (const band of bands) {
          const bandSpecificScores = scores.filter(s => s.bandId === band.id);
          const uniqueJuryIds = new Set(bandSpecificScores.map(s => s.juryMemberId));
          if (uniqueJuryIds.size < totalExpectedForms) {
              allComplete = false;
              incompleteBandsCount++; // Count how many are incomplete
          }
      }
      isOverallComplete = allComplete;
  }
  // --- End Calculation ---

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
      <h1 className="text-3xl font-bold text-[#004380] mb-4 text-center">
        Top 10 Bands
      </h1>

      {/* --- Overall Status Indicator --- */}
      <div className={`p-3 rounded-lg text-center mb-6 text-sm font-medium max-w-md mx-auto flex items-center justify-center ${
          isOverallComplete 
            ? 'bg-green-100 text-green-800' 
            : 'bg-orange-100 text-orange-800' // Use orange for incomplete
      }`}>
         {isOverallComplete ? (
             <>
                <CheckCircle2 size={18} className="mr-2" /> 
                Alle juryformulieren zijn ingevoerd!
             </>
         ) : (
            <>
                <Info size={18} className="mr-2" />
                Nog niet alle scores zijn ingevoerd ({incompleteBandsCount} band(s) incompleet).
            </>
         )}
      </div>
      {/* --- End Status Indicator --- */}

      {/* Extracted Top Bands Section */}
      <div className="max-w-2xl mx-auto"> {/* Center the content */}
        {topTenBands.length > 0 ? (
          <div className="space-y-4">
            {topTenBands.map((band, index) => {
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

              // --- Conditional Styling for Top 3 vs 4-10 ---
              let cardStyle = 'bg-white border border-gray-200'; // Default for 4-10
              if (index === 0) {
                  cardStyle = 'bg-yellow-100 border border-yellow-300'; // Gold
              } else if (index === 1) {
                  cardStyle = 'bg-gray-100 border border-gray-300'; // Silver
              } else if (index === 2) {
                  cardStyle = 'bg-orange-100 border border-orange-300'; // Bronze
              }
              // --- End Conditional Styling ---

              return (
                // Card styling copied from HomePage
                <div 
                  key={band.bandId}
                  // Apply calculated cardStyle
                  className={`p-4 rounded-lg shadow-md ${cardStyle}`}
                >
                  <div className="flex justify-between items-start">
                    {/* Left side: Rank, Name, Progress */}
                    <div>
                      {/* Re-add flex container and progress indicator */}
                      <div className="flex items-center mb-1">
                         <p className="font-bold text-lg">{index + 1}. {band.bandName}</p>
                         {/* Re-added Progress Indicator */}
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
            <p>Nog geen scores beschikbaar om een top 10 te tonen.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBandsPage; 