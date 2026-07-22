import { useState } from 'react';
import { X, Copy, Check, KeyRound } from 'lucide-react';

interface TemporaryPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  temporaryPassword: string;
  entityName: string;
  entityType: 'owner' | 'restaurant';
}

export default function TemporaryPasswordModal({
  isOpen,
  onClose,
  temporaryPassword,
  entityName,
  entityType,
}: TemporaryPasswordModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[450px] overflow-hidden flex flex-col border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-100 bg-[#fff5f5]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffe3e3] text-[#d72b1f] rounded-xl">
              <KeyRound className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                Password Reset Successful
              </h2>
              <p className="text-[11px] text-[#b91d13] font-semibold mt-0.5 uppercase tracking-wider">
                Temporary Password Generated
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-[#ffeef0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-[13px] text-gray-600 leading-relaxed">
            The password for the {entityType} <strong>{entityName}</strong> has been reset. Use the temporary password below to log in:
          </p>

          <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl p-4 gap-3 shadow-inner">
            <span className="font-mono text-lg font-bold text-gray-900 tracking-wider select-all flex-1 text-center">
              {temporaryPassword}
            </span>
            <button
              onClick={handleCopy}
              className={`p-2.5 rounded-lg transition-all border ${
                copied 
                  ? 'bg-green-50 border-green-200 text-green-600' 
                  : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm'
              }`}
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-800 text-[12px] leading-relaxed flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></div>
            <div>
              <strong>Crucial Security Notice:</strong> This password is single-use and will <strong>not</strong> be shown again once you close this window. Please copy it and share it with the {entityType} out of band (e.g. phone call or secure chat).
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[13px] font-semibold text-white bg-[#d72b1f] hover:bg-[#b91d13] transition-colors rounded-xl shadow-sm hover:shadow active:scale-[0.98]"
          >
            I've copied the password
          </button>
        </div>

      </div>
    </div>
  );
}
