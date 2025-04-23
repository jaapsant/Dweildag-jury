import React, { useState, useMemo } from 'react';
import { useScores } from '../context/ScoreContext';
import { useJury } from '../context/JuryContext';
import { useBands } from '../context/BandContext';
import { stages, categories } from '../data/initialData';
import { TrendingUp, ChevronDown, ChevronUp, Award, Check, ArrowUp, ArrowDown, Download } from 'lucide-react';

// Define possible sort columns
type SortColumn = 'totalScore' | 'totalMuzikaliteit' | 'totalShow' | 'rank';
type SortDirection = 'asc' | 'desc';

const ScoresPage: React.FC = () => {
  const { getBandTotalScores, getBandScoreByStage, scores, isLoading: scoresLoading, error: scoresError } = useScores();
  const { juryMembers, isLoading: juryLoading, error: juryError } = useJury();
  const { bands, isLoading: bandsLoading, error: bandsError } = useBands();
  
  // Combine loading/error
  const isLoading = scoresLoading || juryLoading || bandsLoading;
  const error = scoresError || juryError || bandsError;

  const [expandedBands, setExpandedBands] = useState<Record<number, boolean>>({});
  
  // --- Sorting State ---
  const [sortColumn, setSortColumn] = useState<SortColumn>('totalScore'); // Default sort
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc'); // Default direction
  // --- End Sorting State ---

  // Get initial scores (already sorted by totalScore desc by getBandTotalScores)
  const initialBandScores = !isLoading && !error ? getBandTotalScores() : []; 
  
  // Calculate expected forms based on fetched jury members
  const totalExpectedForms = !isLoading && !error ? juryMembers.length : 0; 

  // Calculate max scores (remains the same)
  let maxTotalScore = 0;
  let maxMuzScore = 0;
  let maxShowScore = 0;
  if (initialBandScores.length > 0) {
      maxTotalScore = Math.max(...initialBandScores.map(b => b.totalScore));
      maxMuzScore = Math.max(...initialBandScores.map(b => b.totalMuzikaliteit));
      maxShowScore = Math.max(...initialBandScores.map(b => b.totalShow));
  }

  // --- Sorting Logic ---
  const sortedBandScores = useMemo(() => {
    const sorted = [...initialBandScores]; // Create a mutable copy
    
    sorted.sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      // Assign values based on sortColumn
      switch (sortColumn) {
        case 'totalMuzikaliteit':
          aValue = a.totalMuzikaliteit;
          bValue = b.totalMuzikaliteit;
          break;
        case 'totalShow':
          aValue = a.totalShow;
          bValue = b.totalShow;
          break;
        case 'totalScore': // Default and explicit total score sort
        default:
          aValue = a.totalScore;
          bValue = b.totalScore;
          break;
         // Note: 'rank' sorting is implicitly handled by the default totalScore sort
         // or could be added if needed based on index after default sort
      }

      // Comparison logic
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      // If scores are equal, maintain original relative order (based on totalScore initially)
      if (sortColumn !== 'totalScore') {
           return b.totalScore - a.totalScore; // Secondary sort by totalScore desc
      }
      return 0;
    });
    return sorted;
  }, [initialBandScores, sortColumn, sortDirection]); // Recalculate when these change

  // Handler for clicking sortable headers
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column is clicked
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to descending (or ascending if preferred)
      setSortColumn(column);
      setSortDirection('desc'); 
    }
  };
  // --- End Sorting Logic ---

  const toggleBand = (bandId: number) => {
    setExpandedBands(prev => ({
      ...prev,
      [bandId]: !prev[bandId]
    }));
  };
  
  // --- SQL Generation Logic ---
  const generateSqlUpdates = (): string => {
      let sqlStatements = '';
      const currentYear = new Date().getFullYear(); // Get the current year

      sortedBandScores.forEach((band, index) => {
          // Determine rank - only meaningful if sorted by totalScore desc
          const rank = (sortColumn === 'totalScore' && sortDirection === 'desc') ? index + 1 : 'NULL'; 
          
          // Determine winner flags based on max scores
          const isWinner = band.totalScore === maxTotalScore && maxTotalScore > 0 ? 1 : 0;
          const isWinnerMuz = band.totalMuzikaliteit === maxMuzScore && maxMuzScore > 0 ? 1 : 0;
          const isWinnerShow = band.totalShow === maxShowScore && maxShowScore > 0 ? 1 : 0;

          // Construct the SQL UPDATE statement
          // Using the current year dynamically
          const updateQuery = `UPDATE tblDeelnemers SET nrRangschikking = ${rank}, nrAantalPunten = ${band.totalScore}, nrPuntenMuzikaal = ${band.totalMuzikaliteit}, nrPuntenShow = ${band.totalShow}, bWinnaar= ${isWinner}, bWinnaarMuzikaal = ${isWinnerMuz}, bWinnaarShow = ${isWinnerShow} WHERE jaar="${currentYear}" AND nrWedstrijdnr = ${band.bandId};`;
          
          sqlStatements += updateQuery + '\r\n'; // Add statement and newline
      });

      return sqlStatements;
  };

  const handleDownloadSql = () => {
      const sqlData = generateSqlUpdates();
      // Use text/plain for the blob type, change filename extension
      const blob = new Blob([sqlData], { type: 'text/plain;charset=utf-8;' }); 
      
      const link = document.createElement('a');
      if (link.download !== undefined) { 
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          // Change download filename
          link.setAttribute('download', 'dweildag-updates.txt'); 
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url); 
      } else {
          alert("SQL download wordt niet ondersteund door uw browser.");
      }
  };
  // --- End SQL Generation Logic ---

  if (isLoading) {
      return <div className="container mx-auto px-4 py-8 text-center">Laden...</div>;
  }
  if (error) {
      return <div className="container mx-auto px-4 py-8 text-center text-red-600">Fout bij laden: {error}</div>;
  }

  // Helper component for sortable header cells
  const SortableHeader = ({ title, column }: { title: string; column: SortColumn }) => (
    <button 
        onClick={() => handleSort(column)} 
        className="flex items-center justify-end w-full hover:text-blue-200 transition-colors duration-150"
    >
        <span>{title}</span>
        {sortColumn === column && (
            sortDirection === 'asc' 
                ? <ArrowUp size={14} className="ml-1" /> 
                : <ArrowDown size={14} className="ml-1" />
        )}
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#004380]">
          Festival Ranglijst
        </h1>
        
        <div className='flex items-center space-x-4'>
            <div className="text-sm text-gray-500">
              <p>{bands.length} bands | {stages.length} podia</p>
            </div>
             <button 
                onClick={handleDownloadSql}
                disabled={sortedBandScores.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download update queries als SQL"
             >
                 <Download size={16} className="mr-1.5" />
                 Download SQL
             </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-12 bg-[#004380] text-white font-semibold p-3 text-sm">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Band</div>
          <div className="col-span-2 text-right">
            <SortableHeader title="Totaal" column="totalScore" />
          </div>
          <div className="col-span-2 text-right">
             <SortableHeader title="Muz." column="totalMuzikaliteit" />
          </div>
          <div className="col-span-2 text-right">
             <SortableHeader title="Show" column="totalShow" />
          </div>
          <div className="col-span-1"></div>
        </div>
        
        {sortedBandScores.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {sortedBandScores.map((band, index) => {
              const hasMaxMuz = band.totalMuzikaliteit === maxMuzScore && maxMuzScore > 0;
              const hasMaxShow = band.totalShow === maxShowScore && maxShowScore > 0;

              const bandSpecificScores = scores.filter(s => s.bandId === band.bandId);
              const uniqueJuryIds = new Set(bandSpecificScores.map(s => s.juryMemberId));
              const actualFormsCount = uniqueJuryIds.size;
              const isComplete = totalExpectedForms > 0 && actualFormsCount >= totalExpectedForms;

              // Determine rank based on sort order - if sorted by totalScore desc, use index+1
              // Otherwise, rank might not be meaningful or needs separate calculation
              const displayRank = sortColumn === 'totalScore' && sortDirection === 'desc' ? index + 1 : '-';

              return (
                <div key={band.bandId} className="hover:bg-blue-50 text-sm">
                  <div 
                    className="grid grid-cols-12 p-3 cursor-pointer items-center"
                    onClick={() => toggleBand(band.bandId)}
                  >
                    <div className="col-span-1 font-semibold text-gray-600">
                      {displayRank}
                    </div>
                    <div className="col-span-4 font-medium flex items-center">
                      <span>{band.bandName}</span>
                      <span className="ml-2">
                        {isComplete ? (
                           <Check size={14} className="text-green-600" title={`Alle ${totalExpectedForms} juryformulieren ingevoerd`} />
                        ) : (
                           <span className="text-xs text-gray-400" title={`${actualFormsCount} van ${totalExpectedForms} juryformulieren ingevoerd`}>
                              ({actualFormsCount}/{totalExpectedForms})
                           </span>
                        )}
                      </span>
                    </div>
                    <div className="col-span-2 text-right font-bold text-[#004380] text-base">
                      {band.totalScore}
                    </div>
                    <div className="col-span-2 text-right font-medium text-gray-700">
                      <span className="flex items-center justify-end">
                        {band.totalMuzikaliteit}
                        {hasMaxMuz && (
                          <Award size={14} className="ml-1 text-yellow-500" title="Hoogste Muzikaliteit Score" />
                        )}
                      </span>
                    </div>
                    <div className="col-span-2 text-right font-medium text-gray-700">
                      <span className="flex items-center justify-end">
                        {band.totalShow}
                        {hasMaxShow && (
                          <Award size={14} className="ml-1 text-yellow-500" title="Hoogste Show Score" />
                        )}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {expandedBands[band.bandId] ? (
                        <ChevronUp size={18} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-500" />
                      )}
                    </div>
                  </div>
                  
                  {expandedBands[band.bandId] && (
                    <div className="bg-gray-50 p-3 pb-4 pt-0">
                      <div className="mt-2 border-t border-gray-200 pt-3">
                        <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
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
              );
            })}
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