import { useState } from 'react';
import { X } from 'lucide-react';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string | null;
  onConfirm?: (reason: string) => void;
}

export default function RefundModal({ isOpen, onClose, orderNumber, onConfirm }: RefundModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen || !orderNumber) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(reason);
    }
    onClose();
    setReason('');
  };

  const handleClose = () => {
    onClose();
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-[18px] font-bold text-gray-900">Initiate Refund</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-[14px] text-gray-500 mb-6">
            Are you sure you want to initiate a refund for order {orderNumber}?
          </p>

          <div className="mb-8">
            <label className="block text-[13px] font-bold text-gray-900 mb-2">
              Refund Reason
            </label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for refund..."
              className="w-full min-h-[100px] p-3 text-[14px] bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-center gap-3">
            <button 
              onClick={handleClose}
              className="px-6 py-2.5 rounded-lg text-[14px] font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-lg text-[14px] font-semibold text-white bg-[#ea580c] hover:bg-orange-600 transition-colors shadow-sm"
            >
              Initiate Refund
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
