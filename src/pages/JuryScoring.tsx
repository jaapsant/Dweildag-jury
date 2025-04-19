import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, AlertTriangle } from 'lucide-react';
import { bands } from '../data/initialData';
import { juryMembers, categories, stages } from '../data/initialData';
import { Score } from '../types';
import { useScores } from '../context/ScoreContext';
import BandSelector from '../components/BandSelector';
import RadioButtonGroup from '../components/RadioButtonGroup';

const JuryScoring: React.FC = () => {
  const { juryId } = useParams<{ juryId: string }>();
  const navigate = useNavigate();
  const { addMultipleScores, isPerformanceScored, isLoading: isContextLoading, error: contextError } = useScores();
  
  const juryMember = juryMembers.find(j => j.id === Number(juryId));
  const stage = juryMember ? stages.find(s => s.id === juryMember.stageId) : null;
  
  const [selectedBandId, setSelectedBandId] = useState<number | null>(null);
  const [categoryScores, setCategoryScores] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scoredBands, setScoredBands] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    // Reset category scores when band changes
    setCategoryScores({});
    setSubmitted(false);
  }, [selectedBandId]);

  useEffect(() => {
    // Check which bands have already been scored by this jury member
    if (!juryMember) return;
    
    const scored: number[] = [];
    
    bands.forEach(band => {
      if (isPerformanceScored(band.id, juryMember.stageId, juryMember.type)) {
        scored.push(band.id);
      }
    });
    
    setScoredBands(scored);
  }, [juryMember, isPerformanceScored]);

  if (!juryMember || !stage) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle size={48} className="mx-auto text-orange-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Jurylid niet gevonden</h2>
        <p className="mb-6">Het opgegeven jurylid-ID bestaat niet.</p>
        <button 
          onClick={() => navigate('/jury')}
          className="bg-[#004380] hover:bg-[#003366] text-white font-bold py-2 px-6 rounded"
        >
          Terug naar Jury Selectie
        </button>
      </div>
    );
  }

  const filteredCategories = categories.filter(c => c.type === juryMember.type);
  
  const handleScoreChange = (categoryId: number, value: number) => {
    setCategoryScores(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedBandId || !juryMember || isSaving) return;
    
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
    selectedBandId && 
    filteredCategories.length === Object.keys(categoryScores).length;

  if (isContextLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Laden...</div>;
  }
  
  if (contextError) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">Error: {contextError}</div>;
  }

  const isSubmitDisabled = !isFormComplete || isSaving || submitted;

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#004380] text-white p-4">
          <h1 className="text-xl font-bold">{juryMember.name}</h1>
          <div className="flex justify-between items-center">
            <p>{juryMember.type === 'muzikaliteit' ? 'Muzikaliteit' : 'Show'} Jurering</p>
            <p>Podium: {stage.name}</p>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Selecteer Band
            </label>
            <BandSelector 
              bands={bands} 
              selectedBandId={selectedBandId} 
              onSelectBand={setSelectedBandId} 
            />
            
            {scoredBands.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Je hebt al {scoredBands.length} van de {bands.length} bands beoordeeld
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {scoredBands.map(bandId => {
                    const band = bands.find(b => b.id === bandId);
                    return band ? (
                      <span 
                        key={bandId}
                        className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                      >
                        <Check size={12} className="mr-1" />
                        {band.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
          
          {selectedBandId && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Beoordeling voor {bands.find(b => b.id === selectedBandId)?.name}
              </h2>
              
              {filteredCategories.map(category => (
                <div key={category.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="mb-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 px-2">
                    <span>Laag</span>
                    <span>Hoog</span>
                  </div>
                  
                  <RadioButtonGroup
                    name={`category-${category.id}`}
                    value={categoryScores[category.id] || null}
                    onChange={(value) => handleScoreChange(category.id, value)}
                  />
                </div>
              ))}
              
              <div className="mt-8">
                {saveError && <p className="text-red-600 text-center mb-4">{saveError}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  className={`w-full mt-6 py-3 px-6 rounded-md text-white font-semibold transition-colors duration-300 ${
                    isSubmitDisabled 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#004380] hover:bg-[#003366]'
                  } ${isSaving ? 'opacity-75' : ''}`}
                >
                  {isSaving ? 'Bezig met opslaan...' : submitted ? 'Opgeslagen!' : 'Scores Indienen'}
                </button>
                
                {!isFormComplete && (
                  <p className="text-sm text-orange-600 mt-2">
                    Vul alle categorieën in om de scores op te slaan
                  </p>
                )}
              </div>
            </div>
          )}
          
          {!selectedBandId && (
            <div className="text-center py-8 text-gray-500">
              <p>Selecteer eerst een band om te beoordelen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JuryScoring;