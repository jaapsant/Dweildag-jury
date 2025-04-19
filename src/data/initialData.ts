import { Band, Category, JuryMember, Stage } from '../types';

export const bands: Band[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Band ${i + 1}`,
}));

export const stages: Stage[] = [
  { id: 1, name: 'Hoofdpodium' },
  { id: 2, name: 'Marktplein' },
  { id: 3, name: 'Kerkplein' },
  { id: 4, name: 'Dorpsstraat' },
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
    description: 'Mate van zuiver spelen', 
    type: 'muzikaliteit' 
  },
  { 
    id: 2, 
    name: 'Samenspel', 
    description: 'Hoe goed de band samenwerkt', 
    type: 'muzikaliteit' 
  },
  { 
    id: 3, 
    name: 'Moeilijkheidsgraad', 
    description: 'Complexiteit van het repertoire', 
    type: 'muzikaliteit' 
  },
  { 
    id: 4, 
    name: 'Dynamiek', 
    description: 'Variatie in volume en intensiteit', 
    type: 'muzikaliteit' 
  },
  { 
    id: 5, 
    name: 'Originaliteit', 
    description: 'Unieke elementen in muzikale uitvoering', 
    type: 'muzikaliteit' 
  },
  { 
    id: 6, 
    name: 'Ritmische precisie', 
    description: 'Nauwkeurigheid in timing', 
    type: 'muzikaliteit' 
  },
  
  // Show categories
  { 
    id: 7, 
    name: 'Presentatie', 
    description: 'Algemene uitstraling en houding', 
    type: 'show' 
  },
  { 
    id: 8, 
    name: 'Choreografie', 
    description: 'Bewegingen en formaties', 
    type: 'show' 
  },
  { 
    id: 9, 
    name: 'Publiek interactie', 
    description: 'Betrekken van het publiek', 
    type: 'show' 
  },
  { 
    id: 10, 
    name: 'Kostuums', 
    description: 'Kwaliteit en gepastheid van de kostuums', 
    type: 'show' 
  },
  { 
    id: 11, 
    name: 'Originaliteit', 
    description: 'Unieke elementen in de show', 
    type: 'show' 
  },
  { 
    id: 12, 
    name: 'Energie', 
    description: 'Enthousiasme en levendigheid', 
    type: 'show' 
  },
];