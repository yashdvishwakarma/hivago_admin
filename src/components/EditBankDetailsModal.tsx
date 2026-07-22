import { useState, useEffect } from 'react';
import { X, Loader2, Landmark } from 'lucide-react';

interface EditBankDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialData?: {
    bankAccountNumber?: string;
    bankIfscCode?: string;
    bankAccountName?: string;
  } | null;
  onConfirm: (data: {
    bankAccountNumber: string;
    bankIfscCode: string;
    bankAccountName: string;
  }) => Promise<void> | void;
}

export default function EditBankDetailsModal({
  isOpen,
  onClose,
  title = 'Edit Bank Details',
  initialData,
  onConfirm,
}: EditBankDetailsModalProps) {
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasInitialized(false);
      return;
    }

    if (isOpen && !hasInitialized && initialData) {
      setAccountNumber(initialData.bankAccountNumber || '');
      setIfscCode(initialData.bankIfscCode || '');
      setAccountName(initialData.bankAccountName || '');
      setHasInitialized(true);
    }
  }, [isOpen, initialData, hasInitialized]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !ifscCode.trim() || !accountName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        bankAccountNumber: accountNumber.trim(),
        bankIfscCode: ifscCode.trim().toUpperCase(),
        bankAccountName: accountName.trim(),
      });
      onClose();
    } catch (error) {
      console.error('Failed to save bank details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 rounded-lg text-[#d72b1f] border border-red-100">
              <Landmark className="w-5 h-5" />
            </div>
            <h2 className="text-[17px] font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
              Account Holder Name
            </label>
            <input
              type="text"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="As per bank passbook..."
              className="w-full px-3.5 py-2.5 text-[14px] bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
              Account Number
            </label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter bank account number..."
              className="w-full px-3.5 py-2.5 text-[14px] bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-900 mb-1.5">
              IFSC Code
            </label>
            <input
              type="text"
              required
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              placeholder="e.g. SBIN0001234"
              className="w-full px-3.5 py-2.5 text-[14px] bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !accountNumber.trim() || !ifscCode.trim() || !accountName.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#d72b1f] hover:bg-[#b82218] transition-colors shadow-sm disabled:opacity-50 min-w-[100px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Details'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
