
export enum GameStage {
  AUTH = 'AUTH',
  START = 'START',
  CHARACTER_CREATION = 'CHARACTER_CREATION',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  GACHA = 'GACHA',
  PVP_BATTLE = 'PVP_BATTLE'
}

export type Grade = 
  | 'Figurante Irrelevante'
  | 'Grau 4' 
  | 'Grau 3' 
  | 'Grau 2' 
  | 'Grau 1' 
  | 'Protagonista de Paródia'
  | 'Grau Especial (Meme)';

export type Rarity = 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Grau Especial';
export type Slot = 'Arma' | 'Vestimenta' | 'Amuleto';
export type Origin = 'Humano' | 'Maldição';

export interface NPCRelationship {
  name: string;
  affinity: number;
  status: string;
  isAlive: boolean;
  currentLocation: string;
  lastInteractionSummary: string;
}

export interface User {
  username: string;
  password?: string;
  character?: Character;
  worldState?: WorldState;
  settings?: {
    imageGeneration: boolean;
  };
  pvpStats: {
    points: number;
    wins: number;
    losses: number;
    rankName: string;
  };
  createdAt: number;
}

export interface ArcDefinition {
  id: string;
  name: string;
  description: string;
  milestones: string[];
}

export const ANIME_TIMELINE: ArcDefinition[] = [
  { 
    id: 'intro', 
    name: 'O Início do Meme', 
    description: 'A descoberta de que energia amaldiçoada é basicamente estresse de segunda-feira.',
    milestones: ['Comer algo duvidoso', 'Tentar não morrer no primeiro episódio']
  },
  { 
    id: 'shibuya',
    name: 'Caos em Shibuya (Versão Abridged)',
    description: 'Onde tudo dá errado, mas com trilha sonora engraçada.',
    milestones: ['Selamento do Cara dos Seis Olhos', 'Sukuna pedindo iFood']
  }
];

export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  slot: Slot;
  bonus: { forca?: number; energia?: number; qi?: number; sorte?: number; };
  iconUrl?: string;
}

export interface ActionEvaluation {
  status: 'ACERTO' | 'ERRO' | 'CRÍTICO' | 'VERGONHA_ALHEIA';
  damageDealt: number;
  qiCost: number;
}

export interface WorldState {
  currentArcId: string;
  arcProgress: number; 
  currentLocation: string;
  chaosLevel: number; // 0 a 100, define o quão bizarra a IA narra
  npcRelationships: Record<string, NPCRelationship>;
}

export interface Character {
  name: string;
  origin: Origin;
  appearance: string;
  motivation: string;
  technique: string;
  techniqueDescription: string;
  techniqueMastery: number;
  grade: Grade;
  level: number;
  xp: number;
  nextLevelXp: number;
  spins: number;
  profileImageUrl?: string;
  stats: { forca: number; energia: number; qi: number; sorte: number; protagonismo: number; };
  currentHp: number;
  currentQi: number;
  inventory: Item[];
}

export const CANON_GRADES: Grade[] = ['Figurante Irrelevante', 'Grau 4', 'Grau 3', 'Grau 2', 'Grau 1', 'Protagonista de Paródia', 'Grau Especial (Meme)'];

export const CANON_TECHNIQUES: Record<Rarity, { name: string, desc: string }[]> = {
  'Comum': [{ name: 'Gritar Muito Alto', desc: 'Atordoa inimigos pela vergonha.' }, { name: 'Corrida de Naruto', desc: 'Aumenta a esquiva mas diminui a dignidade.' }],
  'Raro': [{ name: 'Falar Sozinho', desc: 'Recupera Qi enquanto explica seu plano maligno.' }, { name: 'Flashback Triste', desc: 'Ganha um bônus de dano temporário.' }],
  'Épico': [{ name: 'Boogie Woogie de Pagode', desc: 'Troca de lugar com o inimigo no ritmo do samba.' }, { name: 'Piada Sem Graça', desc: 'Dano mental massivo em área.' }],
  'Lendário': [{ name: 'Dez Sombras de Papelão', desc: 'Invoca shikigamis que parecem desenhos de criança.' }, { name: 'Expansão de Domínio: Quarto da Bagunça', desc: 'O inimigo tropeça em tudo.' }],
  'Grau Especial': [{ name: 'Ilimitado (Versão Lag)', desc: 'Ninguém consegue te tocar porque você está travado no tempo.' }, { name: 'Corte do Chefe', desc: 'Corta o inimigo e o salário dele.' }]
};
