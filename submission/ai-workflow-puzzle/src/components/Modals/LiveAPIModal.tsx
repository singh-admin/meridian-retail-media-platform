import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Cpu,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useExecutionStore, useUIStore } from '../../stores';

export const LiveAPIModal: React.FC = () => {
  const { setMockMode } = useExecutionStore();
  const { activeModal, setActiveModal } = useUIStore();

  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('puzzle_live_api_key') || '';
    const savedProv = localStorage.getItem('puzzle_live_provider') || 'openai';
    setApiKey(savedKey);
    setProvider(savedProv);
  }, []);

  if (activeModal !== 'live-api') {
    return null;
  }

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('puzzle_live_api_key', apiKey.trim());
      localStorage.setItem('puzzle_live_provider', provider);
      setMockMode(false);
    } else {
      localStorage.removeItem('puzzle_live_api_key');
      setMockMode(true);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveModal(null);
    }, 1200);
  };

  const handleResetToMock = () => {
    localStorage.removeItem('puzzle_live_api_key');
    setApiKey('');
    setMockMode(true);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveModal(null);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Provider & Mock Settings</h2>
              <p className="text-xs text-slate-400">Configure Live APIs or use Free Mock Engine</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-gray-700">
          {/* Mock Mode Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-emerald-900 text-sm">Free Mock AI Mode (Active)</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              All 8 workflow puzzles are 100% playable offline with built-in realistic mock LLM responses, tool simulators, and failure injection without requiring any external paid API keys.
            </p>
          </div>

          {/* Optional Live Provider Section */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-gray-900 text-xs flex items-center space-x-1.5">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Optional: Connect Live AI Provider</span>
            </h3>

            <div>
              <label className="label">AI Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="input"
              >
                <option value="openai">OpenAI (GPT-4o, GPT-4o-mini)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="gemini">Google Gemini (Gemini 1.5 Pro)</option>
              </select>
            </div>

            <div>
              <label className="label">API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input font-mono text-xs"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Keys are stored locally in browser localStorage only and never sent to any third party server.
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings saved successfully!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleResetToMock}
            className="btn btn-secondary text-xs px-4 py-2"
          >
            Reset to Mock Mode
          </button>

          <button
            onClick={handleSave}
            className="btn btn-primary text-xs px-5 py-2 font-bold"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
