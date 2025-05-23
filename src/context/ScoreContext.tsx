import React, { createContext, useContext, useState, useEffect } from 'react';
import { Score, PerformanceScore, BandTotalScore, JuryMember } from '../types';
import { stages } from '../data/initialData';
import { db } from '../firebase'; // Import the initialized Firestore instance
import { 
  collection, 
  query, 
  getDocs, 
  writeBatch, 
  doc,
  serverTimestamp, // Optional: for accurate timestamps
  updateDoc
} from "firebase/firestore";
import { useJury } from './JuryContext';
import { useBands } from './BandContext'; // Import useBands

interface ScoreContextType {
  scores: Score[];
  addMultipleScores: (scores: Score[]) => Promise<void>; // Make async
  getPerformanceScores: (bandId: number, stageId: number) => PerformanceScore | null;
  getBandTotalScores: () => BandTotalScore[];
  getBandScoreByStage: (bandId: number, stageId: number) => {
    muzikaliteit: number;
    show: number;
    total: number;
  } | null;
  isPerformanceScored: (bandId: number, stageId: number, juryMemberId: string | number) => boolean;
  isLoading: boolean; // Add loading state
  error: string | null; // Add error state
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);
const scoresCollectionRef = collection(db, "scores"); // Reference to the 'scores' collection

export const ScoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { juryMembers, isLoading: juryLoading, error: juryError } = useJury();
  const { bands, isLoading: bandsLoading, error: bandsError } = useBands(); // Use bands context

  // Update main loading state based on all contexts
  useEffect(() => {
      setIsLoading(juryLoading || bandsLoading || scores === null); // Check all loading states
  }, [juryLoading, bandsLoading, scores]);

  // Update error state based on all contexts
  useEffect(() => {
      setError(juryError || bandsError || null); // Show first error encountered
  }, [juryError, bandsError]);

  // Load scores from Firestore on component mount
  useEffect(() => {
    const fetchScores = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching scores from Firestore...");
        const q = query(scoresCollectionRef); // Query all scores
        const querySnapshot = await getDocs(q);
        const fetchedScores: Score[] = [];
        querySnapshot.forEach((doc) => {
          // Assuming Firestore doc data matches the Score type
          // Handle potential timestamp differences if necessary
          fetchedScores.push({ id: doc.id, ...doc.data() } as Score); 
        });
        console.log(`Fetched ${fetchedScores.length} scores.`);
        setScores(fetchedScores);
      } catch (e) {
        console.error("Error fetching scores from Firestore:", e);
        setError("Kon scores niet laden vanuit de database.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, []); // Empty dependency array ensures this runs only once on mount

  const addMultipleScores = async (newScores: Score[]) => {
    if (!newScores || newScores.length === 0) {
      return;
    }
    
    // Use a Set for efficient lookup of existing score identifiers
    const existingScoreKeys = new Set(scores.map(s => 
        `${s.bandId}-${s.stageId}-${s.juryMemberId}-${s.categoryId}`
    ));
    const scoresToUpdateLocally: Score[] = [];
    
    // Use a Firestore batch for atomic writes
    const batch = writeBatch(db);
    
    newScores.forEach(newScore => {
      // Create a unique ID for the Firestore document based on identifiers
      // This allows us to easily overwrite existing scores
      const docId = `${newScore.bandId}-${newScore.stageId}-${newScore.juryMemberId}-${newScore.categoryId}`;
      const docRef = doc(db, "scores", docId);
      
      // Prepare data for Firestore (add server timestamp if desired)
      const scoreData = { 
        ...newScore, 
        // timestamp: serverTimestamp() // Use server timestamp for consistency
        timestamp: Date.now() // Or keep using client timestamp
      };
      
      batch.set(docRef, scoreData); // Use set to create or overwrite
      
      // Prepare for local state update
      const scoreKey = `${newScore.bandId}-${newScore.stageId}-${newScore.juryMemberId}-${newScore.categoryId}`;
       if (!existingScoreKeys.has(scoreKey)) {
           scoresToUpdateLocally.push({ ...newScore, id: docId }); // Add id if new
       } else {
           // Find and replace logic for local state update
           scoresToUpdateLocally.push({ ...newScore, id: docId });
       }
    });

    try {
      console.log(`Attempting to save ${newScores.length} scores to Firestore...`);
      await batch.commit(); // Commit the batch write
      console.log("Scores successfully saved to Firestore.");

      // Update local state *after* successful Firestore write
      setScores(prevScores => {
          const updatedScores = [...prevScores];
          scoresToUpdateLocally.forEach(scoreToUpdate => {
              const existingIndex = updatedScores.findIndex(s => s.id === scoreToUpdate.id);
              if (existingIndex !== -1) {
                  updatedScores[existingIndex] = scoreToUpdate; // Replace existing
              } else {
                  updatedScores.push(scoreToUpdate); // Add new
              }
          });
          return updatedScores;
      });

    } catch (e) {
      console.error("Error saving scores to Firestore:", e);
      setError("Kon scores niet opslaan in de database.");
      // Optionally: revert local state changes if needed, but batch failure means nothing was written
      throw e; // Re-throw error so the calling component knows it failed
    }
  };
  
  const getPerformanceScores = (bandId: number, stageId: number): PerformanceScore | null => {
    // Don't run if jury data isn't loaded yet
    if (juryLoading || juryMembers.length === 0) {
        console.warn("getPerformanceScores called before juryMembers loaded.");
        return null; 
    }

    const bandStageScores = scores.filter(s => s.bandId === bandId && s.stageId === stageId);
    
    if (bandStageScores.length === 0) {
      return null;
    }

    // Create a quick lookup map for jury member types
    const juryTypeMap = new Map<string | number, 'muzikaliteit' | 'show'>();
    juryMembers.forEach(jm => juryTypeMap.set(jm.id, jm.type));

    const result: PerformanceScore = {
      bandId,
      stageId,
      scores: { muzikaliteit: {}, show: {} },
      totalMuzikaliteit: 0,
      totalShow: 0,
      grandTotal: 0,
    };

    bandStageScores.forEach(score => {
      // Look up the jury member's actual type
      const juryType = juryTypeMap.get(score.juryMemberId); 

      if (juryType) { // Only process if jury member type is found
          if (!result.scores[juryType]) { // Ensure bucket exists
              result.scores[juryType] = {};
          }
          result.scores[juryType][score.categoryId] = score.value;
      } else {
          console.warn(`Could not find jury member type for ID: ${score.juryMemberId}`);
      }
    });

    // Calculation of totals remains the same
    const muzikaliteitScores = Object.values(result.scores.muzikaliteit);
    const showScores = Object.values(result.scores.show);
    result.totalMuzikaliteit = muzikaliteitScores.reduce((sum, scoreValue) => sum + (scoreValue || 0), 0);
    result.totalShow = showScores.reduce((sum, scoreValue) => sum + (scoreValue || 0), 0);
    result.grandTotal = result.totalMuzikaliteit + result.totalShow;

    return result;
  };

  const isPerformanceScored = (bandId: number, stageId: number, juryMemberId: string | number): boolean => {
    const targetJuryIdString = String(juryMemberId); 
    const relevantScores = scores.filter(score => 
      score.bandId === bandId && 
      score.stageId === stageId &&
      String(score.juryMemberId) === targetJuryIdString 
    );
    const expectedCount = 6; 
    return relevantScores.length >= expectedCount; 
  };

  const getBandScoreByStage = (bandId: number, stageId: number) => {
    const performanceScore = getPerformanceScores(bandId, stageId);
    if (!performanceScore) return null;

    return {
      muzikaliteit: performanceScore.totalMuzikaliteit,
      show: performanceScore.totalShow,
      total: performanceScore.grandTotal,
    };
  };

  const getBandTotalScores = (): BandTotalScore[] => {
    // Don't run if dependent data isn't loaded yet
    if (isLoading || error || bands.length === 0) {
        return []; // Return empty array if data not ready
    }

    // Use dynamic 'bands' array from context
    return bands.map(band => { 
      let totalMuzikaliteitOverall = 0;
      let totalShowOverall = 0;
      let totalScoreOverall = 0; 

      const bandTotalScore: BandTotalScore = {
        bandId: band.id,
        bandName: band.name,
        stageScores: {},
        totalScore: 0, // Will be updated below
        totalMuzikaliteit: 0, // Initialize added property
        totalShow: 0, // Initialize added property
      };

      stages.forEach(stage => {
        // getPerformanceScores now also depends on juryMembers being loaded
        const performanceScore = getPerformanceScores(band.id, stage.id); 
        if (performanceScore) {
          bandTotalScore.stageScores[stage.id] = {
            muzikaliteit: performanceScore.totalMuzikaliteit,
            show: performanceScore.totalShow,
            total: performanceScore.grandTotal,
          };
          // Accumulate totals
          totalMuzikaliteitOverall += performanceScore.totalMuzikaliteit;
          totalShowOverall += performanceScore.totalShow;
          totalScoreOverall += performanceScore.grandTotal;
        } else {
          // Still add stage entry even if no score, with zeros
          bandTotalScore.stageScores[stage.id] = {
            muzikaliteit: 0,
            show: 0,
            total: 0,
          };
        }
      });

      // Assign calculated overall totals to the band object
      bandTotalScore.totalMuzikaliteit = totalMuzikaliteitOverall;
      bandTotalScore.totalShow = totalShowOverall;
      bandTotalScore.totalScore = totalScoreOverall; // Use the sum calculated here

      return bandTotalScore;
    }).sort((a, b) => b.totalScore - a.totalScore); // Sort by total score descending
  };

  return (
    <ScoreContext.Provider value={{ 
      scores, 
      addMultipleScores,
      getPerformanceScores, 
      getBandTotalScores,
      getBandScoreByStage,
      isPerformanceScored,
      isLoading,
      error
    }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScores = (): ScoreContextType => {
  const context = useContext(ScoreContext);
  if (context === undefined) {
    throw new Error('useScores must be used within a ScoreProvider');
  }
  return context;
};