import { Band, Category, JuryMember, Stage } from '../types';

export const bands: Band[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Band ${i + 1}`,
}));

export const stages: Stage[] = [
  { id: 1, name: 'Hoofdpodium' },
  { id: 2, name: 'Cafe 61' },
  { id: 3, name: 'Het Wapen' },
  { id: 4, name: 'Marktplein' },
];

export const juryMembers: JuryMember[] = [
  // Stage 1
  { id: 1, name: 'Jan Jansen', type: 'muzikaliteit', stageId: 1 },
  { id: 2, name: 'Petra Peters', type: 'show', stageId: 1 },
  // Stage 2
  { id: 3, name: 'Klaas Klaassen', type: 'muzikaliteit', stageId: 2 },
  { id: 4, name: 'Lisa de Vries', type: 'show', stageId: 2 },
  // Stage 3
  { id: 5, name: 'Maarten Maartens', type: 'muzikaliteit', stageId: 3 },
  { id: 6, name: 'Saskia Smit', type: 'show', stageId: 3 },
  // Stage 4
  { id: 7, name: 'Dirk Dijkstra', type: 'muzikaliteit', stageId: 4 },
  { id: 8, name: 'Emma Evers', type: 'show', stageId: 4 },
];

export const categories: Category[] = [
  // Muzikaliteit categories
  { 
    id: 1, 
    name: 'Zuiverheid', 
    type: 'muzikaliteit' 
  },
  { 
    id: 2, 
    name: 'Balans', 
    type: 'muzikaliteit' 
  },
  { 
    id: 3, 
    name: 'Diversiteit van de arrangementen', 
    type: 'muzikaliteit' 
  },
  { 
    id: 4, 
    name: 'Uitvoering',  
    type: 'muzikaliteit' 
  },
  { 
    id: 5, 
    name: 'Dynamiek',  
    type: 'muzikaliteit' 
  },
  { 
    id: 6, 
    name: 'Ritmiek', 
    type: 'muzikaliteit' 
  },
  
  // Show categories
  { 
    id: 7, 
    name: 'Interactie',  
    type: 'show' 
  },
  { 
    id: 8, 
    name: 'Enthousiasme',  
    type: 'show' 
  },
  { 
    id: 9, 
    name: 'Presentatie/uitstraling', 
    type: 'show' 
  },
  { 
    id: 10, 
    name: 'Amusementswaarde', 
    type: 'show' 
  },
  { 
    id: 11, 
    name: 'Diversiteit van het repertoire', 
    type: 'show' 
  },
  { 
    id: 12, 
    name: 'Originaliteit', 
    type: 'show' 
  },
];