import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, AlertTriangle, Eye, X, Pencil } from 'lucide-react';
import { bands } from '../data/initialData';
import { categories, stages } from '../data/initialData';
import { Score, PerformanceScore } from '../types';
import { useScores } from '../context/ScoreContext';
import { useJury } from '../context/JuryContext';
import BandSelector from '../components/BandSelector';
import RadioButtonGroup from '../components/RadioButtonGroup';

const JuryScoring: React.FC = () => {
  const { juryId } = useParams<{ juryId: string }>();
  const navigate = useNavigate();
  const { addMultipleScores, isLoading: scoresLoading, error: scoresError, getPerformanceScores, scores } = useScores();
  const { juryMembers, isLoading: juryLoading, error: juryError } = useJury();
  
  const isLoading = scoresLoading || juryLoading;
  const error = scoresError || juryError;

  const juryMember = !isLoading && !error ? juryMembers.find(j => j.id === juryId) : undefined;
  const stage = !isLoading && juryMember ? stages.find(s => s.id === juryMember.stageId) : null;
  
  const [selectedBandId, setSelectedBandId] = useState<number | null>(null);
  const [categoryScores, setCategoryScores] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scoredBands, setScoredBands] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
  const [viewingScores, setViewingScores] = useState<PerformanceScore | null>(null);

  useEffect(() => {
    if (!isReadOnly) {
        setViewingScores(null);
        if (selectedBandId === null) {
             setCategoryScores({});
        }
    }
    setSubmitted(false);
  }, [selectedBandId, isReadOnly]);

  useEffect(() => {
    if (isReadOnly && selectedBandId && juryMember && !isLoading && !error) {
        const scoresData = getPerformanceScores(selectedBandId, juryMember.stageId);
        setViewingScores(scoresData);
        setCategoryScores({});
    }
  }, [isReadOnly, selectedBandId, juryMember, getPerformanceScores, isLoading, error]);

  useEffect(() => {
    if (!juryMember || isLoading || error || !scores) {
        setScoredBands([]);
        return;
    }
    
    const expectedScoresPerBandForm = 6;
    const scored: number[] = [];
    
    bands.forEach(band => {
      const memberBandScores = scores.filter(s => 
          s.bandId === band.id &&
          String(s.juryMemberId) === String(juryMember.id) &&
          s.stageId === juryMember.stageId
      );
      
      if (memberBandScores.length >= expectedScoresPerBandForm) {
        scored.push(band.id);
      }
    });
    
    setScoredBands(scored);
  }, [juryMember, scores, isLoading, error, bands]);

  const handleSelectBandForScoring = (bandId: number | null) => {
    setIsReadOnly(false);
    setViewingScores(null);
    setSelectedBandId(bandId);
    setCategoryScores({});
  };

  const handleSelectBandForViewing = (bandId: number) => {
    if (!juryMember) return;
    setSelectedBandId(bandId);
    setIsReadOnly(true);
    setSaveError(null);
  };

  const closeReadOnlyView = () => {
      setIsReadOnly(false);
      setSelectedBandId(null);
      setViewingScores(null);
      setCategoryScores({});
  };

  const handleEditScores = () => {
    if (!isReadOnly || !viewingScores || !juryMember) return;

    const scoresToEdit: Record<number, number> = {};
    const relevantScores = viewingScores.scores?.[juryMember.type] ?? {};
    for (const categoryId in relevantScores) {
        scoresToEdit[parseInt(categoryId)] = relevantScores[categoryId];
    }
    setCategoryScores(scoresToEdit);

    setIsReadOnly(false); 
    setViewingScores(null);
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Gegevens laden...</div>;
  }
  
  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">Fout bij laden: {error}</div>;
  }

  if (!juryMember) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle size={48} className="mx-auto text-orange-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Jurylid niet gevonden</h2>
        <p className="mb-6">Controleer het ID of ga terug naar de selectie.</p>
        <button 
          onClick={() => navigate('/jury')}
          className="bg-[#004380] hover:bg-[#003366] text-white font-bold py-2 px-6 rounded"
        >
          Terug naar Jury Selectie
        </button>
      </div>
    );
  }

  if (!stage) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">Fout: Podium niet gevonden voor dit jurylid.</div>;
  }

  const filteredCategories = categories.filter(c => c.type === juryMember.type);
  
  const handleScoreChange = (categoryId: number, value: number) => {
    if (!isReadOnly) {
        setCategoryScores(prev => ({
          ...prev,
          [categoryId]: value
        }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedBandId || !juryMember || isSaving || isReadOnly) return;
    
    setIsSaving(true);
    setSaveError(null);
    setSubmitted(false);
    
    const scoresToSubmit: Score[] = Object.entries(categoryScores).map(([categoryId, value]) => ({
      bandId: selectedBandId,
      stageId: juryMember.stageId,
      juryMemberId: juryMember.id,
      categoryId: parseInt(categoryId),
      value,
      timestamp: Date.now()
    }));
    
    try {
      await addMultipleScores(scoresToSubmit);
      
      setScoredBands(prev => [...prev.filter(id => id !== selectedBandId), selectedBandId]);
      
      setSubmitted(true);
      
      setTimeout(() => {
        setSelectedBandId(null);
        setCategoryScores({});
        setSubmitted(false);
      }, 2000);

    } catch (error) {
      console.error("Failed to submit scores:", error);
      setSaveError("Scores opslaan mislukt. Probeer het opnieuw.");
    } finally {
      setIsSaving(false);
    }
  };

  const isFormComplete = 
    !isReadOnly &&
    selectedBandId && 
    filteredCategories.length === Object.keys(categoryScores).length;

  const availableBands = bands.filter(band => !scoredBands.includes(band.id));

  const isSubmitDisabled = !isFormComplete || isSaving || submitted || isReadOnly;

  let totalScoreToShow: number | null = null;
  if (isReadOnly && viewingScores) {
      totalScoreToShow = juryMember.type === 'muzikaliteit' 
          ? viewingScores.totalMuzikaliteit 
          : viewingScores.totalShow;
  } else if (!isReadOnly) {
      totalScoreToShow = Object.values(categoryScores).reduce((sum, score) => sum + (score || 0), 0);
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-[#004380] text-white p-4 rounded-t-lg flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{juryMember.name}</h1>
            <div className="flex items-center text-sm opacity-90">
              <p>{juryMember.type === 'muzikaliteit' ? 'Muzikaliteit' : 'Show'} Jurering</p>
              <span className="mx-2">|</span>
              <p>Podium: {stage.name}</p>
            </div>
          </div>
          {isReadOnly && selectedBandId && (
              <button 
                onClick={closeReadOnlyView}
                title="Sluit Beoordeling"
                className="text-white hover:bg-white/20 rounded-full p-1.5"
              >
                  <X size={20} />
              </button>
          )}
        </div>
        
        <div className="p-4">
          {!isReadOnly && (
              <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                  {availableBands.length > 0 ? 'Selecteer Band om te Beoordelen' : 'Alle Bands Beoordeeld'} 
              </label>
              {availableBands.length > 0 ? (
                  <BandSelector 
                  bands={availableBands}
                  selectedBandId={selectedBandId} 
                  onSelectBand={handleSelectBandForScoring}
                  />
              ) : (
                  <p className="text-center text-green-600 font-medium py-2">
                  Je hebt alle bands voor jouw categorie beoordeeld! 🎉
                  </p>
              )}
              </div>
          )}

          {scoredBands.length > 0 && (
            <div className="mb-6 border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">
                Beoordeelde bands ({scoredBands.length} van de {bands.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {scoredBands.map(bandId => {
                  const band = bands.find(b => b.id === bandId);
                  const isViewingThisBand = isReadOnly && selectedBandId === bandId;
                  return band ? (
                    <button 
                      key={bandId}
                      onClick={() => handleSelectBandForViewing(bandId)}
                      title={`Bekijk score ${band.name}`}
                      className={`inline-flex items-center px-2.5 py-1 text-xs rounded border transition-colors duration-150 ${
                        isViewingThisBand 
                          ? 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300'
                          : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:border-green-300'
                      }`}
                    >
                      {isViewingThisBand ? <Eye size={12} className="mr-1.5" /> : <Check size={12} className="mr-1.5" />}
                      {band.name}
                    </button>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {selectedBandId && (
            <div className="mb-6 border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                    {isReadOnly ? 'Bekeken Beoordeling' : 'Beoordeling'} voor {bands.find(b => b.id === selectedBandId)?.name}
                </h2>
                <div className="flex items-center gap-3">
                  {isReadOnly && totalScoreToShow !== null && (
                      <div className="text-right">
                          <span className="text-sm text-gray-600 font-medium">Totaal ({juryMember?.type === 'muzikaliteit' ? 'Muz.' : 'Show'}):</span>
                          <span className="ml-1.5 text-xl font-bold text-[#004380]">
                              {totalScoreToShow}
                          </span>
                      </div>
                  )}
                  {isReadOnly && (
                      <button
                          onClick={handleEditScores}
                          title="Bewerk deze score"
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md transition-colors"
                      >
                          <Pencil size={14} className="mr-1.5" />
                          Bewerk
                      </button>
                  )}
                </div>
              </div>
              
              {filteredCategories.map((category, index) => {
                const scoreValue = isReadOnly 
                    ? viewingScores?.scores?.[juryMember.type]?.[category.id] ?? null 
                    : categoryScores[category.id] || null;
                
                const scoreOptions = index === 0 
                    ? [2, 4, 6, 8, 10, 12, 14]
                    : undefined;

                return (
                  <div key={category.id} className={`mb-4 p-4 rounded-lg ${isReadOnly ? 'bg-gray-100' : 'bg-gray-50'}`}>
                    <h3 className="font-medium mb-2">{category.name}</h3>
                    
                    {isReadOnly && (
                        <div className="flex items-center justify-center h-10">
                           {scoreValue !== null ? (
                               <span className="text-2xl font-bold text-[#004380]">{scoreValue}</span>
                           ) : (
                                <span className="text-sm text-gray-500 italic">Geen score</span>
                           )}
                        </div>
                    )}

                    {!isReadOnly && (
                        <>
                            <RadioButtonGroup
                                name={`category-${category.id}`}
                                value={scoreValue}
                                onChange={(value) => handleScoreChange(category.id, value)}
                                scores={scoreOptions}
                            />
                        </>
                    )}
                  </div>
                );
               })}
              
              {!isReadOnly && (
                  <div className="mt-8">
                      <div className="text-right mb-4 pr-2">
                          <span className="text-gray-600 font-medium">Totaal:</span>
                          <span className="ml-2 text-2xl font-bold text-[#004380]">
                              {totalScoreToShow ?? 0} 
                          </span>
                      </div>

                      {saveError && <p className="text-red-600 text-center mb-4">{saveError}</p>}
                      <button
                          onClick={handleSubmit}
                          disabled={isSubmitDisabled}
                          className={`w-full py-3 px-6 rounded-md text-white font-semibold transition-colors duration-300 ${
                          isSubmitDisabled 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-[#004380] hover:bg-[#003366]'
                          } ${isSaving ? 'opacity-75' : ''}`}
                      >
                          {isSaving ? 'Bezig met opslaan...' : submitted ? 'Opgeslagen!' : 'Scores Indienen'}
                      </button>
                      
                      {!isFormComplete && selectedBandId && (
                          <p className="text-sm text-orange-600 mt-2 text-center">
                          Vul alle categorieën in om de scores op te slaan.
                          </p>
                      )}
                  </div>
              )}
            </div>
          )}
          
          {!selectedBandId && availableBands.length > 0 && !isReadOnly && (
            <div className="text-center py-8 text-gray-500 border-t mt-6">
              <p>Selecteer een band uit de lijst hierboven om te beoordelen, of bekijk een reeds beoordeelde band.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JuryScoring;