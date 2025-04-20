import { Band, Category, Stage } from '../types';

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