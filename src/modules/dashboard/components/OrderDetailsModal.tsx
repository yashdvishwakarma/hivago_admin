import React from 'react';
import { X, AlertCircle, Phone, User, MapPin, Store } from 'lucide-react';
import { cn } from '@/utils/cn';

interface OrderItem {
  name: string;
  quantity?: number;
}

export interface OrderDetailsData {
  id: string;
  orderNumber: string;
  time: string;
  statusType: 'critical' | 'warning' | 'normal';
  statusTitle: string;
  statusDescription: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  restaurantName: string;
  restaurantAddress: string;
  items: OrderItem[];
  totalAmount: string;
  timeline: {
    status: string;
    time: string;
  }[];
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetailsData | null;
}

export default function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[600px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900 leading-tight">Order {order.orderNumber}</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">{order.time}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar">
          
          {/* Banner */}
          {order.statusType !== 'normal' && (
            <div className={cn(
              "rounded-xl p-4 flex items-start gap-3 mb-6 border",
              order.statusType === 'critical' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
            )}>
              {order.statusType === 'critical' ? (
                <AlertCircle className="w-5 h-5 text-[#d72b1f] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={cn(
                  "font-bold text-[14px] mb-0.5",
                  order.statusType === 'critical' ? 'text-[#d72b1f]' : 'text-orange-700'
                )}>
                  {order.statusTitle}
                </h3>
                <p className={cn(
                  "text-[13px]",
                  order.statusType === 'critical' ? 'text-[#d72b1f]/80' : 'text-orange-800/80'
                )}>
                  {order.statusDescription}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <h3 className="font-bold text-[14px] text-gray-900 mb-3">Customer Details</h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-gray-700">{order.customerName}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-gray-700">{order.customerPhone}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-gray-700 leading-relaxed">{order.customerAddress}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-[14px] text-gray-900 mb-3">Restaurant</h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <Store className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-gray-700">{order.restaurantName}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-gray-700 leading-relaxed">{order.restaurantAddress}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="font-bold text-[14px] text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[13px] text-gray-700">
                    <span className="text-gray-400">•</span>
                    <span>{item.quantity ? `${item.quantity}x ` : ''}{item.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="font-bold text-[14px] text-gray-900">Total Amount</span>
                <span className="font-bold text-[15px] text-gray-900">{order.totalAmount}</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* Delivery Timeline */}
          <div className="mb-8">
            <h3 className="font-bold text-[14px] text-gray-900 mb-4">Delivery Timeline</h3>
            <div className="flex items-start relative">
              {/* Timeline Line */}
              <div className="absolute top-[3px] left-4 right-4 h-[1px] bg-gray-200 z-0"></div>
              
              {order.timeline.map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col bg-white px-3 flex-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-black mb-2"></div>
                  <span className="font-semibold text-[12px] text-gray-900 mb-0.5">{step.status}</span>
                  <span className="text-[11px] text-gray-400">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Actions */}
          <div>
            <h3 className="font-bold text-[14px] text-gray-900 mb-3">Admin Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-1.5 rounded-md bg-[#2563eb] text-white text-[12px] font-semibold hover:bg-blue-700 transition-colors">
                Assign Rider
              </button>
              <button className="px-4 py-1.5 rounded-md bg-[#9333ea] text-white text-[12px] font-semibold hover:bg-purple-700 transition-colors">
                Re-dispatch
              </button>
              <button className="px-4 py-1.5 rounded-md bg-[#e11d48] text-white text-[12px] font-semibold hover:bg-red-700 transition-colors">
                Cancel Order
              </button>
              <button className="px-4 py-1.5 rounded-md bg-[#ea580c] text-white text-[12px] font-semibold hover:bg-orange-700 transition-colors">
                Initiate Refund
              </button>
              <button className="px-4 py-1.5 rounded-md bg-[#374151] text-white text-[12px] font-semibold hover:bg-gray-800 transition-colors">
                Add Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
