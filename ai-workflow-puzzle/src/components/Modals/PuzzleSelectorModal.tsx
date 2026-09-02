import React, { useState } from 'react';
import {
  X,
  Grid,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { usePuzzleStore, useUIStore } from '../../stores';

export const PuzzleSelectorModal: React.FC = () => {
  const { puzzles, currentPuzzleId, completedPuzzleIds, setCurrentPuzzle, loadSolutionWorkflow } = usePuzzleStore();
  const { activeModal, setActiveModal } = useUIStore();

  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  if (activeModal !== 'puzzle-select') {
    return null;
  }

  const filteredPuzzles = puzzles.filter((p) => {
    if (filterDifficulty === 'all') return true;
    return p.difficulty === filterDifficulty;
  });

  const handleSelectPuzzle = (puzzleId: string) => {
    setCurrentPuzzle(puzzleId);
    setActiveModal(null);
  };

  const handleLoadSolution = (puzzleId: string) => {
    setCurrentPuzzle(puzzleId);
    loadSolutionWorkflow();
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl">
              <Grid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Select AI Workflow Puzzle</h2>
              <p className="text-xs text-slate-400">
                Choose a pre-seeded challenge ({completedPuzzleIds.length}/{puzzles.length} Solved)
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold">
          <button
            onClick={() => setFilterDifficulty('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterDifficulty === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            All ({puzzles.length})
          </button>
          <button
            onClick={() => setFilterDifficulty('beginner')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterDifficulty === 'beginner'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            Beginner (2)
          </button>
          <button
            onClick={() => setFilterDifficulty('intermediate')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterDifficulty === 'intermediate'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            Intermediate (3)
          </button>
          <button
            onClick={() => setFilterDifficulty('advanced')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterDifficulty === 'advanced'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-purple-800 hover:bg-purple-50 border border-purple-200'
            }`}
          >
            Advanced (3)
          </button>
        </div>

        {/* Puzzle Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 scrollbar-thin">
          {filteredPuzzles.map((puzzle, index) => {
            const isCurrent = puzzle.id === currentPuzzleId;
            const isSolved = completedPuzzleIds.includes(puzzle.id);

            return (
              <div
                key={puzzle.id}
                className={`bg-white rounded-2xl border-2 p-4 flex flex-col justify-between transition-all hover:shadow-lg ${
                  isCurrent
                    ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/20'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-gray-400">
                      Puzzle #{index + 1}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className={`difficulty-badge difficulty-${puzzle.difficulty}`}>
                        {puzzle.difficulty}
                      </span>
                      {isSolved && (
                        <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SOLVED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 mb-1">
                    {puzzle.title}
                  </h3>

                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {puzzle.objective}
                  </p>

                  {/* Failure Tag */}
                  {puzzle.failureScenario && (
                    <div className="flex items-center space-x-1 text-[10px] text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200 mb-3">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">Fault: {puzzle.failureScenario.name}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleLoadSolution(puzzle.id)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>View Solution</span>
                  </button>

                  <button
                    onClick={() => handleSelectPuzzle(puzzle.id)}
                    className="btn btn-primary text-xs px-3.5 py-1.5 flex items-center space-x-1 font-semibold"
                  >
                    <span>{isCurrent ? 'Current' : 'Start Puzzle'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
