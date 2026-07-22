import { DollarSign, X } from 'lucide-react';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string | null;
  onConfirm?: () => void;
}

export default function RefundModal({ isOpen, onClose, orderNumber, onConfirm }: RefundModalProps) {
  if (!isOpen || !orderNumber) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[460px] flex flex-col relative overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="text-[17px] font-bold text-gray-900">Initiate Refund</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
            <p className="text-[14px] text-orange-800 font-medium">
              Refund order <span className="font-bold">{orderNumber}</span>?
            </p>
            <p className="text-[13px] text-orange-600 mt-1 leading-relaxed">
              This bypasses the normal refundable-status guard. The full order amount will be returned to the customer's original payment method.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-[14px] font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-lg text-[14px] font-semibold text-white bg-[#ea580c] hover:bg-orange-600 transition-colors shadow-sm"
            >
              Confirm Refund
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
