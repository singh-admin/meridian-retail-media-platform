import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Settings,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCw,
  ShieldCheck,
  PauseCircle,
  UserCheck
} from 'lucide-react';
import { useWorkflowStore, useExecutionStore, useUIStore } from '../../stores';
import { BLOCK_DEFINITIONS } from '../../types/blocks';
import { BlockType } from '../../types';

export const CustomNode = memo(({ id, data, selected }: NodeProps) => {
  const { setSelectedNode, deleteNode } = useWorkflowStore();
  const { activeStepId, stepExecutions } = useExecutionStore();
  const { setActiveRightPanel } = useUIStore();

  const blockConfig = BLOCK_DEFINITIONS[data.type as BlockType] || BLOCK_DEFINITIONS['input'];
  const currentStep = stepExecutions.find((s) => s.stepId === id);
  const isActive = activeStepId === id;
  const status = currentStep?.status || (isActive ? 'running' : 'pending');

  const handleOpenConfig = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(id);
    setActiveRightPanel('config');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  // Determine border & glow colors based on status
  let statusBadge = null;
  let statusBorderClass = 'border-gray-200 hover:border-gray-400';
  let glowEffect = '';

  if (isActive || status === 'running') {
    statusBorderClass = 'border-blue-500 ring-4 ring-blue-100';
    glowEffect = 'animate-pulse shadow-lg shadow-blue-200';
    statusBadge = (
      <span className="flex items-center space-x-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-semibold animate-pulse">
        <RotateCw className="w-2.5 h-2.5 animate-spin" />
        <span>Running</span>
      </span>
    );
  } else if (status === 'completed') {
    statusBorderClass = 'border-emerald-500 ring-2 ring-emerald-100';
    statusBadge = (
      <span className="flex items-center space-x-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-semibold">
        <CheckCircle2 className="w-2.5 h-2.5" />
        <span>Done</span>
      </span>
    );
  } else if (status === 'failed') {
    statusBorderClass = 'border-red-500 ring-2 ring-red-100';
    statusBadge = (
      <span className="flex items-center space-x-1 px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full text-[10px] font-semibold">
        <XCircle className="w-2.5 h-2.5" />
        <span>Failed</span>
      </span>
    );
  } else if (status === 'retrying') {
    statusBorderClass = 'border-orange-500 ring-2 ring-orange-100';
    statusBadge = (
      <span className="flex items-center space-x-1 px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded-full text-[10px] font-semibold animate-pulse">
        <RotateCw className="w-2.5 h-2.5 animate-spin" />
        <span>Retrying ({currentStep?.retryCount})</span>
      </span>
    );
  } else if (status === 'recovered') {
    statusBorderClass = 'border-purple-500 ring-2 ring-purple-100';
    statusBadge = (
      <span className="flex items-center space-x-1 px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-semibold">
        <ShieldCheck className="w-2.5 h-2.5" />
        <span>Recovered</span>
      </span>
    );
  } else if (status === 'safely-stopped') {
    statusBorderClass = 'border-slate-500 ring-2 ring-slate-100';
    statusBadge = (
      <span className="flex items-center space-x-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-semibold">
        <PauseCircle className="w-2.5 h-2.5" />
        <span>Stopped</span>
      </span>
    );
  } else if (status === 'waiting-human') {
    statusBorderClass = 'border-amber-500 ring-4 ring-amber-100';
    glowEffect = 'animate-pulse shadow-lg shadow-amber-200';
    statusBadge = (
      <span className="flex items-center space-x-1 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-semibold">
        <UserCheck className="w-2.5 h-2.5" />
        <span>Reviewing</span>
      </span>
    );
  }

  const isCondition = data.type === 'condition';

  return (
    <div
      className={`group relative bg-white rounded-xl shadow-md border-2 min-w-[200px] max-w-[260px] transition-all duration-200 select-none ${statusBorderClass} ${glowEffect} ${
        selected ? 'ring-2 ring-indigo-600 shadow-xl' : ''
      }`}
      style={{ borderTopColor: blockConfig.color, borderTopWidth: '4px' }}
    >
      {/* Target Connection Handle (Input) */}
      {data.type !== 'input' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-indigo-600 !border-2 !border-white hover:!scale-125 transition-transform"
        />
      )}

      {/* Node Content Header */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-xl leading-none flex-shrink-0">{blockConfig.icon}</span>
            <div className="min-w-0">
              <h3 className="font-bold text-xs text-gray-900 truncate" title={data.label || blockConfig.label}>
                {data.label || blockConfig.label}
              </h3>
              <p className="text-[10px] text-gray-400 font-mono truncate">{id}</p>
            </div>
          </div>

          {/* Quick action buttons on hover */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleOpenConfig}
              className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
              title="Configure Step"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete Step"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Badge & Summary */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 capitalize">{data.type}</span>
          {statusBadge}
        </div>

        {/* Error message snippet if failed */}
        {currentStep?.error && (
          <div className="mt-1.5 p-1.5 bg-red-50 text-red-700 text-[10px] rounded border border-red-200 line-clamp-2" title={currentStep.error}>
            {currentStep.error}
          </div>
        )}
      </div>

      {/* Source Connection Handle (Output) */}
      {data.type !== 'output' && !isCondition && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-indigo-600 !border-2 !border-white hover:!scale-125 transition-transform"
        />
      )}

      {/* Condition Node Multi-Handle */}
      {isCondition && (
        <>
          <Handle
            id="true"
            type="source"
            position={Position.Right}
            style={{ top: '30%' }}
            className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white"
          />
          <Handle
            id="false"
            type="source"
            position={Position.Right}
            style={{ top: '70%' }}
            className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white"
          />
        </>
      )}
    </div>
  );
});
