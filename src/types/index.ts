export interface Band {
  id: number;
  name: string;
}

export interface Stage {
  id: number;
  name: string;
}

export interface JuryMember {
  id: number;
  name: string;
  type: 'muzikaliteit' | 'show';
  stageId: number;
}

export interface Category {
  id: number;
  name: string;
  type: 'muzikaliteit' | 'show';
}

export interface Score {
  bandId: number;
  stageId: number;
  juryMemberId: number;
  categoryId: number;
  value: number; // 1-7
  timestamp: number;
}

export interface PerformanceScore {
  bandId: number;
  stageId: number;
  scores: {
    muzikaliteit: {
      [categoryId: number]: number;
    };
    show: {
      [categoryId: number]: number;
    };
  };
  totalMuzikaliteit: number;
  totalShow: number;
  grandTotal: number;
}

export interface BandTotalScore {
  bandId: number;
  bandName: string;
  stageScores: {
    [stageId: number]: {
      muzikaliteit: number;
      show: number;
      total: number;
    };
  };
  totalScore: number;
  totalMuzikaliteit: number;
  totalShow: number;
}