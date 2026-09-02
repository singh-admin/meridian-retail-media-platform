import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  CheckCircle2,
  Edit3,
  XCircle,
  Info
} from 'lucide-react';
import { useExecutionStore } from '../../stores';
import { HumanDecision } from '../../types';

export const HumanReviewModal: React.FC = () => {
  const { humanReviewRequest, setHumanReviewRequest } = useExecutionStore();

  const [rawText, setRawText] = useState('');
  const [reason, setReason] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (humanReviewRequest) {
      setRawText(
        typeof humanReviewRequest.input === 'object'
          ? JSON.stringify(humanReviewRequest.input, null, 2)
          : String(humanReviewRequest.input || '')
      );
      setReason('');
      setJsonError(null);
    }
  }, [humanReviewRequest]);

  if (!humanReviewRequest) {
    return null;
  }

  const handleApprove = () => {
    const decision: HumanDecision = {
      action: 'approve',
      reason: reason || 'Approved without modifications',
      timestamp: Date.now()
    };
    humanReviewRequest.resolve(decision);
    setHumanReviewRequest(null);
  };

  const handleEditAndApprove = () => {
    let parsedOutput: any = rawText;
    try {
      parsedOutput = JSON.parse(rawText);
    } catch {
      // If not strict JSON, pass as string
    }

    const decision: HumanDecision = {
      action: 'edit',
      editedOutput: parsedOutput,
      reason: reason || 'Output modified by reviewer',
      timestamp: Date.now()
    };
    humanReviewRequest.resolve(decision);
    setHumanReviewRequest(null);
  };

  const handleReject = () => {
    const decision: HumanDecision = {
      action: 'reject',
      reason: reason || 'Rejected by human reviewer',
      timestamp: Date.now()
    };
    humanReviewRequest.resolve(decision);
    setHumanReviewRequest(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-amber-200">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center space-x-3">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
              Human-in-the-Loop Required
            </span>
            <h2 className="text-lg font-bold">
              {humanReviewRequest.node.data.label || 'Human Review Gate'}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Prompt banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Review Request:</p>
              <p className="mt-0.5">{humanReviewRequest.prompt}</p>
            </div>
          </div>

          {/* Editable Payload */}
          <div>
            <label className="label flex items-center justify-between text-xs font-bold text-gray-700">
              <span>Proposed Step Payload (Inspect / Edit):</span>
              <span className="text-[10px] text-gray-400 font-normal">Edit before approving if needed</span>
            </label>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                try {
                  JSON.parse(e.target.value);
                  setJsonError(null);
                } catch (err: any) {
                  setJsonError(err.message);
                }
              }}
              className="input font-mono text-xs bg-slate-900 text-emerald-300 rounded-xl"
            />
            {jsonError && (
              <p className="text-[10px] text-amber-600 mt-1">Note: Payload is plain text (not valid JSON)</p>
            )}
          </div>

          {/* Reviewer Note */}
          <div>
            <label className="label text-xs font-bold text-gray-700">Reviewer Notes (Optional):</label>
            <input
              type="text"
              placeholder="e.g. Adjusted credit amount from $500 to $350 per SLA"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input text-xs"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleReject}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject & Stop</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditAndApprove}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit & Approve</span>
            </button>

            <button
              onClick={handleApprove}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Draft</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
