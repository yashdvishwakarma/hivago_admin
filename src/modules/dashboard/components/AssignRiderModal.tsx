import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Bike, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { riderService } from '@/core/api/riders';
import { ordersService } from '@/core/api/orders';

interface AssignRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  orderId?: string;
}

export default function AssignRiderModal({ isOpen, onClose, orderNumber, orderId }: AssignRiderModalProps) {
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch online & verified riders
  const { data, isLoading, isError } = useQuery({
    queryKey: ['assign-online-riders'],
    queryFn: () => riderService.getRiders({ isOnline: true, kycStatus: 'Verified' }),
    enabled: isOpen,
  });

  const riders = data?.riders ?? [];

  // Mutation to manually assign a rider to the order
  const assignMutation = useMutation({
    mutationFn: () => {
      if (!orderId) throw new Error('Order ID is required for assignment');
      if (!selectedRiderId) throw new Error('Rider ID is required for assignment');
      return ordersService.assignRider(orderId, selectedRiderId);
    },
    onSuccess: () => {
      toast.success("Rider assigned successfully!");
      // Invalidate live orders, alerts, and order details to update dashboard feed immediately
      queryClient.invalidateQueries({ queryKey: ['adminLiveOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminOrderDetails'] });
      queryClient.invalidateQueries({ queryKey: ['adminAlerts'] });
      onClose();
      setSelectedRiderId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to assign rider.");
    }
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedRiderId) {
      if (orderId) {
        assignMutation.mutate();
      } else {
        toast.error("Cannot assign: Order ID not resolved.");
      }
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedRiderId(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[600px] flex flex-col h-[85vh] max-h-[750px]">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-none mb-1.5">Assign Rider</h2>
            <p className="text-[13px] text-gray-500">Order {orderNumber.replace('#', '')}</p>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Header */}
        <div className="px-5 py-4 border-b border-gray-100 shrink-0">
          <p className="text-[13px] text-gray-600">
            {isLoading ? 'Checking for riders...' : `${riders.length} online riders available`}
          </p>
        </div>

        {/* Rider List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-gray-50/30">
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                <span className="text-[13px]">Loading available riders...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-20 text-[13px] text-red-500 font-medium">
                Failed to load riders. Please try again.
              </div>
            ) : riders.length === 0 ? (
              <div className="text-center py-20 text-[13px] text-gray-400 font-medium">
                No online, verified riders found.
              </div>
            ) : (
              riders.map((rider) => {
                const isSelected = selectedRiderId === rider.id;
                
                return (
                  <div 
                    key={rider.id}
                    onClick={() => setSelectedRiderId(rider.id)}
                    className={cn(
                      "bg-white border rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer hover:shadow-sm",
                      isSelected ? "border-[#d72b1f] ring-1 ring-[#d72b1f]/20" : "border-gray-200"
                    )}
                  >
                    {/* Radio Button */}
                    <div className="shrink-0 flex items-center justify-center">
                      <div className={cn(
                        "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected ? "border-[#d72b1f]" : "border-gray-300"
                      )}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#d72b1f]" />}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[15px] text-gray-900 leading-none">{rider.name}</h3>
                        {rider.vehicleType && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-[#d72b1f] border-red-200 bg-red-50/50">
                            {rider.vehicleType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-500">
                        <span className="font-medium font-mono">{rider.id.slice(0, 8).toUpperCase()}</span>
                        <span>•</span>
                        <span>{rider.phone}</span>
                      </div>
                    </div>

                    {/* Stats / Icon */}
                    <div className="flex items-center gap-4 text-[13px] text-gray-600 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Bike className="w-[14px] h-[14px] text-gray-400" />
                        {rider.vehicleType || 'Rider'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
          <button 
            onClick={handleClose}
            className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!selectedRiderId || assignMutation.isPending}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-bold text-white bg-[#75c69b] hover:bg-[#65b38a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px]"
          >
            {assignMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}
