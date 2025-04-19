import React, { createContext, useContext, useState, useEffect } from 'react';
import { Score, PerformanceScore, BandTotalScore } from '../types';
import { bands, stages } from '../data/initialData';

interface ScoreContextType {
  scores: Score[];
  addScore: (score: Score) => void;
  addMultipleScores: (scores: Score[]) => void;
  getPerformanceScores: (bandId: number, stageId: number) => PerformanceScore | null;
  getBandTotalScores: () => BandTotalScore[];
  getBandScoreByStage: (bandId: number, stageId: number) => {
    muzikaliteit: number;
    show: number;
    total: number;
  } | null;
  isPerformanceScored: (bandId: number, stageId: number, juryType: 'muzikaliteit' | 'show') => boolean;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export const ScoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scores, setScores] = useState<Score[]>([]);

  // Load scores from localStorage on component mount
  useEffect(() => {
    const savedScores = localStorage.getItem('bandScores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  // Save scores to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bandScores', JSON.stringify(scores));
  }, [scores]);

  const addScore = (score: Score) => {
    setScores(prevScores => {
      // Replace score if it already exists for this band, stage, jury member, and category
      const filteredScores = prevScores.filter(
        s => !(s.bandId === score.bandId && 
               s.stageId === score.stageId && 
               s.juryMemberId === score.juryMemberId && 
               s.categoryId === score.categoryId)
      );
      return [...filteredScores, score];
    });
  };

  const addMultipleScores = (newScores: Score[]) => {
    setScores(prevScores => {
      // Create a copy of previous scores
      const updatedScores = [...prevScores];
      
      // Process each new score
      newScores.forEach(newScore => {
        // Find the index of an existing score with the same identifiers
        const existingIndex = updatedScores.findIndex(
          s => s.bandId === newScore.bandId && 
               s.stageId === newScore.stageId && 
               s.juryMemberId === newScore.juryMemberId && 
               s.categoryId === newScore.categoryId
        );
        
        // Replace or add the score
        if (existingIndex !== -1) {
          updatedScores[existingIndex] = newScore;
        } else {
          updatedScores.push(newScore);
        }
      });
      
      return updatedScores;
    });
  };

  const getPerformanceScores = (bandId: number, stageId: number): PerformanceScore | null => {
    const bandStageScores = scores.filter(s => s.bandId === bandId && s.stageId === stageId);
    
    if (bandStageScores.length === 0) {
      return null;
    }

    const result: PerformanceScore = {
      bandId,
      stageId,
      scores: {
        muzikaliteit: {},
        show: {},
      },
      totalMuzikaliteit: 0,
      totalShow: 0,
      grandTotal: 0,
    };

    // Group scores by category and jury type
    bandStageScores.forEach(score => {
      const juryMember = score.juryMemberId;
      // Check if jury member is muzikaliteit (1, 3, 5, 7) or show (2, 4, 6, 8)
      const juryType = juryMember % 2 === 1 ? 'muzikaliteit' : 'show';
      result.scores[juryType][score.categoryId] = score.value;
    });

    // Calculate totals
    const muzikaliteitScores = Object.values(result.scores.muzikaliteit);
    const showScores = Object.values(result.scores.show);
    
    result.totalMuzikaliteit = muzikaliteitScores.reduce((sum, score) => sum + score, 0);
    result.totalShow = showScores.reduce((sum, score) => sum + score, 0);
    result.grandTotal = result.totalMuzikaliteit + result.totalShow;

    return result;
  };

  const isPerformanceScored = (bandId: number, stageId: number, juryType: 'muzikaliteit' | 'show'): boolean => {
    // Get all scores for this band, stage
    const relevantScores = scores.filter(score => 
      score.bandId === bandId && 
      score.stageId === stageId
    );

    // Filter by jury type
    const juryTypeScores = relevantScores.filter(score => {
      const isJuryTypeMuzikaliteit = score.juryMemberId % 2 === 1;
      return (juryType === 'muzikaliteit' && isJuryTypeMuzikaliteit) || 
             (juryType === 'show' && !isJuryTypeMuzikaliteit);
    });

    // Check if we have 6 scores (one for each category)
    // For muzikaliteit, we expect 6 scores (categories 1-6)
    // For show, we expect 6 scores (categories 7-12)
    return juryTypeScores.length === 6;
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
    return bands.map(band => {
      const bandTotalScore: BandTotalScore = {
        bandId: band.id,
        bandName: band.name,
        stageScores: {},
        totalScore: 0,
      };

      stages.forEach(stage => {
        const performanceScore = getPerformanceScores(band.id, stage.id);
        if (performanceScore) {
          bandTotalScore.stageScores[stage.id] = {
            muzikaliteit: performanceScore.totalMuzikaliteit,
            show: performanceScore.totalShow,
            total: performanceScore.grandTotal,
          };
          bandTotalScore.totalScore += performanceScore.grandTotal;
        } else {
          bandTotalScore.stageScores[stage.id] = {
            muzikaliteit: 0,
            show: 0,
            total: 0,
          };
        }
      });

      return bandTotalScore;
    }).sort((a, b) => b.totalScore - a.totalScore); // Sort by total score descending
  };

  return (
    <ScoreContext.Provider value={{ 
      scores, 
      addScore, 
      addMultipleScores,
      getPerformanceScores, 
      getBandTotalScores,
      getBandScoreByStage,
      isPerformanceScored
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