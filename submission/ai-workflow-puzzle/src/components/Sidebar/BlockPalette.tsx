import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { usePuzzleStore, useWorkflowStore, useUIStore } from '../../stores';
import { BlockConfig, BlockType } from '../../types';

export const BlockPalette: React.FC = () => {
  const { getAvailableBlocks } = usePuzzleStore();
  const { addNode, nodes } = useWorkflowStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'reliability' | 'human-control'>('all');

  const availableBlocks = getAvailableBlocks();

  const filteredBlocks = availableBlocks.filter((block) => {
    const matchesSearch =
      block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || block.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onDragStart = (event: React.DragEvent, nodeType: BlockType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddNode = (block: BlockConfig) => {
    const id = `node-${block.type}-${Date.now().toString().slice(-4)}`;
    const newNode = {
      id,
      type: block.type,
      position: {
        x: 150 + (nodes.length % 5) * 40,
        y: 120 + (nodes.length % 5) * 40
      },
      data: {
        label: block.label,
        config: { ...block.defaultConfig },
        description: block.description
      }
    };
    addNode(newNode);
  };

  if (!sidebarOpen) {
    return (
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-0 top-24 z-20 bg-white border border-gray-300 rounded-r-lg p-2 shadow-md hover:bg-gray-50 text-gray-700"
        title="Open Block Palette"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    );
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-4rem)] z-10 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-gray-900 text-sm">Block Palette</h2>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 hover:bg-gray-100 rounded text-gray-500"
          title="Collapse Palette"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex p-2 gap-1 border-b border-gray-100 bg-gray-50 text-[11px] font-medium overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-white text-indigo-700 shadow-xs font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedCategory('core')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
            selectedCategory === 'core'
              ? 'bg-white text-blue-700 shadow-xs font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Core
        </button>
        <button
          onClick={() => setSelectedCategory('reliability')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
            selectedCategory === 'reliability'
              ? 'bg-white text-orange-700 shadow-xs font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reliability
        </button>
        <button
          onClick={() => setSelectedCategory('human-control')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
            selectedCategory === 'human-control'
              ? 'bg-white text-amber-700 shadow-xs font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Human Control
        </button>
      </div>

      {/* Block List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
        {filteredBlocks.map((block) => (
          <div
            key={block.id}
            draggable
            onDragStart={(e) => onDragStart(e, block.type)}
            onClick={() => handleAddNode(block)}
            className="group relative bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-md rounded-xl p-2.5 cursor-grab active:cursor-grabbing transition-all duration-150"
            style={{ borderLeftWidth: '4px', borderLeftColor: block.color }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl leading-none">{block.icon}</span>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600">
                    {block.label}
                  </h3>
                  <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-medium uppercase ${
                    block.category === 'core'
                      ? 'bg-blue-50 text-blue-700'
                      : block.category === 'reliability'
                      ? 'bg-orange-50 text-orange-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {block.category}
                  </span>
                </div>
              </div>

              <button
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-indigo-50 text-indigo-600 rounded transition-opacity"
                title="Add to canvas"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-tight">
              {block.description}
            </p>
          </div>
        ))}

        {filteredBlocks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-xs">
            No blocks found matching query.
          </div>
        )}
      </div>

      {/* Instructions footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500 flex items-center space-x-2">
        <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span>Drag blocks onto canvas or click to add.</span>
      </div>
    </aside>
  );
};
