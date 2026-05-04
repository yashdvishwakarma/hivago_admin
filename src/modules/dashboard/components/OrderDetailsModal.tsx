import { X, AlertCircle, Phone, User, MapPin, Store } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import apiClient from '@/core/api/axios';

interface OrderItem {
  name: string;
  quantity?: number;
}

export interface OrderDetailsData {
  id: string;
  orderId?: string;
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
  originalOrder?: any;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetailsData | null;
  onInitiateRefund?: () => void;
}

function OrderDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-[76px] bg-gray-100 rounded-xl w-full mb-6"></div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="space-y-8">
          {/* Customer */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="flex gap-2.5 items-center"><div className="w-4 h-4 rounded-full bg-gray-200 shrink-0"></div><div className="h-3 bg-gray-100 rounded w-2/3"></div></div>
              <div className="flex gap-2.5 items-center"><div className="w-4 h-4 rounded-full bg-gray-200 shrink-0"></div><div className="h-3 bg-gray-100 rounded w-1/2"></div></div>
              <div className="flex gap-2.5 items-center"><div className="w-4 h-4 rounded-full bg-gray-200 shrink-0"></div><div className="h-3 bg-gray-100 rounded w-full"></div></div>
            </div>
          </div>
          {/* Restaurant */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="flex gap-2.5 items-center"><div className="w-4 h-4 rounded-full bg-gray-200 shrink-0"></div><div className="h-3 bg-gray-100 rounded w-3/4"></div></div>
              <div className="flex gap-2.5 items-center"><div className="w-4 h-4 rounded-full bg-gray-200 shrink-0"></div><div className="h-3 bg-gray-100 rounded w-full"></div></div>
            </div>
          </div>
        </div>

        <div>
          {/* Items */}
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3 mb-6">
            <div className="h-3 bg-gray-100 rounded w-full"></div>
            <div className="h-3 bg-gray-100 rounded w-5/6"></div>
            <div className="h-3 bg-gray-100 rounded w-4/5"></div>
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>

      <hr className="border-gray-100 mb-6" />

      {/* Timeline */}
      <div className="mb-8">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="flex gap-4">
           <div className="h-10 bg-gray-100 rounded flex-1"></div>
           <div className="h-10 bg-gray-100 rounded flex-1"></div>
           <div className="h-10 bg-gray-100 rounded flex-1"></div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsModal({ isOpen, onClose, order, onInitiateRefund }: OrderDetailsModalProps) {
  const realOrderId = order?.orderId || order?.originalOrder?.orderId || order?.originalOrder?.id || order?.id;

  const { data: fullOrderDetails, isLoading: isOrderLoading } = useQuery({
    queryKey: ['fullOrderDetails', realOrderId],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/orders/${realOrderId}`);
      return res as any;
    },
    enabled: !!isOpen && !!realOrderId
  });

  const { data: restaurantDetails } = useQuery({
    queryKey: ['restaurantDetails', fullOrderDetails?.restaurantId || order?.originalOrder?.restaurantId],
    queryFn: async () => {
      const restaurantId = fullOrderDetails?.restaurantId || order?.originalOrder?.restaurantId;
      if (!restaurantId) return null;
      const res = await apiClient.get(`/admins/restaurants/${restaurantId}`);
      return res as any;
    },
    enabled: !!isOpen && !!(fullOrderDetails?.restaurantId || order?.originalOrder?.restaurantId)
  });

  const mappedOrder = useMemo(() => {
    if (!order) return null;
    if (!fullOrderDetails) return order;
    
    const og = fullOrderDetails;
    
    const timeline = [];
    if (og.createdAt) timeline.push({ status: "Placed", time: new Date(og.createdAt).toLocaleString() });
    if (og.confirmedAt) timeline.push({ status: "Confirmed", time: new Date(og.confirmedAt).toLocaleString() });
    if (og.preparingAt) timeline.push({ status: "Preparing", time: new Date(og.preparingAt).toLocaleString() });
    if (og.readyAt) timeline.push({ status: "Ready", time: new Date(og.readyAt).toLocaleString() });
    if (og.pickedUpAt) timeline.push({ status: "Picked Up", time: new Date(og.pickedUpAt).toLocaleString() });
    if (og.deliveredAt) timeline.push({ status: "Delivered", time: new Date(og.deliveredAt).toLocaleString() });
    if (og.cancelledAt) timeline.push({ status: "Cancelled", time: new Date(og.cancelledAt).toLocaleString() });

    return {
      ...order,
      orderNumber: og.orderNumber || order.orderNumber,
      statusTitle: og.statusDisplay || og.status || order.statusTitle,
      statusDescription: og.delayMinutes ? `Delayed by ${og.delayMinutes} minutes` : (og.status === 'Confirmed' ? 'Order processing' : order.statusDescription),
      customerName: og.customerName || order.customerName,
      customerPhone: og.customerPhone || order.customerPhone,
      customerAddress: og.deliveryAddress || order.customerAddress,
      restaurantName: og.restaurantName || order.restaurantName,
      items: og.items ? og.items.map((i: any) => ({ name: i.itemName, quantity: i.quantity })) : order.items,
      totalAmount: og.total !== undefined ? `${og.currency === 'INR' ? '₹' : og.currency || ''}${og.total}` : order.totalAmount,
      timeline: timeline.length > 0 ? timeline : order.timeline
    };
  }, [order, fullOrderDetails]);

  if (!isOpen || !mappedOrder) return null;

  let displayRestaurantAddress = mappedOrder.restaurantAddress;
  if (restaurantDetails?.addressLine) {
    displayRestaurantAddress = restaurantDetails.addressLine;
  } else if (restaurantDetails?.address) {
    const rAddr = restaurantDetails.address;
    displayRestaurantAddress = typeof rAddr === 'string' ? rAddr : (rAddr.addressLine1 || rAddr.street || rAddr.fullAddress || JSON.stringify(rAddr));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[600px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[17px] font-bold text-gray-900 leading-tight">Order {mappedOrder.orderNumber}</h2>
              {isOrderLoading && <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>}
            </div>
            <p className="text-[13px] text-gray-500 mt-0.5">{mappedOrder.time}</p>
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
          {isOrderLoading ? (
            <OrderDetailsSkeleton />
          ) : (
            <>
              {/* Banner */}
              {mappedOrder.statusType !== 'normal' && (
                <div className={cn(
                  "rounded-xl p-4 flex items-start gap-3 mb-6 border",
                  mappedOrder.statusType === 'critical' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
                )}>
              {mappedOrder.statusType === 'critical' ? (
                <AlertCircle className="w-5 h-5 text-[#d72b1f] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={cn(
                  "font-bold text-[14px] mb-0.5",
                  mappedOrder.statusType === 'critical' ? 'text-[#d72b1f]' : 'text-orange-700'
                )}>
                  {mappedOrder.statusTitle}
                </h3>
                <p className={cn(
                  "text-[13px]",
                  mappedOrder.statusType === 'critical' ? 'text-[#d72b1f]/80' : 'text-orange-800/80'
                )}>
                  {mappedOrder.statusDescription}
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
                    <span className="text-[13px] text-gray-700">{mappedOrder.customerName}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-gray-700">{mappedOrder.customerPhone}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-gray-700 leading-relaxed">{mappedOrder.customerAddress}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-[14px] text-gray-900 mb-3">Restaurant</h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <Store className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-gray-700">{mappedOrder.restaurantName}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-gray-700 leading-relaxed">{displayRestaurantAddress}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="font-bold text-[14px] text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-2 mb-4">
                {mappedOrder.items.map((item: OrderItem, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-[13px] text-gray-700">
                    <span className="text-gray-400">•</span>
                    <span>{item.quantity ? `${item.quantity}x ` : ''}{item.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="font-bold text-[14px] text-gray-900">Total Amount</span>
                <span className="font-bold text-[15px] text-gray-900">{mappedOrder.totalAmount}</span>
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
              
              {mappedOrder.timeline.map((step, idx) => (
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
              <button 
                onClick={onInitiateRefund}
                className="px-4 py-1.5 rounded-md bg-[#ea580c] text-white text-[12px] font-semibold hover:bg-orange-700 transition-colors"
              >
                Initiate Refund
              </button>
              <button className="px-4 py-1.5 rounded-md bg-[#374151] text-white text-[12px] font-semibold hover:bg-gray-800 transition-colors">
                Add Notes
              </button>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
