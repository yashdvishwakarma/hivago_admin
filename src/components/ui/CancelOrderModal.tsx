import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

const CANCEL_REASONS = [
  { value: 'CustomerRequested',    label: 'Customer Requested' },
  { value: 'RestaurantUnavailable', label: 'Restaurant Unavailable' },
  { value: 'RestaurantClosed',     label: 'Restaurant Closed' },
  { value: 'ItemsOutOfStock',      label: 'Items Out of Stock' },
  { value: 'NoRidersAvailable',    label: 'No Riders Available' },
  { value: 'DeliveryAddressIssue', label: 'Delivery Address Issue' },
  { value: 'PaymentFailed',        label: 'Payment Failed' },
  { value: 'Timeout',              label: 'Order Timed Out' },
  { value: 'FraudSuspected',       label: 'Fraud Suspected' },
  { value: 'SystemError',          label: 'System Error' },
  { value: 'Other',                label: 'Other' },
];

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => void;
  orderNumber?: string;
  isPending?: boolean;
}

export function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isPending = false,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState('CustomerRequested');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('CustomerRequested');
      setNotes('');
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Order">
      <div className="flex flex-col gap-5">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="p-1.5 bg-red-100 rounded-lg shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800">
              Cancel{orderNumber ? ` ${orderNumber}` : ' this order'}?
            </p>
            <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
              This action bypasses normal status guards. A refund will be initiated automatically if the customer paid online.
            </p>
          </div>
        </div>

        {/* Reason Selector */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-700">
            Cancellation Reason <span className="text-red-500">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors appearance-none cursor-pointer"
          >
            {CANCEL_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-700">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional context..."
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Keep Order
          </button>
          <Button
            type="button"
            onClick={() => onConfirm(reason, notes)}
            isLoading={isPending}
            className="bg-[#d72b1f] hover:bg-[#b91d13] text-white font-semibold px-5 py-2 rounded-lg shadow-sm"
          >
            Cancel Order
          </Button>
        </div>
      </div>
    </Modal>
  );
}
