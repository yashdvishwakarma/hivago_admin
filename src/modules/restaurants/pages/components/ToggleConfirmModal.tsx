import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ToggleConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  restaurantName: string;
  isActive: boolean;
  isPending: boolean;
}

export function ToggleConfirmModal({ isOpen, onClose, onConfirm, restaurantName, isActive, isPending }: ToggleConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between p-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", isActive ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500')}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-none mt-1">
              {isActive ? 'Deactivate' : 'Activate'} Restaurant
            </h2>
          </div>
          <button 
            onClick={onClose}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-[14px] text-gray-600 mb-6">
            Are you sure you want to {isActive ? <span className="font-bold text-red-600">deactivate</span> : <span className="font-bold text-green-600">activate</span>} <strong>{restaurantName}</strong>? 
            {isActive 
              ? " They will no longer be able to receive new orders." 
              : " They will become visible and can start receiving orders."}
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className={cn(
                "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2",
                isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              )}
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : (
                isActive ? 'Deactivate' : 'Activate'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
