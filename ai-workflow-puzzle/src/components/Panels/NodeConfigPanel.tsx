import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useWorkflowStore, useUIStore } from '../../stores';
import { BLOCK_DEFINITIONS } from '../../types/blocks';
import { BlockType, ConfigField } from '../../types';

export const NodeConfigPanel: React.FC = () => {
  const { nodes, selectedNodeId, updateNode, updateNodeConfig, deleteNode } = useWorkflowStore();
  const { activeRightPanel, setActiveRightPanel } = useUIStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const blockDef = selectedNode ? BLOCK_DEFINITIONS[selectedNode.type as BlockType] : null;

  const [label, setLabel] = useState('');
  const [config, setConfig] = useState<Record<string, any>>({});
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || blockDef?.label || '');
      setConfig(selectedNode.data.config || {});
      setJsonErrors({});
    }
  }, [selectedNode, blockDef]);

  if (activeRightPanel !== 'config' || !selectedNode || !blockDef) {
    return null;
  }

  const handleFieldChange = (key: string, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    updateNodeConfig(selectedNode.id, { [key]: value });
  };

  const handleJsonFieldChange = (key: string, rawText: string) => {
    try {
      const parsed = JSON.parse(rawText);
      setJsonErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      handleFieldChange(key, parsed);
    } catch (e: any) {
      setJsonErrors((prev) => ({ ...prev, [key]: e.message }));
    }
  };

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    updateNode(selectedNode.id, {
      data: { ...selectedNode.data, label: newLabel }
    });
  };

  const handleDelete = () => {
    deleteNode(selectedNode.id);
    setActiveRightPanel(null);
  };

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-[calc(100vh-4rem)] z-20 shadow-lg select-none">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{blockDef.icon}</span>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">{blockDef.label} Config</h2>
            <p className="text-[10px] text-gray-500 font-mono">{selectedNode.id}</p>
          </div>
        </div>
        <button
          onClick={() => setActiveRightPanel(null)}
          className="p-1 hover:bg-gray-200 rounded text-gray-500"
          title="Close Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Configuration Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* Step Label */}
        <div>
          <label className="label">Step Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="input"
            placeholder="Custom label for this step"
          />
        </div>

        {/* Dynamic Fields */}
        {blockDef.configSchema.map((field: ConfigField) => (
          <div key={field.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="label">{field.label}</label>
              {field.type === 'textarea' && (
                <button
                  type="button"
                  onClick={() => {
                    const curr = config[field.key] || '';
                    handleFieldChange(field.key, curr + ' {{input}}');
                  }}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-mono"
                  title="Insert input placeholder"
                >
                  + {'{{input}}'}
                </button>
              )}
            </div>

            {/* Render input by type */}
            {field.type === 'text' && (
              <input
                type="text"
                value={config[field.key] ?? field.default ?? ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="input"
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                rows={3}
                value={config[field.key] ?? field.default ?? ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="input font-sans text-xs"
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={config[field.key] ?? field.default ?? 0}
                onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
                className="input"
              />
            )}

            {field.type === 'select' && field.options && (
              <select
                value={config[field.key] ?? field.default ?? field.options[0]?.value}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="input bg-white"
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'boolean' && (
              <label className="flex items-center space-x-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={config[field.key] ?? field.default ?? false}
                  onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-xs text-gray-700">Enable this option</span>
              </label>
            )}

            {field.type === 'json' && (
              <div className="space-y-1">
                <textarea
                  rows={4}
                  defaultValue={
                    typeof config[field.key] === 'object'
                      ? JSON.stringify(config[field.key], null, 2)
                      : String(config[field.key] ?? '{}')
                  }
                  onChange={(e) => handleJsonFieldChange(field.key, e.target.value)}
                  className="input font-mono text-[11px] bg-slate-900 text-emerald-400"
                />
                {jsonErrors[field.key] && (
                  <p className="text-[10px] text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>JSON syntax error: {jsonErrors[field.key]}</span>
                  </p>
                )}
              </div>
            )}

            {field.type === 'code' && (
              <textarea
                rows={4}
                value={config[field.key] ?? field.default ?? ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="input font-mono text-[11px] bg-slate-900 text-amber-300"
              />
            )}

            {field.description && (
              <p className="text-[10px] text-gray-500">{field.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Panel Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <button
          onClick={handleDelete}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Step</span>
        </button>

        <button
          onClick={() => setActiveRightPanel(null)}
          className="btn btn-primary px-4 py-1.5 text-xs font-semibold"
        >
          Done
        </button>
      </div>
    </aside>
  );
};
