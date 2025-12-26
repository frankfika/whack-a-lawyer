import React from 'react';

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

// Four Archetypes of annoying lawyers
export type LawyerType = 'BILLER' | 'PEDANT' | 'STALLER' | 'AGGRESSOR';

export interface Lawyer {
  id: number;
  isActive: boolean;
  type: LawyerType;
  taunt: string;
  subTitle: string; // e.g. "Hourly Rate: $800"
  displayDuration: number;
  health: number;    // Current hits remaining
  maxHealth: number; // Total hits needed
  billAmount: number; // How much they have "billed" you while active
}

export interface ScoreState {
  score: number;
  highScore: number;
  whacks: number;
  misses: number;
  combo: number;
  maxCombo: number;
  moneySaved: number; // New metric: How much legal fees you prevented
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  content: string | React.ReactNode;
  color: string;
}
