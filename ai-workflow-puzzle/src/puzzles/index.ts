import { Puzzle, PuzzleSeedData } from '../types';
import { BLOCK_DEFINITIONS } from '../types/blocks';
import { puzzle1 } from './puzzle1';
import { puzzle2 } from './puzzle2';
import { puzzle3 } from './puzzle3';
import { puzzle4 } from './puzzle4';
import { puzzle5 } from './puzzle5';
import { puzzle6 } from './puzzle6';
import { puzzle7 } from './puzzle7';
import { puzzle8 } from './puzzle8';

export const ALL_PUZZLES: Puzzle[] = [
  puzzle1,
  puzzle2,
  puzzle3,
  puzzle4,
  puzzle5,
  puzzle6,
  puzzle7,
  puzzle8
];

export const INITIAL_SEED_DATA: PuzzleSeedData = {
  puzzles: ALL_PUZZLES,
  mockResponses: {},
  blockDefinitions: Object.values(BLOCK_DEFINITIONS)
};

export {
  puzzle1,
  puzzle2,
  puzzle3,
  puzzle4,
  puzzle5,
  puzzle6,
  puzzle7,
  puzzle8
};
