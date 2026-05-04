import { useState } from 'react';
import { ArrowLeft, RefreshCw, X, Info } from 'lucide-react';

export interface TransactionData {
  orderId: string;
  transactionId: string;
  amount: number;
  date: string;
  customerName: string;
  restaurantName: string;
  foodAmount: number;
  gst: number;
  deliveryFee: number;
  commission: number;
}

interface TransactionDetailsViewProps {
  transaction: TransactionData;
  onBack: () => void;
}

export default function TransactionDetailsView({ transaction, onBack }: TransactionDetailsViewProps) {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
      
      {/* Header Area */}
      <div className="flex items-start gap-4 mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors mt-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[13px] font-medium">Back</span>
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Transaction Details</h1>
          <p className="text-[13px] text-gray-400 font-medium mt-0.5">{transaction.transactionId}</p>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl">
        
        {/* Transaction Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-[14px] font-bold text-gray-900">Transaction Summary</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-y-6">
            <div>
              <p className="text-[12px] text-gray-500 mb-1">Transaction ID</p>
              <p className="text-[14px] font-bold text-gray-900">{transaction.transactionId}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 mb-1">Type</p>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-100">
                order
              </span>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 mb-1">Amount</p>
              <p className="text-[18px] font-bold text-[#059669]">₹{transaction.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 mb-1">Status</p>
              <span className="px-2.5 py-0.5 bg-[#ecfdf5] text-[#059669] text-[11px] font-bold rounded-full border border-green-200">
                completed
              </span>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 mb-1">Date</p>
              <p className="text-[13px] font-medium text-gray-900">{transaction.date}</p>
            </div>
          </div>
        </div>

        {/* Linked Order Details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-[14px] font-bold text-gray-900">Linked Order Details</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-y-6">
            <div>
              <p className="text-[12px] text-gray-500 mb-1">Order ID</p>
              <p className="text-[14px] font-bold text-gray-900">{transaction.orderId}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 mb-1">Customer</p>
              <p className="text-[14px] font-bold text-gray-900">{transaction.customerName}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 mb-1">Restaurant</p>
              <p className="text-[14px] font-bold text-gray-900">{transaction.restaurantName}</p>
            </div>
            <div>
              <p className="text-[12px] text-gray-500 mb-1">Payment Method</p>
              <span className="px-2.5 py-0.5 bg-gray-50 text-gray-700 text-[11px] font-bold rounded border border-gray-200">
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-[14px] font-bold text-gray-900">Financial Breakdown</h2>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
              <span className="text-[13px] text-gray-500 font-medium">Food Amount</span>
              <span className="text-[13px] font-bold text-gray-900">₹{transaction.foodAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
              <span className="text-[13px] text-gray-500 font-medium">GST</span>
              <span className="text-[13px] font-bold text-purple-600">₹{transaction.gst.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
              <span className="text-[13px] text-gray-500 font-medium">Delivery Fee</span>
              <span className="text-[13px] font-bold text-gray-900">₹{transaction.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
              <span className="text-[13px] text-gray-500 font-medium">Commission</span>
              <span className="text-[13px] font-bold text-[#d72b1f]">₹{transaction.commission.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Refund Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-[14px] font-bold text-gray-900">Refund Actions</h2>
          </div>
          <div className="p-6">
            <button 
              onClick={() => setIsRefundModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#d72b1f] hover:bg-[#b91d13] text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Initiate Refund (Online Payment)
            </button>
          </div>
        </div>

      </div>

      {/* Refund Modal Overlay */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col scale-in-center">
            
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">Initiate Refund</h2>
                <p className="text-[13px] text-gray-500 mt-1">Online payment refund for {transaction.orderId}</p>
              </div>
              <button 
                onClick={() => setIsRefundModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-[12px] font-bold text-gray-900 mb-2">Refund Amount</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="₹0.00" 
                    className="w-full pl-3 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-900 mb-2">Reason</label>
                <textarea 
                  placeholder="Enter refund reason..." 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all min-h-[100px] resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3.5 flex gap-3 items-start">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-[12px] leading-relaxed text-blue-800">
                  <span className="font-bold">Note:</span> Refund will be processed to the original payment method within 5-7 business days.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsRefundModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                className="flex items-center gap-2 px-5 py-2.5 bg-[#d72b1f] hover:bg-[#b91d13] text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Confirm Refund
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
